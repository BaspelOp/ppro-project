import pytest
from fastapi import HTTPException
from app.models.equipment import EquipmentCategory, EquipmentStatus, EquipmentCondition
from app.schemas.equipment import EquipmentItemCreate, EquipmentItemUpdate, EquipmentServiceAction
from app.services.equipment_service import EquipmentService


def test_create_equipment_success(db_session):
    service = EquipmentService(db_session)
    dto = EquipmentItemCreate(
        inventory_number="TEST-001",
        name="Testovací lyže Atomic",
        category=EquipmentCategory.SKIS,
        size="165 cm",
        purchase_year=2024,
        daily_rate=300.0,
        deposit=1500.0,
        condition=EquipmentCondition.NEW,
        notes="Testovací položka"
    )
    item = service.create_item(dto)
    assert item.id is not None
    assert item.inventory_number == "TEST-001"
    assert item.status == EquipmentStatus.AVAILABLE
    assert item.daily_rate == 300.0


def test_create_equipment_duplicate_inventory_number_fails(db_session):
    service = EquipmentService(db_session)
    dto = EquipmentItemCreate(
        inventory_number="DUP-001",
        name="Lyže 1",
        category=EquipmentCategory.SKIS,
        size="170 cm",
        purchase_year=2023,
        daily_rate=200.0,
        deposit=1000.0,
        condition=EquipmentCondition.GOOD
    )
    service.create_item(dto)

    # Druhé vytvoření se stejným inventárním číslem musí selhat
    dto2 = EquipmentItemCreate(
        inventory_number="dup-001",  # case-insensitive test
        name="Lyže 2",
        category=EquipmentCategory.SKIS,
        size="170 cm",
        purchase_year=2023,
        daily_rate=200.0,
        deposit=1000.0,
        condition=EquipmentCondition.GOOD
    )
    with pytest.raises(HTTPException) as exc_info:
        service.create_item(dto2)
    assert exc_info.value.status_code == 400
    assert "již v evidenci existuje" in exc_info.value.detail


def test_service_lifecycle_actions(db_session):
    service = EquipmentService(db_session)
    dto = EquipmentItemCreate(
        inventory_number="SRV-001",
        name="Snowboard Burton",
        category=EquipmentCategory.SNOWBOARD,
        size="156 cm",
        purchase_year=2024,
        daily_rate=350.0,
        deposit=1500.0,
        condition=EquipmentCondition.GOOD
    )
    item = service.create_item(dto)
    assert item.status == EquipmentStatus.AVAILABLE

    # Odeslání do servisu
    action_send = EquipmentServiceAction(
        action="SEND_TO_SERVICE",
        service_notes="Vytržená hrana na patce",
        new_condition=EquipmentCondition.DAMAGED
    )
    updated = service.handle_service_action(item.id, action_send)
    assert updated.status == EquipmentStatus.IN_SERVICE
    assert updated.condition == EquipmentCondition.DAMAGED
    assert "Vytržená hrana" in updated.service_notes

    # Nelze půjčit kus v servisu!
    with pytest.raises(HTTPException) as exc_info:
        service.update_item(item.id, EquipmentItemUpdate(status=EquipmentStatus.RENTED))
    assert exc_info.value.status_code == 400
    assert "v servisu nelze zapůjčit" in exc_info.value.detail

    # Návrat ze servisu
    action_return = EquipmentServiceAction(
        action="RETURN_FROM_SERVICE",
        service_notes="Zalito, hrana zabroušena",
        new_condition=EquipmentCondition.GOOD
    )
    returned = service.handle_service_action(item.id, action_return)
    assert returned.status == EquipmentStatus.AVAILABLE
    assert returned.condition == EquipmentCondition.GOOD


def test_discard_item_prevents_rented_item(db_session):
    service = EquipmentService(db_session)
    dto = EquipmentItemCreate(
        inventory_number="DISC-001",
        name="Kanoe Vydra",
        category=EquipmentCategory.BOAT,
        size="450 cm",
        purchase_year=2021,
        daily_rate=250.0,
        deposit=1000.0,
        condition=EquipmentCondition.WORN
    )
    item = service.create_item(dto)
    
    # Nastavíme na RENTED
    service.update_item(item.id, EquipmentItemUpdate(status=EquipmentStatus.RENTED))
    
    # Vyřazení zapůjčeného kusu musí selhat
    with pytest.raises(HTTPException) as exc_info:
        service.discard_item(item.id, reason="Prasklý trup")
    assert exc_info.value.status_code == 400
    assert "který je aktuálně zapůjčen" in exc_info.value.detail
