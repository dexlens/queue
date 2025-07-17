import dotenv from 'npm:dotenv';
dotenv.config();
import { createClient } from 'npm:@supabase/supabase-js';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_KEY') || '';

console.log(supabaseUrl, supabaseKey);
export const supabase = createClient(supabaseUrl, supabaseKey);