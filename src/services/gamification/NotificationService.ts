import { supabase } from '../../lib/supabase';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export class NotificationService {
  /**
   * Generates a new notification for a user.
   */
  static async notify(userId: string, title: string, message: string, type: string = 'system'): Promise<boolean> {
    try {
      // Assuming you have a 'notifications' table in Supabase
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type
        });

      if (error) {
        console.warn('Could not insert notification (Table might not exist yet):', error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Notification Service Error:', error);
      return false;
    }
  }
}
