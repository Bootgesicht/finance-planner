package com.bootgesicht.financeplanner.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.nio.file.Path;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import com.bootgesicht.financeplanner.dto.EntryOverviewResponse;
import com.bootgesicht.financeplanner.dto.LatestEntryResponse;
import com.bootgesicht.financeplanner.model.Entry;

class EntryRepositoryAuditTest {

    @TempDir
    Path tempDirectory;

    private DatabaseConnection databaseConnection;
    private EntryRepository repository;

    @BeforeEach
    void setUp() throws Exception {
        databaseConnection = new DatabaseConnection("jdbc:sqlite:" + tempDirectory.resolve("audit.db"));
        try (Connection connection = databaseConnection.getConnection(); Statement statement = connection.createStatement()) {
            statement.executeUpdate("CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT, kind TEXT)");
            statement.executeUpdate("CREATE TABLE subcategories (id INTEGER PRIMARY KEY, category_id INTEGER, name TEXT)");
            statement.executeUpdate("CREATE TABLE persons (id INTEGER PRIMARY KEY, name TEXT, role TEXT)");
            statement.executeUpdate("""
                    CREATE TABLE entries (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        entry_date TEXT NOT NULL,
                        amount NUMERIC NOT NULL,
                        description TEXT NOT NULL,
                        subcategory_id INTEGER NOT NULL,
                        person_id INTEGER,
                        note TEXT,
                        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                    """);
            statement.executeUpdate("INSERT INTO categories VALUES (1, 'Wohnen', 'EXPENSE')");
            statement.executeUpdate("INSERT INTO subcategories VALUES (1, 1, 'Strom')");
            statement.executeUpdate("INSERT INTO persons VALUES (1, 'Jonas', 'ADULT')");
            statement.executeUpdate("""
                    INSERT INTO entries (entry_date, amount, description, subcategory_id, person_id)
                    VALUES ('2025-01-01', 10, 'Historisch', 1, 1)
                    """);
        }

        DatabaseMigration migration = new DatabaseMigration(databaseConnection);
        migration.run(null);
        migration.run(null);
        try (Connection connection = databaseConnection.getConnection(); Statement statement = connection.createStatement()) {
            statement.executeUpdate("INSERT INTO users VALUES (1, 'jonas', 'hash-1', 'Jonas', 1)");
            statement.executeUpdate("INSERT INTO users VALUES (2, 'annina', 'hash-2', 'Annina', 1)");
        }
        repository = new EntryRepository(databaseConnection);
    }

    @Test
    void migrationPreservesHistoricalRowsAndAddsAuditColumnsOnlyOnce() throws Exception {
        Entry historical = repository.findById(1);
        assertEquals("Historisch", historical.getDescription());
        assertNull(historical.getCreatedByUserId());
        assertNull(historical.getUpdatedByUserId());

        try (Connection connection = databaseConnection.getConnection(); Statement statement = connection.createStatement();
                ResultSet columns = statement.executeQuery("PRAGMA table_info(entries)")) {
            int auditColumns = 0;
            while (columns.next()) {
                if (columns.getString("name").endsWith("_by_user_id")) auditColumns++;
            }
            assertEquals(2, auditColumns);
        }
    }

    @Test
    void createAndUpdateTrackDifferentUsersWithoutChangingCreator() {
        repository.save(entryForUsers(1, 1));
        Entry created = repository.findById(2);
        assertEquals(1, created.getCreatedByUserId());
        assertEquals(1, created.getUpdatedByUserId());

        repository.updateById(2, entryForUsers(1, 2));
        Entry updated = repository.findById(2);
        assertEquals(1, updated.getCreatedByUserId());
        assertEquals(2, updated.getUpdatedByUserId());
    }

    @Test
    void latestAndSearchCanFilterByCreatorWhileAllIncludesHistoricalRows() {
        repository.save(entryForUsers(1, 1));
        repository.save(entryForUsers(2, 2));

        List<LatestEntryResponse> mine = repository.findLatestEntries(15, 1);
        assertEquals(1, mine.size());
        assertEquals("Jonas", mine.get(0).getCreatedByDisplayName());

        List<LatestEntryResponse> all = repository.findLatestEntries(15, null);
        assertEquals(3, all.size());
        assertNull(all.stream().filter(item -> item.getDescription().equals("Historisch"))
                .findFirst().orElseThrow().getCreatedByUserId());

        List<EntryOverviewResponse> annina = repository.searchEntries(
                null, null, null, null, null, null, 2);
        assertEquals(1, annina.size());
        assertEquals("Annina", annina.get(0).getCreatedByDisplayName());
    }

    private Entry entryForUsers(int creatorId, int updaterId) {
        return new Entry(0, LocalDate.of(2026, 1, creatorId), 20, "Neu " + creatorId,
                1, 1, null, null, null, creatorId, updaterId);
    }
}
