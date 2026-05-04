import { Link } from 'react-router-dom'

function LandingPage() {
    return (
        <div className="container mt-4">
            <h1>Family Finance Planner</h1>
            <p className="text-muted">
                Track expenses, manage entries and analyze household finances.
            </p>

            <div className="row g-3 mt-3">
                <div className="col-md-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Neue Einträge</h5>
                            <p className="card-text">
                                Erfasse mehrere Ausgaben für einen Tag.
                            </p>
                            <Link to="/entries/new" className="btn btn-primary">
                                Einträge erfassen
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Analytics</h5>
                            <p className="card-text">
                                Analysiere Ausgaben nach Monat, Jahr und Kategorie.
                            </p>
                            <Link to="/analytics" className="btn btn-outline-primary">
                                Analytics öffnen
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="col-md-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title">Verwaltung</h5>
                            <p className="card-text">
                                Personen, Kategorien und Subkategorien verwalten.
                            </p>
                            <Link to="/management" className="btn btn-outline-secondary">
                                Verwaltung
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LandingPage