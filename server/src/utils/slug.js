import { supabase } from '../config/supabase.js'

export function generateBaseSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function generateUniqueSlug(name) {
  const baseSlug = generateBaseSlug(name)
  let slug = baseSlug
  let counter = 1
  
  while (true) {
    const { data, error } = await supabase()
      .from('businesses')
      .select('id')
      .eq('slug', slug)
      .single()
    
    if (error && error.code === 'PGRST116') {
      return slug
    }
    
    if (data) {
      counter++
      slug = `${baseSlug}-${generateRandomSuffix()}`
    } else {
      return slug
    }
  }
}

function generateRandomSuffix(length = 4) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}