'use server';

import { createClient } from '@supabase/supabase-js';

// This action runs securely on the server and can use the Service Role Key
// to bypass RLS and client-side restrictions.
export async function adminUpdateUserPassword(userId: string, newPassword: string) {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // MUST be set in .env
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );

  try {
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error('Admin Password Update Error:', error);
    return { success: false, error: error.message };
  }
}
