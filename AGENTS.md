# AGENTS.md

> Vorläufige Minimalversion.  
> Diese Datei soll bewusst klein bleiben und später anhand tatsächlicher Erfahrungen mit Codex erweitert werden.

## Zweck

Diese Datei enthält **dauerhafte Arbeitsregeln für Codex in diesem Repository**.

Sie ist **keine Feature-Roadmap** und ersetzt keinen konkreten Arbeitsauftrag.

Für geplante Funktionen siehe `ROADMAP.md`.

---

## Projekt

Finance Planner ist eine private Anwendung zur Verwaltung und Analyse von Haushaltsfinanzen.

Aktueller Stack:

- Backend: Java / Spring Boot
- Datenbank: SQLite
- Frontend: React
- UI: Bootstrap
- Charts: Chart.js

---

## Quellen im Repository

- `README.md` beschreibt Projekt, Setup und aktuellen technischen Stand.
- `ROADMAP.md` beschreibt geplante und langfristige Funktionen.
- Der konkrete Benutzerauftrag definiert immer, **was jetzt tatsächlich umgesetzt werden soll**.

### Wichtige Scope-Regel

`ROADMAP.md` ist Kontext und **kein automatischer Arbeitsauftrag**.

Implementiere niemals weitere Roadmap-Punkte nur deshalb, weil sie dort erwähnt werden.

Wenn der aktuelle Auftrag vier Features nennt, bearbeite nur diese vier Features.

---

## Arbeitsweise

Vor Änderungen:

1. Relevante bestehende Dateien und Strukturen untersuchen.
2. Vorhandene Architektur und Naming Conventions berücksichtigen.
3. Bestehende Lösungen wiederverwenden, wenn sie fachlich und technisch passen.

Während der Umsetzung:

- Änderungen möglichst klein und nachvollziehbar halten.
- Keine unnötigen Refactorings außerhalb des aktuellen Scopes durchführen.
- Keine neuen Dependencies hinzufügen, wenn die vorhandenen Mittel ausreichen.
- Bestehende Funktionen nicht unbeabsichtigt verändern.
- Keine nur theoretisch geplanten Roadmap-Funktionen vorzeitig implementieren.

---

## Fachliche Grundregel

### Sparen / Investieren ist keine normale Ausgabe

ETF-Sparen, Einzelaktien-Sparen und andere als Sparen behandelte Einträge dürfen in Analytics nicht automatisch als normale Haushaltsausgaben behandelt werden.

Bestehende fachliche Abgrenzungen im Projekt sind zu erhalten.

---

## Analytics

Bei Analytics-Erweiterungen:

- bestehende Backend-Struktur bevorzugt weiterverwenden:
  - Controller
  - Service
  - Repository
  - DTOs
- fachliche Aggregationslogik nicht unnötig im React-Frontend duplizieren
- bestehende Chart.js- und Bootstrap-Strukturen wiederverwenden
- bestehende Analytics-Module nur ändern, wenn es für den aktuellen Auftrag notwendig ist
- die Analytics-Seite grundsätzlich als geführte Seite mit Sektionen und interner Navigation behandeln

---

## Abschluss eines Auftrags

Vor Abschluss:

- relevante vorhandene Tests bzw. Build-Prüfungen ausführen, soweit im Repository verfügbar
- auf offensichtliche Regressionen prüfen
- keine unrelated Änderungen im Diff zurücklassen

Am Ende kurz zusammenfassen:

1. welche Dateien geändert oder neu angelegt wurden
2. was funktional umgesetzt wurde
3. welche wichtigen technischen Entscheidungen getroffen wurden
4. wie die Änderung geprüft wurde
5. ob bekannte offene Punkte bestehen

---

## Weiterentwicklung dieser Datei

Diese Datei soll nicht vorsorglich mit sehr vielen Regeln gefüllt werden.

Neue Regeln sollen vor allem dann ergänzt werden, wenn:

- Codex wiederholt dieselbe falsche Annahme trifft
- ein bestimmter Projektstandard regelmäßig erklärt werden muss
- bestimmte Build-/Test-Schritte dauerhaft relevant werden
- wiederkehrende Fehler durch eine klare Repository-Regel verhindert werden können

Bis dahin gilt: **kurz, konkret und projektbezogen halten.**
