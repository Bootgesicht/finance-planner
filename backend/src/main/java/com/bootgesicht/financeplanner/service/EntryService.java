package com.bootgesicht.financeplanner.service;

import java.util.List;

import com.bootgesicht.financeplanner.model.Entry;
import com.bootgesicht.financeplanner.repository.EntryRepository;

public class EntryService {
    private EntryRepository entryRepository = new EntryRepository();

    public List<Entry> getAllEntries() {
        return entryRepository.findAll();
    }

    public Entry getEntryById(int id) {
        return entryRepository.findById(id);
    }

    public List<Entry> getEntriesBySubcategoryId(int subcategoryid) {
        return entryRepository.findBySubcategoryId(subcategoryid);
    }

    public List<Entry> getEntriesPersonById(int personId) {
        return entryRepository.findByPersonId(personId);
    }

    public List<Entry> getEntriesByDateBetween(String entryDateOne, String entryDateTwo) {
        return entryRepository.findByDateBetween(entryDateOne, entryDateTwo);
    }

    public void createEntry(Entry entry) {
        entryRepository.save(entry);
    }

    public void deleteEntryById(int id) {
        entryRepository.deleteById(id);
    }

}
