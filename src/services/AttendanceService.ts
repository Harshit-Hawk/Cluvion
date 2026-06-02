import { supabase } from '../lib/supabase';

export interface AttendancePayload {
  userId: string;
  timestamp: number;
}

export class AttendanceService {
  /**
   * Generates a simple payload for the student's QR code
   */
  static generateStudentQRPayload(userId: string): string {
    const payload: AttendancePayload = {
      userId,
      timestamp: Date.now()
    };
    return btoa(JSON.stringify(payload));
  }

  /**
   * Parses the scanned QR code payload
   */
  static parseQRPayload(encodedPayload: string): AttendancePayload | null {
    try {
      const decoded = atob(encodedPayload);
      return JSON.parse(decoded) as AttendancePayload;
    } catch (e) {
      console.error('Invalid QR code payload:', e);
      return null;
    }
  }

  /**
   * Marks a student as attended for a specific event
   * Includes duplicate prevention via Supabase unique constraints
   */
  static async markAttendance(eventId: string, studentId: string, scannedByAdminId: string) {
    try {
      // 1. Ensure the user isn't already marked as attended
      const { data: existing, error: checkError } = await supabase
        .from('event_attendance')
        .select('status')
        .eq('event_id', eventId)
        .eq('user_id', studentId)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing?.status === 'attended') {
        return { success: false, message: 'Student has already been checked into this event.' };
      }

      // 2. Mark attendance (upserting in case they registered previously)
      const { error: upsertError } = await supabase
        .from('event_attendance')
        .upsert({
          event_id: eventId,
          user_id: studentId,
          scanned_by: scannedByAdminId,
          status: 'attended',
        }, { onConflict: 'event_id,user_id' });

      if (upsertError) throw upsertError;

      // Note: The Supabase Trigger 'log_attendance_activity' will automatically 
      // fire upon this insert/update and award XP to the student via activity_logs.

      return { success: true, message: 'Attendance marked successfully! XP awarded.' };
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      
      // Handle Postgres unique constraint violation gracefully just in case
      if (error.code === '23505') {
         return { success: false, message: 'Student is already checked in.' };
      }

      return { success: false, message: error.message || 'Failed to mark attendance.' };
    }
  }

  /**
   * Fetches the attendance list for a specific event
   */
  static async getEventAttendees(eventId: string) {
    const { data, error } = await supabase
      .from('event_attendance')
      .select(`
        id,
        status,
        created_at,
        users!event_attendance_user_id_fkey (
          id,
          full_name,
          email,
          avatar_url,
          roll_no,
          course
        )
      `)
      .eq('event_id', eventId)
      .eq('status', 'attended')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
