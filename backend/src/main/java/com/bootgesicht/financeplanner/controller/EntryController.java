package com.bootgesicht.financeplanner.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.bootgesicht.financeplanner.dto.EntryOverviewResponse;
import com.bootgesicht.financeplanner.dto.EntryRequest;
import com.bootgesicht.financeplanner.dto.LatestEntryResponse;
import com.bootgesicht.financeplanner.model.Entry;
import com.bootgesicht.financeplanner.service.EntryService;
import com.bootgesicht.financeplanner.model.UserAccount;
import com.bootgesicht.financeplanner.service.UserService;

@RestController
@RequestMapping("/entries")
public class EntryController {

    private EntryService entryService;
    private UserService userService;

    public EntryController(EntryService entryService, UserService userService) {
        this.entryService = entryService;
        this.userService = userService;
    }

    @GetMapping
    public List<Entry> getAllEntries() {
        return entryService.getAllEntries();
    }

    @GetMapping("/{id}")
    public Entry getEntryById(@PathVariable int id) {
        return entryService.getEntryById(id);
    }

    @GetMapping("/person/{personId}")
    public List<Entry> getEntriesByPersonId(@PathVariable int personId) {
        return entryService.getEntriesByPersonId(personId);
    }

    @GetMapping("/subcategory/{subcategoryId}")
    public List<Entry> getEntriesBySubcategoryId(@PathVariable int subcategoryId) {
        return entryService.getEntriesBySubcategoryId(subcategoryId);
    }

    @GetMapping("/latest")
    public List<LatestEntryResponse> getLatestEntries(
            @RequestParam(defaultValue = "15") int limit,
            @RequestParam(defaultValue = "mine") String scope,
            Authentication authentication) {
        Integer createdByUserId;
        if ("mine".equals(scope)) {
            createdByUserId = userService.requireCurrentUser(authentication).getId();
        } else if ("all".equals(scope)) {
            createdByUserId = null;
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unbekannter Eintragsbereich.");
        }
        return entryService.getLatestEntries(limit, createdByUserId);
    }

    @GetMapping("/search")
    public List<EntryOverviewResponse> searchEntries(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Integer personId,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer subcategoryId,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Integer createdByUserId) {

        return entryService.searchEntries(
                startDate,
                endDate,
                personId,
                categoryId,
                subcategoryId,
                description,
                createdByUserId
        );
    }

    @PostMapping
    public void createEntry(@RequestBody EntryRequest request, Authentication authentication) {
        UserAccount user = userService.requireCurrentUser(authentication);
        entryService.createEntry(request, user.getId());
    }

    @DeleteMapping("/{id}")
    public void deleteEntryById(@PathVariable int id) {
        entryService.deleteEntryById(id);
    }

    @PutMapping("/{id}")
    public void updateEntry(
            @PathVariable int id,
            @RequestBody EntryRequest request,
            Authentication authentication) {
        UserAccount user = userService.requireCurrentUser(authentication);
        entryService.updateEntry(id, request, user.getId());
    }
}
