from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.category import Category
from app.models.customer import Customer
from app.models.equipment import EquipmentItem, EquipmentCategory, EquipmentStatus, EquipmentCondition
from app.models.rental import Rental, RentalItem, RentalStatus
from app.models.service_record import ServiceRecord


SAMPLE_CATEGORIES = [
    {"code": "SKIS", "name": "Lyže", "default_daily_rate": 400.0, "default_deposit": 2000.0, "description": "Sjezdové, carvingové a skialpové lyže"},
    {"code": "SNOWBOARD", "name": "Snowboardy", "default_daily_rate": 380.0, "default_deposit": 2000.0, "description": "All-mountain a freestyle snowboardy s vázáním"},
    {"code": "BOOTS", "name": "Boty", "default_daily_rate": 180.0, "default_deposit": 1000.0, "description": "Lyžařské a snowboardové boty"},
    {"code": "POLES", "name": "Hole", "default_daily_rate": 60.0, "default_deposit": 300.0, "description": "Sjezdové a skialpové hole"},
    {"code": "BOAT", "name": "Lodě / Kanoe", "default_daily_rate": 300.0, "default_deposit": 1500.0, "description": "Plastové a nafukovací kanoe"},
    {"code": "RAFT", "name": "Rafty", "default_daily_rate": 750.0, "default_deposit": 4000.0, "description": "Vícemístné nafukovací rafty"},
    {"code": "PADDLE", "name": "Pádla", "default_daily_rate": 50.0, "default_deposit": 200.0, "description": "Kanoistická a raftová pádla"},
    {"code": "LIFE_JACKET", "name": "Vesty", "default_daily_rate": 70.0, "default_deposit": 400.0, "description": "Certifikované záchranné a vodácké vesty"},
    {"code": "HELMET", "name": "Helmy", "default_daily_rate": 90.0, "default_deposit": 500.0, "description": "Lyžařské a vodácké přilby"},
    {"code": "OTHER", "name": "Ostatní", "default_daily_rate": 100.0, "default_deposit": 500.0, "description": "Doplňkové vybavení a příslušenství"},
]

SAMPLE_CUSTOMERS = [
    {"name": "Jan Novotný", "phone": "+420 602 111 222", "email": "jan.novotny@example.cz", "id_card_number": "OP-2024001", "notes": "Stálý zákazník, jezdí pravidelně do Krkonoš"},
    {"name": "Petra Svobodová", "phone": "+420 777 333 444", "email": "petra.svobodova@example.cz", "id_card_number": "OP-2024002", "notes": "Preferuje snowboardové sety"},
    {"name": "Tomáš Dvořák", "phone": "+420 608 555 666", "email": "tomas.dvorak@example.cz", "id_card_number": "OP-2024003", "notes": "Vodácký oddíl Hradec Králové"},
    {"name": "Lucie Černá", "phone": "+420 731 777 888", "email": "lucie.cerna@example.cz", "id_card_number": "OP-2024004", "notes": "Rodinné výpůjčky"},
]


SAMPLE_EQUIPMENT = [
    {
        "inventory_number": "SKI-001",
        "name": "Atomic Redster G9 Revoshock",
        "category": EquipmentCategory.SKIS,
        "size": "177 cm",
        "purchase_year": 2024,
        "daily_rate": 450.0,
        "deposit": 2000.0,
        "condition": EquipmentCondition.NEW,
        "status": EquipmentStatus.AVAILABLE,
        "notes": "Sportovní obřačka, špičkový stav, po kompletním servisu",
    },
    {
        "inventory_number": "SKI-002",
        "name": "Salomon S/Max 10",
        "category": EquipmentCategory.SKIS,
        "size": "165 cm",
        "purchase_year": 2023,
        "daily_rate": 350.0,
        "deposit": 1500.0,
        "condition": EquipmentCondition.GOOD,
        "status": EquipmentStatus.AVAILABLE,
        "notes": "Univerzální carvingové lyže pro pokročilé lyžaře",
    },
    {
        "inventory_number": "SKI-003",
        "name": "Head Supershape e-Magnum",
        "category": EquipmentCategory.SKIS,
        "size": "170 cm",
        "purchase_year": 2023,
        "daily_rate": 420.0,
        "deposit": 2000.0,
        "condition": EquipmentCondition.GOOD,
        "status": EquipmentStatus.RENTED,
        "notes": "Zapůjčeno na víkendový výjezd do Pece pod Sněžkou",
    },
    {
        "inventory_number": "SKI-004",
        "name": "Fischer Travers Skialp Set",
        "category": EquipmentCategory.SKIS,
        "size": "176 cm",
        "purchase_year": 2024,
        "daily_rate": 550.0,
        "deposit": 3000.0,
        "condition": EquipmentCondition.GOOD,
        "status": EquipmentStatus.IN_SERVICE,
        "service_notes": "Provádí se montáž a seřízení skialpového vázání a impregnace pásů",
        "notes": "Kompletní skialpový set včetně stoupacích pásů",
    },
    {
        "inventory_number": "SNW-001",
        "name": "Burton Custom Camber",
        "category": EquipmentCategory.SNOWBOARD,
        "size": "158 cm (Wide)",
        "purchase_year": 2024,
        "daily_rate": 390.0,
        "deposit": 2000.0,
        "condition": EquipmentCondition.NEW,
        "status": EquipmentStatus.AVAILABLE,
        "notes": "All-mountain prkno s vázáním Burton Cartel",
    },
    {
        "inventory_number": "SNW-002",
        "name": "Nitro Team Pro",
        "category": EquipmentCategory.SNOWBOARD,
        "size": "155 cm",
        "purchase_year": 2023,
        "daily_rate": 350.0,
        "deposit": 1500.0,
        "condition": EquipmentCondition.GOOD,
        "status": EquipmentStatus.RENTED,
        "notes": "Oblíbené all-round prkno pro středně pokročilé",
    },
    {
        "inventory_number": "BOT-001",
        "name": "Salomon S/Pro 100 GW",
        "category": EquipmentCategory.BOOTS,
        "size": "28.5 (EU 44)",
        "purchase_year": 2023,
        "daily_rate": 180.0,
        "deposit": 1000.0,
        "condition": EquipmentCondition.GOOD,
        "status": EquipmentStatus.AVAILABLE,
        "notes": "Skelet 100 flex, GripWalk podrážka",
    },
    {
        "inventory_number": "BOT-002",
        "name": "Nordica Sportmachine 3 90",
        "category": EquipmentCategory.BOOTS,
        "size": "26.5 (EU 41)",
        "purchase_year": 2024,
        "daily_rate": 180.0,
        "deposit": 1000.0,
        "condition": EquipmentCondition.GOOD,
        "status": EquipmentStatus.AVAILABLE,
        "notes": "Pohodlné rekreační sjezdové boty s širším kopytem",
    },
    {
        "inventory_number": "BOT-003",
        "name": "Burton Moto BOA Snowboard Boty",
        "category": EquipmentCategory.BOOTS,
        "size": "43 EU",
        "purchase_year": 2023,
        "daily_rate": 160.0,
        "deposit": 1000.0,
        "condition": EquipmentCondition.WORN,
        "status": EquipmentStatus.IN_SERVICE,
        "service_notes": "Výměna lanka BOA systému na pravé botě",
        "notes": "Měkčí freestylová bota s rychloutahováním",
    },
    {
        "inventory_number": "HEL-001",
        "name": "Atomic Count XTD Přilba",
        "category": EquipmentCategory.HELMET,
        "size": "M (55-59 cm)",
        "purchase_year": 2024,
        "daily_rate": 90.0,
        "deposit": 500.0,
        "condition": EquipmentCondition.NEW,
        "status": EquipmentStatus.AVAILABLE,
        "notes": "Velmi lehká přilba se systémem Holo Core",
    },
    {
        "inventory_number": "POL-001",
        "name": "Leki Spark S Hůlky",
        "category": EquipmentCategory.POLES,
        "size": "125 cm",
        "purchase_year": 2023,
        "daily_rate": 60.0,
        "deposit": 300.0,
        "condition": EquipmentCondition.GOOD,
        "status": EquipmentStatus.AVAILABLE,
        "notes": "Systém Trigger S bezpečnostního poutka",
    },
    {
        "inventory_number": "BOAT-001",
        "name": "Kanoe Vydra Plastová (Maku)",
        "category": EquipmentCategory.BOAT,
        "size": "2-místná (450 cm)",
        "purchase_year": 2022,
        "daily_rate": 280.0,
        "deposit": 1500.0,
        "condition": EquipmentCondition.GOOD,
        "status": EquipmentStatus.AVAILABLE,
        "notes": "Odolná plastová kanoe na řeku Orlici a Labe",
    },
    {
        "inventory_number": "BOAT-002",
        "name": "Nafukovací Kanoe Gumotex Pálava",
        "category": EquipmentCategory.BOAT,
        "size": "2-místná (400 cm)",
        "purchase_year": 2023,
        "daily_rate": 320.0,
        "deposit": 2000.0,
        "condition": EquipmentCondition.GOOD,
        "status": EquipmentStatus.RENTED,
        "notes": "Sbaleno v transportním vaku včetně houby a pumpy",
    },
    {
        "inventory_number": "RAFT-001",
        "name": "Raft Gumotex Colorado 450",
        "category": EquipmentCategory.RAFT,
        "size": "6 osob (450 cm)",
        "purchase_year": 2023,
        "daily_rate": 750.0,
        "deposit": 4000.0,
        "condition": EquipmentCondition.GOOD,
        "status": EquipmentStatus.AVAILABLE,
        "notes": "Šestimístný nafukovací raft s bezpečnostními lany",
    },
    {
        "inventory_number": "VES-001",
        "name": "Záchranná vesta Hiko Baby / Dětská",
        "category": EquipmentCategory.LIFE_JACKET,
        "size": "Dětská S (do 25 kg)",
        "purchase_year": 2024,
        "daily_rate": 70.0,
        "deposit": 400.0,
        "condition": EquipmentCondition.NEW,
        "status": EquipmentStatus.AVAILABLE,
        "notes": "S límcem a mezinožním popruhem pro maximální bezpečí dětí",
    },
    {
        "inventory_number": "VES-002",
        "name": "Vodácká vesta Hiko Sport Standard",
        "category": EquipmentCategory.LIFE_JACKET,
        "size": "L/XL (60-90 kg)",
        "purchase_year": 2023,
        "daily_rate": 70.0,
        "deposit": 400.0,
        "condition": EquipmentCondition.GOOD,
        "status": EquipmentStatus.AVAILABLE,
        "notes": "Certifikace EN ISO 12402-5",
    },
    {
        "inventory_number": "PAD-001",
        "name": "Kanoistické pádlo Profiplast Dural",
        "category": EquipmentCategory.PADDLE,
        "size": "155 cm",
        "purchase_year": 2022,
        "daily_rate": 50.0,
        "deposit": 200.0,
        "condition": EquipmentCondition.GOOD,
        "status": EquipmentStatus.AVAILABLE,
        "notes": "Duralová žerď s plastovým listem",
    },
    {
        "inventory_number": "SKI-099",
        "name": "Staré lyže Blizzard Quattro (Vyřazeno)",
        "category": EquipmentCategory.SKIS,
        "size": "162 cm",
        "purchase_year": 2018,
        "daily_rate": 200.0,
        "deposit": 1000.0,
        "condition": EquipmentCondition.DAMAGED,
        "status": EquipmentStatus.DISCARDED,
        "notes": "Vyřazeno po vytržení vázání z jádra na sjezdovce [Vyřazeno: Neopravitelné poškození jádra]",
    }
]


def seed_database(db: Session) -> int:
    """Populates the database with realistic synthetic data (Categories, Equipment, Customers, Rentals, ServiceRecords) if empty."""
    # 1. Seed categories if empty
    cat_map = {}
    if db.query(Category).count() == 0:
        for cat_data in SAMPLE_CATEGORIES:
            cat = Category(**cat_data)
            db.add(cat)
        db.flush()
    for cat in db.query(Category).all():
        cat_map[cat.code] = cat.id

    # 2. Seed equipment items if empty
    count = db.query(EquipmentItem).count()
    created_count = 0
    if count == 0:
        for data in SAMPLE_EQUIPMENT:
            item_data = dict(data)
            cat_code = item_data["category"].value if hasattr(item_data["category"], "value") else str(item_data["category"])
            item_data["category_id"] = cat_map.get(cat_code)
            item = EquipmentItem(**item_data)
            db.add(item)
            created_count += 1
        db.flush()

    # 3. Seed customers if empty
    if db.query(Customer).count() == 0:
        for cust_data in SAMPLE_CUSTOMERS:
            db.add(Customer(**cust_data))
        db.flush()

    # 4. Seed service records for items currently IN_SERVICE if empty
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if db.query(ServiceRecord).count() == 0:
        in_service_items = db.query(EquipmentItem).filter(EquipmentItem.status == EquipmentStatus.IN_SERVICE).all()
        for eq in in_service_items:
            db.add(
                ServiceRecord(
                    equipment_item_id=eq.id,
                    service_start=now - timedelta(days=2),
                    issue_description=eq.service_notes or "Pravidelná údržba a seřízení",
                    cost=350.0,
                )
            )
        db.flush()

    # 5. Seed sample rentals (M:N) if empty
    if db.query(Rental).count() == 0:
        customers = db.query(Customer).order_by(Customer.id.asc()).all()
        eq_by_inv = {eq.inventory_number: eq for eq in db.query(EquipmentItem).all()}

        if len(customers) >= 3 and "SKI-003" in eq_by_inv and "SNW-002" in eq_by_inv and "BOAT-002" in eq_by_inv:
            # Aktivní výpůjčka 1 (aktuálně v termínu)
            r1 = Rental(
                customer_id=customers[0].id,
                rental_start=now - timedelta(days=1),
                rental_end=now + timedelta(days=2),
                total_deposit=eq_by_inv["SKI-003"].deposit,
                discount_amount=0.0,
                total_price=eq_by_inv["SKI-003"].daily_rate * 3,
                status=RentalStatus.ACTIVE,
                notes="Víkendový výjezd Pec pod Sněžkou",
            )
            db.add(r1)
            db.flush()
            db.add(RentalItem(
                rental_id=r1.id,
                equipment_item_id=eq_by_inv["SKI-003"].id,
                agreed_daily_rate=eq_by_inv["SKI-003"].daily_rate,
                agreed_deposit=eq_by_inv["SKI-003"].deposit,
            ))

            # Aktivní výpůjčka 2 (po termínu - pro demonstraci výpočtu penále)
            r2 = Rental(
                customer_id=customers[1].id,
                rental_start=now - timedelta(days=4),
                rental_end=now - timedelta(days=1),
                total_deposit=eq_by_inv["SNW-002"].deposit,
                discount_amount=0.0,
                total_price=eq_by_inv["SNW-002"].daily_rate * 3,
                status=RentalStatus.ACTIVE,
                notes="Po termínu vrácení – při vrácení se automaticky napočítá penále",
            )
            db.add(r2)
            db.flush()
            db.add(RentalItem(
                rental_id=r2.id,
                equipment_item_id=eq_by_inv["SNW-002"].id,
                agreed_daily_rate=eq_by_inv["SNW-002"].daily_rate,
                agreed_deposit=eq_by_inv["SNW-002"].deposit,
            ))

            # Budoucí rezervace 3 (RESERVED)
            if "RAFT-001" in eq_by_inv and "VES-002" in eq_by_inv:
                r3 = Rental(
                    customer_id=customers[2].id,
                    rental_start=now + timedelta(days=5),
                    rental_end=now + timedelta(days=7),
                    total_deposit=eq_by_inv["RAFT-001"].deposit + eq_by_inv["VES-002"].deposit,
                    discount_amount=100.0,
                    total_price=(eq_by_inv["RAFT-001"].daily_rate + eq_by_inv["VES-002"].daily_rate) * 2 - 100.0,
                    status=RentalStatus.RESERVED,
                    notes="Rezervace na příští víkend – sjezd Orlice",
                )
                db.add(r3)
                db.flush()
                for inv in ("RAFT-001", "VES-002"):
                    db.add(RentalItem(
                        rental_id=r3.id,
                        equipment_item_id=eq_by_inv[inv].id,
                        agreed_daily_rate=eq_by_inv[inv].daily_rate,
                        agreed_deposit=eq_by_inv[inv].deposit,
                    ))

    db.commit()
    return created_count
