import { useEffect, useState } from 'react'
import { getPersons } from '../api/personApi'
import { getCategories, createCategory } from '../api/categoryApi'
import { getSubcategories } from '../api/subcategoryApi'

function ManagementPage() {
    const [persons, setPersons] = useState([])
    const [categories, setCategories] = useState([])
    const [subcategories, setSubcategories] = useState([])
    const [newCategoryName, setNewCategoryName] = useState('')
    const [newCategoryKind, setNewCategoryKind] = useState('EXPENSE')
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