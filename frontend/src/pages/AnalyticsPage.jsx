import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    getAnalyticsOverview,
    getCategorySummary,
    getIncomeSummary,
    getMonthlyBalance,
    getPersonSummary,
    getSavingsSummary,
    getSubcategorySummary
} from '../api/analyticsApi'
import AnalyticsDoughnutChart from '../components/AnalyticsDoughnutChart'
import AnalyticsAverageCards from '../components/AnalyticsAverageCards'

const EMPTY_OVERVIEW = {
    income: 0,
    expenses: 0,
    savings: 0,
    balanceBeforeSavings: 0,
    freeBalanceAfterSavings: 0
}

const EMPTY_SAVINGS = {
    items: [],
    bookedSavings: 0,
    freeSurplus: 0,
    totalAmount: 0
}

function getCurrentYearRange() {
    const year = new Date().getFullYear()
    return { from: `${year}-01-01`, to: `${year}-12-31` }
}

function parseLocalDate(dateString) {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
}

function formatAmount(amount) {
    return Number(amount || 0).toLocaleString('de-DE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })
}

function formatMonth(monthString) {
    const [year, month] = monthString.split('-').map(Number)
    return new Date(year, month - 1, 1).toLocaleDateString('de-DE', {
        month: 'long',
        year: 'numeric'
    })
}

function formatPeriodLabel(from, to) {
    const fromDate = parseLocalDate(from)
    const toDate = parseLocalDate(to)
    const lastDayOfToMonth = new Date(toDate.getFullYear(), toDate.getMonth() + 1, 0).getDate()

    if (fromDate.getDate() === 1 && toDate.getDate() === lastDayOfToMonth) {
        const options = { month: 'long', year: 'numeric' }
        return `${fromDate.toLocaleDateString('de-DE', options)} – ${toDate.toLocaleDateString('de-DE', options)}`
    }

    const options = { day: 'numeric', month: 'long', year: 'numeric' }
    return `${fromDate.toLocaleDateString('de-DE', options)} – ${toDate.toLocaleDateString('de-DE', options)}`
}

function getBalanceClass(value) {
    if (value > 0) return 'text-success fw-semibold'
    if (value < 0) return 'text-danger fw-semibold'
    return ''
}

function BalanceCard({ label, value, color, balance }) {
    const effectiveColor = balance ? (value < 0 ? 'danger' : 'success') : color

    return (
        <div className="col">
            <div className={`card h-100 border-${effectiveColor}`}>
                <div className="card-body">
                    <p className="text-muted mb-1">{label}</p>
                    <h4 className={`${balance ? getBalanceClass(value) : `text-${color}`} mb-0`}>
                        {formatAmount(value)} €
                    </h4>
                </div>
            </div>
        </div>
    )
}

function AnalyticsPage() {
    const [initialRange] = useState(getCurrentYearRange)
    const [fromDate, setFromDate] = useState(initialRange.from)
    const [toDate, setToDate] = useState(initialRange.to)
    const [appliedRange, setAppliedRange] = useState(initialRange)
    const [overview, setOverview] = useState(EMPTY_OVERVIEW)
    const [monthlyBalance, setMonthlyBalance] = useState([])
    const [categorySummary, setCategorySummary] = useState([])
    const [subcategorySummary, setSubcategorySummary] = useState([])
    const [personSummary, setPersonSummary] = useState([])
    const [savingsSummary, setSavingsSummary] = useState(EMPTY_SAVINGS)
    const [incomeCategorySummary, setIncomeCategorySummary] = useState([])
    const [incomePersonSummary, setIncomePersonSummary] = useState([])
    const [incomeMode, setIncomeMode] = useState('category')
    const [errorMessage, setErrorMessage] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const loadAnalytics = useCallback(async (from, to) => {
        setLoading(true)
        setErrorMessage('')
        setSuccessMessage('')

        try {
            const [
                overviewData,
                monthlyData,
                categoryData,
                subcategoryData,
                personData,
                savingsData,
                incomeCategoryData,
                incomePersonData
            ] =
                await Promise.all([
                    getAnalyticsOverview(from, to),
                    getMonthlyBalance(from, to),
                    getCategorySummary(from, to, 'EXPENSE'),
                    getSubcategorySummary(from, to, 'EXPENSE'),
                    getPersonSummary(from, to),
                    getSavingsSummary(from, to),
                    getIncomeSummary(from, to, 'category'),
                    getIncomeSummary(from, to, 'person')
                ])

            setOverview({ ...EMPTY_OVERVIEW, ...overviewData })
            setMonthlyBalance(Array.isArray(monthlyData) ? monthlyData : [])
            setCategorySummary(Array.isArray(categoryData) ? categoryData : [])
            setSubcategorySummary(Array.isArray(subcategoryData) ? subcategoryData : [])
            setPersonSummary(Array.isArray(personData) ? personData : [])
            setSavingsSummary({ ...EMPTY_SAVINGS, ...savingsData })
            setIncomeCategorySummary(Array.isArray(incomeCategoryData?.items) ? incomeCategoryData.items : [])
            setIncomePersonSummary(Array.isArray(incomePersonData?.items) ? incomePersonData.items : [])
            setAppliedRange({ from, to })
            setSuccessMessage(`Auswertung für ${formatPeriodLabel(from, to)} geladen.`)
        } catch (error) {
            console.error('Error loading analytics:', error)
            setErrorMessage('Die Auswertung konnte nicht geladen werden.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // Initial data loading is the effect's external synchronization task.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadAnalytics(initialRange.from, initialRange.to)
    }, [initialRange, loadAnalytics])

    const categoryItems = useMemo(() => categorySummary.map(category => ({
        id: `category-${category.categoryId}`,
        label: category.categoryName,
        amount: category.totalAmount,
        averagePerMonth: category.averagePerMonth
    })), [categorySummary])

    const subcategoryItems = useMemo(() => subcategorySummary.map(subcategory => ({
        id: `subcategory-${subcategory.subcategoryId}`,
        label: `${subcategory.categoryName} – ${subcategory.subcategoryName}`,
        amount: subcategory.totalAmount,
        averagePerMonth: subcategory.averagePerMonth
    })), [subcategorySummary])

    const personItems = useMemo(() => personSummary.map(person => ({
        id: `person-${person.personId}`,
        label: person.personName,
        amount: person.totalAmount,
        averagePerMonth: person.averagePerMonth
    })), [personSummary])

    const savingsItems = useMemo(() => (Array.isArray(savingsSummary.items) ? savingsSummary.items : [])
        .map(item => ({
            id: item.id,
            label: item.name,
            amount: item.totalAmount,
            averagePerMonth: item.averagePerMonth
        })), [savingsSummary.items])

    const incomeItems = useMemo(() => {
        const source = incomeMode === 'category' ? incomeCategorySummary : incomePersonSummary
        return source.map(item => ({
            id: item.id,
            label: item.name,
            amount: item.totalAmount,
            averagePerMonth: item.averagePerMonth
        }))
    }, [incomeCategorySummary, incomeMode, incomePersonSummary])

    function handleSubmit(event) {
        event.preventDefault()
        if (!fromDate || !toDate || fromDate > toDate) {
            setErrorMessage('Das Von-Datum darf nicht nach dem Bis-Datum liegen.')
            return
        }
        loadAnalytics(fromDate, toDate)
    }

    function selectCurrentYear() {
        const range = getCurrentYearRange()
        setFromDate(range.from)
        setToDate(range.to)
    }

    const periodLabel = formatPeriodLabel(appliedRange.from, appliedRange.to)

    return (
        <div className="container mt-4 pb-5">
            <div className="mb-4">
                <h1>Analytics</h1>
                <p className="text-muted mb-0">
                    Auswertung von Einkommen, Ausgaben, Sparen und Salden für einen frei wählbaren Zeitraum.
                </p>
            </div>

            {errorMessage && <div className="alert alert-danger mt-3" role="alert">{errorMessage}</div>}
            {successMessage && <div className="alert alert-success mt-3" role="status">{successMessage}</div>}

            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Analytics-Bereiche</h5>
                    <nav className="nav nav-pills flex-wrap gap-2">
                        <a className="nav-link active" href="#monthly-balance">Monats-Saldo</a>
                        <a className="nav-link" href="#category-summary">Kategorien</a>
                        <a className="nav-link" href="#subcategory-summary">Subkategorien</a>
                        <a className="nav-link" href="#person-summary">Personen</a>
                        <a className="nav-link" href="#savings-summary">Sparen</a>
                        <a className="nav-link" href="#income-summary">Einnahmen</a>
                        <a className="nav-link" href="#year-comparison">Jahresvergleich</a>
                    </nav>
                </div>
            </div>

            <div className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Zeitraum</h5>
                    <form onSubmit={handleSubmit}>
                        <div className="row g-3 align-items-end">
                            <div className="col-12 col-md-3">
                                <label className="form-label" htmlFor="analytics-from">Von-Datum</label>
                                <input id="analytics-from" type="date" className="form-control" value={fromDate}
                                    onChange={event => setFromDate(event.target.value)} required />
                            </div>
                            <div className="col-12 col-md-3">
                                <label className="form-label" htmlFor="analytics-to">Bis-Datum</label>
                                <input id="analytics-to" type="date" className="form-control" value={toDate}
                                    onChange={event => setToDate(event.target.value)} required />
                            </div>
                            <div className="col-12 col-md-3">
                                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                                    {loading ? 'Wird ausgewertet …' : 'Auswerten'}
                                </button>
                            </div>
                            <div className="col-12 col-md-3">
                                <button type="button" className="btn btn-outline-secondary w-100" onClick={selectCurrentYear}>
                                    Aktuelles Jahr
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <section aria-labelledby="overview-heading" className="mt-4">
                <h5 id="overview-heading" className="mb-3">Übersicht {periodLabel}</h5>
                <div className="row row-cols-1 row-cols-md-2 row-cols-xl-5 g-3">
                    <BalanceCard label="Einkommen" value={overview.income} color="success" />
                    <BalanceCard label="Ausgaben" value={overview.expenses} color="danger" />
                    <BalanceCard label="Sparen" value={overview.savings} color="info" />
                    <BalanceCard label="Saldo vor Sparen" value={overview.balanceBeforeSavings} balance />
                    <BalanceCard label="Freier Saldo" value={overview.freeBalanceAfterSavings} balance />
                </div>
            </section>

            <section id="monthly-balance" className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title mb-3">Monats-Saldo</h5>
                    {monthlyBalance.length === 0 ? (
                        <p className="text-muted mb-0">Für den ausgewählten Zeitraum sind keine Monatsdaten vorhanden.</p>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-sm align-middle">
                                <thead><tr>
                                    <th>Monat</th><th className="text-end">Einkommen</th>
                                    <th className="text-end">Ausgaben</th><th className="text-end">Sparen</th>
                                    <th className="text-end">Saldo vor Sparen</th><th className="text-end">Freier Saldo</th>
                                </tr></thead>
                                <tbody>{monthlyBalance.map(month => (
                                    <tr key={month.month}>
                                        <td>{formatMonth(month.month)}</td>
                                        <td className="text-end text-success">{formatAmount(month.income)} €</td>
                                        <td className="text-end text-danger">{formatAmount(month.expenses)} €</td>
                                        <td className="text-end text-info">{formatAmount(month.savings)} €</td>
                                        <td className={`text-end ${getBalanceClass(month.balanceBeforeSavings)}`}>
                                            {formatAmount(month.balanceBeforeSavings)} €
                                        </td>
                                        <td className={`text-end ${getBalanceClass(month.freeBalanceAfterSavings)}`}>
                                            {formatAmount(month.freeBalanceAfterSavings)} €
                                        </td>
                                    </tr>
                                ))}</tbody>
                            </table>
                        </div>
                    )}
                </div>
            </section>

            <section id="category-summary" className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title mb-2">Ausgaben nach Kategorien</h5>
                    <p className="text-muted mb-4">Zeitraum: {periodLabel}</p>
                    {categoryItems.length === 0 ? (
                        <p className="text-muted mb-0">Für den ausgewählten Zeitraum sind keine Ausgaben vorhanden.</p>
                    ) : (
                        <>
                            <AnalyticsDoughnutChart items={categoryItems}
                                ariaLabel="Ausgaben nach Kategorien als Doughnut-Diagramm" />
                            <AnalyticsAverageCards items={categoryItems}
                                heading="Monatlicher Durchschnitt nach Kategorie"
                                ariaLabel="Durchschnittsausgaben nach Kategorien" />
                        </>
                    )}
                </div>
            </section>

            <section id="subcategory-summary" className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title mb-2">Ausgaben nach Subkategorien</h5>
                    <p className="text-muted mb-4">Zeitraum: {periodLabel}</p>
                    {subcategoryItems.length === 0 ? (
                        <p className="text-muted mb-0">
                            Für den ausgewählten Zeitraum sind keine Ausgaben nach Subkategorien vorhanden.
                        </p>
                    ) : (
                        <>
                            <AnalyticsDoughnutChart items={subcategoryItems}
                                ariaLabel="Ausgaben nach Subkategorien als Doughnut-Diagramm" />
                            <AnalyticsAverageCards items={subcategoryItems}
                                heading="Monatlicher Durchschnitt nach Subkategorie"
                                ariaLabel="Durchschnittsausgaben nach Subkategorien" />
                        </>
                    )}
                </div>
            </section>

            <section id="person-summary" className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title mb-2">Ausgaben nach Personen</h5>
                    <p className="text-muted mb-4">Zeitraum: {periodLabel}</p>
                    {personItems.length === 0 ? (
                        <p className="text-muted mb-0">
                            Für den ausgewählten Zeitraum sind keine personenbezogenen Ausgaben vorhanden.
                        </p>
                    ) : (
                        <>
                            <AnalyticsDoughnutChart items={personItems}
                                ariaLabel="Ausgaben nach Personen als Doughnut-Diagramm" />
                            <AnalyticsAverageCards items={personItems}
                                heading="Monatlicher Durchschnitt nach Person"
                                ariaLabel="Durchschnittsausgaben nach Personen" />
                        </>
                    )}
                </div>
            </section>

            <section id="savings-summary" className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title mb-2">Sparen &amp; Investieren</h5>
                    <p className="text-muted mb-4">Zeitraum: {periodLabel}</p>
                    {savingsItems.length === 0 ? (
                        <p className="text-muted mb-0">
                            Für den ausgewählten Zeitraum sind keine Sparbeträge vorhanden.
                        </p>
                    ) : (
                        <>
                            <AnalyticsDoughnutChart items={savingsItems}
                                ariaLabel="Sparen und Investieren als Doughnut-Diagramm" />
                            <AnalyticsAverageCards items={savingsItems}
                                heading="Monatlicher Durchschnitt für Sparen und Investieren"
                                ariaLabel="Durchschnitt für Sparen und Investieren" />
                        </>
                    )}
                </div>
            </section>

            <section id="income-summary" className="card mt-4">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-2">
                        <h5 className="card-title mb-0">Einnahmen</h5>
                        <div className="btn-group btn-group-sm" role="group" aria-label="Einnahmen gruppieren nach">
                            <button
                                type="button"
                                className={`btn ${incomeMode === 'category' ? 'btn-primary' : 'btn-outline-primary'}`}
                                aria-pressed={incomeMode === 'category'}
                                onClick={() => setIncomeMode('category')}
                            >
                                Kategorien
                            </button>
                            <button
                                type="button"
                                className={`btn ${incomeMode === 'person' ? 'btn-primary' : 'btn-outline-primary'}`}
                                aria-pressed={incomeMode === 'person'}
                                onClick={() => setIncomeMode('person')}
                            >
                                Personen
                            </button>
                        </div>
                    </div>
                    <p className="text-muted mb-4">Zeitraum: {periodLabel}</p>
                    {incomeItems.length === 0 ? (
                        <p className="text-muted mb-0">
                            {incomeMode === 'category'
                                ? 'Für den ausgewählten Zeitraum sind keine Einnahmen vorhanden.'
                                : 'Für den ausgewählten Zeitraum sind keine personenbezogenen Einnahmen vorhanden.'}
                        </p>
                    ) : (
                        <>
                            <AnalyticsDoughnutChart items={incomeItems}
                                ariaLabel={`Einnahmen nach ${incomeMode === 'category' ? 'Kategorien' : 'Personen'} als Doughnut-Diagramm`} />
                            <AnalyticsAverageCards items={incomeItems}
                                heading={`Monatlicher Durchschnitt nach ${incomeMode === 'category' ? 'Kategorie' : 'Person'}`}
                                ariaLabel={`Durchschnittseinnahmen nach ${incomeMode === 'category' ? 'Kategorien' : 'Personen'}`} />
                        </>
                    )}
                </div>
            </section>

            <section id="year-comparison" className="card mt-4">
                <div className="card-body">
                    <h5 className="card-title mb-2">Jahresvergleich</h5>
                    <p className="text-muted mb-0">Vergleich von Monaten über mehrere Jahre.</p>
                </div>
            </section>
        </div>
    )
}

export default AnalyticsPage
