import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Сохранять сессию в localStorage
    autoRefreshToken: true, // Обновлять токен автоматически
    detectSessionInUrl: false, // Не парсить URL при каждом запуске
    flowType: 'pkce', // Более надёжный flow
  },
})
