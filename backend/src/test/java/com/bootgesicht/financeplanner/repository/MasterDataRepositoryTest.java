package com.bootgesicht.financeplanner.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Path;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import com.bootgesicht.financeplanner.dto.EntryOverviewResponse;

class MasterDataRepositoryTest {

    @TempDir
    Path tempDirectory;

    private DatabaseConnection databaseConnection;
    private CategoryRepository categoryRepository;
    private SubcategoryRepository subcategoryRepository;
    private EntryRepository entryRepository;

    @BeforeEach
    void setUp() throws Exception {
        String databaseUrl = "jdbc:sqlite:" + tempDirectory.resolve("master-data.db");
        databaseConnection = new DatabaseConnection(databaseUrl);

        try (
                Connection connection = databaseConnection.getConnection();
                Statement statement = connection.createStatement()) {
            statement.executeUpdate("CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT UNIQUE, kind TEXT)");
            statement.executeUpdate("""
                    CREATE TABLE subcategories (
                        id INTEGER PRIMARY KEY,
                        category_id INTEGER,
                        name TEXT,
                        UNIQUE (category_id, name)
                    )
                    """);
            statement.executeUpdate("CREATE TABLE persons (id INTEGER PRIMARY KEY, name TEXT, role TEXT)");
            statement.executeUpdate("""
                    CREATE TABLE entries (
                        id INTEGER PRIMARY KEY,
                        entry_date TEXT,
                        amount NUMERIC,
                        description TEXT,
                        subcategory_id INTEGER,
                        person_id INTEGER,
                        note TEXT,
                        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                    )
                    """);
            statement.executeUpdate("INSERT INTO categories VALUES (1, 'Wohnen', 'EXPENSE')");
            statement.executeUpdate("INSERT INTO categories VALUES (2, 'Freizeit', 'EXPENSE')");
            statement.executeUpdate("INSERT INTO subcategories VALUES (1, 1, 'Strom')");
            statement.executeUpdate("INSERT INTO subcategories VALUES (2, 2, 'Hobby')");
            statement.executeUpdate("INSERT INTO persons VALUES (1, 'Familie', 'HOUSEHOLD')");
            statement.executeUpdate("""
                    INSERT INTO entries (id, entry_date, amount, description, subcategory_id, person_id)
                    VALUES (1, '2026-01-15', 100, 'Abschlag', 1, 1)
                    """);
        }

        DatabaseMigration migration = new DatabaseMigration(databaseConnection);
        migration.run(null);
        migration.run(null);

        categoryRepository = new CategoryRepository(databaseConnection);
        subcategoryRepository = new SubcategoryRepository(databaseConnection);
        entryRepository = new EntryRepository(databaseConnection);
    }

    @Test
    void migrationKeepsExistingRowsActiveAndIsIdempotent() throws Exception {
        assertFalse(categoryRepository.findById(1).isArchived());
        assertFalse(subcategoryRepository.findById(1).isArchived());

        try (
                Connection connection = databaseConnection.getConnection();
                Statement statement = connection.createStatement();
                ResultSet resultSet = statement.executeQuery("PRAGMA table_info(categories)")) {
            int archivedColumns = 0;
            while (resultSet.next()) {
                if ("archived".equals(resultSet.getString("name"))) {
                    archivedColumns++;
                }
            }
            assertEquals(1, archivedColumns);
        }
    }

    @Test
    void activeSelectionsExcludeArchivedCategoriesAndTheirSubcategories() {
        categoryRepository.setArchived(1, true);

        assertEquals(1, categoryRepository.findAll(false).size());
        assertEquals(2, categoryRepository.findAll(true).size());
        assertTrue(subcategoryRepository.getSubcategoriesByCategoryId(1, false).isEmpty());
        assertEquals(1, subcategoryRepository.getSubcategoriesByCategoryId(1, true).size());

        categoryRepository.setArchived(1, false);
        subcategoryRepository.setArchived(1, true);
        assertTrue(subcategoryRepository.getSubcategoriesByCategoryId(1, false).isEmpty());
        assertEquals(1, subcategoryRepository.getSubcategoriesByCategoryId(1, true).size());
    }

    @Test
    void renamingKeepsIdsAndHistoricalEntryJoinsUseTheNewNames() {
        categoryRepository.updateName(1, "Haushalt");
        subcategoryRepository.updateName(1, "Energie");

        assertEquals(1, categoryRepository.findById(1).getCategoryId());
        assertEquals(1, subcategoryRepository.findById(1).getId());

        EntryOverviewResponse entry = entryRepository.searchEntries(
                null, null, null, null, null, null).get(0);
        assertEquals("Haushalt", entry.getCategoryName());
        assertEquals("Energie", entry.getSubcategoryName());
    }

    @Test
    void dependencyCountsCoverDirectEntriesAndIndirectCategoryUsage() {
        assertEquals(1, subcategoryRepository.countEntries(1));
        assertEquals(1, categoryRepository.countSubcategories(1));
        assertEquals(1, categoryRepository.countEntries(1));
        assertEquals(0, subcategoryRepository.countEntries(2));
    }
}
