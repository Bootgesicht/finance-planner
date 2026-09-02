package com.bootgesicht.financeplanner.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.bootgesicht.financeplanner.repository.UserRepository;

@Component
@Order(1)
public class InitialUserBootstrap implements ApplicationRunner {

    private static final Logger LOGGER = LoggerFactory.getLogger(InitialUserBootstrap.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Environment environment;

    public InitialUserBootstrap(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            Environment environment) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        createIfMissing("jonas", "Jonas", "FINANCE_PLANNER_JONAS_PASSWORD");
        createIfMissing("annina", "Annina", "FINANCE_PLANNER_ANNINA_PASSWORD");
    }

    private void createIfMissing(String username, String displayName, String environmentVariable) {
        if (userRepository.findByUsername(username) != null) {
            return;
        }

        String password = environment.getProperty(environmentVariable);
        if (password == null || password.isBlank()) {
            LOGGER.warn("Initial user '{}' was not created because {} is not set.", username, environmentVariable);
            return;
        }

        userRepository.create(username, passwordEncoder.encode(password), displayName);
        LOGGER.info("Initial user '{}' was created.", username);
    }
}
