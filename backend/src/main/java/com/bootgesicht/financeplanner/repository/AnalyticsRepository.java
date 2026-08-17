package com.bootgesicht.financeplanner.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.bootgesicht.financeplanner.dto.AnalyticsOverviewResponse;
import com.bootgesicht.financeplanner.dto.CategorySummaryResponse;
import com.bootgesicht.financeplanner.dto.MonthlyBalanceResponse;
import com.bootgesicht.financeplanner.dto.PersonSummaryResponse;
import com.bootgesicht.financeplanner.dto.SubcategorySummaryResponse;

@Repository
public class AnalyticsRepository {

    private DatabaseConnection databaseConnection;

    public AnalyticsRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    public AnalyticsOverviewResponse getOverview(LocalDate from, LocalDate to) {
        String sql = """
                SELECT
                    ROUND(COALESCE(SUM(CASE WHEN c.kind = 'INCOME' THEN e.amount ELSE 0 END), 0), 2) AS income,
                    ROUND(COALESCE(SUM(CASE WHEN c.kind = 'EXPENSE' THEN e.amount ELSE 0 END), 0), 2) AS expenses,
                    ROUND(COALESCE(SUM(CASE WHEN c.kind = 'SAVING' THEN e.amount ELSE 0 END), 0), 2) AS savings,
                    ROUND(COALESCE(SUM(CASE
                        WHEN c.kind = 'INCOME' THEN e.amount
                        WHEN c.kind = 'EXPENSE' THEN -e.amount
                        ELSE 0
                    END), 0), 2) AS balance_before_savings,
                    ROUND(COALESCE(SUM(CASE
                        WHEN c.kind = 'INCOME' THEN e.amount
                        WHEN c.kind = 'EXPENSE' THEN -e.amount
                        WHEN c.kind = 'SAVING' THEN -e.amount
                        ELSE 0
                    END), 0), 2) AS free_balance_after_savings
                FROM entries e
                JOIN subcategories s ON e.subcategory_id = s.id
                JOIN categories c ON s.category_id = c.id
                WHERE e.entry_date BETWEEN ? AND ?
                """;

        try (Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            setDateRange(statement, from, to);
            try (ResultSet result = statement.executeQuery()) {
                if (result.next()) {
                    return new AnalyticsOverviewResponse(
                            result.getDouble("income"),
                            result.getDouble("expenses"),
                            result.getDouble("savings"),
                            result.getDouble("balance_before_savings"),
                            result.getDouble("free_balance_after_savings"));
                }
            }
        } catch (SQLException error) {
            throw new IllegalStateException("Analytics overview could not be loaded", error);
        }

        return new AnalyticsOverviewResponse(0, 0, 0, 0, 0);
    }

    public List<MonthlyBalanceResponse> getMonthlyBalance(LocalDate from, LocalDate to) {
        List<MonthlyBalanceResponse> balances = new ArrayList<>();
        String sql = """
                SELECT
                    strftime('%Y-%m', e.entry_date) AS month,
                    ROUND(SUM(CASE WHEN c.kind = 'INCOME' THEN e.amount ELSE 0 END), 2) AS income,
                    ROUND(SUM(CASE WHEN c.kind = 'EXPENSE' THEN e.amount ELSE 0 END), 2) AS expenses,
                    ROUND(SUM(CASE WHEN c.kind = 'SAVING' THEN e.amount ELSE 0 END), 2) AS savings,
                    ROUND(SUM(CASE
                        WHEN c.kind = 'INCOME' THEN e.amount
                        WHEN c.kind = 'EXPENSE' THEN -e.amount
                        ELSE 0
                    END), 2) AS balance_before_savings,
                    ROUND(SUM(CASE
                        WHEN c.kind = 'INCOME' THEN e.amount
                        WHEN c.kind = 'EXPENSE' THEN -e.amount
                        WHEN c.kind = 'SAVING' THEN -e.amount
                        ELSE 0
                    END), 2) AS free_balance_after_savings
                FROM entries e
                JOIN subcategories s ON e.subcategory_id = s.id
                JOIN categories c ON s.category_id = c.id
                WHERE e.entry_date BETWEEN ? AND ?
                GROUP BY strftime('%Y-%m', e.entry_date)
                ORDER BY month
                """;

        try (Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            setDateRange(statement, from, to);
            try (ResultSet result = statement.executeQuery()) {
                while (result.next()) {
                    balances.add(new MonthlyBalanceResponse(
                            result.getString("month"),
                            result.getDouble("income"),
                            result.getDouble("expenses"),
                            result.getDouble("savings"),
                            result.getDouble("balance_before_savings"),
                            result.getDouble("free_balance_after_savings")));
                }
            }
        } catch (SQLException error) {
            throw new IllegalStateException("Monthly analytics could not be loaded", error);
        }

        return balances;
    }

    public List<CategorySummaryResponse> getCategorySummary(LocalDate from, LocalDate to, String kind) {
        List<CategorySummaryResponse> summaries = new ArrayList<>();
        StringBuilder sql = new StringBuilder("""
                SELECT c.id AS category_id, c.name AS category_name, c.kind AS category_kind,
                       ROUND(SUM(e.amount), 2) AS total_amount
                FROM entries e
                JOIN subcategories s ON e.subcategory_id = s.id
                JOIN categories c ON s.category_id = c.id
                WHERE e.entry_date BETWEEN ? AND ?
                """);
        List<Object> parameters = dateRangeParameters(from, to);

        if (kind != null && !kind.isBlank()) {
            sql.append(" AND c.kind = ?");
            parameters.add(kind);
        }
        sql.append(" GROUP BY c.id, c.name, c.kind ORDER BY total_amount DESC");

        try (Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql.toString())) {
            setParameters(statement, parameters);
            try (ResultSet result = statement.executeQuery()) {
                while (result.next()) {
                    summaries.add(new CategorySummaryResponse(
                            result.getInt("category_id"),
                            result.getString("category_name"),
                            result.getString("category_kind"),
                            result.getDouble("total_amount")));
                }
            }
        } catch (SQLException error) {
            throw new IllegalStateException("Category analytics could not be loaded", error);
        }

        return summaries;
    }

    public List<SubcategorySummaryResponse> getSubcategorySummary(
            LocalDate from, LocalDate to, Integer categoryId, String kind) {
        List<SubcategorySummaryResponse> summaries = new ArrayList<>();
        StringBuilder sql = new StringBuilder("""
                SELECT s.id AS subcategory_id, s.name AS subcategory_name,
                       c.id AS category_id, c.name AS category_name, c.kind AS category_kind,
                       ROUND(SUM(e.amount), 2) AS total_amount
                FROM entries e
                JOIN subcategories s ON e.subcategory_id = s.id
                JOIN categories c ON s.category_id = c.id
                WHERE e.entry_date BETWEEN ? AND ?
                """);
        List<Object> parameters = dateRangeParameters(from, to);

        if (categoryId != null) {
            sql.append(" AND c.id = ?");
            parameters.add(categoryId);
        }
        if (kind != null && !kind.isBlank()) {
            sql.append(" AND c.kind = ?");
            parameters.add(kind);
        }
        sql.append(" GROUP BY s.id, s.name, c.id, c.name, c.kind ORDER BY total_amount DESC");

        try (Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql.toString())) {
            setParameters(statement, parameters);
            try (ResultSet result = statement.executeQuery()) {
                while (result.next()) {
                    summaries.add(new SubcategorySummaryResponse(
                            result.getInt("subcategory_id"),
                            result.getString("subcategory_name"),
                            result.getInt("category_id"),
                            result.getString("category_name"),
                            result.getString("category_kind"),
                            result.getDouble("total_amount")));
                }
            }
        } catch (SQLException error) {
            throw new IllegalStateException("Subcategory analytics could not be loaded", error);
        }

        return summaries;
    }

    public List<PersonSummaryResponse> getPersonSummary(LocalDate from, LocalDate to) {
        return getPersonSummaryByKind(from, to, "EXPENSE", false);
    }

    public List<PersonSummaryResponse> getIncomePersonSummary(LocalDate from, LocalDate to) {
        return getPersonSummaryByKind(from, to, "INCOME", true);
    }

    private List<PersonSummaryResponse> getPersonSummaryByKind(
            LocalDate from, LocalDate to, String kind, boolean includeUnassigned) {
        List<PersonSummaryResponse> summaries = new ArrayList<>();
        String personJoin = includeUnassigned ? "LEFT JOIN" : "JOIN";
        String sql = """
                SELECT e.person_id AS person_id, COALESCE(p.name, 'Ohne Person') AS person_name,
                       ROUND(SUM(e.amount), 2) AS total_amount
                FROM entries e
                JOIN subcategories s ON e.subcategory_id = s.id
                JOIN categories c ON s.category_id = c.id
                %s persons p ON e.person_id = p.id
                WHERE e.entry_date BETWEEN ? AND ? AND c.kind = ?
                GROUP BY e.person_id, p.name
                ORDER BY total_amount DESC
                """.formatted(personJoin);

        try (Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            setDateRange(statement, from, to);
            statement.setString(3, kind);
            try (ResultSet result = statement.executeQuery()) {
                while (result.next()) {
                    summaries.add(new PersonSummaryResponse(
                            result.getObject("person_id") == null ? 0 : result.getInt("person_id"),
                            result.getString("person_name"),
                            result.getDouble("total_amount")));
                }
            }
        } catch (SQLException error) {
            throw new IllegalStateException("Person analytics could not be loaded", error);
        }

        return summaries;
    }

    private List<Object> dateRangeParameters(LocalDate from, LocalDate to) {
        List<Object> parameters = new ArrayList<>();
        parameters.add(from.toString());
        parameters.add(to.toString());
        return parameters;
    }

    private void setDateRange(PreparedStatement statement, LocalDate from, LocalDate to) throws SQLException {
        statement.setString(1, from.toString());
        statement.setString(2, to.toString());
    }

    private void setParameters(PreparedStatement statement, List<Object> parameters) throws SQLException {
        for (int index = 0; index < parameters.size(); index++) {
            statement.setObject(index + 1, parameters.get(index));
        }
    }
}
