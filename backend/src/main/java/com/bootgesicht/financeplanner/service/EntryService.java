package com.bootgesicht.financeplanner.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.bootgesicht.financeplanner.dto.EntryOverviewResponse;
import com.bootgesicht.financeplanner.dto.EntryRequest;
import com.bootgesicht.financeplanner.dto.LatestEntryResponse;
import com.bootgesicht.financeplanner.model.Entry;
import com.bootgesicht.financeplanner.repository.EntryRepository;
import com.bootgesicht.financeplanner.repository.SubcategoryRepository;

@Service
public class EntryService {

    private final EntryRepository entryRepository;
    private final SubcategoryRepository subcategoryRepository;

    public EntryService(
            EntryRepository entryRepository,
            SubcategoryRepository subcategoryRepository) {
        this.entryRepository = entryRepository;
        this.subcategoryRepository = subcategoryRepository;
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

    public List<LatestEntryResponse> getLatestEntries(int limit, Integer createdByUserId) {
        return entryRepository.findLatestEntries(limit, createdByUserId);
    }

    public List<EntryOverviewResponse> searchEntries(
            String startDate,
            String endDate,
            Integer personId,
            Integer categoryId,
            Integer subcategoryId,
            String description,
            Integer createdByUserId) {

        return entryRepository.searchEntries(
                startDate,
                endDate,
                personId,
                categoryId,
                subcategoryId,
                description,
                createdByUserId);
    }

    public void createEntry(EntryRequest request, int currentUserId) {
        requireSelectableSubcategory(request.getSubcategoryId());
        Entry entry = new Entry(
                0,
                request.getDate(),
                request.getAmount(),
                request.getDescription(),
                request.getSubcategoryId(),
                request.getPersonId(),
                request.getNote(),
                null,
                null,
                currentUserId,
                currentUserId);

        entryRepository.save(entry);
    }

    public void updateEntry(int id, EntryRequest request, int currentUserId) {
        Entry existingEntry = entryRepository.findById(id);
        if (existingEntry == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Eintrag wurde nicht gefunden.");
        }

        if (existingEntry.getSubcategoryId() != request.getSubcategoryId()) {
            requireSelectableSubcategory(request.getSubcategoryId());
        }

        Entry entry = new Entry(
                id,
                request.getDate(),
                request.getAmount(),
                request.getDescription(),
                request.getSubcategoryId(),
                request.getPersonId(),
                request.getNote(),
                null,
                null,
                existingEntry.getCreatedByUserId(),
                currentUserId);

        entryRepository.updateById(id, entry);
    }

    public void deleteEntryById(int id) {
        entryRepository.deleteById(id);
    }

    private void requireSelectableSubcategory(int subcategoryId) {
        if (!subcategoryRepository.isAvailableForNewEntries(subcategoryId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Die gewählte Kategorie oder Subkategorie ist archiviert und kann nicht für neue Buchungen verwendet werden.");
        }
    }
}
