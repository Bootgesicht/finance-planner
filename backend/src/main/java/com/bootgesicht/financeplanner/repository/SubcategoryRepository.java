package com.bootgesicht.financeplanner.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import com.bootgesicht.financeplanner.model.Subcategory;

public class SubcategoryRepository {

    public List<Subcategory> findAll() {
        List<Subcategory> subCategories = new ArrayList<>();
        String sql = """
                SELECT id, category_id, name
                FROM subcategories
                        """;
        try (
                Connection conn = DatabaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery();) {

            while (rs.next()) {
                subCategories.add(mapRowToSubCategory(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return subCategories;
    }

    public Subcategory findByName(String name) {
        String sql = """
                SELECT id, category_id, name
                FROM subcategories
                WHERE name = ?
                        """;
        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);) {
            ps.setString(1, name);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToSubCategory(rs);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Subcategory findById(int id) {
        String sql = """
                SELECT id, category_id, name
                FROM subcategories
                WHERE id = ?
                        """;
        try (Connection conn = DatabaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToSubCategory(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public void save(Subcategory subCategory) {
        String sql = """
                INSERT INTO subcategories (category_id, name)
                VALUES (?, ?)
                """;
        try (
                Connection conn = DatabaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);) {
            ps.setInt(1, subCategory.getCategoryId());
            ps.setString(2, subCategory.getName());
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void deleteById(int id) {
        String sql = """
                DELETE FROM subcategories
                WHERE id = ?
                """;

        try (
                Connection conn = DatabaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);) {
            ps.setInt(1, id);
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private Subcategory mapRowToSubCategory(ResultSet rs) throws SQLException {
        return new Subcategory(
                rs.getInt("id"),
                rs.getInt("category_id"),
                rs.getString("name"));
    }
}
