package com.bootgesicht.financeplanner.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.bootgesicht.financeplanner.dto.EntryOverviewResponse;
import com.bootgesicht.financeplanner.dto.EntryRequest;
import com.bootgesicht.financeplanner.dto.LatestEntryResponse;
import com.bootgesicht.financeplanner.model.Entry;
import com.bootgesicht.financeplanner.repository.EntryRepository;

@Service
public class EntryService {

    private EntryRepository entryRepository;

    public EntryService(EntryRepository entryRepository) {
        this.entryRepository = entryRepository;
    }

    public List<Entry> getAllEntries() {
        return entryRepository.findAll();
    }

    public Entry getEntryById(int id) {
        return entryRepository.findById(id);
    }

    public List<Entry> getEntriesBySubcategoryId(int subcategoryId) {
        return entryRepository.findBySubcategoryId(subcategoryId);
    }

    public List<Entry> getEntriesByPersonId(int personId) {
        return entryRepository.findByPersonId(personId);
    }

    public List<Entry> getEntriesByDateBetween(String entryDateOne, String entryDateTwo) {
        return entryRepository.findByDateBetween(entryDateOne, entryDateTwo);
    }

    public List<LatestEntryResponse> getLatestEntries(int limit) {
        return entryRepository.findLatestEntries(limit);
    }

    public List<EntryOverviewResponse> searchEntries(
            String startDate,
            String endDate,
            Integer personId,
            Integer categoryId,
            Integer subcategoryId,
            String description) {

        return entryRepository.searchEntries(
                startDate,
                endDate,
                personId,
                categoryId,
                subcategoryId,
                description);
    }

    public void createEntry(EntryRequest request) {
        Entry entry = new Entry(
                0,
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

    public void updateEntry(int id, EntryRequest request) {
        Entry entry = new Entry(
                id,
                request.getDate(),
                request.getAmount(),
                request.getDescription(),
                request.getSubcategoryId(),
                request.getPersonId(),
                request.getNote(),
                null,
                null);

        entryRepository.updateById(id, entry);
    }

    public void deleteEntryById(int id) {
        entryRepository.deleteById(id);
    }
}