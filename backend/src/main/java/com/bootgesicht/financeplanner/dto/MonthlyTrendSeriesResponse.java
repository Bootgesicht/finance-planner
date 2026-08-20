package com.bootgesicht.financeplanner.dto;

import java.util.List;

public class MonthlyTrendSeriesResponse {

    private String id;
    private String name;
    private List<MonthlyTrendPointResponse> points;

    public MonthlyTrendSeriesResponse(String id, String name, List<MonthlyTrendPointResponse> points) {
        this.id = id;
        this.name = name;
        this.points = points;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public List<MonthlyTrendPointResponse> getPoints() {
        return points;
    }
}
