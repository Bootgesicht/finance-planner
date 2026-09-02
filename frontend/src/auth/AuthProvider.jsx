import { useCallback, useEffect, useMemo, useState } from 'react'
import { bootstrapAuthentication, login, logout } from '../api/authApi'
import AuthContext from './AuthContext'

function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [initializationError, setInitializationError] = useState('')

    useEffect(() => {
        let active = true
        const handleUnauthorized = () => setUser(null)
        window.addEventListener('financeplanner:unauthorized', handleUnauthorized)

        bootstrapAuthentication()
            .then(currentUser => {
                if (active) setUser(currentUser)
            })
            .catch(() => {
                if (active) setInitializationError('Die Verbindung zum Backend konnte nicht hergestellt werden.')
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
            window.removeEventListener('financeplanner:unauthorized', handleUnauthorized)
        }
    }, [])

    const signIn = useCallback(async (username, password) => {
        const currentUser = await login(username, password)
        setUser(currentUser)
        setInitializationError('')
    }, [])

    const signOut = useCallback(async () => {
        await logout()
        setUser(null)
    }, [])

    const value = useMemo(() => ({
        user,
        loading,
        initializationError,
        signIn,
        signOut
    }), [user, loading, initializationError, signIn, signOut])

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider
