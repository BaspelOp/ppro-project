# TODO.md – Seznam úkolů a stav implementace (PPRO Project)

**Projekt:** Půjčovna vybavení „Hory a voda“ (Zadání D)  
**Klient:** Martin Řehák  
**Garant / Vyučující:** Dominik Palla  
**Stack:** React + Vite + TypeScript (Frontend), Python + FastAPI + SQLAlchemy (Backend), PostgreSQL 16 (Docker)  
**Aktualizováno:** 2026-09-30  

---

## Legenda stavů
- `[ ]` Nezahájeno
- `[/]` Rozpracováno
- `[x]` Dokončeno a otestováno

---

## 🎯 FÁZE 1: MVP Demo – Správa entity Kus vybavení (`EquipmentItem`)
*Cíl: Připravit plně funkční 3-vrstvou aplikaci v Dockeru se správou první klíčové entity pro demonstraci klientovi a vyučujícímu.*

### 1.1 Backend & Docker infrastruktura
- [x] Inicializace struktury `backend/` (`app/core`, `models`, `schemas`, `repositories`, `services`, `api`)
- [x] Vytvoření `requirements.txt` a `.env.example`
- [x] Konfigurace `backend/Dockerfile`
- [x] Konfigurace `docker-compose.yml` (služby: `db` PostgreSQL 16, `backend` FastAPI, `frontend` React/Nginx)

### 1.2 Datová vrstva (Data / Infrastructure Layer)
- [x] Definice SQLAlchemy modelu `EquipmentItem` (inventární číslo, název, kategorie, velikost, rok pořízení, stav opotřebení, provozní stav, poznámka)
- [x] Nastavení Alembic a vytvoření počáteční migrace `001_initial_equipment`
- [x] Implementace `EquipmentRepository` (CRUD, filtrování dle kategorie, velikosti a stavu, agregace statistik)
- [x] Vytvoření seedovacího skriptu pro syntetická testovací data (ukázkové lyže, snowboardy, lodě, rafty, vesty)

### 1.3 Byznys vrstva (Application / Business Layer)
- [x] Definice Pydantic schémat (`EquipmentItemCreate`, `EquipmentItemUpdate`, `EquipmentItemResponse`, `EquipmentServiceAction`, `EquipmentStatsResponse`)
- [x] Implementace `EquipmentService`:
  - [x] Validace unikátnosti inventárního čísla
  - [x] Kontrola povolených přechodů provozních stavů (`AVAILABLE`, `RENTED`, `IN_SERVICE`, `DISCARDED`)
  - [x] Byznys pravidlo: kus v servisu nesmí být k dispozici pro výpůjčku
  - [x] Validace roku pořízení a povinných parametrů

### 1.4 API Kontrolery (Presentation Layer - API)
- [x] `GET /api/v1/equipment` – Seznam kusů s filtry (kategorie, stav, fulltext hledání)
- [x] `GET /api/v1/equipment/stats` – Souhrnné statistiky pro ranní dashboard
- [x] `GET /api/v1/equipment/{id}` – Detail konkrétního kusu
- [x] `POST /api/v1/equipment` – Zaevidování nového kusu do půjčovny
- [x] `PUT /api/v1/equipment/{id}` – Editace kusu a stavu opotřebení
- [x] `POST /api/v1/equipment/{id}/service` – Odeslání do servisu / návrat ze servisu
- [x] `DELETE /api/v1/equipment/{id}` – Bezpečné vyřazení kusu

### 1.5 Frontend – Dashboard v Reactu (Presentation Layer - UI)
- [x] Inicializace Vite projektu s React + TypeScript v `frontend/`
- [x] Vytvoření moderního design systému (čisté CSS, přehledný dashboard obsluhy)
- [x] Komponenta: Přehledový dashboard (karty statistik: Celkem kusů, Dostupné, Zapůjčeno, V servisu, Vyřazeno s možností filtrace kliknutím)
- [x] Komponenta: Rychlé filtry pro ranní sobotní špičku (kategorie, dostupnost, velikost, fulltext vyhledávání)
- [x] Komponenta: Tabulka a karty vybavení s barevným odlišením stavů
- [x] Komponenta: Modální dialog pro rychlé zaevidování nového kusu
- [x] Komponenta: Akce pro rychlý přesun do servisu a návrat ze servisu
- [x] Dockerizace frontendu (`frontend/Dockerfile`, `nginx.conf`) a integrace do `docker-compose.yml`

### 1.6 Testování a verifikace
- [x] Pytest testy pro `EquipmentService` (validace duplicit, stavová logika)
- [x] Integrační testy pro FastAPI endpointy (7 testů, 100% úspěšnost)
- [x] Ověření HTTP komunikace a servírování SPA rozhraní

### 1.7 Dokumentace & Verzování
- [x] Aktualizace [README.md](file:///p:/ppro/project/README.md) (zaškrtnutí Zadání D, popis vrstev a entity, rozhodnutí)
- [x] Aktualizace sekce Rozhodnutí a Changelogu
- [ ] Git commit s konvenční zprávou `-m` (a push po schválení)

---

## 🚀 FÁZE 2: Rozšíření na 5 entit a vazbu M:N (Plný datový model)
*Spustí se po zpětné vazbě klienta k demu.*

- [x] Entita `Category` (Lyže, Snowboardy, Boty, Hole, Lodě, Vesty + cenové tarify)
- [x] Entita `Customer` (Jméno, telefon, číslo dokladu, poznámka)
- [x] Entita `Rental` (Hlavička výpůjčky: zákazník, datum od, datum do, sjednaná cena, kauce, stav)
- [x] Entita `RentalItem` (**Vazba M:N**: Výpůjčka $\leftrightarrow$ Kus vybavení, datum vrácení, penále, stav kusu)
- [x] Entita `ServiceRecord` (Historie servisu: kus, datum od-do, popis zásahu, cena)
- [x] Byznys pravidlo: Kus nesmí být ve dvou překrývajících se výpůjčkách/rezervacích
- [x] Byznys pravidlo: Kus v servisu nelze půjčit
- [x] Byznys pravidlo: Výpočet penále za pozdní vrácení za každý započatý den
- [x] Byznys pravidlo: Historie výpůjček se nemaže

---

## 📊 FÁZE 3: Reporting a doplňkové funkce
- [ ] Dashboard: Přehled aktuálně zapůjčených kusů a prodlení s vrácením
- [ ] Dashboard: Statistika vytíženosti vybavení (podklad pro dokupování)
- [ ] Možnost částečného vrácení výpůjčky (např. vrácení lyží dříve než bot)
- [ ] Víkendový tarif (páteční odpoledne až pondělí ráno)
- [ ] Generování předvyplněného protokolu o výpůjčce (náhled / tisk)

---

## 🎓 FÁZE 4: Příprava k obhajobě
- [ ] Kontrola splnění všech bodů Společného minima PPRO
- [ ] Zkompletování sekce Rozhodnutí v `README.md` (odůvodnění všech 5 otevřených bodů)
- [ ] Verifikace spuštění na čistém stroji z repozitáře jedním příkazem `docker compose up`
