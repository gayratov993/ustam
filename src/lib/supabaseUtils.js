import { getSupabase } from './supabaseClient'

export function normalizeError(error) {
  return {
    status: error?.code || 500,
    message: error?.message || 'Noma’lum xatolik',
    details: error?.details || null,
    hint: error?.hint || null,
  }
}

export function toResponse(execute) {
  return async () => {
    try {
      const { data, error } = await execute(getSupabase())
      if (error) throw error
      return { data }
    } catch (error) {
      return { error: normalizeError(error) }
    }
  }
}

export function toResponseArgs(execute) {
  return async (args) => {
    try {
      const { data, error } = await execute(getSupabase(), args)
      if (error) throw error
      return { data }
    } catch (error) {
      return { error: normalizeError(error) }
    }
  }
}

export function selectProfileFields(sb) {
  return sb.from('profiles').select(
    'id, full_name, phone, avatar_url, role, city, district, bio, hourly_rate, created_at'
  )
}
