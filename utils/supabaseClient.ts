import { createClient } from "@supabase/supabase-js"

// Initialize Supabase (db backend) client with API URL and anonymous key.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_API_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase
