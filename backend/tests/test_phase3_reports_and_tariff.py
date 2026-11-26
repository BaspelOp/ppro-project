from datetime import datetime, timedelta, timezone


def _create_equipment(client, inv: str, daily_rate: float = 400.0, deposit: float = 1500.0):
    resp = client.post(
        "/api/v1/equipment",
        json={
            "inventory_number": inv,
            "name": f"Phase3 Item {inv}",
            "category": "SKIS",
            "size": "175 cm",
            "purchase_year": 2024,
            "daily_rate": daily_rate,
            "deposit": deposit,
            "condition": "GOOD",
        },
    )
    assert resp.status_code == 201
    return resp.json()


def _create_customer(client, card: str, name: str = "Martin Víkendový"):
    resp = client.post(
        "/api/v1/customers",
        json={
            "name": name,
            "phone": "+420 777 888 999",
            "email": "martin@example.cz",
            "id_card_number": card,
        },
    )
    assert resp.status_code == 201
    return resp.json()


def test_weekend_tariff_pricing(client):
    """Víkendový tarif: páteční odpoledne (14:00) až pondělí ráno (09:00) účtuje 2 dny místo 3."""
    eq = _create_equipment(client, "SKI-WKND-1", daily_rate=500.0)
    cust = _create_customer(client, "OP-W001")

    # 2026-11-27 je pátek, 2026-11-30 je pondělí
    fri_afternoon = datetime(2026, 11, 27, 14, 0, 0, tzinfo=timezone.utc)
    mon_morning = datetime(2026, 11, 30, 9, 0, 0, tzinfo=timezone.utc)

    resp = client.post(
        "/api/v1/rentals",
        json={
            "customer_id": cust["id"],
            "equipment_item_ids": [eq["id"]],
            "rental_start": fri_afternoon.isoformat(),
            "rental_end": mon_morning.isoformat(),
            "is_reservation": True,
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["tariff_type"] == "WEEKEND"
    assert data["total_price"] == 1000.0  # 2 dny * 500 Kč (místo 1500 Kč za 3 dny)


def test_active_overdue_and_utilization_reports_and_protocol(client):
    """Ověření reportů (aktuálně zapůjčené + prodlení, vytíženost) a generování protokolu."""
    eq1 = _create_equipment(client, "SKI-REP-1", daily_rate=400.0)
    eq2 = _create_equipment(client, "SKI-REP-2", daily_rate=300.0)
    cust = _create_customer(client, "OP-R001", "Jana Reportová")

    now = datetime.now(timezone.utc)
    # Vytvoření aktivní výpůjčky po termínu (skončila před 2 dny)
    r_overdue = client.post(
        "/api/v1/rentals",
        json={
            "customer_id": cust["id"],
            "equipment_item_ids": [eq1["id"]],
            "rental_start": (now - timedelta(days=5)).isoformat(),
            "rental_end": (now - timedelta(days=2)).isoformat(),
            "is_reservation": False,
            "notes": "Test prodlení",
        },
    )
    assert r_overdue.status_code == 201
    rental_id = r_overdue.json()["id"]

    # 1. Active & overdue report
    rep_active = client.get("/api/v1/reports/active-overdue")
    assert rep_active.status_code == 200
    active_data = rep_active.json()
    assert active_data["active_rentals_count"] == 1
    assert active_data["overdue_items_count"] == 1
    assert active_data["total_estimated_penalty"] >= 800.0
    assert active_data["items"][0]["inventory_number"] == "SKI-REP-1"
    assert active_data["items"][0]["is_overdue"] is True

    # 2. Utilization report
    rep_util = client.get("/api/v1/reports/utilization")
    assert rep_util.status_code == 200
    util_data = rep_util.json()
    assert len(util_data["by_category"]) >= 1
    skis_cat = next(c for c in util_data["by_category"] if c["category"] == "SKIS")
    assert skis_cat["total_items"] == 2
    assert skis_cat["rented_items"] == 1
    assert skis_cat["occupancy_pct"] == 50.0

    # 3. Printable rental protocol
    proto = client.get(f"/api/v1/rentals/{rental_id}/protocol")
    assert proto.status_code == 200
    proto_data = proto.json()
    assert proto_data["customer_name"] == "Jana Reportová"
    assert proto_data["protocol_number"].startswith("HV-")
    assert len(proto_data["items"]) == 1
    assert proto_data["items"][0]["inventory_number"] == "SKI-REP-1"
