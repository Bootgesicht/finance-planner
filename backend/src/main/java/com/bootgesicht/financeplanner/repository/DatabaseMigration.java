package com.bootgesicht.financeplanner.repository;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
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
        } catch (SQLException exception) {
            throw new RepositoryException("Die Datenbankmigration für den Archivstatus ist fehlgeschlagen.", exception);
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
