import { useEffect, useState } from 'react'
import { getPersons, createPerson } from '../api/personApi'
import {
    archiveCategory,
    createCategory,
    deleteCategory,
    getCategories,
    getCategoryDeletionImpact,
    reactivateCategory,
    renameCategory
} from '../api/categoryApi'
import {
    archiveSubcategory,
    createSubcategory,
    deleteSubcategory,
    getSubcategories,
    getSubcategoryDeletionImpact,
    reactivateSubcategory,
    renameSubcategory
} from '../api/subcategoryApi'
import './ManagementPage.css'

const CATEGORY_KIND_LABELS = {
    EXPENSE: 'Ausgabe',
    INCOME: 'Einnahme',
    SAVING: 'Sparen / Investieren'
}

function ManagementPage() {
    const [persons, setPersons] = useState([])
    const [categories, setCategories] = useState([])
    const [subcategories, setSubcategories] = useState([])
    const [newCategoryName, setNewCategoryName] = useState('')
    const [newCategoryKind, setNewCategoryKind] = useState('EXPENSE')
    const [newSubcategoryName, setNewSubcategoryName] = useState('')
    const [newSubcategoryCategoryId, setNewSubcategoryCategoryId] = useState('')
    const [newPersonName, setNewPersonName] = useState('')
    const [newPersonRole, setNewPersonRole] = useState('ADULT')
    const [showArchived, setShowArchived] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [renameDialog, setRenameDialog] = useState(null)
    const [deleteDialog, setDeleteDialog] = useState(null)

    function loadMasterData() {
        return Promise.all([
            getPersons(),
            getCategories(true),
            getSubcategories(true)
        ])
            .then(([personsData, categoriesData, subcategoriesData]) => {
                setPersons(personsData)
                setCategories(categoriesData)
                setSubcategories(subcategoriesData)
            })
            .catch(error => {
                console.error('Error loading management data:', error)
                setErrorMessage('Stammdaten konnten nicht geladen werden.')
            })
    }

    useEffect(() => {
        loadMasterData()
    }, [])

    function showError(error, fallback) {
        console.error(fallback, error)
        setSuccessMessage('')
        setErrorMessage(error.message || fallback)
    }

    function handleCreateCategory(event) {
        event.preventDefault()
        setErrorMessage('')
        setSuccessMessage('')

        if (!newCategoryName.trim()) {
            setErrorMessage('Bitte einen Kategorienamen eingeben.')
            return
        }

        const category = { name: newCategoryName.trim(), kind: newCategoryKind }
        createCategory(category)
            .then(() => {
                setSuccessMessage(`Kategorie "${category.name}" wurde erstellt.`)
                setNewCategoryName('')
                setNewCategoryKind('EXPENSE')
                return loadMasterData()
            })
            .catch(error => showError(error, 'Kategorie konnte nicht erstellt werden.'))
    }

    function handleCreatePerson(event) {
        event.preventDefault()
        setErrorMessage('')
        setSuccessMessage('')

        if (!newPersonName.trim()) {
            setErrorMessage('Bitte einen Personennamen eingeben.')
            return
        }

        const person = { name: newPersonName.trim(), role: newPersonRole }
        createPerson(person)
            .then(() => {
                setSuccessMessage(`Person "${person.name}" wurde erstellt.`)
                setNewPersonName('')
                setNewPersonRole('ADULT')
                return loadMasterData()
            })
            .catch(error => showError(error, 'Person konnte nicht erstellt werden.'))
    }

    function handleCreateSubcategory(event) {
        event.preventDefault()
        setErrorMessage('')
        setSuccessMessage('')

        if (!newSubcategoryName.trim()) {
            setErrorMessage('Bitte einen Namen für die Subkategorie eingeben.')
            return
        }
        if (!newSubcategoryCategoryId) {
            setErrorMessage('Bitte eine Kategorie für die Subkategorie auswählen.')
            return
        }

        const subcategory = {
            name: newSubcategoryName.trim(),
            categoryId: Number(newSubcategoryCategoryId)
        }
        createSubcategory(subcategory)
            .then(() => {
                setSuccessMessage(`Subkategorie "${subcategory.name}" wurde erstellt.`)
                setNewSubcategoryName('')
                setNewSubcategoryCategoryId('')
                return loadMasterData()
            })
            .catch(error => showError(error, 'Subkategorie konnte nicht erstellt werden.'))
    }

    function getCategoryNameById(categoryId) {
        return categories.find(category => String(category.categoryId) === String(categoryId))
            ?.categoryName || `Kategorie ${categoryId}`
    }

    function getItemName(type, item) {
        return type === 'category' ? item.categoryName : item.name
    }

    function getItemId(type, item) {
        return type === 'category' ? item.categoryId : item.id
    }

    function openRenameDialog(type, item) {
        setRenameDialog({ type, item, name: getItemName(type, item), saving: false, error: '' })
    }

    function handleRename(event) {
        event.preventDefault()
        const name = renameDialog.name.trim()
        if (!name) {
            setRenameDialog(current => ({ ...current, error: 'Bitte einen Namen eingeben.' }))
            return
        }

        setRenameDialog(current => ({ ...current, saving: true }))
        const id = getItemId(renameDialog.type, renameDialog.item)
        const action = renameDialog.type === 'category'
            ? renameCategory(id, name)
            : renameSubcategory(id, name)

        action
            .then(() => {
                setRenameDialog(null)
                setErrorMessage('')
                setSuccessMessage(`"${name}" wurde gespeichert.`)
                return loadMasterData()
            })
            .catch(error => {
                setRenameDialog(current => ({
                    ...current,
                    saving: false,
                    error: error.message || 'Name konnte nicht gespeichert werden.'
                }))
            })
    }

    function handleArchiveState(type, item, archived) {
        const id = getItemId(type, item)
        const action = type === 'category'
            ? (archived ? archiveCategory(id) : reactivateCategory(id))
            : (archived ? archiveSubcategory(id) : reactivateSubcategory(id))

        setErrorMessage('')
        action
            .then(() => {
                const verb = archived ? 'archiviert' : 'reaktiviert'
                setSuccessMessage(`"${getItemName(type, item)}" wurde ${verb}.`)
                return loadMasterData()
            })
            .catch(error => showError(error, 'Status konnte nicht geändert werden.'))
    }

    function openDeleteDialog(type, item) {
        setDeleteDialog({ type, item, impact: null, loading: true, deleting: false, error: '' })
        const id = getItemId(type, item)
        const request = type === 'category'
            ? getCategoryDeletionImpact(id)
            : getSubcategoryDeletionImpact(id)

        request
            .then(impact => setDeleteDialog(current => (
                current ? { ...current, impact, loading: false } : current
            )))
            .catch(error => setDeleteDialog(current => (
                current ? { ...current, loading: false, error: error.message } : current
            )))
    }

    function handleDelete() {
        const { type, item } = deleteDialog
        const id = getItemId(type, item)
        const action = type === 'category' ? deleteCategory(id) : deleteSubcategory(id)

        setDeleteDialog(current => ({ ...current, deleting: true, error: '' }))
        action
            .then(() => {
                setDeleteDialog(null)
                setErrorMessage('')
                setSuccessMessage(`"${getItemName(type, item)}" wurde endgültig gelöscht.`)
                return loadMasterData()
            })
            .catch(error => setDeleteDialog(current => (
                current ? { ...current, deleting: false, error: error.message } : current
            )))
    }

    function handleArchiveFromDeleteDialog() {
        const { type, item } = deleteDialog
        const name = getItemName(type, item)
        const id = getItemId(type, item)
        const action = type === 'category' ? archiveCategory(id) : archiveSubcategory(id)

        setDeleteDialog(current => ({ ...current, deleting: true, error: '' }))
        action
            .then(() => {
                setDeleteDialog(null)
                setErrorMessage('')
                setSuccessMessage(`"${name}" wurde stattdessen sicher archiviert.`)
                return loadMasterData()
            })
            .catch(error => setDeleteDialog(current => (
                current ? { ...current, deleting: false, error: error.message } : current
            )))
    }

    const visibleCategories = categories.filter(category => showArchived || !category.archived)
    const visibleSubcategories = subcategories.filter(subcategory => showArchived || !subcategory.archived)
    const activeCategories = categories.filter(category => !category.archived)

    return (
        <div className="container mt-4 pb-5 management-page">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
                <div>
                    <h1>Verwaltung</h1>
                    <p className="text-muted">
                        Personen sowie aktive und historische Kategorien zentral verwalten.
                    </p>
                </div>
                <div className="form-check form-switch mb-md-1">
                    <input
                        id="show-archived"
                        className="form-check-input"
                        type="checkbox"
                        checked={showArchived}
                        onChange={(event) => setShowArchived(event.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="show-archived">
                        Archivierte anzeigen
                    </label>
                </div>
            </div>

            {errorMessage && <div className="alert alert-danger mt-3" role="alert">{errorMessage}</div>}
            {successMessage && <div className="alert alert-success mt-3" role="alert">{successMessage}</div>}

            <section className="card mt-4" aria-labelledby="persons-heading">
                <div className="card-body">
                    <h2 id="persons-heading" className="h4 mb-3">Personen</h2>
                    <form className="row g-2 align-items-end mb-4" onSubmit={handleCreatePerson}>
                        <div className="col-12 col-md-5">
                            <label className="form-label" htmlFor="new-person-name">Neue Person</label>
                            <input
                                id="new-person-name"
                                type="text"
                                className="form-control"
                                value={newPersonName}
                                onChange={(event) => setNewPersonName(event.target.value)}
                                placeholder="z. B. Familie"
                            />
                        </div>
                        <div className="col-12 col-md-4">
                            <label className="form-label" htmlFor="new-person-role">Rolle</label>
                            <select
                                id="new-person-role"
                                className="form-select"
                                value={newPersonRole}
                                onChange={(event) => setNewPersonRole(event.target.value)}
                            >
                                <option value="ADULT">Erwachsen</option>
                                <option value="CHILD">Kind</option>
                                <option value="HOUSEHOLD">Haushalt / Familie</option>
                            </select>
                        </div>
                        <div className="col-12 col-md-3">
                            <button type="submit" className="btn btn-primary w-100">Person erstellen</button>
                        </div>
                    </form>
                    <div className="table-responsive">
                        <table className="table table-sm align-middle mb-0">
                            <thead><tr><th>Name</th><th>Rolle</th></tr></thead>
                            <tbody>
                                {persons.map(person => (
                                    <tr key={person.personId}>
                                        <td>{person.personName}</td>
                                        <td>{person.personRole}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="card mt-4" aria-labelledby="categories-heading">
                <div className="card-body">
                    <h2 id="categories-heading" className="h4 mb-3">Kategorien</h2>
                    <form className="row g-2 align-items-end mb-4" onSubmit={handleCreateCategory}>
                        <div className="col-12 col-md-5">
                            <label className="form-label" htmlFor="new-category-name">Neue Kategorie</label>
                            <input
                                id="new-category-name"
                                type="text"
                                className="form-control"
                                value={newCategoryName}
                                onChange={(event) => setNewCategoryName(event.target.value)}
                                placeholder="z. B. Arbeit"
                            />
                        </div>
                        <div className="col-12 col-md-4">
                            <label className="form-label" htmlFor="new-category-kind">Art</label>
                            <select
                                id="new-category-kind"
                                className="form-select"
                                value={newCategoryKind}
                                onChange={(event) => setNewCategoryKind(event.target.value)}
                            >
                                {Object.entries(CATEGORY_KIND_LABELS).map(([kind, label]) => (
                                    <option key={kind} value={kind}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12 col-md-3">
                            <button type="submit" className="btn btn-primary w-100">Kategorie erstellen</button>
                        </div>
                    </form>
                    <div className="table-responsive">
                        <table className="table align-middle mb-0 management-table">
                            <thead><tr><th>Name</th><th>Art</th><th>Status</th><th>Aktionen</th></tr></thead>
                            <tbody>
                                {visibleCategories.map(category => (
                                    <tr key={category.categoryId}>
                                        <td>{category.categoryName}</td>
                                        <td>{CATEGORY_KIND_LABELS[category.categoryKind] || category.categoryKind}</td>
                                        <td>
                                            <span className={`badge ${category.archived ? 'text-bg-secondary' : 'text-bg-success'}`}>
                                                {category.archived ? 'Archiviert' : 'Aktiv'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="d-flex flex-wrap gap-2">
                                                <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => openRenameDialog('category', category)}>Bearbeiten</button>
                                                <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => handleArchiveState('category', category, !category.archived)}>
                                                    {category.archived ? 'Reaktivieren' : 'Archivieren'}
                                                </button>
                                                <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => openDeleteDialog('category', category)}>Löschen</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="card mt-4" aria-labelledby="subcategories-heading">
                <div className="card-body">
                    <h2 id="subcategories-heading" className="h4 mb-3">Subkategorien</h2>
                    <form className="row g-2 align-items-end mb-4" onSubmit={handleCreateSubcategory}>
                        <div className="col-12 col-md-5">
                            <label className="form-label" htmlFor="new-subcategory-name">Neue Subkategorie</label>
                            <input
                                id="new-subcategory-name"
                                type="text"
                                className="form-control"
                                value={newSubcategoryName}
                                onChange={(event) => setNewSubcategoryName(event.target.value)}
                                placeholder="z. B. ETF-Sparplan"
                            />
                        </div>
                        <div className="col-12 col-md-4">
                            <label className="form-label" htmlFor="new-subcategory-category">Kategorie</label>
                            <select
                                id="new-subcategory-category"
                                className="form-select"
                                value={newSubcategoryCategoryId}
                                onChange={(event) => setNewSubcategoryCategoryId(event.target.value)}
                            >
                                <option value="">Kategorie auswählen</option>
                                {activeCategories.map(category => (
                                    <option key={category.categoryId} value={category.categoryId}>
                                        {category.categoryName} ({CATEGORY_KIND_LABELS[category.categoryKind]})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-12 col-md-3">
                            <button type="submit" className="btn btn-primary w-100">Subkategorie erstellen</button>
                        </div>
                    </form>
                    <div className="table-responsive management-subcategory-table">
                        <table className="table align-middle mb-0 management-table">
                            <thead><tr><th>Kategorie</th><th>Subkategorie</th><th>Status</th><th>Aktionen</th></tr></thead>
                            <tbody>
                                {visibleSubcategories.map(subcategory => {
                                    const parent = categories.find(category => category.categoryId === subcategory.categoryId)
                                    return (
                                        <tr key={subcategory.id}>
                                            <td>{getCategoryNameById(subcategory.categoryId)}</td>
                                            <td>{subcategory.name}</td>
                                            <td>
                                                {subcategory.archived ? (
                                                    <span className="badge text-bg-secondary">Archiviert</span>
                                                ) : parent?.archived ? (
                                                    <span className="badge text-bg-warning">Kategorie archiviert</span>
                                                ) : (
                                                    <span className="badge text-bg-success">Aktiv</span>
                                                )}
                                            </td>
                                            <td>
                                                <div className="d-flex flex-wrap gap-2">
                                                    <button className="btn btn-sm btn-outline-primary" type="button" onClick={() => openRenameDialog('subcategory', subcategory)}>Bearbeiten</button>
                                                    <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => handleArchiveState('subcategory', subcategory, !subcategory.archived)}>
                                                        {subcategory.archived ? 'Reaktivieren' : 'Archivieren'}
                                                    </button>
                                                    <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => openDeleteDialog('subcategory', subcategory)}>Löschen</button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {renameDialog && (
                <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="rename-dialog-title">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <form onSubmit={handleRename}>
                                <div className="modal-header">
                                    <h2 className="modal-title fs-5" id="rename-dialog-title">
                                        {renameDialog.type === 'category' ? 'Kategorie' : 'Subkategorie'} umbenennen
                                    </h2>
                                    <button type="button" className="btn-close" aria-label="Schließen" onClick={() => setRenameDialog(null)} />
                                </div>
                                <div className="modal-body">
                                    <label className="form-label" htmlFor="rename-value">Neuer Name</label>
                                    <input
                                        id="rename-value"
                                        className="form-control"
                                        value={renameDialog.name}
                                        onChange={(event) => setRenameDialog(current => ({ ...current, name: event.target.value }))}
                                        autoFocus
                                    />
                                    {renameDialog.error && (
                                        <div className="alert alert-danger mt-3 mb-0" role="alert">
                                            {renameDialog.error}
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setRenameDialog(null)}>Abbrechen</button>
                                    <button type="submit" className="btn btn-primary" disabled={renameDialog.saving}>Speichern</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {deleteDialog && (
                <div className="modal d-block" tabIndex="-1" role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2 className="modal-title fs-5" id="delete-dialog-title">Endgültig löschen?</h2>
                                <button type="button" className="btn-close" aria-label="Schließen" onClick={() => setDeleteDialog(null)} />
                            </div>
                            <div className="modal-body">
                                <p className="mb-3">
                                    {deleteDialog.type === 'category' ? 'Kategorie' : 'Subkategorie'} <strong>„{getItemName(deleteDialog.type, deleteDialog.item)}“</strong> endgültig löschen?
                                </p>
                                {deleteDialog.loading && <p className="text-muted mb-0">Abhängigkeiten werden geprüft …</p>}
                                {deleteDialog.impact?.deletable && (
                                    <div className="alert alert-warning mb-0">
                                        Das Element wird von keinem Eintrag verwendet und kann gelöscht werden. Dieser Schritt kann nicht rückgängig gemacht werden.
                                    </div>
                                )}
                                {deleteDialog.impact && !deleteDialog.impact.deletable && (
                                    <div className="alert alert-info mb-0">
                                        <p className="mb-2">{deleteDialog.impact.reason}</p>
                                        {deleteDialog.item.archived && (
                                            <p className="mb-0">Ordne zuerst die bestehenden Einträge um und entferne verbleibende Unterstrukturen.</p>
                                        )}
                                    </div>
                                )}
                                {deleteDialog.error && <div className="alert alert-danger mt-3 mb-0">{deleteDialog.error}</div>}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline-secondary" onClick={() => setDeleteDialog(null)}>Abbrechen</button>
                                {deleteDialog.impact && !deleteDialog.impact.deletable && !deleteDialog.item.archived && (
                                    <button type="button" className="btn btn-secondary" disabled={deleteDialog.deleting} onClick={handleArchiveFromDeleteDialog}>Stattdessen archivieren</button>
                                )}
                                {deleteDialog.impact?.deletable && (
                                    <button type="button" className="btn btn-danger" disabled={deleteDialog.deleting} onClick={handleDelete}>Endgültig löschen</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {(renameDialog || deleteDialog) && <div className="modal-backdrop show" />}
        </div>
    )
}

export default ManagementPage
