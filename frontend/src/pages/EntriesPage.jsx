import { useEffect, useState } from 'react'
import { getPersons } from '../api/personApi'
import { getCategories } from '../api/categoryApi'
import { getSubcategoriesByCategoryId } from '../api/subcategoryApi'
import { searchEntries, deleteEntry, updateEntry } from '../api/entryApi'

function EntriesPage() {
    const [persons, setPersons] = useState([])
    const [categories, setCategories] = useState([])
    const [subcategories, setSubcategories] = useState([])

    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [personId, setPersonId] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [subcategoryId, setSubcategoryId] = useState('')
    const [description, setDescription] = useState('')

    const [entries, setEntries] = useState([])
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    const [editingEntryId, setEditingEntryId] = useState(null)
    const [editForm, setEditForm] = useState({
        date: '',
        amount: '',
        description: '',
        categoryId: '',
        subcategoryId: '',
        personId: '',
        note: ''
    })
    const [editSubcategories, setEditSubcategories] = useState([])
    useEffect(() => {
        getPersons()
            .then(data => setPersons(data))
            .catch(error => {
                console.error('Error loading persons:', error)
                setErrorMessage('Personen konnten nicht geladen werden.')
            })

        getCategories()
            .then(data => setCategories(data))
            .catch(error => {
                console.error('Error loading categories:', error)
                setErrorMessage('Kategorien konnten nicht geladen werden.')
            })

        handleSearch()
    }, [])

    function handleCategoryChange(event) {
        const selectedCategoryId = event.target.value

        setCategoryId(selectedCategoryId)
        setSubcategoryId('')
        setSubcategories([])

        if (selectedCategoryId) {
            getSubcategoriesByCategoryId(selectedCategoryId)
                .then(data => setSubcategories(data))
                .catch(error => {
                    console.error('Error loading subcategories:', error)
                    setErrorMessage('Subkategorien konnten nicht geladen werden.')
                })
        }
    }

    function handleSearch(event) {
        if (event) {
            event.preventDefault()
        }

        setErrorMessage('')
        setSuccessMessage('')

        const filters = {
            startDate,
            endDate,
            personId,
            categoryId,
            subcategoryId,
            description
        }

        searchEntries(filters)
            .then(data => {
                setEntries(data)
                setSuccessMessage(`${data.length} Einträge gefunden.`)
            })
            .catch(error => {
                console.error('Error searching entries:', error)
                setErrorMessage('Einträge konnten nicht geladen werden.')
            })
    }

    function parseAmount(value) {
        return Number(String(value).replace(',', '.'))
    }

    function handleStartEdit(entry) {
        setEditingEntryId(entry.id)

        setEditForm({
            date: entry.date,
            amount: String(entry.amount).replace('.', ','),
            description: entry.description,
            categoryId: String(entry.categoryId),
            subcategoryId: String(entry.subcategoryId),
            personId: String(entry.personId),
            note: entry.note || ''
        })

        getSubcategoriesByCategoryId(entry.categoryId)
            .then(data => setEditSubcategories(data))
            .catch(error => {
                console.error('Error loading edit subcategories:', error)
                setErrorMessage('Subkategorien konnten nicht geladen werden.')
            })
    }

    function handleEditFormChange(field, value) {
        setEditForm(currentForm => ({
            ...currentForm,
            [field]: value
        }))
    }

    function handleEditCategoryChange(categoryId) {
        setEditForm(currentForm => ({
            ...currentForm,
            categoryId: categoryId,
            subcategoryId: ''
        }))

        setEditSubcategories([])

        if (categoryId) {
            getSubcategoriesByCategoryId(categoryId)
                .then(data => setEditSubcategories(data))
                .catch(error => {
                    console.error('Error loading edit subcategories:', error)
                    setErrorMessage('Subkategorien konnten nicht geladen werden.')
                })
        }
    }

    function handleCancelEdit() {
        setEditingEntryId(null)
        setEditForm({
            date: '',
            amount: '',
            description: '',
            categoryId: '',
            subcategoryId: '',
            personId: '',
            note: ''
        })
        setEditSubcategories([])
    }

    function handleSaveEdit() {
        setErrorMessage('')
        setSuccessMessage('')

        if (!editForm.date) {
            setErrorMessage('Bitte ein Datum auswählen.')
            return
        }

        if (!editForm.personId) {
            setErrorMessage('Bitte eine Person auswählen.')
            return
        }

        if (!editForm.amount) {
            setErrorMessage('Bitte einen Betrag eingeben.')
            return
        }

        const parsedAmount = parseAmount(editForm.amount)

        if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
            setErrorMessage('Bitte einen gültigen Betrag eingeben.')
            return
        }

        if (!editForm.description.trim()) {
            setErrorMessage('Bitte eine Beschreibung eingeben.')
            return
        }

        if (!editForm.subcategoryId) {
            setErrorMessage('Bitte eine Subkategorie auswählen.')
            return
        }

        const entry = {
            date: editForm.date,
            amount: parsedAmount,
            description: editForm.description.trim(),
            subcategoryId: Number(editForm.subcategoryId),
            personId: Number(editForm.personId),
            note: editForm.note.trim() || null
        }

        updateEntry(editingEntryId, entry)
            .then(() => {
                setSuccessMessage('Eintrag wurde aktualisiert.')
                handleCancelEdit()
                handleSearch()
            })
            .catch(error => {
                console.error('Error updating entry:', error)
                setErrorMessage('Eintrag konnte nicht aktualisiert werden.')
            })
    }

    function handleResetFilters() {
        setStartDate('')
        setEndDate('')
        setPersonId('')
        setCategoryId('')
        setSubcategoryId('')
        setDescription('')
        setSubcategories([])
        setSuccessMessage('')
        setErrorMessage('')

        searchEntries({})
            .then(data => {
                setEntries(data)
                setSuccessMessage(`${data.length} Einträge gefunden.`)
            })
            .catch(error => {
                console.error('Error loading entries:', error)
                setErrorMessage('Einträge konnten nicht geladen werden.')
            })
    }

    function formatAmount(amount) {
        return amount.toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    function getEntryRowClass(categoryKind) {
        if (categoryKind === 'INCOME') {
            return 'table-success'
        }

        if (categoryKind === 'EXPENSE') {
            return 'table-danger'
        }

        if (categoryKind === 'SAVING') {
            return 'table-info'
        }

        return ''
    }

    function handleDeleteEntry(id) {
        const confirmed = window.confirm('Diesen Eintrag wirklich löschen?')

        if (!confirmed) {
            return
        }

        deleteEntry(id)
            .then(() => {
                setSuccessMessage('Eintrag wurde gelöscht.')
                handleSearch()
            })
            .catch(error => {
                console.error('Error deleting entry:', error)
                setErrorMessage('Eintrag konnte nicht gelöscht werden.')
            })
    }

    return (
        <div className="container mt-4 pb-5">
            <h1>Einträge</h1>
            <p className="text-muted">
                Suche und filtere erfasste Einträge. Bearbeiten und Löschen folgen als nächster Schritt.
            </p>

            {errorMessage && (
                <div className="alert alert-danger mt-3" role="alert">
                    {errorMessage}
                </div>
            )}

            {successMessage && (
                <div className="alert alert-success mt-3" role="alert">
                    {successMessage}
                </div>
            )}

            <div className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Filter</h5>

                    <form onSubmit={handleSearch}>
                        <div className="row g-3">
                            <div className="col-12 col-md-2">
                                <label className="form-label">Von Datum</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={startDate}
                                    onChange={(event) => setStartDate(event.target.value)}
                                />
                            </div>

                            <div className="col-12 col-md-2">
                                <label className="form-label">Bis Datum</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={endDate}
                                    onChange={(event) => setEndDate(event.target.value)}
                                />
                            </div>

                            <div className="col-12 col-md-2">
                                <label className="form-label">Person</label>
                                <select
                                    className="form-select"
                                    value={personId}
                                    onChange={(event) => setPersonId(event.target.value)}
                                >
                                    <option value="">Alle</option>

                                    {persons.map(person => (
                                        <option key={person.personId} value={person.personId}>
                                            {person.personName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-12 col-md-2">
                                <label className="form-label">Kategorie</label>
                                <select
                                    className="form-select"
                                    value={categoryId}
                                    onChange={handleCategoryChange}
                                >
                                    <option value="">Alle</option>

                                    {categories.map(category => (
                                        <option key={category.categoryId} value={category.categoryId}>
                                            {category.categoryName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-12 col-md-2">
                                <label className="form-label">Subkategorie</label>
                                <select
                                    className="form-select"
                                    value={subcategoryId}
                                    onChange={(event) => setSubcategoryId(event.target.value)}
                                    disabled={!categoryId}
                                >
                                    <option value="">Alle</option>

                                    {subcategories.map(subcategory => (
                                        <option key={subcategory.id} value={subcategory.id}>
                                            {subcategory.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="col-12 col-md-2">
                                <label className="form-label">Beschreibung</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={description}
                                    onChange={(event) => setDescription(event.target.value)}
                                    placeholder="z. B. Rewe"
                                />
                            </div>
                        </div>

                        <div className="d-flex gap-2 mt-3">
                            <button type="submit" className="btn btn-primary">
                                Filtern
                            </button>

                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={handleResetFilters}
                            >
                                Filter zurücksetzen
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Gefundene Einträge</h5>

                    {entries.length === 0 ? (
                        <p className="text-muted">Keine Einträge gefunden.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-sm align-middle">
                                <thead>
                                    <tr>
                                        <th>Datum</th>
                                        <th className="text-end">Betrag</th>
                                        <th>Beschreibung</th>
                                        <th>Person</th>
                                        <th>Kategorie</th>
                                        <th>Subkategorie</th>
                                        <th>Notiz</th>
                                        <th>Aktionen</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {entries.map(entry => {
                                        const isEditing = editingEntryId === entry.id

                                        return (
                                            <tr
                                                key={entry.id}
                                                className={getEntryRowClass(entry.categoryKind)}
                                            >
                                                {isEditing ? (
                                                    <>
                                                        <td>
                                                            <input
                                                                type="date"
                                                                className="form-control form-control-sm"
                                                                value={editForm.date}
                                                                onChange={(event) => handleEditFormChange('date', event.target.value)}
                                                            />
                                                        </td>

                                                        <td>
                                                            <input
                                                                type="text"
                                                                inputMode="decimal"
                                                                className="form-control form-control-sm text-end"
                                                                value={editForm.amount}
                                                                onChange={(event) => handleEditFormChange('amount', event.target.value)}
                                                            />
                                                        </td>

                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={editForm.description}
                                                                onChange={(event) => handleEditFormChange('description', event.target.value)}
                                                            />
                                                        </td>

                                                        <td>
                                                            <select
                                                                className="form-select form-select-sm"
                                                                value={editForm.personId}
                                                                onChange={(event) => handleEditFormChange('personId', event.target.value)}
                                                            >
                                                                <option value="">Person</option>

                                                                {persons.map(person => (
                                                                    <option key={person.personId} value={person.personId}>
                                                                        {person.personName}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>

                                                        <td>
                                                            <select
                                                                className="form-select form-select-sm"
                                                                value={editForm.categoryId}
                                                                onChange={(event) => handleEditCategoryChange(event.target.value)}
                                                            >
                                                                <option value="">Kategorie</option>

                                                                {categories.map(category => (
                                                                    <option key={category.categoryId} value={category.categoryId}>
                                                                        {category.categoryName}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>

                                                        <td>
                                                            <select
                                                                className="form-select form-select-sm"
                                                                value={editForm.subcategoryId}
                                                                onChange={(event) => handleEditFormChange('subcategoryId', event.target.value)}
                                                                disabled={!editForm.categoryId}
                                                            >
                                                                <option value="">Subkategorie</option>

                                                                {editSubcategories.map(subcategory => (
                                                                    <option key={subcategory.id} value={subcategory.id}>
                                                                        {subcategory.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>

                                                        <td>
                                                            <input
                                                                type="text"
                                                                className="form-control form-control-sm"
                                                                value={editForm.note}
                                                                onChange={(event) => handleEditFormChange('note', event.target.value)}
                                                            />
                                                        </td>

                                                        <td>
                                                            <div className="d-flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-primary"
                                                                    onClick={handleSaveEdit}
                                                                >
                                                                    Speichern
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-secondary"
                                                                    onClick={handleCancelEdit}
                                                                >
                                                                    Abbrechen
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td>{entry.date}</td>
                                                        <td className="text-end">
                                                            {formatAmount(entry.amount)} €
                                                        </td>
                                                        <td>{entry.description}</td>
                                                        <td>{entry.personName}</td>
                                                        <td>{entry.categoryName}</td>
                                                        <td>{entry.subcategoryName}</td>
                                                        <td>{entry.note || '-'}</td>
                                                        <td>
                                                            <div className="d-flex gap-2">
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-dark"
                                                                    onClick={() => handleStartEdit(entry)}
                                                                >
                                                                    Bearbeiten
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => handleDeleteEntry(entry.id)}
                                                                >
                                                                    Löschen
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EntriesPage