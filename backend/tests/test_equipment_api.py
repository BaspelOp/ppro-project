def test_api_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"


def test_api_create_and_list_equipment(client):
    payload = {
        "inventory_number": "API-001",
        "name": "Atomic Bent Chetler 100",
        "category": "SKIS",
        "size": "180 cm",
        "purchase_year": 2024,
        "daily_rate": 450.0,
        "deposit": 2000.0,
        "condition": "NEW",
        "notes": "Freeride lyže"
    }
    create_res = client.post("/api/v1/equipment", json=payload)
    assert create_res.status_code == 201
    item = create_res.json()
    assert item["inventory_number"] == "API-001"
    assert item["status"] == "AVAILABLE"

    # Seznam vybavení
    list_res = client.get("/api/v1/equipment")
    assert list_res.status_code == 200
    items = list_res.json()
    assert len(items) >= 1
    assert any(i["inventory_number"] == "API-001" for i in items)

    # Filtrování dle kategorie
    ski_res = client.get("/api/v1/equipment?category=SKIS")
    assert ski_res.status_code == 200
    assert all(i["category"] == "SKIS" for i in ski_res.json())

    # Fulltext vyhledávání
    search_res = client.get("/api/v1/equipment?search=Bent")
    assert search_res.status_code == 200
    assert len(search_res.json()) == 1


def test_api_service_endpoint(client):
    # Nejprve vytvoříme kus
    payload = {
        "inventory_number": "API-SRV-10",
        "name": "Raft Colorado",
        "category": "RAFT",
        "size": "450 cm",
        "purchase_year": 2023,
        "daily_rate": 600.0,
        "deposit": 3000.0,
        "condition": "GOOD"
    }
    create_res = client.post("/api/v1/equipment", json=payload)
    item_id = create_res.json()["id"]

    # Odeslat do servisu
    service_payload = {
        "action": "SEND_TO_SERVICE",
        "service_notes": "Kontrola přetlakových ventilů",
        "new_condition": "GOOD"
    }
    srv_res = client.post(f"/api/v1/equipment/{item_id}/service", json=service_payload)
    assert srv_res.status_code == 200
    assert srv_res.json()["status"] == "IN_SERVICE"

    # Kontrola statistiky
    stats_res = client.get("/api/v1/equipment/stats")
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["in_service"] >= 1
