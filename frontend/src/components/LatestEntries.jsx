import { useEffect, useState } from 'react'
import { getEntries } from '../api/entryApi'

function LatestEntries() {
    const [latestEntries, setLatestEntries] = useState([])

    useEffect(() => {
        getEntries()
            .then(data => {
                const sortedEntries = [...data]
                    .sort((a, b) => {
                        if (a.date !== b.date) {
                            return b.date.localeCompare(a.date)
                        }

                        return b.id - a.id
                    })
                    .slice(0, 15)

                setLatestEntries(sortedEntries)
            })
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
                                    <th>Betrag</th>
                                    <th>Subkategorie</th>
                                    <th>Person</th>
                                </tr>
                            </thead>
                            <tbody>
                                {latestEntries.map(entry => (
                                    <tr key={entry.id}>
                                        <td>{entry.date}</td>
                                        <td>{entry.description}</td>
                                        <td>{entry.amount.toFixed(2)} €</td>
                                        <td>{entry.subcategoryId}</td>
                                        <td>{entry.personId}</td>
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