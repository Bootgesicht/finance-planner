import { useEffect, useState } from 'react'
import { getEntries } from '../api/entryApi'
import { getLatestEntries } from '../api/entryApi'

function LatestEntries() {
    const [latestEntries, setLatestEntries] = useState([])

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

    useEffect(() => {
        getLatestEntries(15)
            .then(data => setLatestEntries(data))
            .catch(error => console.error('Error loading latest entries:', error))
    }, [])

    return (
        <div className="card mt-4">
            <div className="card-body">
                <h5 className="card-title">Letzte Einträge</h5>

                {latestEntries.length === 0 ? (
                    <p className="text-muted">Noch keine Einträge vorhanden.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-sm align-middle">
                            <thead>
                                <tr>
                                    <th>Datum</th>
                                    <th>Beschreibung</th>
                                    <th>Kategorie</th>
                                    <th>Subkategorie</th>
                                    <th>Person</th>
                                    <th className="text-end">Betrag</th>
                                </tr>
                            </thead>
                            <tbody>
                                {latestEntries.map(entry => (
                                    <tr key={entry.id} className={getEntryRowClass(entry.categoryKind)}>
                                        <td>{entry.date}</td>
                                        <td>{entry.description}</td>
                                        <td>{entry.categoryName}</td>
                                        <td>{entry.subcategoryName}</td>
                                        <td>{entry.personName}</td>
                                        <td className="text-end">
                                            {entry.amount.toFixed(2)} €
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}

export default LatestEntries