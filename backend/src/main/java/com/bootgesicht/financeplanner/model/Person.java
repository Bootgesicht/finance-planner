package com.bootgesicht.financeplanner.model;

public class Person {
    private int id;
    private String name;
    private PersonRole role; // Oder lieber nen Enum? aber für 2 Eintröge Child oder Adult?

    public Person(int id, String name, PersonRole role) {
        this.id = id;
        this.name = name;
        this.role = role;
    }

    public int getPersonId() {
        return id;
    }

    public String getPersonName() {
        return name;
    }

    public PersonRole getPersonRole() {
        return role;
    }

    public void setPersonID(int id) {
        this.id = id;
    }

    public void setPersonName(String name) {
        this.name = name;
    }

    public void setPersonRole(PersonRole role) {
        this.role = role;
    }

}