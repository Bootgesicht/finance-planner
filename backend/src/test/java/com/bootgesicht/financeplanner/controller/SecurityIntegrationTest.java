package com.bootgesicht.financeplanner.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRepository;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

import com.bootgesicht.financeplanner.repository.UserRepository;
import com.bootgesicht.financeplanner.repository.EntryRepository;
import com.bootgesicht.financeplanner.model.Entry;
import com.jayway.jsonpath.JsonPath;

import jakarta.servlet.http.Cookie;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityIntegrationTest {

    private static final Path DATABASE_PATH = createDatabase();

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EntryRepository entryRepository;

    @Autowired
    private CsrfTokenRepository csrfTokenRepository;

    @DynamicPropertySource
    static void configureDatabase(DynamicPropertyRegistry registry) {
        registry.add("app.database.url", () -> "jdbc:sqlite:" + DATABASE_PATH);
    }

    @BeforeEach
    void createLoginUser() {
        if (userRepository.findByUsername("jonas") == null) {
            userRepository.create("jonas", passwordEncoder.encode("richtig"), "Jonas");
        }
        if (userRepository.findByUsername("annina") == null) {
            userRepository.create("annina", passwordEncoder.encode("auch-richtig"), "Annina");
        }
    }

    @Test
    void apiReturnsJson401InsteadOfRedirectForAnonymousRequests() throws Exception {
        org.junit.jupiter.api.Assertions.assertInstanceOf(CookieCsrfTokenRepository.class, csrfTokenRepository);
        mockMvc.perform(get("/persons"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().doesNotExist("Location"))
                .andExpect(jsonPath("$.message").value("Anmeldung erforderlich."));
    }

    @Test
    void loginPersistsInSessionAndLogoutInvalidatesIt() throws Exception {
        AuthenticatedSession authenticated = loginAs("jonas", "richtig");

        mockMvc.perform(get("/auth/me").session(authenticated.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("jonas"));

        mockMvc.perform(withCsrf(post("/auth/logout"), authenticated))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/auth/me").session(authenticated.session()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void invalidCredentialsAndMissingCsrfAreRejected() throws Exception {
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"jonas\",\"password\":\"falsch\"}"))
                .andExpect(status().isForbidden());

        CsrfData csrfData = requestCsrf(null);
        mockMvc.perform(withCsrf(post("/auth/login"), csrfData)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"jonas\",\"password\":\"falsch\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void corsAllowsOnlyTheConfiguredFrontendWithCredentials() throws Exception {
        mockMvc.perform(options("/auth/me")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));

        mockMvc.perform(options("/auth/me")
                        .header("Origin", "https://example.invalid")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }

    @Test
    void auditUsersAlwaysComeFromAuthenticationAndCannotBeSpoofedByJson() throws Exception {
        AuthenticatedSession jonasSession = loginAs("jonas", "richtig");
        mockMvc.perform(withCsrf(post("/entries"), jonasSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "date":"2026-08-20",
                                  "amount":42,
                                  "description":"Security-Audit-Test",
                                  "subcategoryId":1,
                                  "personId":1,
                                  "note":null,
                                  "createdByUserId":2,
                                  "updatedByUserId":2
                                }
                                """))
                .andExpect(status().isOk());

        Entry created = entryRepository.searchEntries(
                        null, null, null, null, null, "Security-Audit-Test", null)
                .stream()
                .findFirst()
                .map(result -> entryRepository.findById(result.getId()))
                .orElseThrow();
        int jonasId = userRepository.findByUsername("jonas").getId();
        int anninaId = userRepository.findByUsername("annina").getId();
        org.junit.jupiter.api.Assertions.assertEquals(jonasId, created.getCreatedByUserId());
        org.junit.jupiter.api.Assertions.assertEquals(jonasId, created.getUpdatedByUserId());

        AuthenticatedSession anninaSession = loginAs("annina", "auch-richtig");
        mockMvc.perform(withCsrf(put("/entries/" + created.getId()), anninaSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "date":"2026-08-21",
                                  "amount":43,
                                  "description":"Security-Audit-Test",
                                  "subcategoryId":1,
                                  "personId":1,
                                  "note":null,
                                  "createdByUserId":2,
                                  "updatedByUserId":1
                                }
                                """))
                .andExpect(status().isOk());

        Entry updated = entryRepository.findById(created.getId());
        org.junit.jupiter.api.Assertions.assertEquals(jonasId, updated.getCreatedByUserId());
        org.junit.jupiter.api.Assertions.assertEquals(anninaId, updated.getUpdatedByUserId());
    }

    private AuthenticatedSession loginAs(String username, String password) throws Exception {
        CsrfData initialCsrf = requestCsrf(null);
        MvcResult loginResult = mockMvc.perform(withCsrf(post("/auth/login"), initialCsrf)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + username + "\",\"password\":\"" + password + "\"}"))
                .andExpect(status().isOk())
                .andReturn();

        MockHttpSession session = (MockHttpSession) loginResult.getRequest().getSession(false);
        CsrfData refreshed = requestCsrf(session);
        return new AuthenticatedSession(session, refreshed.cookie(), refreshed.token(), refreshed.headerName());
    }

    private CsrfData requestCsrf(MockHttpSession session) throws Exception {
        MockHttpServletRequestBuilder request = get("/auth/csrf");
        if (session != null) request.session(session);
        MvcResult result = mockMvc.perform(request).andExpect(status().isOk()).andReturn();
        String body = result.getResponse().getContentAsString();
        return new CsrfData(
                (MockHttpSession) result.getRequest().getSession(false),
                result.getResponse().getCookie("XSRF-TOKEN"),
                JsonPath.read(body, "$.token"),
                JsonPath.read(body, "$.headerName"));
    }

    private MockHttpServletRequestBuilder withCsrf(
            MockHttpServletRequestBuilder request,
            CsrfData csrfData) {
        if (csrfData.session() != null) request.session(csrfData.session());
        if (csrfData.cookie() != null) request.cookie(csrfData.cookie());
        return request.header(csrfData.headerName(), csrfData.token());
    }

    private MockHttpServletRequestBuilder withCsrf(
            MockHttpServletRequestBuilder request,
            AuthenticatedSession authenticatedSession) {
        if (authenticatedSession.session() != null) request.session(authenticatedSession.session());
        if (authenticatedSession.cookie() != null) request.cookie(authenticatedSession.cookie());
        return request.header(authenticatedSession.headerName(), authenticatedSession.token());
    }

    private static Path createDatabase() {
        try {
            Path path = Files.createTempFile("finance-planner-security-", ".db");
            try (Connection connection = DriverManager.getConnection("jdbc:sqlite:" + path);
                    Statement statement = connection.createStatement()) {
                statement.executeUpdate("CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT, kind TEXT)");
                statement.executeUpdate("CREATE TABLE subcategories (id INTEGER PRIMARY KEY, category_id INTEGER, name TEXT)");
                statement.executeUpdate("CREATE TABLE persons (id INTEGER PRIMARY KEY, name TEXT, role TEXT)");
                statement.executeUpdate("""
                        CREATE TABLE entries (
                            id INTEGER PRIMARY KEY, entry_date TEXT, amount NUMERIC, description TEXT,
                            subcategory_id INTEGER, person_id INTEGER, note TEXT,
                            created_at TEXT DEFAULT CURRENT_TIMESTAMP, updated_at TEXT DEFAULT CURRENT_TIMESTAMP
                        )
                        """);
                statement.executeUpdate("INSERT INTO categories VALUES (1, 'Wohnen', 'EXPENSE')");
                statement.executeUpdate("INSERT INTO subcategories VALUES (1, 1, 'Strom')");
                statement.executeUpdate("INSERT INTO persons VALUES (1, 'Haushalt', 'HOUSEHOLD')");
            }
            return path;
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }

    private record CsrfData(MockHttpSession session, Cookie cookie, String token, String headerName) {
    }

    private record AuthenticatedSession(
            MockHttpSession session,
            Cookie cookie,
            String token,
            String headerName) {
    }
}
