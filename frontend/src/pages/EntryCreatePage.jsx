import { useEffect, useState } from 'react'
import { getPersons } from '../api/personApi'
import { getCategories } from '../api/categoryApi'
import EntryRow from '../components/EntryRow'
import { createEntry } from '../api/entryApi'

function EntryCreatePage() {
    const [persons, setPersons] = useState([])
    const [categories, setCategories] = useState([])

    const [selectedPersonId, setSelectedPersonId] = useState('')
    const [entryDate, setEntryDate] = useState('')

    const [entryRows, setEntryRows] = useState([
        {
            date: '',
            amount: '',
            description: '',
            categoryId: '',
            subcategoryId: '',
            note: ''
        }
    ])

    useEffect(() => {
        getPersons()
            .then(data => setPersons(data))
            .catch(error => console.error('Error loading persons:', error))

        getCategories()
            .then(data => setCategories(data))
            .catch(error => console.error('Error loading categories:', error))
    }, [])

    function handleRowChange(index, field, value) {
        setEntryRows(currentRows =>
            currentRows.map((row, rowIndex) =>
                rowIndex === index
                    ? { ...row, [field]: value }
                    : row
            )
        )
    }

    function addEntryRow() {
        setEntryRows(currentRows => {
            const lastRow = currentRows[currentRows.length - 1]

            return [
                ...currentRows,
                {
                    date: lastRow?.date || entryDate,
                    amount: '',
                    description: '',
                    categoryId: '',
                    subcategoryId: '',
                    note: ''
                }
            ]
        })
    }

    function removeEntryRow(index) {
        setEntryRows(currentRows =>
            currentRows.filter((_, rowIndex) => rowIndex !== index)
        )
    }

    function parseAmount(value) {
        return Number(String(value).replace(',', '.'))
    }

    function handleSaveAll() {
        const entries = entryRows.map(row => ({
            date: row.date,
            amount: parseAmount(row.amount),
            description: row.description,
            subcategoryId: Number(row.subcategoryId),
            personId: Number(selectedPersonId),
            note: row.note || null
        }))

        console.log('Saving entries:', entries)

        Promise.all(entries.map(entry => createEntry(entry)))
            .then(() => {
                console.log('All entries saved')

                setEntryRows([
                    {
                        date: entryDate,
                        amount: '',
                        description: '',
                        categoryId: '',
                        subcategoryId: '',
                        note: ''
                    }
                ])
            })
            .catch(error => console.error('Error saving entries:', error))
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
                        onChange={(event) => {
                            const newDate = event.target.value
                            setEntryDate(newDate)

                            setEntryRows(currentRows =>
                                currentRows.map((row, index) =>
                                    index === 0 && !row.date
                                        ? { ...row, date: newDate }
                                        : row
                                )
                            )
                        }}
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
            </div>

            <div className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title">Neue Einträge</h5>

                    {entryRows.map((row, index) => (
                        <EntryRow
                            key={index}
                            row={row}
                            index={index}
                            categories={categories}
                            onChange={handleRowChange}
                            onRemove={removeEntryRow}
                        />
                    ))}

                    <div className="d-flex gap-2 mt-3">
                        <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={addEntryRow}
                        >
                            + Zeile hinzufügen
                        </button>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSaveAll}
                        >
                            Alle speichern
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EntryCreatePage