package com.bootgesicht.financeplanner.dto;

import java.time.LocalDate;

public class EntryRequest {

    private LocalDate date;
    private double amount;
    private String description;
    private int subcategoryId;
    private int personId;
    private String note;

    public EntryRequest() {
    }

    public LocalDate getDate() {
        return date;
    }

    public double getAmount() {
        return amount;
    }

    public String getDescription() {
        return description;
    }

    public int getSubcategoryId() {
        return subcategoryId;
    }

    public int getPersonId() {
        return personId;
    }

    public String getNote() {
        return note;
    }
}
