# AGENTS.md – Pravidla a zásady pro asistenta (PPRO Project)

Tento dokument definuje pravidla chování, pracovní postupy, architektonické standardy a provozní zásady pro vývojového asistenta při práci na semestrálním projektu předmětu **Pokročilé programování (PPRO)** na FIM UHK (zimní semestr 2026/2027).

---

## 1. Role a poslání asistenta

- **Role:** Asistent pro vývoj, architekturu a technickou dokumentaci.
- **Cíl:** Dodat plně funkční aplikaci splňující veškeré požadavky klienta a formální kritéria předmětu PPRO.
- **Klíčový princip:** Každá implementovaná funkcionalita musí být ověřitelná spuštěním aplikace. Přednost má funkční a otestovaný kód před neimplementovanými plány.

---

## 2. Zásady práce s Git repozitářem

Při práci s verzovacím systémem Git je asistent **povinen** striktně dodržovat tato pravidla:

### 2.1 Commity – Vždy s přepínačem `-m`
- **Povinnost:** Každý commit musí být proveden příkazem:
  ```bash
  git commit -m "<typ>: <výstižný popis změny>"
  ```
- **Zprávy commitů:** Používat standard Conventional Commits:
  - `feat:` nová funkcionalita
  - `fix:` oprava chyby
  - `docs:` aktualizace dokumentace (`README.md`, `AGENTS.md` apod.)
  - `refactor:` refaktoring kódu bez změny chování
  - `test:` přidání či úprava testů
  - `chore:` konfigurační či údržbové práce (Docker, závislosti, CI/CD)
- **Zákaz:** Nikdy nespouštět `git commit` bez parametru `-m`, aby nedošlo k uvíznutí v interaktivním terminálovém editoru.

### 2.2 Push operace – Výhradně na explicitní povel uživatele
- **Striktní zákaz automatického pushování:** Asistent **NIKDY nesmí** provést `git push` svévolně nebo automaticky v rámci běhu úloh.
- **Pravidlo schválení:** `git push` lze provést **pouze a výhradně tehdy**, kdy uživatel výslovně a explicitně vydá povel (např. *"nyní to pushni"*, *"pushni změny na GitHub"*).
- V ostatních případech asistent změny pouze commitne lokálně a uživatele informuje, že změny jsou připraveny k pushnutí.

### 2.3 Kontrola technické dokumentace před commitem
- **Pravidlo jediného zdroje pravdy:** Před **každým** commitem se asistent ujistí, že soubor [README.md](file:///p:/ppro/project/README.md) byl zkontrolován a v případě potřeby aktualizován.
- Pokud commit přináší:
  - novou funkcionalitu či změnu chování,
  - architektonické rozhodnutí nebo vyřešení otevřeného bodu klienta,
  - změnu datového modelu, entit či konfigurace,
  musí být tyto změny **nejprve promítnuty do [README.md](file:///p:/ppro/project/README.md)** a zahrnuty v commitu.
- Pro dodržení tohoto pravidla je v repozitáři aktivní Git hook (`pre-commit`), který připomíná a kontroluje stav dokumentace.

---

## 3. Technická dokumentace jako jediný zdroj pravdy (SSOT)

Soubor [README.md](file:///p:/ppro/project/README.md) je centrálním bodem celé zakázky a technické dokumentace:
1. **Specifikace a zadání klienta:**
   - Rozpad na: *Co klient chce* (funkční požadavky), *Na čem klient trvá* (obchodní pravidla, nesmí jít obejít), *Co klient prohodil mimochodem* (volitelné nápady).
2. **Sekce „Rozhodnutí“ (Otevřené body klienta):**
   - Ke každému neujasněnému bodu ze zadání musí být zapsáno jasné rozhodnutí v rozsahu 1–2 vět: **jak to bylo vyřešeno a proč**.
   - Tato sekce slouží jako podklad pro obhajobu projektu u vyučujícího.
3. **Architektura a datový model:**
   - Diagram a popis tří vrstev se závislostmi jedním směrem.
   - ER diagram entit (minimálně 5 entit, alespoň jedna vazba M:N).
4. **Instrukce ke spuštění a testování:**
   - Návod na zprovoznění přes `docker compose up`.
   - Příkazy pro spuštění testů a migrací.
5. **Deník postupu (Changelog):**
   - Průběžný chronologický záznam o vývoji a milnících.

---

## 4. Společné povinné minimum pro projekt (PPRO)

Každý kód a architektura v tomto repozitáři musí splňovat tyto nepřekročitelné požadavky:
- **Třívrstvá architektura:**
  - 1. Prezentační vrstva (UI / REST API kontrolery)
  - 2. Aplikační / Byznys vrstva (služby, doménová logika, validace obchodních pravidel)
  - 3. Datová / Infrastrukturní vrstva (persistence, repozitáře, přístup k DB)
  - **Závislosti výhradně jedním směrem** (Prezentace $\rightarrow$ Byznys $\rightarrow$ Data/Infrastruktura; případně Dependency Inversion).
- **Relační databáze v Dockeru s migracemi:**
  - Databáze (např. PostgreSQL / MySQL) spouštěná v kontejneru.
  - Schéma spravované striktně migračními nástroji (žádné ruční ad-hoc SQL úpravy bez migrace).
- **Datový model:**
  - Nejméně 5 doménových entit.
  - Alespoň jedna vazba typu M:N (mnoho k mnohým).
- **Testy:**
  - Jednotkové (unit) a integrační testy pokrývající klíčová obchodní pravidla a hraniční stavy.
- **Spuštění jedním příkazem:**
  - Celé prostředí (aplikace + databáze + závislosti) musí jít spustit příkazem `docker compose up`.
- **Integrita a bezpečnost dat:**
  - **Pouze syntetická data:** Žádné reálné osobní údaje, žádná data z práce či stáže.
  - **Žádné citlivé údaje v repozitáři:** Žádná hesla, API klíče ani produkční tokeny v gitu (používat `.env.example` a `.gitignore`).

---

## 5. Reakce na změny klienta a zpětnou vazbu

Během semestru vystupuje vyučující (Dominik Palla) v roli klienta a ověřuje stav aplikace přímo na cvičeních:
- **Připravenost na změnu zadání:** Klient může změnit názor na otevřené body. Architektura musí být modulární, aby změna nevedla k přepsání celého systému.
- **Ověřování spuštěním:** Odpověď *"to už mám hotové"* je platná pouze tehdy, když ji lze ihned demonstrovat v běžící aplikaci.
- **Argumentace omezení:** Odpověď *"to nejde"* je legitimní, pokud je podložena technickým či doménovým zdůvodněním zapsaným v dokumentaci.
- Jakákoliv změna schválená či požadovaná klientem se neprodleně zapíše do [README.md](file:///p:/ppro/project/README.md) v sekci *Rozhodnutí*.

---

## 6. Krokování featur a sledování postupu (TODO.md)

- Pro detailní řízení implementace a sledování postupu slouží soubor [TODO.md](file:///p:/ppro/project/TODO.md).
- Asistent při implementaci postupuje systematicky krok za krokem:
  - Před zahájením práce na featuře označí úkol stavem `[/]` (rozpracováno).
  - Po dokončení a otestování označí úkol stavem `[x]` (hotovo).
- [TODO.md](file:///p:/ppro/project/TODO.md) je udržován aktuální společně s [README.md](file:///p:/ppro/project/README.md) při každém milníku a commitu.
