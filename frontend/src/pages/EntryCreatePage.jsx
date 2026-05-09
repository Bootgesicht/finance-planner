import { useEffect, useState } from 'react'
import { getPersons } from '../api/personApi'
import { createEntry } from '../api/entryApi'
import { getCategories } from '../api/categoryApi'
import { getSubcategoriesByCategoryId } from '../api/subcategoryApi'

function EntryCreatePage() {
    const [persons, setPersons] = useState([])
    const [categories, setCategories] = useState([])
    const [subcategories, setSubcategories] = useState([])

    const [selectedPersonId, setSelectedPersonId] = useState('')
    const [selectedCategoryId, setSelectedCategoryId] = useState('')
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('')

    const [entryDate, setEntryDate] = useState('')
    const [amount, setAmount] = useState('')
    const [description, setDescription] = useState('')
    const [note, setNote] = useState('')

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

    function handleSave() {
        const entry = {
            date: entryDate,
            amount: Number(amount),
            description: description,
            subcategoryId: Number(selectedSubcategoryId),
            personId: Number(selectedPersonId),
            note: note || null
        }

        console.log('Saving entry:', entry)

        createEntry(entry)
            .then(() => {
                console.log('Entry saved')

                setAmount('')
                setDescription('')
                setNote('')
            })
            .catch(error => console.error('Error saving entry:', error))
    }

    return (
        <div className="container mt-4">
            <h1>Einträge erfassen</h1>

            <div className="row g-3 mt-3">
                <div className="col-12 col-md-3">
                    <label className="form-label">Datum</label>
                    <input
                        type="date"
                        className="form-control"
                        value={entryDate}
                        onChange={(event) => setEntryDate(event.target.value)}
                    />
                </div>

                <div className="col-12 col-md-3">
                    <label className="form-label">Standard-Person</label>
                    <select
                        className="form-select"
                        value={selectedPersonId}
                        onChange={(event) => setSelectedPersonId(event.target.value)}
                    >
                        <option value="">Person auswählen</option>

                        {persons.map(person => (
                            <option key={person.personId} value={person.personId}>
                                {person.personName}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="col-12 col-md-3">
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

                <div className="col-12 col-md-3">
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

            <div className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title">Neuer Eintrag</h5>

                    <div className="row g-3">
                        <div className="col-12 col-md-2">
                            <label className="form-label">Betrag</label>
                            <input
                                type="number"
                                step="0.01"
                                className="form-control"
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                            />
                        </div>

                        <div className="col-12 col-md-4">
                            <label className="form-label">Beschreibung</label>
                            <input
                                type="text"
                                className="form-control"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                            />
                        </div>

                        <div className="col-12 col-md-4">
                            <label className="form-label">Notiz</label>
                            <input
                                type="text"
                                className="form-control"
                                value={note}
                                onChange={(event) => setNote(event.target.value)}
                            />
                        </div>

                        <div className="col-12 col-md-2 d-flex align-items-end">
                            <button
                                className="btn btn-primary w-100"
                                onClick={handleSave}
                            >
                                Speichern
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EntryCreatePage