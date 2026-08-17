package com.bootgesicht.financeplanner.repository;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import com.bootgesicht.financeplanner.dto.AnalyticsOverviewResponse;
import com.bootgesicht.financeplanner.dto.CategorySummaryResponse;
import com.bootgesicht.financeplanner.dto.MonthlyBalanceResponse;
import com.bootgesicht.financeplanner.dto.PersonSummaryResponse;
import com.bootgesicht.financeplanner.dto.SubcategorySummaryResponse;

class AnalyticsRepositoryTest {

    @TempDir
    Path tempDirectory;

    private AnalyticsRepository repository;

    @BeforeEach
    void setUpDatabase() throws Exception {
        String databaseUrl = "jdbc:sqlite:"
                + tempDirectory.resolve("analytics-" + UUID.randomUUID() + ".db");
        repository = new AnalyticsRepository(new DatabaseConnection(databaseUrl));

        try (Connection connection = DriverManager.getConnection(databaseUrl);
                Statement statement = connection.createStatement()) {
            statement.executeUpdate("CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT, kind TEXT)");
            statement.executeUpdate("CREATE TABLE subcategories (id INTEGER PRIMARY KEY, category_id INTEGER, name TEXT)");
            statement.executeUpdate("CREATE TABLE persons (id INTEGER PRIMARY KEY, name TEXT, role TEXT)");
            statement.executeUpdate("""
                    CREATE TABLE entries (
                        id INTEGER PRIMARY KEY,
                        entry_date TEXT,
                        amount REAL,
                        subcategory_id INTEGER,
                        person_id INTEGER
                    )
                    """);

            statement.executeUpdate("INSERT INTO categories VALUES (1, 'Einkommen', 'INCOME')");
            statement.executeUpdate("INSERT INTO categories VALUES (2, 'Wohnen', 'EXPENSE')");
            statement.executeUpdate("INSERT INTO categories VALUES (3, 'Investieren', 'SAVING')");
            statement.executeUpdate("INSERT INTO categories VALUES (4, 'Freizeit', 'EXPENSE')");
            statement.executeUpdate("INSERT INTO categories VALUES (5, 'Geldgeschenke', 'INCOME')");
            statement.executeUpdate("INSERT INTO subcategories VALUES (1, 1, 'Gehalt')");
            statement.executeUpdate("INSERT INTO subcategories VALUES (2, 2, 'Miete')");
            statement.executeUpdate("INSERT INTO subcategories VALUES (3, 3, 'ETF-Sparen')");
            statement.executeUpdate("INSERT INTO subcategories VALUES (4, 4, 'Hobby')");
            statement.executeUpdate("INSERT INTO subcategories VALUES (5, 3, 'Einzelaktien-Sparen')");
            statement.executeUpdate("INSERT INTO subcategories VALUES (6, 2, 'Strom')");
            statement.executeUpdate("INSERT INTO subcategories VALUES (7, 5, 'Geschenk')");
            statement.executeUpdate("INSERT INTO persons VALUES (1, 'Jonas', 'ADULT')");
            statement.executeUpdate("INSERT INTO persons VALUES (2, 'Familie', 'HOUSEHOLD')");

            insertEntry(statement, 1, "2025-12-31", 1000, 1, 1);
            insertEntry(statement, 2, "2026-01-10", 3000, 1, 1);
            insertEntry(statement, 3, "2026-01-15", 1200, 2, 1);
            insertEntry(statement, 4, "2026-01-18", 100, 6, 2);
            insertEntry(statement, 5, "2026-01-20", 500, 3, 1);
            insertEntry(statement, 6, "2026-01-25", 200, 5, 1);
            insertEntry(statement, 7, "2026-02-05", 900, 2, 2);
            insertEntry(statement, 8, "2026-02-10", 300, 4, 1);
            insertEntry(statement, 9, "2026-03-01", 500, 1, 1);
            insertEntry(statement, 10, "2027-01-01", 999, 1, 1);
            insertEntry(statement, 11, "2026-01-30", 100, 7, 2);
            insertEntryWithoutPerson(statement, 12, "2026-02-15", 400, 7);
        }
    }

    @Test
    void calculatesTotalsAndMonthlyBalancesAcrossYearsWithPartialMonths() {
        LocalDate from = LocalDate.of(2025, 12, 31);
        LocalDate to = LocalDate.of(2026, 2, 5);

        AnalyticsOverviewResponse overview = repository.getOverview(from, to);
        List<MonthlyBalanceResponse> months = repository.getMonthlyBalance(from, to);

        assertThat(overview.getIncome()).isEqualTo(4100);
        assertThat(overview.getExpenses()).isEqualTo(2200);
        assertThat(overview.getSavings()).isEqualTo(700);
        assertThat(overview.getBalanceBeforeSavings()).isEqualTo(1900);
        assertThat(overview.getFreeBalanceAfterSavings()).isEqualTo(1200);
        assertThat(months).extracting(MonthlyBalanceResponse::getMonth)
                .containsExactly("2025-12", "2026-01", "2026-02");
    }

    @Test
    void groupsExpenseSubcategoriesAndRespectsTheExactDateRange() {
        List<SubcategorySummaryResponse> summaries = repository.getSubcategorySummary(
                LocalDate.of(2026, 1, 1),
                LocalDate.of(2026, 2, 5),
                null,
                "EXPENSE");

        assertThat(summaries).extracting(SubcategorySummaryResponse::getSubcategoryName)
                .containsExactly("Miete", "Strom");
        assertThat(summaries).extracting(SubcategorySummaryResponse::getTotalAmount)
                .containsExactly(2100.0, 100.0);
    }

    @Test
    void groupsOnlyExpensesByPersonAndRespectsPartialMonths() {
        List<PersonSummaryResponse> fullRange = repository.getPersonSummary(
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 2, 28));
        List<PersonSummaryResponse> partialRange = repository.getPersonSummary(
                LocalDate.of(2026, 1, 16), LocalDate.of(2026, 2, 5));

        assertThat(fullRange).extracting(PersonSummaryResponse::getPersonName)
                .containsExactly("Jonas", "Familie");
        assertThat(fullRange).extracting(PersonSummaryResponse::getTotalAmount)
                .containsExactly(1500.0, 1000.0);
        assertThat(partialRange).singleElement().satisfies(person -> {
            assertThat(person.getPersonName()).isEqualTo("Familie");
            assertThat(person.getTotalAmount()).isEqualTo(1000);
        });
    }

    @Test
    void groupsBookedSavingsByTheirExistingSubcategories() {
        List<SubcategorySummaryResponse> savings = repository.getSubcategorySummary(
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31), null, "SAVING");

        assertThat(savings).extracting(SubcategorySummaryResponse::getSubcategoryName)
                .containsExactly("ETF-Sparen", "Einzelaktien-Sparen");
        assertThat(savings).extracting(SubcategorySummaryResponse::getTotalAmount)
                .containsExactly(500.0, 200.0);
    }

    @Test
    void groupsOnlyIncomeByCategoryAndKeepsTheOverviewTotal() {
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 2, 28);

        List<CategorySummaryResponse> income = repository.getCategorySummary(from, to, "INCOME");
        AnalyticsOverviewResponse overview = repository.getOverview(from, to);

        assertThat(income).extracting(CategorySummaryResponse::getCategoryName)
                .containsExactly("Einkommen", "Geldgeschenke");
        assertThat(income).extracting(CategorySummaryResponse::getTotalAmount)
                .containsExactly(3000.0, 500.0);
        assertThat(income.stream().mapToDouble(CategorySummaryResponse::getTotalAmount).sum())
                .isEqualTo(overview.getIncome());
    }

    @Test
    void groupsIncomeByPersonWithoutLosingUnassignedEntries() {
        LocalDate from = LocalDate.of(2026, 1, 1);
        LocalDate to = LocalDate.of(2026, 2, 28);
        List<PersonSummaryResponse> income = repository.getIncomePersonSummary(from, to);
        AnalyticsOverviewResponse overview = repository.getOverview(from, to);

        assertThat(income).extracting(PersonSummaryResponse::getPersonName)
                .containsExactly("Jonas", "Ohne Person", "Familie");
        assertThat(income).extracting(PersonSummaryResponse::getTotalAmount)
                .containsExactly(3000.0, 400.0, 100.0);
        assertThat(income.stream().mapToDouble(PersonSummaryResponse::getTotalAmount).sum())
                .isEqualTo(overview.getIncome());
    }

    @Test
    void incomeGroupingRespectsPartialAndCrossYearDateRanges() {
        List<CategorySummaryResponse> crossYear = repository.getCategorySummary(
                LocalDate.of(2025, 12, 31), LocalDate.of(2026, 1, 30), "INCOME");
        List<PersonSummaryResponse> partialMonth = repository.getIncomePersonSummary(
                LocalDate.of(2026, 1, 16), LocalDate.of(2026, 2, 10));

        assertThat(crossYear.stream().mapToDouble(CategorySummaryResponse::getTotalAmount).sum())
                .isEqualTo(4100);
        assertThat(partialMonth).singleElement().satisfies(person -> {
            assertThat(person.getPersonName()).isEqualTo("Familie");
            assertThat(person.getTotalAmount()).isEqualTo(100);
        });
    }

    @Test
    void returnsZerosAndEmptyCollectionsForAnEmptyPeriod() {
        LocalDate from = LocalDate.of(2024, 1, 1);
        LocalDate to = LocalDate.of(2024, 12, 31);

        AnalyticsOverviewResponse overview = repository.getOverview(from, to);

        assertThat(overview.getIncome()).isZero();
        assertThat(overview.getExpenses()).isZero();
        assertThat(overview.getSavings()).isZero();
        assertThat(repository.getMonthlyBalance(from, to)).isEmpty();
        assertThat(repository.getSubcategorySummary(from, to, null, "EXPENSE")).isEmpty();
        assertThat(repository.getPersonSummary(from, to)).isEmpty();
        assertThat(repository.getCategorySummary(from, to, "INCOME")).isEmpty();
        assertThat(repository.getIncomePersonSummary(from, to)).isEmpty();
    }

    private void insertEntry(Statement statement, int id, String date, double amount,
            int subcategoryId, int personId) throws Exception {
        statement.executeUpdate("INSERT INTO entries VALUES ("
                + id + ", '" + date + "', " + amount + ", " + subcategoryId + ", " + personId + ")");
    }

    private void insertEntryWithoutPerson(Statement statement, int id, String date, double amount,
            int subcategoryId) throws Exception {
        statement.executeUpdate("INSERT INTO entries VALUES ("
                + id + ", '" + date + "', " + amount + ", " + subcategoryId + ", NULL)");
    }
}
