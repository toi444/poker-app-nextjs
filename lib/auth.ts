import { supabase } from './supabase'

export async function signUp(email: string, password: string, username: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (authError) return { error: authError }

  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: authData.user.id, username })

    if (profileError) return { error: profileError }
  }

  return { data: authData }
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}