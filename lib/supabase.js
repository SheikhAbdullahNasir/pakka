import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// If the two keys are missing, the app runs in "demo mode":
// no login, and orders are saved only in this browser.
export const supabase = url && key ? createClient(url, key) : null;
export const isDemo = !supabase;
