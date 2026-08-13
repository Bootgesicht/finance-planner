import { useEffect, useState } from 'react'
import { getPersons } from '../api/personApi'
import { getCategories } from '../api/categoryApi'
import EntryRow from '../components/EntryRow'
import { createEntry } from '../api/entryApi'

function EntryCreatePage() {
    const [persons, setPersons] = useState([])
    const [categories, setCategories] = useState([])
    const [entryRows, setEntryRows] = useState([
        {
            date: '',
            amount: '',
            description: '',
            categoryId: '',
            subcategoryId: '',
            personId: '',
            note: ''
        }
    ])
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

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

    function isRowEmpty(row) {
        return (
            !row.date &&
            !row.amount &&
            !row.description &&
            !row.categoryId &&
            !row.subcategoryId &&
            !row.personId &&
            !row.note
        )
    }

    function addEntryRow() {
        setEntryRows(currentRows => {
            const lastRow = currentRows[currentRows.length - 1]

            return [
                ...currentRows,
                {
                    date: lastRow?.date || '',
                    amount: '',
                    description: '',
                    categoryId: '',
                    subcategoryId: '',
                    personId: lastRow?.personId || '',
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

    function validateEntries(rowsToSave) {
        if (rowsToSave.length === 0) {
            return 'Bitte mindestens einen Eintrag ausfüllen.'
        }

        for (let i = 0; i < rowsToSave.length; i++) {
            const row = rowsToSave[i]
            const rowNumber = i + 1

            if (!row.date) {
                return `Bitte in Zeile ${rowNumber} ein Datum auswählen.`
            }

            if (!row.amount) {
                return `Bitte in Zeile ${rowNumber} einen Betrag eingeben.`
            }

            const parsedAmount = parseAmount(row.amount)

            if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
                return `Bitte in Zeile ${rowNumber} einen gültigen Betrag eingeben.`
            }

            if (!row.description.trim()) {
                return `Bitte in Zeile ${rowNumber} eine Beschreibung eingeben.`
            }

            if (!row.subcategoryId) {
                return `Bitte in Zeile ${rowNumber} eine Subkategorie auswählen.`
            }

            if (!row.personId) {
                return `Bitte in Zeile ${rowNumber} eine Person auswählen.`
            }
        }

        return ''
    }

    function handleSaveAll() {
        setErrorMessage('')
        setSuccessMessage('')

        const rowsToSave = entryRows.filter(row => !isRowEmpty(row))

        const validationError = validateEntries(rowsToSave)

        if (validationError) {
            setErrorMessage(validationError)
            return
        }

        const entries = rowsToSave.map(row => ({
            date: row.date,
            amount: parseAmount(row.amount),
            description: row.description.trim(),
            subcategoryId: Number(row.subcategoryId),
            personId: Number(row.personId),
            note: row.note.trim() || null
        }))

        console.log('Saving entries:', entries)

        Promise.all(entries.map(entry => createEntry(entry)))
            .then(() => {
                console.log('All entries saved')

                const lastRow = rowsToSave[rowsToSave.length - 1]

                setSuccessMessage(`${entries.length} Einträge erfolgreich gespeichert.`)

                setEntryRows([
                    {
                        date: lastRow.date,
                        amount: '',
                        description: '',
                        categoryId: '',
                        subcategoryId: '',
                        personId: lastRow.personId,
                        note: ''
                    }
                ])
            })
            .catch(error => {
                console.error('Error saving entries:', error)
                setErrorMessage('Beim Speichern ist ein Fehler aufgetreten.')
            })
    }

    return (
        <div className="container mt-4">
            <h1>Einträge erfassen</h1>

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
            <div className="card mt-3">
                <div className="card-body">
                    <h5 className="card-title mb-4">Neue Einträge</h5>

                    {entryRows.map((row, index) => (
                        <EntryRow
                            key={index}
                            row={row}
                            index={index}
                            categories={categories}
                            persons={persons}
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
