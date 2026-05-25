import { useEffect, useState } from 'react'
import { getMonthlyBalance } from '../api/analyticsApi'

function AnalyticsPage() {
    const currentYear = new Date().getFullYear()

    const [selectedYear, setSelectedYear] = useState(currentYear)
    const [monthlyBalance, setMonthlyBalance] = useState([])
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    useEffect(() => {
        loadMonthlyBalance(currentYear)
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

    return (
        <div className="container mt-4 pb-5">
            <h1>Analytics</h1>
            <p className="text-muted">
                Monatsübersicht für Einkommen, Ausgaben, Sparen und freien Saldo.
            </p>

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

            <div className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Zeitraum</h5>

                    <form onSubmit={handleSubmit}>
                        <div className="row g-3 align-items-end">
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

            <div className="card mt-4">
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
                                            <td>{month.month}</td>
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
            </div>
        </div>
    )
}

export default AnalyticsPage