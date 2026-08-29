package com.bootgesicht.financeplanner.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.bootgesicht.financeplanner.model.Category;
import com.bootgesicht.financeplanner.model.CategoryKind;

@Repository
public class CategoryRepository {

    private final DatabaseConnection databaseConnection;

    public CategoryRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    public List<Category> findAll(boolean includeArchived) {
        List<Category> categories = new ArrayList<>();
        String sql = """
                SELECT id, name, kind, archived
                FROM categories
                """ + (includeArchived ? "" : " WHERE archived = 0") + " ORDER BY name COLLATE NOCASE";

        try (
                Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql);
                ResultSet resultSet = statement.executeQuery()) {
            while (resultSet.next()) {
                categories.add(mapRowToCategory(resultSet));
            }
        } catch (SQLException exception) {
            throw new RepositoryException("Kategorien konnten nicht geladen werden.", exception);
        }

        return categories;
    }

    public Category findByName(String name) {
        return findByNameExcludingId(name, null);
    }

    public Category findByNameExcludingId(String name, Integer excludedId) {
        String sql = """
                SELECT id, name, kind, archived
                FROM categories
                WHERE LOWER(name) = LOWER(?)
                """ + (excludedId == null ? "" : " AND id <> ?");

        try (
                Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, name);
            if (excludedId != null) {
                statement.setInt(2, excludedId);
            }

            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() ? mapRowToCategory(resultSet) : null;
            }
        } catch (SQLException exception) {
            throw new RepositoryException("Kategorie konnte nicht gesucht werden.", exception);
        }
    }

    public Category findById(int id) {
        String sql = """
                SELECT id, name, kind, archived
                FROM categories
                WHERE id = ?
                """;

        try (
                Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setInt(1, id);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() ? mapRowToCategory(resultSet) : null;
            }
        } catch (SQLException exception) {
            throw new RepositoryException("Kategorie konnte nicht geladen werden.", exception);
        }
    }

    public void save(Category category) {
        String sql = "INSERT INTO categories (name, kind, archived) VALUES (?, ?, ?)";

        try (
                Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, category.getCategoryName());
            statement.setString(2, category.getCategoryKind().name());
            statement.setBoolean(3, category.isArchived());
            statement.executeUpdate();
        } catch (SQLException exception) {
            throw new RepositoryException("Kategorie konnte nicht gespeichert werden.", exception);
        }
    }

    public void updateName(int id, String name) {
        executeUpdate("UPDATE categories SET name = ? WHERE id = ?", name, id);
    }

    public void setArchived(int id, boolean archived) {
        executeUpdate("UPDATE categories SET archived = ? WHERE id = ?", archived, id);
    }

    public int countSubcategories(int id) {
        return count("SELECT COUNT(*) FROM subcategories WHERE category_id = ?", id);
    }

    public int countEntries(int id) {
        return count("""
                SELECT COUNT(*)
                FROM entries e
                JOIN subcategories s ON e.subcategory_id = s.id
                WHERE s.category_id = ?
                """, id);
    }

    public void deleteById(int id) {
        try (
                Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement("DELETE FROM categories WHERE id = ?")) {
            statement.setInt(1, id);
            statement.executeUpdate();
        } catch (SQLException exception) {
            throw new RepositoryException("Kategorie konnte nicht gelöscht werden.", exception);
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
            throw new RepositoryException("Kategorie konnte nicht aktualisiert werden.", exception);
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
            throw new RepositoryException("Kategorie-Abhängigkeiten konnten nicht geprüft werden.", exception);
        }
    }

    private Category mapRowToCategory(ResultSet resultSet) throws SQLException {
        return new Category(
                resultSet.getInt("id"),
                resultSet.getString("name"),
                CategoryKind.valueOf(resultSet.getString("kind")),
                resultSet.getBoolean("archived"));
    }
}
