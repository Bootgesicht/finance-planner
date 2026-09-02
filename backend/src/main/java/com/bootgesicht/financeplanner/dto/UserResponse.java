package com.bootgesicht.financeplanner.dto;

public class UserResponse {

    private final int id;
    private final String username;
    private final String displayName;

    public UserResponse(int id, String username, String displayName) {
        this.id = id;
        this.username = username;
        this.displayName = displayName;
    }

    public int getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getDisplayName() {
        return displayName;
    }
}
