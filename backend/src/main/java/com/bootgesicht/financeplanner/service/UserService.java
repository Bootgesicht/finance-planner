package com.bootgesicht.financeplanner.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.bootgesicht.financeplanner.dto.UserResponse;
import com.bootgesicht.financeplanner.model.UserAccount;
import com.bootgesicht.financeplanner.repository.UserRepository;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserAccount user = userRepository.findByUsername(username);
        if (user == null || !user.isActive()) {
            throw new UsernameNotFoundException("Benutzer wurde nicht gefunden.");
        }

        return org.springframework.security.core.userdetails.User.withUsername(user.getUsername())
                .password(user.getPasswordHash())
                .authorities("APP_ACCESS")
                .build();
    }

    public UserAccount requireCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Anmeldung erforderlich.");
        }

        UserAccount user = userRepository.findByUsername(authentication.getName());
        if (user == null || !user.isActive()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Anmeldung erforderlich.");
        }
        return user;
    }

    public UserResponse getCurrentUser(Authentication authentication) {
        return toResponse(requireCurrentUser(authentication));
    }

    public List<UserResponse> getActiveUsers() {
        return userRepository.findAllActive().stream().map(this::toResponse).toList();
    }

    private UserResponse toResponse(UserAccount user) {
        return new UserResponse(user.getId(), user.getUsername(), user.getDisplayName());
    }
}
