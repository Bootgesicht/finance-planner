## Finance Planner Backend

Dieses Backend stellt die REST-API fuer den Finance Planner bereit. Es basiert
auf Spring Boot, Java 17, Maven und SQLite.

## Lokal starten

Das Backend sollte aus dem Projekt-Root gestartet werden, damit der relative
SQLite-Pfad korrekt auf die Datenbank zeigt:

```powershell
.\backend\mvnw.cmd -f backend\pom.xml spring-boot:run
```

Die API ist danach standardmaessig unter `http://localhost:8080` erreichbar.

## Hinweis zur SQLite-Datenbank

In `src/main/resources/application.properties` ist die Datenbank als relativer
Pfad konfiguriert:

```properties
app.database.url=jdbc:sqlite:database/finance.db
```

Wenn das Backend direkt aus dem Ordner `backend` gestartet wird, kann dieser
relative Pfad auf `backend/database/finance.db` zeigen. Die eigentliche
Datenbank liegt aber im Projekt-Root unter `database/finance.db`.
