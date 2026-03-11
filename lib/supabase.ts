import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://jposixqotpxzaafnmsjx.supabase.co';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwb3NpeHFvdHB4emFhZm5tc2p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMDk2MTUsImV4cCI6MjA4NzU4NTYxNX0.RjTWWkrydyezytKP5EwnE2fA9kyhT-STewns14kUTw4';

// IMPORTANT: Ensure Row Level Security (RLS) is enabled on all Supabase tables.
// Policies should be configured in the Supabase Dashboard to restrict access
// based on auth.uid() where appropriate.

// Initialize the Supabase client only if the keys are provided
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Enhanced error handling for Supabase operations to provide more context
 * for debugging and security auditing.
 */
export const handleSupabaseError = (error: any, operation: string, table?: string) => {
  const errorInfo = {
    error: error.message || error,
    code: error.code,
    details: error.details,
    hint: error.hint,
    operation,
    table,
    timestamp: new Date().toISOString(),
  };
  
  console.error(`Supabase Error [${operation}]:`, JSON.stringify(errorInfo, null, 2));
  
  // If it's a permission error, it might be an RLS issue
  if (error.code === '42501') {
    console.warn(`Security Warning: Permission denied on table "${table}". Check RLS policies.`);
  }
  
  throw error;
};
