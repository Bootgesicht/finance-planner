package com.bootgesicht.financeplanner.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.bootgesicht.financeplanner.dto.EntryRequest;
import com.bootgesicht.financeplanner.model.Entry;
import com.bootgesicht.financeplanner.repository.EntryRepository;
import com.bootgesicht.financeplanner.repository.SubcategoryRepository;

@ExtendWith(MockitoExtension.class)
class EntryServiceArchiveTest {

    @Mock
    private EntryRepository entryRepository;

    @Mock
    private SubcategoryRepository subcategoryRepository;

    @Mock
    private EntryRequest request;

    private EntryService service;

    @BeforeEach
    void setUp() {
        service = new EntryService(entryRepository, subcategoryRepository);
    }

    @Test
    void newEntriesCannotUseArchivedStructures() {
        when(request.getSubcategoryId()).thenReturn(8);
        when(subcategoryRepository.isAvailableForNewEntries(8)).thenReturn(false);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> service.createEntry(request, 2));

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(entryRepository, never()).save(any());
    }

    @Test
    void historicalEntryCanKeepItsArchivedSubcategoryWhileOtherFieldsChange() {
        Entry existing = new Entry(
                4, LocalDate.of(2025, 1, 1), 10, "Alt", 8, 1, null, null, null);
        when(entryRepository.findById(4)).thenReturn(existing);
        prepareValidRequest(8);

        service.updateEntry(4, request, 2);

        verify(subcategoryRepository, never()).isAvailableForNewEntries(8);
        verify(entryRepository).updateById(org.mockito.ArgumentMatchers.eq(4), any());
    }

    @Test
    void historicalEntryCanMoveOnlyToAnActiveSubcategory() {
        Entry existing = new Entry(
                4, LocalDate.of(2025, 1, 1), 10, "Alt", 8, 1, null, null, null);
        when(entryRepository.findById(4)).thenReturn(existing);
        prepareValidRequest(9);
        when(subcategoryRepository.isAvailableForNewEntries(9)).thenReturn(true);

        service.updateEntry(4, request, 2);

        verify(entryRepository).updateById(org.mockito.ArgumentMatchers.eq(4), any());
    }

    private void prepareValidRequest(int subcategoryId) {
        when(request.getSubcategoryId()).thenReturn(subcategoryId);
        when(request.getDate()).thenReturn(LocalDate.of(2026, 2, 1));
        when(request.getAmount()).thenReturn(20.0);
        when(request.getDescription()).thenReturn("Neu");
        when(request.getPersonId()).thenReturn(1);
        when(request.getNote()).thenReturn(null);
    }
}
