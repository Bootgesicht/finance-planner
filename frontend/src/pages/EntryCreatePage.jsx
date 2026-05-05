import { useEffect, useState } from 'react'
import { getPersons } from '../api/personApi'
import { getCategories } from '../api/categoryApi'
import { getSubcategoriesByCategoryId } from '../api/subcategoryApi'

function EntryCreatePage() {
    const [persons, setPersons] = useState([])
    const [categories, setCategories] = useState([])
    const [subcategories, setSubcategories] = useState([])
    const [selectedCategoryId, setSelectedCategoryId] = useState('')
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('')

    useEffect(() => {
        getPersons()
            .then(data => setPersons(data))
            .catch(error => console.error('Error loading persons:', error))

        getCategories()
            .then(data => setCategories(data))
            .catch(error => console.error('Error loading categories:', error))
    }, [])

    function handleCategoryChange(event) {
        const categoryId = event.target.value

        setSelectedCategoryId(categoryId)
        setSelectedSubcategoryId('')
        setSubcategories([])

        if (categoryId) {
            getSubcategoriesByCategoryId(categoryId)
                .then(data => setSubcategories(data))
                .catch(error => console.error('Error loading subcategories:', error))
        }
    }

    return (
        <div className="row g-3 mt-3">
            <div className="col-12 col-md-4">
                <label className="form-label">Standard-Person</label>
                <select className="form-select">
                    <option value="">Person auswählen</option>

                    {persons.map(person => (
                        <option key={person.personId} value={person.personId}>
                            {person.personName}
                        </option>
                    ))}
                </select>
            </div>

            <div className="col-12 col-md-4">
                <label className="form-label">Kategorie</label>
                <select
                    className="form-select"
                    value={selectedCategoryId}
                    onChange={handleCategoryChange}
                >
                    <option value="">Kategorie auswählen</option>

                    {categories.map(category => (
                        <option key={category.categoryId} value={category.categoryId}>
                            {category.categoryName}
                        </option>
                    ))}
                </select>
            </div>

            <div className="col-12 col-md-4">
                <label className="form-label">Subcategory</label>
                <select
                    className="form-select"
                    value={selectedSubcategoryId}
                    onChange={(event) => setSelectedSubcategoryId(event.target.value)}
                    disabled={!selectedCategoryId}
                >
                    <option value="">Subcategory auswählen</option>

                    {subcategories.map(subcategory => (
                        <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    )
}

export default EntryCreatePage