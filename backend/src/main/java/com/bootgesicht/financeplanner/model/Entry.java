package com.bootgesicht.financeplanner.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class Entry {

    private int id;
    private LocalDate date;
    private double amount;
    private String description;
    private int subcategoryId;
    private int personId;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Entry(int id, LocalDate date, double amount, String description,
            int subcategoryId, int personId, String note,
            LocalDateTime createdAt, LocalDateTime updatedAt) {

        this.id = id;
        this.date = date;
        this.amount = amount;
        this.description = description;
        this.subcategoryId = subcategoryId;
        this.personId = personId;
        this.note = note;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public int getId() {
        return id;
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

    public Integer getPersonId() {
        return personId;
    }

    public String getNote() {
        return note;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

}
