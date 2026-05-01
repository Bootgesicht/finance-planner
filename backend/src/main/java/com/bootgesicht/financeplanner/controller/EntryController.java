package com.bootgesicht.financeplanner.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import com.bootgesicht.financeplanner.model.Entry;
import com.bootgesicht.financeplanner.service.EntryService;

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
        return entryService.getEntriesByPersonById(personId);
    }

    @GetMapping("/subcategory/{subcategoryId}")
    public List<Entry> getEntriesBySubcategoryId(@PathVariable int subcategoryId) {
        return entryService.getEntriesBySubcategoryId(subcategoryId);
    }
}