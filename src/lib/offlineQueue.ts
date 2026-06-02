export interface OfflineAction {
  id: string;
  type: 'ATTENDANCE_SCAN';
  payload: any;
  timestamp: number;
}

export class OfflineQueueService {
  private static QUEUE_KEY = 'cluvion_offline_queue';

  /**
   * Adds an action to the offline queue
   */
  static enqueue(actionType: 'ATTENDANCE_SCAN', payload: any) {
    const queue = this.getQueue();
    const action: OfflineAction = {
      id: crypto.randomUUID(),
      type: actionType,
      payload,
      timestamp: Date.now()
    };
    queue.push(action);
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
    
    // Attempt to register background sync if available
    this.registerBackgroundSync();
  }

  /**
   * Retrieves the current queue
   */
  static getQueue(): OfflineAction[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Clears an action from the queue
   */
  static dequeue(id: string) {
    let queue = this.getQueue();
    queue = queue.filter(q => q.id !== id);
    localStorage.setItem(this.QUEUE_KEY, JSON.stringify(queue));
  }

  /**
   * Attempts to register a background sync event with the service worker
   */
  private static async registerBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // @ts-ignore - background sync API type missing
        await registration.sync.register('sync-attendance');
      } catch (err) {
         console.warn('Background sync not supported or failed', err);
      }
    }
  }

  /**
   * Processes the queue (call this when online)
   */
  static async processQueue(processor: (action: OfflineAction) => Promise<boolean>) {
    if (!navigator.onLine) return;
    
    const queue = this.getQueue();
    if (queue.length === 0) return;

    for (const action of queue) {
      try {
        const success = await processor(action);
        if (success) {
          this.dequeue(action.id);
        }
      } catch (err) {
        console.error(`Failed to process offline action ${action.id}`, err);
      }
    }
  }
}
