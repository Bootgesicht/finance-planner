package com.bootgesicht.financeplanner.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.bootgesicht.financeplanner.dto.EntryOverviewResponse;
import com.bootgesicht.financeplanner.dto.EntryRequest;
import com.bootgesicht.financeplanner.model.Entry;
import com.bootgesicht.financeplanner.service.EntryService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.bootgesicht.financeplanner.dto.LatestEntryResponse;

@RestController
@RequestMapping("/entries")
public class EntryController {

    private EntryService entryService = new EntryService();

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
            @RequestParam(defaultValue = "15") int limit) {
        return entryService.getLatestEntries(limit);
    }

    @GetMapping("/search")
    public List<EntryOverviewResponse> searchEntries(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Integer personId,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) Integer subcategoryId,
            @RequestParam(required = false) String description) {

        return entryService.searchEntries(
                startDate,
                endDate,
                personId,
                categoryId,
                subcategoryId,
                description);
    }

    @PostMapping
    public void createEntry(@RequestBody EntryRequest request) {
        entryService.createEntry(request);
    }

    @DeleteMapping("/{id}")
    public void deleteEntryById(@PathVariable int id) {
        entryService.deleteEntryById(id);
    }

    @PutMapping("/{id}")
    public void updateEntry(
            @PathVariable int id,
            @RequestBody EntryRequest request) {
        entryService.updateEntry(id, request);
    }

}