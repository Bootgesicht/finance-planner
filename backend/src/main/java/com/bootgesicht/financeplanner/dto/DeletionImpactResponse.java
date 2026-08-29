package com.bootgesicht.financeplanner.dto;

public record DeletionImpactResponse(
        boolean deletable,
        int subcategoryCount,
        int entryCount,
        String reason) {
}
