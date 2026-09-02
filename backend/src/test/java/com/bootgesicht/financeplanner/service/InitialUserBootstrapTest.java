package com.bootgesicht.financeplanner.service;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.bootgesicht.financeplanner.model.UserAccount;
import com.bootgesicht.financeplanner.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class InitialUserBootstrapTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private Environment environment;

    private PasswordEncoder passwordEncoder;
    private InitialUserBootstrap bootstrap;

    @BeforeEach
    void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        bootstrap = new InitialUserBootstrap(userRepository, passwordEncoder, environment);
    }

    @Test
    void missingUsersAreCreatedWithBcryptHashesFromEnvironment() {
        when(environment.getProperty("FINANCE_PLANNER_JONAS_PASSWORD")).thenReturn("jonas-secret");
        when(environment.getProperty("FINANCE_PLANNER_ANNINA_PASSWORD")).thenReturn("annina-secret");

        bootstrap.run(null);

        verify(userRepository).create(eq("jonas"), argThat(hash -> {
            assertTrue(hash.startsWith("$2"));
            return passwordEncoder.matches("jonas-secret", hash);
        }), eq("Jonas"));
        verify(userRepository).create(eq("annina"), argThat(hash ->
                passwordEncoder.matches("annina-secret", hash)), eq("Annina"));
    }

    @Test
    void existingPasswordsAreNeverOverwritten() {
        when(userRepository.findByUsername("jonas"))
                .thenReturn(new UserAccount(1, "jonas", "$2a$10$existing", "Jonas", true));
        when(userRepository.findByUsername("annina"))
                .thenReturn(new UserAccount(2, "annina", "$2a$10$existing", "Annina", true));

        bootstrap.run(null);

        verify(environment, never()).getProperty("FINANCE_PLANNER_JONAS_PASSWORD");
        verify(environment, never()).getProperty("FINANCE_PLANNER_ANNINA_PASSWORD");
        verify(userRepository, never()).create(eq("jonas"), org.mockito.ArgumentMatchers.anyString(), eq("Jonas"));
        verify(userRepository, never()).create(eq("annina"), org.mockito.ArgumentMatchers.anyString(), eq("Annina"));
    }
}
