package com.bootgesicht.financeplanner.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.bootgesicht.financeplanner.dto.MonthlyBalanceResponse;

public class AnalyticsRepository {

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
                Connection conn = DatabaseConnection.getConnection();
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
}