package com.bootgesicht.financeplanner.model;

public class UserAccount {

    private final int id;
    private final String username;
    private final String passwordHash;
    private final String displayName;
    private final boolean active;

    public UserAccount(int id, String username, String passwordHash, String displayName, boolean active) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.displayName = displayName;
        this.active = active;
    }

    public int getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getDisplayName() {
        return displayName;
    }

    public boolean isActive() {
        return active;
    }
}
