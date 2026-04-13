# Family Finance Planner

## Projektziel

Der Family Finance Planner ist eine lokal nutzbare Webanwendung zur strukturierten Erfassung und Auswertung von privaten Haushaltsfinanzen.

Ziel ist es, Einnahmen und Ausgaben über mehrere Jahre hinweg nachvollziehbar zu speichern, nach Kategorien auszuwerten und Entwicklungen über Zeit sichtbar zu machen.

Die Anwendung soll insbesondere dabei helfen:

- monatliche und jährliche Einnahmen und Ausgaben zu erfassen
- Ausgaben nach Haupt- und Unterkategorien aufzuschlüsseln
- finanzielle Entwicklungen über längere Zeiträume zu vergleichen
- Veränderungen durch Lebenssituationen wie Elternzeit, Kinder oder Mobilitätskosten sichtbar zu machen
- eine saubere Datengrundlage für spätere Finanzplanung zu schaffen, z. B. für Hauskauf oder Kreditgespräche

Die Anwendung ist zunächst für die lokale Nutzung im Heimnetz gedacht und soll später über ein browserbasiertes Frontend erreichbar sein.

---

## Technischer Grundansatz

- **Backend:** Java
- **Frontend:** browserbasiert
- **Datenbank:** SQLite
- **Versionsverwaltung:** Git / GitHub

Die Datenbank wird lokal als Datei gespeichert und bildet die zentrale Datenbasis für Kategorien, Personen und einzelne Finanzbuchungen.

---

## Fachliches Modell

Die Anwendung basiert nicht auf separaten Tabellen pro Monat oder Kategorie, sondern auf einem relationalen Modell mit einzelnen Buchungen.

Jede Einnahme oder Ausgabe wird als einzelner Eintrag gespeichert und über folgende Dimensionen strukturiert:

- Datum
- Betrag
- Beschreibung
- Hauptkategorie
- Unterkategorie
- optionale Personenzuordnung

Dadurch bleiben Auswertungen nach Monat, Jahr, Kategorie und Person flexibel möglich.

---

## Erste Datenbankstruktur

### categories

Speichert die Hauptkategorien einer Buchung, z. B. Wohnen, Mobilität oder Einnahmen.

```sql
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    kind TEXT NOT NULL CHECK (kind IN ('INCOME', 'EXPENSE'))
);
```

### subcategories

Speichert Unterkategorien innerhalb einer Hauptkategorie, z. B. Kaltmiete, Strom oder Lebensmittel.

```sql
CREATE TABLE subcategories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    UNIQUE (category_id, name)
);
```

### persons

Speichert Personen im Haushalt, z. B. Erwachsene und Kinder.

```sql
CREATE TABLE persons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADULT', 'CHILD'))
);
```

### entries

Speichert einzelne Einnahmen und Ausgaben.

```sql
CREATE TABLE entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_date TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    description TEXT NOT NULL,
    subcategory_id INTEGER NOT NULL,
    person_id INTEGER,
    note TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subcategory_id) REFERENCES subcategories(id),
    FOREIGN KEY (person_id) REFERENCES persons(id)
);
```

Warum dieses Modell?

Dieses Modell wurde bewusst so gewählt, dass:

keine redundanten Informationen doppelt gespeichert werden
Hauptkategorie und Einnahme-/Ausgabe-Typ über die Unterkategorie ableitbar sind
Buchungen flexibel über mehrere Jahre hinweg erfasst werden können
spätere Auswertungen einfach möglich bleiben

Beispiele:

Wie viel wurde im Januar 2026 für Lebensmittel ausgegeben?
Wie hoch waren die Wohnkosten im Jahr 2025?
Welche Ausgaben entfielen auf ein bestimmtes Kind?
Wie haben sich Einnahmen und Ausgaben über die Zeit verändert?