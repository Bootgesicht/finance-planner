package com.bootgesicht.financeplanner.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.bootgesicht.financeplanner.model.Entry;
import com.bootgesicht.financeplanner.dto.LatestEntryResponse;

public class EntryRepository {

    public List<Entry> findAll() {
        List<Entry> entries = new ArrayList<>();
        String sql = """
                    SELECT id, entry_date, amount, description, subcategory_id, person_id, note, created_at, updated_at
                    FROM entries
                """;
        try (
                Connection conn = DatabaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery();) {
            while (rs.next()) {
                entries.add(mapRowToEntry(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return entries;
    }

    public Entry findById(int id) {
        String sql = """
                    SELECT id, entry_date, amount, description, subcategory_id, person_id, note, created_at, updated_at
                    FROM entries
                    WHERE id = ?
                """;
        try (
                Connection conn = DatabaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);) {
            ps.setInt(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return mapRowToEntry(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Entry> findBySubcategoryId(int subcategoryid) {
        List<Entry> entries = new ArrayList<>();
        String sql = """
                    SELECT id, entry_date, amount, description, subcategory_id, person_id, note, created_at, updated_at
                    FROM entries
                    WHERE subcategory_id = ?
                """;
        try (
                Connection conn = DatabaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);) {
            ps.setInt(1, subcategoryid);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    entries.add(mapRowToEntry(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return entries;
    }

    public List<Entry> findByPersonId(int personId) {
        List<Entry> entries = new ArrayList<>();
        String sql = """
                    SELECT id, entry_date, amount, description, subcategory_id, person_id, note, created_at, updated_at
                    FROM entries
                    WHERE person_id = ?
                """;

        try (
                Connection conn = DatabaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);) {
            ps.setInt(1, personId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    entries.add(mapRowToEntry(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return entries;
    }

    public List<Entry> findByDateBetween(String entryDateOne, String entryDateTwo) {
        List<Entry> entries = new ArrayList<>();
        String sql = """
                    SELECT id, entry_date, amount, description, subcategory_id, person_id, note, created_at, updated_at
                    FROM entries
                    WHERE entry_date BETWEEN ? AND ?
                """;

        try (
                Connection conn = DatabaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);) {
            ps.setString(1, entryDateOne);
            ps.setString(2, entryDateTwo);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    entries.add(mapRowToEntry(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return entries;
    }

    public List<LatestEntryResponse> findLatestEntries(int limit) {
        List<LatestEntryResponse> latestEntries = new ArrayList<>();

        String sql = """
                SELECT
                    e.id,
                    e.entry_date,
                    e.amount,
                    e.description,
                    p.name AS person_name,
                    c.name AS category_name,
                    c.kind AS category_kind,
                    s.name AS subcategory_name
                FROM entries e
                JOIN persons p ON e.person_id = p.id
                JOIN subcategories s ON e.subcategory_id = s.id
                JOIN categories c ON s.category_id = c.id
                ORDER BY e.entry_date DESC, e.id DESC
                LIMIT ?
                """;

        try (
                Connection conn = DatabaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setInt(1, limit);

            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    LatestEntryResponse entry = new LatestEntryResponse(
                            rs.getInt("id"),
                            rs.getString("entry_date"),
                            rs.getDouble("amount"),
                            rs.getString("description"),
                            rs.getString("person_name"),
                            rs.getString("category_name"),
                            rs.getString("subcategory_name"),
                            rs.getString("category_kind"));

                    latestEntries.add(entry);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }

        return latestEntries;
    }

    public void save(Entry entry) {
        String sql = """
                INSERT INTO entries (entry_date, amount, description, subcategory_id, person_id, note)
                VALUES (?, ?, ?, ?, ?, ?)
                """;
        try (
                Connection conn = DatabaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);) {
            ps.setString(1, entry.getDate().toString());
            ps.setDouble(2, entry.getAmount());
            ps.setString(3, entry.getDescription());
            ps.setInt(4, entry.getSubcategoryId());
            ps.setInt(5, entry.getPersonId());
            if (entry.getNote() != null) {
                ps.setString(6, entry.getNote());
            } else {
                ps.setNull(6, Types.VARCHAR);
            }
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void deleteById(int id) {
        String sql = """
                DELETE FROM entries
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

    private Entry mapRowToEntry(ResultSet rs) throws SQLException {
        return new Entry(
                rs.getInt("id"),
                LocalDate.parse(rs.getString("entry_date")),
                rs.getDouble("amount"),
                rs.getString("description"),
                rs.getInt("subcategory_id"),
                rs.getInt("person_id"),
                rs.getString("note"),
                LocalDateTime.parse(rs.getString("created_at").replace(" ", "T")),
                LocalDateTime.parse(rs.getString("updated_at").replace(" ", "T")));
    }

}