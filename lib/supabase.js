import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Null when the two keys are missing.
export const supabase = url && key ? createClient(url, key) : null;

// A live site without the keys shows a setup error instead of quietly saving
// orders only in the browser. On your own computer (npm run dev) demo mode still works.
export const configMissing = !supabase && process.env.NODE_ENV === 'production';
