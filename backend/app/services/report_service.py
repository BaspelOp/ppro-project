import math
from datetime import datetime, timezone
from collections import defaultdict
from sqlalchemy.orm import Session, joinedload

from app.models.equipment import EquipmentItem, EquipmentStatus
from app.models.rental import Rental, RentalItem, RentalStatus
from app.models.service_record import ServiceRecord
from app.services.rental_service import _to_naive_utc, calculate_billing_days, RentalService
from app.schemas.report import (
    ActiveRentedItemReport,
    ActiveOverdueSummaryResponse,
    EquipmentUtilizationItem,
    CategoryUtilizationItem,
    UtilizationReportResponse,
    ProtocolItem,
    RentalProtocolResponse,
)


class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def get_active_and_overdue(self) -> ActiveOverdueSummaryResponse:
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        rentals = (
            self.db.query(Rental)
            .options(
                joinedload(Rental.customer),
                joinedload(Rental.items).joinedload(RentalItem.equipment_item),
            )
            .filter(Rental.status.in_([RentalStatus.ACTIVE, RentalStatus.PARTIALLY_RETURNED]))
            .order_by(Rental.rental_end.asc())
            .all()
        )

        report_items = []
        overdue_count = 0
        total_estimated_penalty = 0.0

        for rental in rentals:
            rental_end = _to_naive_utc(rental.rental_end)
            for item in rental.items:
                if item.returned_at is not None:
                    continue
                is_overdue = now > rental_end
                overdue_days = 0
                est_penalty = 0.0
                if is_overdue:
                    overdue_days = math.ceil((now - rental_end).total_seconds() / 86400.0)
                    est_penalty = overdue_days * item.agreed_daily_rate
                    overdue_count += 1
                    total_estimated_penalty += est_penalty

                eq = item.equipment_item
                cust = rental.customer
                report_items.append(
                    ActiveRentedItemReport(
                        rental_id=rental.id,
                        rental_item_id=item.id,
                        equipment_item_id=item.equipment_item_id,
                        inventory_number=eq.inventory_number if eq else f"#{item.equipment_item_id}",
                        equipment_name=eq.name if eq else "Neznámý kus",
                        category=eq.category.value if eq and hasattr(eq.category, "value") else (str(eq.category) if eq else "OTHER"),
                        customer_id=rental.customer_id,
                        customer_name=cust.name if cust else f"Zákazník #{rental.customer_id}",
                        customer_phone=cust.phone if cust else "",
                        rental_start=rental.rental_start,
                        rental_end=rental.rental_end,
                        agreed_daily_rate=item.agreed_daily_rate,
                        is_overdue=is_overdue,
                        overdue_days=overdue_days,
                        estimated_penalty=est_penalty,
                    )
                )

        # Prodlené položky nahoře
        report_items.sort(key=lambda x: (not x.is_overdue, x.rental_end))

        return ActiveOverdueSummaryResponse(
            active_rentals_count=len(rentals),
            active_items_count=len(report_items),
            overdue_items_count=overdue_count,
            total_estimated_penalty=total_estimated_penalty,
            items=report_items,
        )

    def get_utilization_report(self) -> UtilizationReportResponse:
        equipment_list = self.db.query(EquipmentItem).order_by(EquipmentItem.inventory_number.asc()).all()
        rental_items = (
            self.db.query(RentalItem)
            .join(Rental, RentalItem.rental_id == Rental.id)
            .options(joinedload(RentalItem.rental))
            .filter(Rental.status != RentalStatus.CANCELLED)
            .all()
        )
        service_records = self.db.query(ServiceRecord).all()

        # Agregace dle kusu
        eq_rental_count = defaultdict(int)
        eq_rented_days = defaultdict(int)
        eq_revenue = defaultdict(float)

        for ri in rental_items:
            eq_rental_count[ri.equipment_item_id] += 1
            start_dt = _to_naive_utc(ri.rental.rental_start)
            end_dt = _to_naive_utc(ri.rental.rental_end)
            days, _ = calculate_billing_days(start_dt, end_dt)
            eq_rented_days[ri.equipment_item_id] += int(math.ceil(days))
            eq_revenue[ri.equipment_item_id] += (days * ri.agreed_daily_rate) + (ri.late_penalty or 0.0)

        eq_service_count = defaultdict(int)
        eq_service_cost = defaultdict(float)
        for sr in service_records:
            eq_service_count[sr.equipment_item_id] += 1
            eq_service_cost[sr.equipment_item_id] += sr.cost or 0.0

        by_equipment = []
        cat_stats = defaultdict(lambda: {
            "total_items": 0,
            "available_items": 0,
            "rented_items": 0,
            "in_service_items": 0,
            "total_rentals": 0,
            "total_revenue": 0.0,
        })

        for eq in equipment_list:
            cat_key = eq.category.value if hasattr(eq.category, "value") else str(eq.category)
            st_val = eq.status.value if hasattr(eq.status, "value") else str(eq.status)

            r_cnt = eq_rental_count[eq.id]
            r_days = eq_rented_days[eq.id]
            r_rev = round(eq_revenue[eq.id], 2)

            by_equipment.append(
                EquipmentUtilizationItem(
                    equipment_item_id=eq.id,
                    inventory_number=eq.inventory_number,
                    name=eq.name,
                    category=cat_key,
                    status=st_val,
                    rental_count=r_cnt,
                    total_rented_days=r_days,
                    total_revenue=r_rev,
                    service_count=eq_service_count[eq.id],
                    total_service_cost=round(eq_service_cost[eq.id], 2),
                )
            )

            cs = cat_stats[cat_key]
            if eq.status != EquipmentStatus.DISCARDED:
                cs["total_items"] += 1
            if eq.status == EquipmentStatus.AVAILABLE:
                cs["available_items"] += 1
            elif eq.status == EquipmentStatus.RENTED:
                cs["rented_items"] += 1
            elif eq.status == EquipmentStatus.IN_SERVICE:
                cs["in_service_items"] += 1
            cs["total_rentals"] += r_cnt
            cs["total_revenue"] += r_rev

        by_equipment.sort(key=lambda x: (x.rental_count, x.total_revenue), reverse=True)

        by_category = []
        for cat_key, cs in cat_stats.items():
            active_pool = cs["total_items"]
            occupancy_pct = round((cs["rented_items"] / active_pool * 100.0), 1) if active_pool > 0 else 0.0
            by_category.append(
                CategoryUtilizationItem(
                    category=cat_key,
                    total_items=cs["total_items"],
                    available_items=cs["available_items"],
                    rented_items=cs["rented_items"],
                    in_service_items=cs["in_service_items"],
                    total_rentals=cs["total_rentals"],
                    total_revenue=round(cs["total_revenue"], 2),
                    occupancy_pct=occupancy_pct,
                )
            )

        by_category.sort(key=lambda x: (x.occupancy_pct, x.total_rentals), reverse=True)

        return UtilizationReportResponse(
            by_category=by_category,
            by_equipment=by_equipment,
        )

    def get_rental_protocol(self, rental_id: int) -> RentalProtocolResponse:
        rental = RentalService(self.db).get_rental(rental_id)
        start_dt = _to_naive_utc(rental.rental_start)
        end_dt = _to_naive_utc(rental.rental_end)
        billing_days, _ = calculate_billing_days(start_dt, end_dt)

        items = []
        total_penalties = 0.0
        for ri in rental.items:
            eq = ri.equipment_item
            total_penalties += ri.late_penalty or 0.0
            items.append(
                ProtocolItem(
                    inventory_number=eq.inventory_number if eq else f"#{ri.equipment_item_id}",
                    name=eq.name if eq else "Vybavení",
                    size=eq.size if eq else "-",
                    agreed_daily_rate=ri.agreed_daily_rate,
                    agreed_deposit=ri.agreed_deposit,
                    returned_at=ri.returned_at,
                    late_penalty=ri.late_penalty,
                    item_return_condition=ri.item_return_condition.value if ri.item_return_condition else None,
                )
            )

        cust = rental.customer
        return RentalProtocolResponse(
            protocol_number=f"HV-{rental.created_at.year}-{rental.id:05d}",
            generated_at=datetime.now(timezone.utc),
            provider_name="Půjčovna vybavení „Hory a voda“ – Martin Řehák",
            provider_address="Hradecká 1249/6, 500 03 Hradec Králové",
            rental_id=rental.id,
            status=rental.status.value if hasattr(rental.status, "value") else str(rental.status),
            tariff_type=rental.tariff_type or "STANDARD",
            rental_start=rental.rental_start,
            rental_end=rental.rental_end,
            billing_days=billing_days,
            customer_name=cust.name if cust else f"Zákazník #{rental.customer_id}",
            customer_phone=cust.phone if cust else "",
            customer_id_card=cust.id_card_number if cust else "",
            customer_email=cust.email if cust else None,
            total_deposit=rental.total_deposit,
            discount_amount=rental.discount_amount,
            total_price=rental.total_price,
            total_penalties=round(total_penalties, 2),
            notes=rental.notes,
            items=items,
        )
