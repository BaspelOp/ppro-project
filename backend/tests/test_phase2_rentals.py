from datetime import datetime, timedelta, timezone
import pytest


def _create_equipment(client, inv: str, daily_rate: float = 400.0, deposit: float = 1500.0):
    resp = client.post(
        "/api/v1/equipment",
        json={
            "inventory_number": inv,
            "name": f"Test Item {inv}",
            "category": "SKIS",
            "size": "170 cm",
            "purchase_year": 2024,
            "daily_rate": daily_rate,
            "deposit": deposit,
            "condition": "GOOD",
        },
    )
    assert resp.status_code == 201
    return resp.json()


def _create_customer(client, card: str, name: str = "Karel Testovací"):
    resp = client.post(
        "/api/v1/customers",
        json={
            "name": name,
            "phone": "+420 600 123 456",
            "email": "karel@example.cz",
            "id_card_number": card,
        },
    )
    assert resp.status_code == 201
    return resp.json()


def test_category_crud_and_pricing_snapshot(client):
    cat_resp = client.post(
        "/api/v1/categories",
        json={
            "code": "SKIS",
            "name": "Lyže",
            "default_daily_rate": 400.0,
            "default_deposit": 2000.0,
        },
    )
    assert cat_resp.status_code == 201
    cat_id = cat_resp.json()["id"]

    # Update tarifu kategorie
    upd = client.put(
        f"/api/v1/categories/{cat_id}",
        json={"default_daily_rate": 480.0},
    )
    assert upd.status_code == 200
    assert upd.json()["default_daily_rate"] == 480.0

    # Nový kus vybavení se automaticky propojí na kategorii SKIS
    eq = _create_equipment(client, "SKI-CAT-1", daily_rate=400.0)
    assert eq["category_id"] == cat_id


def test_rental_overlap_is_blocked(client):
    """Byznys pravidlo: Kus nesmí být ve dvou překrývajících se výpůjčkách/rezervacích."""
    eq = _create_equipment(client, "SKI-OVL-1")
    c1 = _create_customer(client, "OP-1001", "Jan První")
    c2 = _create_customer(client, "OP-1002", "Eva Druhá")

    now = datetime.now(timezone.utc)
    r1 = client.post(
        "/api/v1/rentals",
        json={
            "customer_id": c1["id"],
            "equipment_item_ids": [eq["id"]],
            "rental_start": (now + timedelta(days=2)).isoformat(),
            "rental_end": (now + timedelta(days=5)).isoformat(),
            "is_reservation": True,
        },
    )
    assert r1.status_code == 201
    assert r1.json()["status"] == "RESERVED"

    # Překrývající se rezervace pro stejný kus musí být odmítnuta (HTTP 400)
    r2 = client.post(
        "/api/v1/rentals",
        json={
            "customer_id": c2["id"],
            "equipment_item_ids": [eq["id"]],
            "rental_start": (now + timedelta(days=4)).isoformat(),
            "rental_end": (now + timedelta(days=6)).isoformat(),
            "is_reservation": True,
        },
    )
    assert r2.status_code == 400
    assert "již rezervován" in r2.json()["detail"]


def test_item_in_service_cannot_be_rented(client):
    """Byznys pravidlo: Kus v servisu nelze půjčit ani rezervovat a vytváří se ServiceRecord."""
    eq = _create_equipment(client, "SKI-SRV-1")
    cust = _create_customer(client, "OP-2001")

    # Odeslání do servisu vytvoří ServiceRecord
    srv = client.post(
        f"/api/v1/equipment/{eq['id']}/service",
        json={"action": "SEND_TO_SERVICE", "service_notes": "Broušení hran", "cost": 450.0},
    )
    assert srv.status_code == 200
    assert srv.json()["status"] == "IN_SERVICE"

    records = client.get(f"/api/v1/service-records/equipment/{eq['id']}").json()
    assert len(records) == 1
    assert records[0]["issue_description"] == "Broušení hran"
    assert records[0]["service_end"] is None

    # Pokus o výpůjčku kusu v servisu musí selhat
    now = datetime.now(timezone.utc)
    r = client.post(
        "/api/v1/rentals",
        json={
            "customer_id": cust["id"],
            "equipment_item_ids": [eq["id"]],
            "rental_start": now.isoformat(),
            "rental_end": (now + timedelta(days=2)).isoformat(),
            "is_reservation": False,
        },
    )
    assert r.status_code == 400
    assert "v servisu" in r.json()["detail"]

    # Návrat ze servisu uzavře ServiceRecord
    ret_srv = client.post(
        f"/api/v1/equipment/{eq['id']}/service",
        json={"action": "RETURN_FROM_SERVICE", "service_notes": "Hrany nabroušeny"},
    )
    assert ret_srv.status_code == 200
    records_after = client.get(f"/api/v1/service-records/equipment/{eq['id']}").json()
    assert records_after[0]["service_end"] is not None


def test_partial_return_and_late_penalty_calculation(client):
    """Byznys pravidlo: Částečné vrácení (M:N) a výpočet penále za každý započatý den prodlení."""
    eq1 = _create_equipment(client, "SKI-PEN-1", daily_rate=500.0)
    eq2 = _create_equipment(client, "BOT-PEN-2", daily_rate=200.0)
    cust = _create_customer(client, "OP-3001")

    start = datetime(2026, 11, 1, 9, 0, 0, tzinfo=timezone.utc)
    end = datetime(2026, 11, 3, 9, 0, 0, tzinfo=timezone.utc)

    rental = client.post(
        "/api/v1/rentals",
        json={
            "customer_id": cust["id"],
            "equipment_item_ids": [eq1["id"], eq2["id"]],
            "rental_start": start.isoformat(),
            "rental_end": end.isoformat(),
            "is_reservation": False,
        },
    ).json()
    assert rental["status"] == "ACTIVE"
    assert len(rental["items"]) == 2

    item1 = next(i for i in rental["items"] if i["equipment_item_id"] == eq1["id"])
    item2 = next(i for i in rental["items"] if i["equipment_item_id"] == eq2["id"])

    # Vrácení 1. kusu včas -> penále 0 Kč, stav smlouvy PARTIALLY_RETURNED
    res1 = client.post(
        f"/api/v1/rentals/{rental['id']}/items/{item1['id']}/return",
        json={
            "returned_at": datetime(2026, 11, 3, 8, 30, 0, tzinfo=timezone.utc).isoformat(),
            "item_return_condition": "GOOD",
            "send_to_service": False,
        },
    )
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["status"] == "PARTIALLY_RETURNED"
    ret_item1 = next(i for i in data1["items"] if i["id"] == item1["id"])
    assert ret_item1["late_penalty"] == 0.0

    # Vrácení 2. kusu o 25 hodin později (= 2 započaté dny prodlení) -> penále 2 * 200 = 400 Kč, stav RETURNED
    res2 = client.post(
        f"/api/v1/rentals/{rental['id']}/items/{item2['id']}/return",
        json={
            "returned_at": datetime(2026, 11, 4, 10, 0, 0, tzinfo=timezone.utc).isoformat(),
            "item_return_condition": "GOOD",
            "send_to_service": False,
        },
    )
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["status"] == "RETURNED"
    ret_item2 = next(i for i in data2["items"] if i["id"] == item2["id"])
    assert ret_item2["late_penalty"] == 400.0


def test_rental_history_is_never_deleted(client):
    """Byznys pravidlo: Historie výpůjček se nemaže; storno pouze přepne stav na CANCELLED."""
    eq = _create_equipment(client, "SKI-HIST-1")
    cust = _create_customer(client, "OP-4001")
    now = datetime.now(timezone.utc)

    rental = client.post(
        "/api/v1/rentals",
        json={
            "customer_id": cust["id"],
            "equipment_item_ids": [eq["id"]],
            "rental_start": (now + timedelta(days=3)).isoformat(),
            "rental_end": (now + timedelta(days=5)).isoformat(),
            "is_reservation": True,
        },
    ).json()

    cancelled = client.post(f"/api/v1/rentals/{rental['id']}/cancel?reason=Změna%20plánu")
    assert cancelled.status_code == 200
    assert cancelled.json()["status"] == "CANCELLED"

    # Záznam je stále v DB dohledatelný
    fetched = client.get(f"/api/v1/rentals/{rental['id']}")
    assert fetched.status_code == 200
    assert fetched.json()["status"] == "CANCELLED"
