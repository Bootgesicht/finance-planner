package com.bootgesicht.financeplanner.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.bootgesicht.financeplanner.model.Subcategory;

@Repository
public class SubcategoryRepository {

    private final DatabaseConnection databaseConnection;

    public SubcategoryRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    public List<Subcategory> findAll(boolean includeArchived) {
        List<Subcategory> subcategories = new ArrayList<>();
        String sql = """
                SELECT s.id, s.category_id, s.name, s.archived
                FROM subcategories s
                JOIN categories c ON s.category_id = c.id
                """ + (includeArchived ? "" : " WHERE s.archived = 0 AND c.archived = 0")
                + " ORDER BY s.name COLLATE NOCASE";

        try (
                Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql);
                ResultSet resultSet = statement.executeQuery()) {
            while (resultSet.next()) {
                subcategories.add(mapRowToSubcategory(resultSet));
            }
        } catch (SQLException exception) {
            throw new RepositoryException("Subkategorien konnten nicht geladen werden.", exception);
        }

        return subcategories;
    }

    public Subcategory findByName(String name) {
        String sql = """
                SELECT id, category_id, name, archived
                FROM subcategories
                WHERE LOWER(name) = LOWER(?)
                LIMIT 1
                """;
        return findOne(sql, name);
    }

    public Subcategory findByNameAndCategoryExcludingId(String name, int categoryId, Integer excludedId) {
        String sql = """
                SELECT id, category_id, name, archived
                FROM subcategories
                WHERE category_id = ? AND LOWER(name) = LOWER(?)
                """ + (excludedId == null ? "" : " AND id <> ?");

        try (
                Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, categoryId);
            statement.setString(2, name);
            if (excludedId != null) {
                statement.setInt(3, excludedId);
            }
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() ? mapRowToSubcategory(resultSet) : null;
            }
        } catch (SQLException exception) {
            throw new RepositoryException("Subkategorie konnte nicht gesucht werden.", exception);
        }
    }

    public Subcategory findById(int id) {
        String sql = """
                SELECT id, category_id, name, archived
                FROM subcategories
                WHERE id = ?
                """;

        try (
                Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, id);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() ? mapRowToSubcategory(resultSet) : null;
            }
        } catch (SQLException exception) {
            throw new RepositoryException("Subkategorie konnte nicht geladen werden.", exception);
        }
    }

    public List<Subcategory> getSubcategoriesByCategoryId(int categoryId, boolean includeArchived) {
        List<Subcategory> subcategories = new ArrayList<>();
        String sql = """
                SELECT s.id, s.category_id, s.name, s.archived
                FROM subcategories s
                JOIN categories c ON s.category_id = c.id
                WHERE s.category_id = ?
                """ + (includeArchived ? "" : " AND s.archived = 0 AND c.archived = 0")
                + " ORDER BY s.name COLLATE NOCASE";

        try (
                Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, categoryId);
            try (ResultSet resultSet = statement.executeQuery()) {
                while (resultSet.next()) {
                    subcategories.add(mapRowToSubcategory(resultSet));
                }
            }
        } catch (SQLException exception) {
            throw new RepositoryException("Subkategorien konnten nicht geladen werden.", exception);
        }

        return subcategories;
    }

    public void save(Subcategory subcategory) {
        String sql = "INSERT INTO subcategories (category_id, name, archived) VALUES (?, ?, ?)";

        try (
                Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, subcategory.getCategoryId());
            statement.setString(2, subcategory.getName());
            statement.setBoolean(3, subcategory.isArchived());
            statement.executeUpdate();
        } catch (SQLException exception) {
            throw new RepositoryException("Subkategorie konnte nicht gespeichert werden.", exception);
        }
    }

    public void updateName(int id, String name) {
        executeUpdate("UPDATE subcategories SET name = ? WHERE id = ?", name, id);
    }

    public void setArchived(int id, boolean archived) {
        executeUpdate("UPDATE subcategories SET archived = ? WHERE id = ?", archived, id);
    }

    public boolean isAvailableForNewEntries(int id) {
        String sql = """
                SELECT COUNT(*)
                FROM subcategories s
                JOIN categories c ON s.category_id = c.id
                WHERE s.id = ? AND s.archived = 0 AND c.archived = 0
                """;
        return count(sql, id) > 0;
    }

    public int countEntries(int id) {
        return count("SELECT COUNT(*) FROM entries WHERE subcategory_id = ?", id);
    }

    public void deleteById(int id) {
        try (
                Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement("DELETE FROM subcategories WHERE id = ?")) {
            statement.setInt(1, id);
            statement.executeUpdate();
        } catch (SQLException exception) {
            throw new RepositoryException("Subkategorie konnte nicht gelöscht werden.", exception);
        }
    }

    private Subcategory findOne(String sql, String value) {
        try (
                Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, value);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() ? mapRowToSubcategory(resultSet) : null;
            }
        } catch (SQLException exception) {
            throw new RepositoryException("Subkategorie konnte nicht gesucht werden.", exception);
        }
    }

    private void executeUpdate(String sql, Object value, int id) {
        try (
                Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setObject(1, value);
            statement.setInt(2, id);
            statement.executeUpdate();
        } catch (SQLException exception) {
            throw new RepositoryException("Subkategorie konnte nicht aktualisiert werden.", exception);
        }
    }

    private int count(String sql, int id) {
        try (
                Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, id);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() ? resultSet.getInt(1) : 0;
            }
        } catch (SQLException exception) {
            throw new RepositoryException("Subkategorie-Abhängigkeiten konnten nicht geprüft werden.", exception);
        }
    }

    private Subcategory mapRowToSubcategory(ResultSet resultSet) throws SQLException {
        return new Subcategory(
                resultSet.getInt("id"),
                resultSet.getInt("category_id"),
                resultSet.getString("name"),
                resultSet.getBoolean("archived"));
    }
}
