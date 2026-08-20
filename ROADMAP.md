# Finance Planner – Roadmap

> Stand: August 2026  
> Diese Roadmap beschreibt die langfristige Zielrichtung des Finance Planners.
>
> **Wichtig für Codex:** Die Roadmap dient als Kontext für Architektur- und Designentscheidungen.  
> Roadmap-Punkte dürfen **nur dann implementiert werden, wenn sie im aktuellen Auftrag ausdrücklich beauftragt wurden**.  
> Die Reihenfolge ist eine Orientierung und darf je nach aktuellem Bedarf angepasst werden.

---

## 1. Produktvision

Der Finance Planner soll die bisherige Haushaltsfinanzverwaltung in Tabellenkalkulationen vollständig ersetzen.

Ziel ist nicht nur klassisches CRUD für Einnahmen und Ausgaben, sondern eine langfristig nutzbare Anwendung, mit der sich die finanzielle Entwicklung des Haushalts nachvollziehen und auswerten lässt.

Schwerpunkte:

- schnelle und komfortable Erfassung von Kontobewegungen
- klare Trennung von Einnahmen, Ausgaben und Sparen/Investieren
- verständliche Monats-, Jahres- und Langzeitauswertungen
- Vergleich von Zeiträumen und Jahren
- Analyse nach Kategorien, Subkategorien und Personen
- langfristige Beobachtung finanzieller Entwicklungen
- Export der Daten und Auswertungen
- später optionaler Betrieb als private Mehrbenutzer-Webanwendung

---

# 2. Aktueller Stand

## 2.1 Startseite

Die Startseite ist bewusst einfach gehalten und dient hauptsächlich als Navigation.

Vorhanden bzw. grundsätzlich passend:

- Navigation zu:
  - Neue Einträge
  - Einträge
  - Analytics
  - Verwaltung
- Anzeige der letzten Einträge

Für den aktuellen Stand besteht hier kein größerer Änderungsbedarf.

---

## 2.2 Neue Einträge

Die Erfassung neuer Einträge ist grundsätzlich in einem guten Zustand.

Vorhanden:

- Datum
- Betrag
- Beschreibung
- Kategorie
- Subkategorie
- Person
- Notiz

Die Person wird pro Eintrag gewählt.

Die jeweils zuletzt verwendete Person kann als Vorauswahl für den nächsten Eintrag übernommen werden. Das gleiche Prinzip gilt bereits für das Datum.

Ziel bleibt eine möglichst schnelle Übertragung mehrerer Kontobewegungen hintereinander.

---

## 2.3 Einträge

Die bestehende Eintragsseite soll weiterhin die zentrale Stelle für die Verwaltung bereits erfasster Buchungen sein.

Vorhanden bzw. gewünscht:

- Einträge anzeigen
- suchen
- filtern
- bearbeiten
- löschen

Die Filterfunktion ist ein wichtiger Bestandteil des aktuellen Workflows und soll erhalten bleiben.

---

# 3. Analytics – Grundkonzept

Analytics soll **keine Sammlung vieler einzelner Hauptseiten** werden.

Bevorzugt wird eine geführte Analytics-Seite mit:

- festen Standardauswertungen
- klar getrennten Sektionen
- interner Analytics-Navigation
- Ankerlinks zum direkten Springen
- zusätzlicher Möglichkeit für individuelle Filter

Häufig benötigte Auswertungen sollen als feste Module vorhanden sein und nicht jedes Mal neu zusammengestellt werden müssen.

Die Analytics-Seite soll langfristig eine zentrale Übersicht über die finanzielle Entwicklung des Haushalts bieten.

---

## 3.1 Bereits vorhandene Analytics-Funktionen

### Zeitraumfilter

Analytics kann für einen ausgewählten Zeitraum ausgewertet werden.

---

### Gesamtübersicht

Darstellung zentraler Kennzahlen:

- Einnahmen
- Ausgaben
- Sparen / Investieren
- Saldo vor Sparen
- Saldo nach Sparen

### Fachlogik

**Sparen / Investieren ist keine Ausgabe.**

Beispielsweise ETF-Sparen oder Einzelaktien-Sparen stellt eine Vermögensverschiebung dar und soll nicht die normalen Haushaltsausgaben verfälschen.

Deshalb werden Saldo vor Sparen und Saldo nach Sparen getrennt betrachtet.

---

### Monatszahlen

Monatliche Übersicht mit beispielsweise:

- Einnahmen gesamt
- Ausgaben gesamt
- Sparen gesamt
- Saldo vor Sparen
- Saldo nach Sparen

---

### Ausgaben nach Kategorien

Auswertung der Ausgaben nach Hauptkategorien.

Darstellung unter anderem über Doughnut-Charts.

---

### Ausgaben nach Subkategorien

Detailliertere Analyse innerhalb der Kategorien.

---

### Ausgaben nach Personen

Analyse der Haushaltsausgaben nach Person.

---

### Sparen / Investieren

Separate Betrachtung von Sparvorgängen.

Beispiele:

- ETF-Sparen
- Einzelaktien-Sparen

Sparen bleibt fachlich von normalen Ausgaben getrennt.

---

### Einnahmenanalyse

Einnahmen sollen nach sinnvoll detaillierten Merkmalen ausgewertet werden.

Aktueller gewünschter Ansatz:

- Einnahmen nach **Subkategorien**
- Einnahmen nach **Personen**

Die Darstellung kann über einen Toggle innerhalb derselben Analytics-Kachel umgeschaltet werden.

---

# 4. Aktuelle Priorität – Analytics UX und Langzeitentwicklung

Diese Punkte haben aktuell hohe Priorität, auch wenn sie ursprünglich nicht zwingend als nächste chronologische Roadmap-Schritte vorgesehen waren.

---

## 4.1 Sticky Analytics-Navigation

Die interne Analytics-Navigation soll beim Scrollen sichtbar bleiben.

Ziele:

- schneller Wechsel zwischen Analytics-Sektionen
- bessere Orientierung auf der langen Analytics-Seite
- bestehende Ankerstruktur weiterverwenden
- Überschriften dürfen beim Anspringen nicht unter der Navigation verschwinden
- responsive Darstellung

---

## 4.2 Back-to-top-Button

Auf langen Analytics-Seiten soll ein fester Button zurück zum Seitenanfang führen.

Ziele:

- erscheint erst nach relevantem Scrollen
- Position unten rechts
- Smooth Scrolling
- keine zusätzliche Library notwendig

---

## 4.3 Langfristige Einnahmenentwicklung

Eigener Line-Chart für die Entwicklung der Einnahmen über längere Zeiträume.

Geplante Ansichten:

- monatlich
- jährlich
- rollierende 12 Monate

### Monatlich

Jeder Punkt entspricht den gesamten Einnahmen eines Monats.

Beispiel:

- Jan 2026
- Feb 2026
- Mär 2026
- …
- Jan 2027

### Jährlich

Jeder Punkt entspricht den gesamten Einnahmen eines Kalenderjahres.

### Rollierende 12 Monate

Für jeden darstellbaren Monat wird die Summe der vorherigen zwölf Monate inklusive des aktuellen Monats berechnet.

Beispiel:

> Mai 2027 = Juni 2026 bis Mai 2027

Ziel ist es, die langfristige Einkommensentwicklung unabhängig von einzelnen schwankenden Monaten erkennen zu können.

---

## 4.4 Langfristige Ausgabenentwicklung

Analog zur langfristigen Einnahmenentwicklung.

Geplante Ansichten:

- monatlich
- jährlich
- rollierende 12 Monate

Die bestehende Fachlogik muss erhalten bleiben:

> Sparen / Investieren zählt nicht zu den normalen Ausgaben.

---

# 5. Weitere langfristige Analytics-Trends

Nach Einnahmen und Ausgaben können weitere langfristige Kennzahlen ergänzt werden.

Mögliche bzw. bereits besprochene Entwicklungen:

## 5.1 Langfristige Sparentwicklung

Darstellung der Spar- und Investitionsbeträge über längere Zeiträume.

Mögliche Ansichten:

- monatlich
- jährlich
- rollierende 12 Monate

---

## 5.2 Sparquote

Langfristige Entwicklung der Sparquote.

Ziel:

Erkennen, welcher Anteil des verfügbaren Einkommens tatsächlich gespart bzw. investiert wurde.

---

## 5.3 Investitionsentwicklung

Langfristige Entwicklung einzelner Spar-/Investitionsarten, beispielsweise:

- ETF
- Einzelaktien

Hier geht es um die im Finance Planner erfassten Sparvorgänge, nicht um eine Depotkurs- oder Performanceanalyse.

---

# 6. Jahresvergleich

Der Jahresvergleich ist ein eigener größerer Analytics-Bereich und soll bewusst getrennt von den normalen Zeitraum-Auswertungen entwickelt werden.

Ziel ist der direkte Vergleich zweier Jahre, beispielsweise:

> 2026 vs. 2027

Der Benutzer soll auswählen können, welche Jahre miteinander verglichen werden.

---

## 6.1 Monatlicher Jahresvergleich

Direkter Vergleich der gleichen Monate zweier Jahre.

Beispiel:

- Januar 2026 vs. Januar 2027
- Februar 2026 vs. Februar 2027
- usw.

Geeignete Darstellung:

- gruppierte Balkendiagramme
- zwei Werte pro Monat

---

## 6.2 Vergleich zentraler Kennzahlen

Vergleich unter anderem von:

- Einnahmen
- Ausgaben
- Sparen / Investieren
- Saldo vor Sparen
- Saldo nach Sparen

---

## 6.3 Prozentuale Veränderung

Zusätzlich zu absoluten Beträgen sollen sinnvolle Veränderungen zwischen den Vergleichsjahren sichtbar werden.

Beispiel:

- Ausgaben +4,2 %
- Einnahmen +6,8 %

Dabei müssen Sonderfälle wie ein Vorjahreswert von 0 sauber behandelt werden.

---

## 6.4 Kategorien im Jahresvergleich

Vergleich der Ausgaben nach Kategorien zwischen zwei Jahren.

Beispiele:

- Wohnen 2026 vs. 2027
- Lebensmittel 2026 vs. 2027
- Mobilität 2026 vs. 2027

---

## 6.5 Subkategorien im Jahresvergleich

Bei Bedarf soll der Vergleich bis auf Subkategorieebene möglich sein.

Ziel ist beispielsweise die Beantwortung von Fragen wie:

> Geben wir 2027 für Lebensmittel, Strom oder Tanken mehr aus als 2026?

---

## 6.6 Einnahmen im Jahresvergleich

Vergleich der Einkommensentwicklung zwischen zwei Jahren.

Mögliche Dimensionen:

- Gesamteinnahmen
- nach Subkategorie
- nach Person

---

## 6.7 Platzierung

Der Jahresvergleich soll nicht einfach zwischen bestehende kleine Analytics-Karten gequetscht werden.

Er darf als deutlich abgegrenzter Bereich innerhalb von Analytics gestaltet werden.

Falls die Analytics-Seite langfristig zu groß wird, kann der Jahresvergleich später stärker entkoppelt werden. Die grundlegende Idee einer zentralen Analytics-Navigation soll dabei erhalten bleiben.

---

# 7. Flexible / individuelle Analytics

Neben den festen Standardauswertungen soll Analytics langfristig auch individuellere Fragen beantworten können.

Grundidee:

- Standardmodule für häufig benötigte Auswertungen
- zusätzliche Filtermöglichkeiten für spezielle Fragestellungen

Beispiele:

- bestimmte Kategorie
- bestimmte Subkategorie
- bestimmte Person
- frei gewählter Zeitraum

Die Standardauswertungen sollen trotzdem erhalten bleiben, damit häufige Fragen nicht jedes Mal neu zusammengestellt werden müssen.

---

# 8. Kategorien und Subkategorien weiter verfeinern

Die Kategorienstruktur soll mit der tatsächlichen Nutzung wachsen.

Bereits als Beispiele diskutierte mögliche Verfeinerungen:

- Parken
- Fahrzeugpflege
- Cloud- / digitale Dienste
- klarere Trennung innerhalb Freizeit / Familie

Grundsatz:

Die Kategorien sollen nicht künstlich maximal detailliert werden. Neue Subkategorien sollen dort entstehen, wo sie für spätere Analytics tatsächlich einen Mehrwert liefern.

---

# 9. Verwaltung ausbauen

Die Verwaltungsseite soll langfristig mehr als reine Anzeige ermöglichen.

Geplante Funktionen:

- Kategorien erstellen
- Subkategorien erstellen
- Kategorien umbenennen
- Subkategorien umbenennen
- Kategorien / Subkategorien archivieren
- bestehende Einträge bei Änderungen sauber migrieren bzw. zuordnen

Ziel ist, die Datenstruktur später pflegen zu können, ohne direkt in der Datenbank arbeiten zu müssen.

Bei Änderungen an Kategorien muss Datenkonsistenz wichtiger sein als eine möglichst einfache UI.

---

# 10. Schnellere Eintragserfassung

Die Erfassung soll langfristig noch stärker an den tatsächlichen Kontobewegungs-Workflow angepasst werden.

Mögliche Erweiterungen:

## 10.1 Zuletzt verwendete Werte

Bereits genutzt bzw. sinnvoll:

- letztes Datum als Ausgangspunkt
- zuletzt verwendete Person als Vorauswahl

---

## 10.2 Vorschläge aus früheren Einträgen

Langfristig können wiederkehrende Beschreibungen erkannt bzw. vorgeschlagen werden.

Beispiel:

Bei einer bekannten Beschreibung könnten passende Werte vorgeschlagen werden:

- Kategorie
- Subkategorie
- Person

Das soll eine Eingabehilfe bleiben und keine unkontrollierte automatische Buchung werden.

---

## 10.3 Häufig verwendete / letzte Buchungen

Denkbar ist eine schnellere Auswahl häufig auftretender Eintragsmuster.

Priorität hat weiterhin eine übersichtliche Eingabemaske ohne unnötige Komplexität.

---

# 11. CSV-Export

Die Daten sollen exportierbar sein.

Ziele:

- langfristige Unabhängigkeit von der Anwendung
- Weiterverarbeitung außerhalb des Finance Planners
- Sicherung / Nachvollziehbarkeit der Finanzhistorie
- bei Bedarf Nachweis einer strukturierten Haushaltsführung, beispielsweise gegenüber einer Bank

Mögliche Exportebenen:

- alle Einträge
- gefilterte Einträge
- ausgewählter Zeitraum
- später eventuell Analytics-Ergebnisse

CSV ist zunächst das bevorzugte einfache Austauschformat.

---

# 12. Dark Mode

Ein Dark Mode ist als spätere UI-Erweiterung vorgesehen.

Er ist funktional weniger wichtig als:

- Datenerfassung
- Analytics
- Jahresvergleich
- Datenpflege
- Export

Daher aktuell keine hohe Priorität.

---

# 13. Spätere Bereitstellung als private Webanwendung

Der Finance Planner läuft aktuell lokal.

Langfristig ist denkbar, ihn so bereitzustellen, dass er von Jonas und Annina auch unterwegs genutzt werden kann.

Dabei geht es ausdrücklich **nicht** um eine öffentlich skalierende Multi-Tenant-Anwendung.

Ziel wäre eine private Familienanwendung.

---

## 13.1 Mehrbenutzerfähigkeit

Mögliche spätere Benutzer:

- Jonas
- Annina

Beide arbeiten mit demselben Haushalt und denselben Finanzdaten.

Falls eine echte Anmeldung eingeführt wird, kann zusätzlich nachvollzogen werden, welcher Benutzer einen Datensatz erstellt oder geändert hat.

Beispiel:

- `createdBy`

Die bestehende fachliche Zuordnung eines Eintrags zu einer Person ist davon getrennt.

---

## 13.2 Hosting

Langfristig denkbar:

- Serverbetrieb
- Docker
- eigene Domain bzw. definierter Zugriffspunkt
- HTTPS
- Login / Authentifizierung

Diese Punkte gehören bewusst zu einer späteren Entwicklungsphase.

Die Anwendung soll zunächst lokal fachlich vollständig und stabil werden.

---

# 14. Backups und Datensicherheit

Mit wachsender Finanzhistorie wird die Datenbank zunehmend wertvoll.

Spätestens vor einem dauerhaften Serverbetrieb soll ein verlässliches Backup-Konzept vorhanden sein.

Ziele:

- regelmäßige Datenbanksicherung
- einfache Wiederherstellung
- Schutz vor versehentlichem Datenverlust
- Backup unabhängig von der laufenden Anwendung

---

# 15. Entwicklungsgrundsätze

Diese Grundsätze sollen die Roadmap begleiten.

## Fachlichkeit vor Technik

Features sollen reale Fragen des Haushalts beantworten und nicht nur eingebaut werden, weil sie technisch interessant sind.

---

## Sparen ist keine Ausgabe

Diese Fachlogik muss in allen zukünftigen Analytics-Auswertungen konsistent bleiben.

---

## Bestehende Funktionen nicht unnötig umbauen

Wenn ein Bereich gut funktioniert, soll er nicht ohne konkreten Nutzen neu geschrieben werden.

---

## Kleine, überprüfbare Entwicklungsschritte

Roadmap-Punkte sollen vorzugsweise als klar abgegrenzte Arbeitspakete umgesetzt werden.

Nach jedem größeren Schritt:

1. Funktion prüfen
2. Regressionen prüfen
3. Änderungen nachvollziehen
4. committen

---

## Roadmap ist Kontext, kein Arbeitsauftrag

Codex darf aus dieser Datei keine eigenständige Feature-Auswahl ableiten.

Ein konkreter Codex-Auftrag definiert immer den tatsächlichen Scope.

Beispiel:

Wenn ein Auftrag nur

- Sticky Analytics-Navigation
- Back-to-top
- langfristige Einnahmenentwicklung
- langfristige Ausgabenentwicklung

nennt, darf Codex nicht zusätzlich den Jahresvergleich, CSV-Export oder andere Roadmap-Punkte implementieren.

---

# 16. Aktuell gewünschte nächste Arbeitspakete

Die genaue Reihenfolge kann sich nach aktuellem Interesse ändern.

## Nächstes Paket

- Sticky Analytics-Navigation
- Back-to-top-Button
- langfristiger Einnahmenchart
- langfristiger Ausgabenchart

## Danach als großer Analytics-Schritt

- Jahresvergleich

## Weitere spätere Pakete

- langfristige Spar-/Investitionsentwicklung und Sparquote
- flexible Analytics
- Kategorien-/Subkategorienpflege
- schnellere Eintragserfassung
- CSV-Export
- Dark Mode
- private Mehrbenutzer-/Server-Version
- Backup-Konzept

---

## Leitgedanke

Der Finance Planner soll nicht möglichst viele Funktionen besitzen.

Er soll Schritt für Schritt zu einer Anwendung werden, mit der sich die tatsächlichen Haushaltsfinanzen einfach erfassen, nachvollziehen, vergleichen und langfristig verstehen lassen.
