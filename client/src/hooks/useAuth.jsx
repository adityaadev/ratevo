import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { authApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        localStorage.setItem('ratevo_token', session.access_token)
      } else {
        setUser(null)
        localStorage.removeItem('ratevo_token')
      }
    } catch (err) {
      setUser(null)
      localStorage.removeItem('ratevo_token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        localStorage.setItem('ratevo_token', session.access_token)
      } else {
        setUser(null)
        localStorage.removeItem('ratevo_token')
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signup = async (email, password) => {
    setError(null)
    setLoading(true)
    try {
      const clientUrl = import.meta.env.VITE_APP_URL || import.meta.env.VITE_CLIENT_URL || window.location.origin
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${clientUrl}/verify-otp`
        }
      })
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (email, token, type = 'signup') => {
    setError(null)
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({ 
        email, 
        token, 
        type 
      })
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async (email, type = 'signup') => {
    setError(null)
    try {
      const { error } = await supabase.auth.resend({ 
        type, 
        email 
      })
      if (error) throw error
      return { success: true }
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const login = async (email, password) => {
    setError(null)
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      setUser(null)
      localStorage.removeItem('ratevo_token')
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setError(null)
    setLoading(true)
    try {
      const clientUrl = import.meta.env.VITE_APP_URL || import.meta.env.VITE_CLIENT_URL || window.location.origin
      const redirectTo = `${clientUrl}/dashboard`
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    signInWithGoogle,
    verifyOtp,
    resendOtp,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}