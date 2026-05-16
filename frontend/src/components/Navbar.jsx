import { NavLink } from 'react-router-dom'

function Navbar() {
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
                </div>
            </div>
        </nav>
    )
}

export default Navbar