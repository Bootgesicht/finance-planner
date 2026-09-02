package com.bootgesicht.financeplanner.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.bootgesicht.financeplanner.model.UserAccount;

@Repository
public class UserRepository {

    private final DatabaseConnection databaseConnection;

    public UserRepository(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    public UserAccount findByUsername(String username) {
        String sql = """
                SELECT id, username, password_hash, display_name, active
                FROM users
                WHERE username = ? COLLATE NOCASE
                """;

        try (
                Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, username);
            try (ResultSet resultSet = statement.executeQuery()) {
                return resultSet.next() ? mapRow(resultSet) : null;
            }
        } catch (SQLException exception) {
            throw new RepositoryException("Der Benutzer konnte nicht geladen werden.", exception);
        }
    }

    public List<UserAccount> findAllActive() {
        List<UserAccount> users = new ArrayList<>();
        String sql = """
                SELECT id, username, password_hash, display_name, active
                FROM users
                WHERE active = 1
                ORDER BY display_name COLLATE NOCASE, id
                """;

        try (
                Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql);
                ResultSet resultSet = statement.executeQuery()) {
            while (resultSet.next()) {
                users.add(mapRow(resultSet));
            }
        } catch (SQLException exception) {
            throw new RepositoryException("Die Benutzer konnten nicht geladen werden.", exception);
        }
        return users;
    }

    public void create(String username, String passwordHash, String displayName) {
        String sql = """
                INSERT INTO users (username, password_hash, display_name, active)
                VALUES (?, ?, ?, 1)
                """;

        try (
                Connection connection = databaseConnection.getConnection();
                PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, username);
            statement.setString(2, passwordHash);
            statement.setString(3, displayName);
            statement.executeUpdate();
        } catch (SQLException exception) {
            throw new RepositoryException("Der Benutzer konnte nicht angelegt werden.", exception);
        }
    }

    private UserAccount mapRow(ResultSet resultSet) throws SQLException {
        return new UserAccount(
                resultSet.getInt("id"),
                resultSet.getString("username"),
                resultSet.getString("password_hash"),
                resultSet.getString("display_name"),
                resultSet.getInt("active") == 1);
    }
}
