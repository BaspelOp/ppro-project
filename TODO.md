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
- [ ] Inicializace struktury `backend/` (`src/core`, `models`, `schemas`, `repositories`, `services`, `api`)
- [ ] Vytvoření `requirements.txt` a `.env.example`
- [ ] Konfigurace `backend/Dockerfile`
- [ ] Konfigurace `docker-compose.yml` (služby: `db` PostgreSQL 16, `backend` FastAPI)

### 1.2 Datová vrstva (Data / Infrastructure Layer)
- [ ] Definice SQLAlchemy modelu `EquipmentItem` (inventární číslo, název, kategorie, velikost, rok pořízení, stav opotřebení, provozní stav, poznámka)
- [ ] Nastavení Alembic a vytvoření počáteční migrace `001_initial_equipment`
- [ ] Implementace `EquipmentRepository` (CRUD, filtrování dle kategorie, velikosti a stavu)
- [ ] Vytvoření seedovacího skriptu pro syntetická testovací data (ukázkové lyže, snowboardy, lodě)

### 1.3 Byznys vrstva (Application / Business Layer)
- [ ] Definice Pydantic schémat (`EquipmentItemCreate`, `EquipmentItemUpdate`, `EquipmentItemResponse`, `EquipmentFilterParams`)
- [ ] Implementace `EquipmentService`:
  - [ ] Validace unikátnosti inventárního čísla
  - [ ] Kontrola povolených přechodů provozních stavů (`AVAILABLE`, `RENTED`, `IN_SERVICE`, `DISCARDED`)
  - [ ] Byznys pravidlo: kus v servisu nesmí být k dispozici pro výpůjčku
  - [ ] Validace roku pořízení a povinných parametrů

### 1.4 API Kontrolery (Presentation Layer - API)
- [ ] `GET /api/equipment` – Seznam kusů s filtry (kategorie, stav, fulltext hledání)
- [ ] `GET /api/equipment/{id}` – Detail konkrétního kusu
- [ ] `POST /api/equipment` – Zaevidování nového kusu do půjčovny
- [ ] `PUT /api/equipment/{id}` – Editace kusu a stavu opotřebení
- [ ] `POST /api/equipment/{id}/service` – Odeslání do servisu / návrat ze servisu
- [ ] `DELETE /api/equipment/{id}` – Bezpečné vyřazení kusu

### 1.5 Frontend – Dashboard v Reactu (Presentation Layer - UI)
- [ ] Inicializace Vite projektu s React + TypeScript v `frontend/`
- [ ] Vytvoření moderního design systému (čisté CSS, přehledný dashboard obsluhy)
- [ ] Komponenta: Přehledový dashboard (karty statistik: Celkem kusů, Dostupné, V servisu)
- [ ] Komponenta: Rychlé filtry pro ranní sobotní špičku (kategorie, dostupnost, velikost)
- [ ] Komponenta: Tabulka a karty vybavení s barevným odlišením stavů
- [ ] Komponenta: Modální dialog pro rychlé zaevidování nového kusu
- [ ] Komponenta: Akce pro rychlý přesun do servisu a návrat ze servisu
- [ ] Dockerizace frontendu (`frontend/Dockerfile`) a integrace do `docker-compose.yml`

### 1.6 Testování a verifikace
- [ ] Pytest testy pro `EquipmentService` (validace duplicit, stavová logika)
- [ ] Integrační testy pro FastAPI endpointy
- [ ] Ověření celého stacku spuštěním `docker compose up --build`

### 1.7 Dokumentace & Verzování
- [ ] Aktualizace [README.md](file:///p:/ppro/project/README.md) (zaškrtnutí Zadání D, popis vrstev a entity)
- [ ] Aktualizace sekce Rozhodnutí a Changelogu
- [ ] Git commit s konvenční zprávou `-m` (a push po schválení)

---

## 🚀 FÁZE 2: Rozšíření na 5 entit a vazbu M:N (Plný datový model)
*Spustí se po zpětné vazbě klienta k demu.*

- [ ] Entita `Category` (Lyže, Snowboardy, Boty, Hole, Lodě, Vesty + cenové tarify)
- [ ] Entita `Customer` (Jméno, telefon, číslo dokladu, poznámka)
- [ ] Entita `Rental` (Hlavička výpůjčky: zákazník, datum od, datum do, sjednaná cena, kauce, stav)
- [ ] Entita `RentalItem` (**Vazba M:N**: Výpůjčka $\leftrightarrow$ Kus vybavení, datum vrácení, penále, stav kusu)
- [ ] Entita `ServiceRecord` (Historie servisu: kus, datum od-do, popis zásahu, cena)
- [ ] Byznys pravidlo: Kus nesmí být ve dvou překrývajících se výpůjčkách/rezervacích
- [ ] Byznys pravidlo: Kus v servisu nelze půjčit
- [ ] Byznys pravidlo: Výpočet penále za pozdní vrácení za každý započatý den
- [ ] Byznys pravidlo: Historie výpůjček se nemaže

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
