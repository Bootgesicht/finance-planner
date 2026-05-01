package com.bootgesicht.financeplanner.service;

import java.util.List;

import com.bootgesicht.financeplanner.dto.EntryRequest;
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

    public List<Entry> getEntriesByPersonId(int personId) {
        return entryRepository.findByPersonId(personId);
    }

    public List<Entry> getEntriesByDateBetween(String entryDateOne, String entryDateTwo) {
        return entryRepository.findByDateBetween(entryDateOne, entryDateTwo);
    }

    public void createEntry(EntryRequest request) {
        Entry entry = new Entry(
                0, // id wird von DB gesetzt
                request.getDate(),
                request.getAmount(),
                request.getDescription(),
                request.getSubcategoryId(),
                request.getPersonId(),
                request.getNote(),
                null,
                null);

        entryRepository.save(entry);
    }

    public void deleteEntryById(int id) {
        entryRepository.deleteById(id);
    }

}
