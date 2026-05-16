import { useEffect, useState } from 'react'
import { getSubcategoriesByCategoryId } from '../api/subcategoryApi'

function EntryRow({ row, index, categories, onChange, onRemove }) {
    const [subcategories, setSubcategories] = useState([])

    const selectedCategory = categories.find(
        category => String(category.categoryId) === String(row.categoryId)
    )

    let rowBackgroundClass = ''

    if (selectedCategory?.categoryKind === 'INCOME') {
        rowBackgroundClass = 'bg-success-subtle border border-success-subtle'
    } else if (selectedCategory?.categoryKind === 'EXPENSE') {
        rowBackgroundClass = 'bg-danger-subtle border border-danger-subtle'
    } else if (selectedCategory?.categoryKind === 'SAVING') {
        rowBackgroundClass = 'bg-info-subtle border border-info-subtle'
    }

    useEffect(() => {
        if (!row.categoryId) {
            setSubcategories([])
            return
        }

        getSubcategoriesByCategoryId(row.categoryId)
            .then(data => setSubcategories(data))
            .catch(error => console.error('Error loading subcategories:', error))
    }, [row.categoryId])

    return (
        <div className={`row g-3 align-items-end mb-3 p-3 rounded ${rowBackgroundClass}`}>
            <div className="col-12 col-md-2">
                <label className="form-label">Datum</label>
                <input
                    type="date"
                    className="form-control"
                    value={row.date}
                    onChange={(event) => onChange(index, 'date', event.target.value)}
                />
            </div>

            <div className="col-12 col-md-1">
                <label className="form-label">Betrag</label>
                <input
                    type="text"
                    inputMode="decimal"
                    className="form-control"
                    value={row.amount}
                    onChange={(event) => onChange(index, 'amount', event.target.value)}
                />
            </div>

            <div className="col-12 col-md-3">
                <label className="form-label">Beschreibung</label>
                <input
                    type="text"
                    className="form-control"
                    value={row.description}
                    onChange={(event) => onChange(index, 'description', event.target.value)}
                />
            </div>

            <div className="col-12 col-md-2">
                <label className="form-label">Kategorie</label>
                <select
                    className="form-select"
                    value={row.categoryId}
                    onChange={(event) => {
                        onChange(index, 'categoryId', event.target.value)
                        onChange(index, 'subcategoryId', '')
                    }}
                >
                    <option value="">Kategorie</option>

                    {categories.map(category => (
                        <option key={category.categoryId} value={category.categoryId}>
                            {category.categoryName}
                        </option>
                    ))}
                </select>
            </div>

            <div className="col-12 col-md-2">
                <label className="form-label">Subkategorie</label>
                <select
                    className="form-select"
                    value={row.subcategoryId}
                    onChange={(event) => onChange(index, 'subcategoryId', event.target.value)}
                    disabled={!row.categoryId}
                >
                    <option value="">Subkategorie</option>

                    {subcategories.map(subcategory => (
                        <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                        </option>
                    ))}
                </select>
            </div>

            <div className="col-12 col-md-1">
                <label className="form-label">Notiz</label>
                <input
                    type="text"
                    className="form-control"
                    value={row.note}
                    onChange={(event) => onChange(index, 'note', event.target.value)}
                />
            </div>

            <div className="col-12 col-md-1">
                <button
                    type="button"
                    className="btn btn-outline-dark w-100"
                    onClick={() => onRemove(index)}
                    aria-label="Eintrag entfernen"
                >
                    X
                </button>
            </div>
        </div>
    )
}

export default EntryRow