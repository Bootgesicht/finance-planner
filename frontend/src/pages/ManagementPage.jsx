import { useEffect, useState } from 'react'
import { getPersons, createPerson } from '../api/personApi'
import { getCategories, createCategory } from '../api/categoryApi'
import { getSubcategories, createSubcategory } from '../api/subcategoryApi'

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
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    function loadMasterData() {
        Promise.all([
            getPersons(),
            getCategories(),
            getSubcategories()
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

    function handleCreateCategory(event) {
        event.preventDefault()

        setErrorMessage('')
        setSuccessMessage('')

        if (!newCategoryName.trim()) {
            setErrorMessage('Bitte einen Kategorienamen eingeben.')
            return
        }

        const category = {
            name: newCategoryName.trim(),
            kind: newCategoryKind
        }

        createCategory(category)
            .then(() => {
                setSuccessMessage(`Kategorie "${category.name}" wurde erstellt.`)
                setNewCategoryName('')
                setNewCategoryKind('EXPENSE')
                loadMasterData()
            })
            .catch(error => {
                console.error('Error creating category:', error)
                setErrorMessage('Kategorie konnte nicht erstellt werden.')
            })
    }

    function handleCreatePerson(event) {
        event.preventDefault()

        setErrorMessage('')
        setSuccessMessage('')

        if (!newPersonName.trim()) {
            setErrorMessage('Bitte einen Personennamen eingeben.')
            return
        }

        const person = {
            name: newPersonName.trim(),
            role: newPersonRole
        }

        createPerson(person)
            .then(() => {
                setSuccessMessage(`Person "${person.name}" wurde erstellt.`)
                setNewPersonName('')
                setNewPersonRole('ADULT')
                loadMasterData()
            })
            .catch(error => {
                console.error('Error creating person:', error)
                setErrorMessage('Person konnte nicht erstellt werden.')
            })
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
                loadMasterData()
            })
            .catch(error => {
                console.error('Error creating subcategory:', error)
                setErrorMessage('Subkategorie konnte nicht erstellt werden.')
            })
    }

    function getCategoryNameById(categoryId) {
        const category = categories.find(
            category => String(category.categoryId) === String(categoryId)
        )

        return category ? category.categoryName : `Kategorie ${categoryId}`
    }

    return (
        <div className="container mt-4 pb-5">
            <h1>Verwaltung</h1>
            <p className="text-muted">
                Übersicht der Stammdaten für Personen, Kategorien und Subkategorien.
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

            <div className="row g-4 mt-2">
                <div className="col-12 col-lg-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Personen</h5>
                            <form className="mb-3" onSubmit={handleCreatePerson}>
                                <div className="mb-2">
                                    <label className="form-label">Neue Person</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newPersonName}
                                        onChange={(event) => setNewPersonName(event.target.value)}
                                        placeholder="z. B. Familie"
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="form-label">Rolle</label>
                                    <select
                                        className="form-select"
                                        value={newPersonRole}
                                        onChange={(event) => setNewPersonRole(event.target.value)}
                                    >
                                        <option value="ADULT">Erwachsen</option>
                                        <option value="CHILD">Kind</option>
                                        <option value="HOUSEHOLD">Haushalt / Familie</option>
                                    </select>
                                </div>

                                <button type="submit" className="btn btn-primary w-100">
                                    Person erstellen
                                </button>
                            </form>
                            <div className="table-responsive">
                                <table className="table table-sm align-middle">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Rolle</th>
                                        </tr>
                                    </thead>
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
                    </div>
                </div>

                <div className="col-12 col-lg-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Kategorien</h5>
                            <form className="mb-3" onSubmit={handleCreateCategory}>
                                <div className="mb-2">
                                    <label className="form-label">Neue Kategorie</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newCategoryName}
                                        onChange={(event) => setNewCategoryName(event.target.value)}
                                        placeholder="z. B. Arbeit"
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="form-label">Art</label>
                                    <select
                                        className="form-select"
                                        value={newCategoryKind}
                                        onChange={(event) => setNewCategoryKind(event.target.value)}
                                    >
                                        <option value="EXPENSE">Ausgabe</option>
                                        <option value="INCOME">Einnahme</option>
                                        <option value="SAVING">Sparen / Investieren</option>
                                    </select>
                                </div>

                                <button type="submit" className="btn btn-primary w-100">
                                    Kategorie erstellen
                                </button>
                            </form>

                            <div className="table-responsive">
                                <table className="table table-sm align-middle">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Art</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map(category => (
                                            <tr key={category.categoryId}>
                                                <td>{category.categoryName}</td>
                                                <td>{category.categoryKind}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Subkategorien</h5>
                            <form className="mb-3" onSubmit={handleCreateSubcategory}>
                                <div className="mb-2">
                                    <label className="form-label">Neue Subkategorie</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newSubcategoryName}
                                        onChange={(event) => setNewSubcategoryName(event.target.value)}
                                        placeholder="z. B. ETF-Sparplan"
                                    />
                                </div>

                                <div className="mb-2">
                                    <label className="form-label">Kategorie</label>
                                    <select
                                        className="form-select"
                                        value={newSubcategoryCategoryId}
                                        onChange={(event) => setNewSubcategoryCategoryId(event.target.value)}
                                    >
                                        <option value="">Kategorie auswählen</option>

                                        {categories.map(category => (
                                            <option key={category.categoryId} value={category.categoryId}>
                                                {category.categoryName} ({category.categoryKind})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <button type="submit" className="btn btn-primary w-100">
                                    Subkategorie erstellen
                                </button>
                            </form>
                            <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <table className="table table-sm align-middle">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Kategorie</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subcategories.map(subcategory => (
                                            <tr key={subcategory.id}>
                                                <td>{subcategory.name}</td>
                                                <td>{getCategoryNameById(subcategory.categoryId)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ManagementPage