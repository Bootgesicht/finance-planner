package com.bootgesicht.financeplanner.dto;

import com.bootgesicht.financeplanner.model.PersonRole;

public class PersonRequest {

    private String name;
    private PersonRole role;

    public PersonRequest() {
    }

    public String getName() {
        return name;
    }

    public PersonRole getRole() {
        return role;
    }
}
