package com.bootgesicht.financeplanner.repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.bootgesicht.financeplanner.model.Person;
import com.bootgesicht.financeplanner.model.PersonRole;

public class PersonRepository {

    public List<Person> findAll() {
        List<Person> persons = new ArrayList<>();

        String sql = """
                    SELECT id, name, role
                    FROM persons
                """;

        try (
                Connection conn = DatabaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery();) {

            while (rs.next()) {
                Person person = new Person(
                        rs.getInt("id"),
                        rs.getString("name"),
                        PersonRole.valueOf(rs.getString("role")));
                persons.add(person);
            }
        } catch (SQLException e) {
            // TODO: handle exception
            e.printStackTrace();
        }
        return persons;
    }

    public Person findById(int id) {
        String sql = """
                SELECT id, name, role
                FROM persons
                WHERE id = ?
                """;

        try (
                Connection conn = DatabaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);) {

            ps.setInt(1, id);

            try (ResultSet rs = ps.executeQuery()) {

                if (rs.next()) {
                    return new Person(
                            rs.getInt("id"),
                            rs.getString("name"),
                            PersonRole.valueOf(rs.getString("role")));
                }
            }
        } catch (SQLException e) {
            // TODO: handle exception
            e.printStackTrace();
        }
        return null;
    }

    public Person findByName(String name) {
        String sql = """
                SELECT id, name, role
                FROM persons
                WHERE name = ?
                """;

        try (
                Connection conn = DatabaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);) {

            ps.setString(1, name);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new Person(
                            rs.getInt("id"),
                            rs.getString("name"),
                            PersonRole.valueOf(rs.getString("role")));
                }
            }

        } catch (SQLException e) {
            // TODO: handle exception
            e.printStackTrace();
        }
        return null;
    }

    public void save(Person person) {
        String sql = """
                INSERT INTO persons (name,role)
                VALUES (?, ?)
                """;
        try (
                Connection conn = DatabaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);) {
            ps.setString(1, person.getPersonName());
            ps.setString(2, person.getPersonRole().name());
            ps.executeUpdate();
        } catch (SQLException e) {
            // TODO: handle exception
            e.printStackTrace();
        }
    }

    public void deleteById(int id) {
        String sql = """
                DELETE FROM persons
                WHERE id = ?
                """;

        try (
                Connection conn = DatabaseConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);) {
            ps.setInt(1, id);
            ps.executeUpdate();

        } catch (SQLException e) {
            // TODO: handle exception
            e.printStackTrace();
        }

    }

}
