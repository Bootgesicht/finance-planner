import { useEffect, useState } from 'react'
import { getPersons } from '../api/personApi'
import { getCategories } from '../api/categoryApi'
import { getSubcategories } from '../api/subcategoryApi'

function ManagementPage() {
    const [persons, setPersons] = useState([])
    const [categories, setCategories] = useState([])
    const [subcategories, setSubcategories] = useState([])

    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
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
    }, [])

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

                            <div className="table-responsive">
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