import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import useAuth from '../auth/useAuth'

function Navbar({ user }) {
    const { signOut } = useAuth()
    const [loggingOut, setLoggingOut] = useState(false)
    const [logoutError, setLogoutError] = useState(false)

    async function handleLogout() {
        setLoggingOut(true)
        setLogoutError(false)
        try {
            await signOut()
        } catch {
            setLogoutError(true)
        } finally {
            setLoggingOut(false)
        }
    }

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary border-bottom">
            <div className="container">
                <NavLink className="navbar-brand fw-semibold" to="/">
                    Finance Planner
                </NavLink>

                <div className="navbar-nav">
                    <NavLink
                        className={({ isActive }) =>
                            isActive ? 'nav-link active fw-semibold' : 'nav-link'
                        }
                        to="/entries/new"
                    >
                        Neue Einträge
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            isActive ? 'nav-link active fw-semibold' : 'nav-link'
                        }
                        to="/entries"
                    >
                        Einträge
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            isActive ? 'nav-link active fw-semibold' : 'nav-link'
                        }
                        to="/analytics"
                    >
                        Analytics
                    </NavLink>

                    <NavLink
                        className={({ isActive }) =>
                            isActive ? 'nav-link active fw-semibold' : 'nav-link'
                        }
                        to="/management"
                    >
                        Verwaltung
                    </NavLink>

                    <span className="navbar-text ms-lg-3 me-lg-2">
                        {user.displayName}
                    </span>
                    {logoutError && (
                        <span className="navbar-text text-danger me-lg-2">Abmeldung fehlgeschlagen.</span>
                    )}
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary align-self-lg-center"
                        onClick={handleLogout}
                        disabled={loggingOut}
                    >
                        Abmelden
                    </button>
                </div>
            </div>
        </nav>
    )
}

export default Navbar
