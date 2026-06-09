package com.bootgesicht.financeplanner.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.bootgesicht.financeplanner.dto.CategorySummaryResponse;
import com.bootgesicht.financeplanner.dto.MonthlyBalanceResponse;
import com.bootgesicht.financeplanner.dto.SubcategorySummaryResponse;

@Repository
public class AnalyticsRepository {

    private DatabaseConnection databaseConnection;

    public AnalyticsRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    public List<MonthlyBalanceResponse> getMonthlyBalance(int year) {
        List<MonthlyBalanceResponse> monthlyBalances = new ArrayList<>();

        String sql = """
                SELECT
                    strftime('%Y-%m', e.entry_date) AS month,

                    ROUND(SUM(CASE
                        WHEN c.kind = 'INCOME' THEN e.amount
                        ELSE 0
                    END), 2) AS income,

                    ROUND(SUM(CASE
                        WHEN c.kind = 'EXPENSE' THEN e.amount
                        ELSE 0
                    END), 2) AS expenses,

                    ROUND(SUM(CASE
                        WHEN c.kind = 'SAVING' THEN e.amount
                        ELSE 0
                    END), 2) AS savings,

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
                WHERE strftime('%Y', e.entry_date) = ?
                GROUP BY strftime('%Y-%m', e.entry_date)
                ORDER BY month
                """;

        try (
                Connection conn = databaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, String.valueOf(year));

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    MonthlyBalanceResponse monthlyBalance = new MonthlyBalanceResponse(
                            rs.getString("month"),
                            rs.getDouble("income"),
                            rs.getDouble("expenses"),
                            rs.getDouble("savings"),
                            rs.getDouble("balance_before_savings"),
                            rs.getDouble("free_balance_after_savings"));

                    monthlyBalances.add(monthlyBalance);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return monthlyBalances;
    }

    public List<CategorySummaryResponse> getCategorySummary(int year, Integer month, String kind) {
        List<CategorySummaryResponse> summaries = new ArrayList<>();

        StringBuilder sql = new StringBuilder("""
                SELECT
                    c.id AS category_id,
                    c.name AS category_name,
                    c.kind AS category_kind,
                    ROUND(SUM(e.amount), 2) AS total_amount
                FROM entries e
                JOIN subcategories s ON e.subcategory_id = s.id
                JOIN categories c ON s.category_id = c.id
                WHERE strftime('%Y', e.entry_date) = ?
                """);

        List<Object> parameters = new ArrayList<>();
        parameters.add(String.valueOf(year));

        if (month != null) {
            sql.append(" AND strftime('%m', e.entry_date) = ?");
            parameters.add(String.format("%02d", month));
        }

        if (kind != null && !kind.isBlank()) {
            sql.append(" AND c.kind = ?");
            parameters.add(kind);
        }

        sql.append("""
                GROUP BY c.id, c.name, c.kind
                ORDER BY total_amount DESC
                """);

        try (
                Connection conn = databaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql.toString())) {
            for (int i = 0; i < parameters.size(); i++) {
                ps.setObject(i + 1, parameters.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    summaries.add(new CategorySummaryResponse(
                            rs.getInt("category_id"),
                            rs.getString("category_name"),
                            rs.getString("category_kind"),
                            rs.getDouble("total_amount")));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return summaries;
    }

    public List<SubcategorySummaryResponse> getSubcategorySummary(
            int year,
            Integer month,
            Integer categoryId,
            String kind) {

        List<SubcategorySummaryResponse> summaries = new ArrayList<>();

        StringBuilder sql = new StringBuilder("""
                SELECT
                    s.id AS subcategory_id,
                    s.name AS subcategory_name,
                    c.id AS category_id,
                    c.name AS category_name,
                    c.kind AS category_kind,
                    ROUND(SUM(e.amount), 2) AS total_amount
                FROM entries e
                JOIN subcategories s ON e.subcategory_id = s.id
                JOIN categories c ON s.category_id = c.id
                WHERE strftime('%Y', e.entry_date) = ?
                """);

        List<Object> parameters = new ArrayList<>();
        parameters.add(String.valueOf(year));

        if (month != null) {
            sql.append(" AND strftime('%m', e.entry_date) = ?");
            parameters.add(String.format("%02d", month));
        }

        if (categoryId != null) {
            sql.append(" AND c.id = ?");
            parameters.add(categoryId);
        }

        if (kind != null && !kind.isBlank()) {
            sql.append(" AND c.kind = ?");
            parameters.add(kind);
        }

        sql.append("""
                GROUP BY s.id, s.name, c.id, c.name, c.kind
                ORDER BY total_amount DESC
                """);

        try (
                Connection conn = databaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql.toString())) {

            for (int i = 0; i < parameters.size(); i++) {
                ps.setObject(i + 1, parameters.get(i));
            }

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    summaries.add(new SubcategorySummaryResponse(
                            rs.getInt("subcategory_id"),
                            rs.getString("subcategory_name"),
                            rs.getInt("category_id"),
                            rs.getString("category_name"),
                            rs.getString("category_kind"),
                            rs.getDouble("total_amount")));
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return summaries;
    }
}