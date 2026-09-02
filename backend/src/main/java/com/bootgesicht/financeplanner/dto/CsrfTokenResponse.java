package com.bootgesicht.financeplanner.dto;

public class CsrfTokenResponse {

    private final String token;
    private final String headerName;

    public CsrfTokenResponse(String token, String headerName) {
        this.token = token;
        this.headerName = headerName;
    }

    public String getToken() {
        return token;
    }

    public String getHeaderName() {
        return headerName;
    }
}
