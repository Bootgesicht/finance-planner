package com.bootgesicht.financeplanner.dto;

public class PersonSummaryResponse {

    private int personId;
    private String personName;
    private double totalAmount;
    private double averagePerMonth;
    private long monthCount;

    public PersonSummaryResponse(int personId, String personName, double totalAmount) {
        this(personId, personName, totalAmount, 0, 0);
    }

    public PersonSummaryResponse(int personId, String personName, double totalAmount,
            double averagePerMonth, long monthCount) {
        this.personId = personId;
        this.personName = personName;
        this.totalAmount = totalAmount;
        this.averagePerMonth = averagePerMonth;
        this.monthCount = monthCount;
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

    public double getAveragePerMonth() {
        return averagePerMonth;
    }

    public long getMonthCount() {
        return monthCount;
    }
}
