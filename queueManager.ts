import { supabase } from './db.ts';
import { QueueEvent, EventType } from './types.ts';

/**
 * QueueManager is a class that manages the queue of events.
 * It is responsible for adding events to the queue and processing them.
 * 
 * @example
 * const queueManager = new QueueManager();
 * await queueManager.addEvent('EVENT_TYPE', { data: 'data' });
 */
export class QueueManager {
  async addEvent(type: EventType, data: Record<string, any>): Promise<void> {
    const event: Omit<QueueEvent, 'id' | 'created_at' | 'updated_at'> = {
      type,
      data,
      status: 'PENDING',
      retries: 0,
    };

    const { error } = await supabase.from('queue_events').insert([event]);

    if (error) {
      console.error(`Failed to add event (${type}):`, error);
      throw new Error(`Failed to add event: ${error.message}`);
    }

    console.log(`Event added to queue: ${type}`);
  }
}