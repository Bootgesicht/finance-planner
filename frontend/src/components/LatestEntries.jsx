import { useEffect, useState } from 'react'
import { getLatestEntries } from '../api/entryApi'

function LatestEntries() {
    const [latestEntries, setLatestEntries] = useState([])
    const [scope, setScope] = useState('mine')
    const [loading, setLoading] = useState(true)

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
        getLatestEntries(15, scope)
            .then(data => setLatestEntries(data))
            .catch(error => console.error('Error loading latest entries:', error))
            .finally(() => setLoading(false))
    }, [scope])

    function changeScope(nextScope) {
        if (nextScope === scope) return
        setLoading(true)
        setScope(nextScope)
    }

    return (
        <div className="card mt-4">
            <div className="card-body">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <h5 className="card-title mb-0">Letzte Einträge</h5>
                    <div className="btn-group btn-group-sm" role="group" aria-label="Eintragsbereich">
                        <button
                            type="button"
                            className={`btn ${scope === 'mine' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => changeScope('mine')}
                        >
                            Von mir eingetragen
                        </button>
                        <button
                            type="button"
                            className={`btn ${scope === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => changeScope('all')}
                        >
                            Alle
                        </button>
                    </div>
                </div>

                {loading ? (
                    <p className="text-muted">Einträge werden geladen …</p>
                ) : latestEntries.length === 0 ? (
                    <p className="text-muted">
                        {scope === 'mine' ? 'Noch keine eigenen Einträge vorhanden.' : 'Noch keine Einträge vorhanden.'}
                    </p>
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
                                    <th>Eingetragen von</th>
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
                                        <td>{entry.createdByDisplayName || 'Unbekannt'}</td>
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
