package com.bootgesicht.financeplanner.repository;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(0)
public class DatabaseMigration implements ApplicationRunner {

    private final DatabaseConnection databaseConnection;

    public DatabaseMigration(DatabaseConnection databaseConnection) {
        this.databaseConnection = databaseConnection;
    }

    @Override
    public void run(ApplicationArguments args) {
        try (Connection connection = databaseConnection.getConnection()) {
            addArchivedColumnIfMissing(connection, "categories");
            addArchivedColumnIfMissing(connection, "subcategories");
            createUsersTable(connection);
            addUserReferenceIfMissing(connection, "created_by_user_id");
            addUserReferenceIfMissing(connection, "updated_by_user_id");
            createAuditIndexes(connection);
        } catch (SQLException exception) {
            throw new RepositoryException("Die Datenbankmigration ist fehlgeschlagen.", exception);
        }
    }

    private void createUsersTable(Connection connection) throws SQLException {
        try (Statement statement = connection.createStatement()) {
            statement.executeUpdate("""
                    CREATE TABLE IF NOT EXISTS users (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        username TEXT NOT NULL UNIQUE COLLATE NOCASE,
                        password_hash TEXT NOT NULL,
                        display_name TEXT NOT NULL,
                        active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
                    )
                    """);
        }
    }

    private void addUserReferenceIfMissing(Connection connection, String columnName) throws SQLException {
        if (hasColumn(connection, "entries", columnName)) {
            return;
        }

        try (Statement statement = connection.createStatement()) {
            statement.executeUpdate("ALTER TABLE entries ADD COLUMN " + columnName
                    + " INTEGER REFERENCES users(id)");
        }
    }

    private void createAuditIndexes(Connection connection) throws SQLException {
        try (Statement statement = connection.createStatement()) {
            statement.executeUpdate("""
                    CREATE INDEX IF NOT EXISTS idx_entries_created_by_user_id
                    ON entries(created_by_user_id)
                    """);
            statement.executeUpdate("""
                    CREATE INDEX IF NOT EXISTS idx_entries_updated_by_user_id
                    ON entries(updated_by_user_id)
                    """);
        }
    }

    private void addArchivedColumnIfMissing(Connection connection, String tableName) throws SQLException {
        if (hasColumn(connection, tableName, "archived")) {
            return;
        }

        try (Statement statement = connection.createStatement()) {
            statement.executeUpdate("ALTER TABLE " + tableName
                    + " ADD COLUMN archived INTEGER NOT NULL DEFAULT 0 CHECK (archived IN (0, 1))");
        }
    }

    private boolean hasColumn(Connection connection, String tableName, String columnName) throws SQLException {
        try (
                Statement statement = connection.createStatement();
                ResultSet resultSet = statement.executeQuery("PRAGMA table_info(" + tableName + ")")) {
            while (resultSet.next()) {
                if (columnName.equalsIgnoreCase(resultSet.getString("name"))) {
                    return true;
                }
            }
        }

        return false;
    }
}
