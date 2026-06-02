import { useEffect, useState } from 'react'
import { getMonthlyBalance, getCategorySummary } from '../api/analyticsApi'

function AnalyticsPage() {
    const currentYear = new Date().getFullYear()

    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [monthlyBalance, setMonthlyBalance] = useState([])
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [selectedMonth, setSelectedMonth] = useState('')
    const [categorySummary, setCategorySummary] = useState([])

    useEffect(() => {
        loadMonthlyBalance(currentYear)
        loadCategorySummary(currentYear, selectedMonth)
    }, [])

    function loadMonthlyBalance(year) {
        setErrorMessage('')
        setSuccessMessage('')

        getMonthlyBalance(year)
            .then(data => {
                setMonthlyBalance(data)
                setSuccessMessage(`${data.length} Monate für ${year} geladen.`)
            })
            .catch(error => {
                console.error('Error loading monthly balance:', error)
                setErrorMessage('Monatsübersicht konnte nicht geladen werden.')
            })
    }

    function handleSubmit(event) {
        event.preventDefault()
        loadMonthlyBalance(selectedYear)
        loadCategorySummary(selectedYear, selectedMonth)
    }

    function formatAmount(amount) {
        return amount.toLocaleString('de-DE', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }

    function getBalanceClass(value) {
        if (value > 0) {
            return 'text-success fw-semibold'
        }

        if (value < 0) {
            return 'text-danger fw-semibold'
        }

        return ''
    }

    const latestMonthBalance = monthlyBalance.length > 0
        ? monthlyBalance[monthlyBalance.length - 1]
        : null

    function formatMonth(monthString) {
        const [year, month] = monthString.split('-')
        const date = new Date(Number(year), Number(month) - 1)

        return date.toLocaleDateString('de-DE', {
            month: 'long',
            year: 'numeric'
        })
    }

    function loadCategorySummary(year, month) {
        getCategorySummary(year, month, 'EXPENSE')
            .then(data => setCategorySummary(data))
            .catch(error => {
                console.error('Error loading category summary:', error)
                setErrorMessage('Kategorie-Auswertung konnte nicht geladen werden.')
            })
    }



    return (
        <div className="container mt-4 pb-5">
            <div className="mb-4">
                <h1>Analytics</h1>
                <p className="text-muted mb-0">
                    Monatsübersicht für Einkommen, Ausgaben, Sparen und freien Saldo.
                </p>
            </div>

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

            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Analytics-Bereiche</h5>

                    <nav className="nav nav-pills flex-wrap gap-2">
                        <a className="nav-link active" href="#monthly-balance">
                            Monats-Saldo
                        </a>
                        <a className="nav-link" href="#category-summary">
                            Kategorien
                        </a>
                        <a className="nav-link" href="#subcategory-summary">
                            Subkategorien
                        </a>
                        <a className="nav-link" href="#person-summary">
                            Personen
                        </a>
                        <a className="nav-link" href="#savings-summary">
                            Sparen
                        </a>
                        <a className="nav-link" href="#year-comparison">
                            Jahresvergleich
                        </a>
                    </nav>
                </div>
            </div>

            <div className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Zeitraum</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3 align-items-end">
                            <div className="col-12 col-md-3">
                                <label className="form-label">Monat</label>
                                <select
                                    className="form-select"
                                    value={selectedMonth}
                                    onChange={(event) => setSelectedMonth(event.target.value)}
                                >
                                    <option value="">Ganzes Jahr</option>
                                    <option value="1">Januar</option>
                                    <option value="2">Februar</option>
                                    <option value="3">März</option>
                                    <option value="4">April</option>
                                    <option value="5">Mai</option>
                                    <option value="6">Juni</option>
                                    <option value="7">Juli</option>
                                    <option value="8">August</option>
                                    <option value="9">September</option>
                                    <option value="10">Oktober</option>
                                    <option value="11">November</option>
                                    <option value="12">Dezember</option>
                                </select>
                            </div>
                            <div className="col-12 col-md-3">
                                <label className="form-label">Jahr</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={selectedYear}
                                    onChange={(event) => setSelectedYear(event.target.value)}
                                />
                            </div>
                            <div className="col-12 col-md-3">
                                <button type="submit" className="btn btn-primary w-100">
                                    Auswerten
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {latestMonthBalance && (
                <div className="row g-3 mt-4">
                    <div className="col-12">
                        <h5 className="mb-0">
                            Übersicht {formatMonth(latestMonthBalance.month)}
                        </h5>
                    </div>

                    <div className="col-12 col-md-3">
                        <div className="card h-100 border-success">
                            <div className="card-body">
                                <p className="text-muted mb-1">Einkommen</p>
                                <h4 className="text-success mb-0">
                                    {formatAmount(latestMonthBalance.income)} €
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-3">
                        <div className="card h-100 border-danger">
                            <div className="card-body">
                                <p className="text-muted mb-1">Ausgaben</p>
                                <h4 className="text-danger mb-0">
                                    {formatAmount(latestMonthBalance.expenses)} €
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-3">
                        <div className="card h-100 border-info">
                            <div className="card-body">
                                <p className="text-muted mb-1">Sparen</p>
                                <h4 className="text-info mb-0">
                                    {formatAmount(latestMonthBalance.savings)} €
                                </h4>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-3">
                        <div className={`card h-100 ${latestMonthBalance.freeBalanceAfterSavings >= 0 ? 'border-success' : 'border-danger'}`}>
                            <div className="card-body">
                                <p className="text-muted mb-1">Freier Saldo</p>
                                <h4 className={`${getBalanceClass(latestMonthBalance.freeBalanceAfterSavings)} mb-0`}>
                                    {formatAmount(latestMonthBalance.freeBalanceAfterSavings)} €
                                </h4>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <section id="monthly-balance" className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Monats-Saldo</h5>

                    {monthlyBalance.length === 0 ? (
                        <p className="text-muted">Keine Daten für dieses Jahr vorhanden.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-sm align-middle">
                                <thead>
                                    <tr>
                                        <th>Monat</th>
                                        <th className="text-end">Einkommen</th>
                                        <th className="text-end">Ausgaben</th>
                                        <th className="text-end">Sparen</th>
                                        <th className="text-end">Saldo vor Sparen</th>
                                        <th className="text-end">Freier Saldo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {monthlyBalance.map(month => (
                                        <tr key={month.month}>
                                            <td>{formatMonth(month.month)}</td>
                                            <td className="text-end text-success">
                                                {formatAmount(month.income)} €
                                            </td>
                                            <td className="text-end text-danger">
                                                {formatAmount(month.expenses)} €
                                            </td>
                                            <td className="text-end text-info">
                                                {formatAmount(month.savings)} €
                                            </td>
                                            <td className={`text-end ${getBalanceClass(month.balanceBeforeSavings)}`}>
                                                {formatAmount(month.balanceBeforeSavings)} €
                                            </td>
                                            <td className={`text-end ${getBalanceClass(month.freeBalanceAfterSavings)}`}>
                                                {formatAmount(month.freeBalanceAfterSavings)} €
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            <section id="category-summary" className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title mb-2">Ausgaben nach Kategorien</h5>
                    <p className="text-muted">
                        Übersicht der Ausgaben nach Hauptkategorien.
                    </p>

                    {categorySummary.length === 0 ? (
                        <p className="text-muted mb-0">Keine Ausgaben für den gewählten Zeitraum vorhanden.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-sm align-middle">
                                <thead>
                                    <tr>
                                        <th>Kategorie</th>
                                        <th>Art</th>
                                        <th className="text-end">Betrag</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categorySummary.map(category => (
                                        <tr key={category.categoryId}>
                                            <td>{category.categoryName}</td>
                                            <td>{category.categoryKind}</td>
                                            <td className="text-end text-danger">
                                                {formatAmount(category.totalAmount)} €
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            <section id="subcategory-summary" className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title mb-2">Ausgaben nach Subkategorien</h5>
                    <p className="text-muted mb-0">
                        Detailauswertung innerhalb einzelner Kategorien.
                    </p>
                </div>
            </section>

            <section id="person-summary" className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title mb-2">Ausgaben nach Personen</h5>
                    <p className="text-muted mb-0">
                        Zeigt später die fachliche Zuordnung der Ausgaben.
                    </p>
                </div>
            </section>

            <section id="savings-summary" className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title mb-2">Sparen & Investieren</h5>
                    <p className="text-muted mb-0">
                        Übersicht über Sparraten und Investments.
                    </p>
                </div>
            </section>

            <section id="year-comparison" className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title mb-2">Jahresvergleich</h5>
                    <p className="text-muted mb-0">
                        Vergleich von Monaten über mehrere Jahre.
                    </p>
                </div>
            </section>
        </div>
    )
}

export default AnalyticsPage