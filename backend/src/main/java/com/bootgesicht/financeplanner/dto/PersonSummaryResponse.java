package com.bootgesicht.financeplanner.dto;

public class PersonSummaryResponse {

    private int personId;
    private String personName;
    private double totalAmount;

    public PersonSummaryResponse(int personId, String personName, double totalAmount) {
        this.personId = personId;
        this.personName = personName;
        this.totalAmount = totalAmount;
    }

    public int getPersonId() {
        return personId;
    }

    public String getPersonName() {
        return personName;
    }

    public double getTotalAmount() {
        return totalAmount;
    }
}
