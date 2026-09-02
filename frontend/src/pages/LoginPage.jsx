import { useState } from 'react'
import useAuth from '../auth/useAuth'

function LoginPage() {
    const { initializationError, signIn } = useAuth()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()
        setError('')
        setSubmitting(true)
        try {
            await signIn(username.trim(), password)
        } catch (loginError) {
            setError(loginError.status === 401
                ? 'Benutzername oder Passwort ist falsch.'
                : 'Die Anmeldung ist fehlgeschlagen.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <main className="container py-5">
            <div className="row justify-content-center">
                <div className="col-12 col-sm-9 col-md-6 col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-body p-4">
                            <h1 className="h3 mb-2">Finance Planner</h1>
                            <p className="text-muted mb-4">Bitte melde dich an.</p>

                            {(error || initializationError) && (
                                <div className="alert alert-danger" role="alert">
                                    {error || initializationError}
                                </div>
                            )}

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="username">Benutzername</label>
                                    <input
                                        id="username"
                                        className="form-control"
                                        autoComplete="username"
                                        value={username}
                                        onChange={event => setUsername(event.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="form-label" htmlFor="password">Passwort</label>
                                    <input
                                        id="password"
                                        type="password"
                                        className="form-control"
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={event => setPassword(event.target.value)}
                                        required
                                    />
                                </div>
                                <button className="btn btn-primary w-100" disabled={submitting}>
                                    {submitting ? 'Anmeldung läuft …' : 'Anmelden'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default LoginPage
