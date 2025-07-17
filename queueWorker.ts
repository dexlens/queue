import { supabase } from './db.ts';
import { QueueEvent, EventType } from './types.ts';
import { eventHandlers } from './eventHandler.ts';

export class QueueWorker {
    private readonly maxRetries = 3;
    private readonly pollInterval = 5000; // 5 seconds

    async start(): Promise<void> {
        console.log('Queue worker started');
        // eslint-disable-next-line no-constant-condition
        while (true) {
            await this.processNextEvent();
            await new Promise((resolve) => setTimeout(resolve, this.pollInterval));
        }
    }

    private async processNextEvent(): Promise<void> {
        const { data, error } = await supabase
            .from('queue_events')
            .select('*')
            .eq('status', 'PENDING')
            .order('created_at', { ascending: true })
            .limit(1)
            .single();

        if (error || !data) {
            if (error) console.error('Error fetching event:', error);
            return;
        }

        const event: QueueEvent = data;
        await this.processEvent(event);
    }

    private async processEvent(event: QueueEvent): Promise<void> {
        try {
            await supabase
                .from('queue_events')
                .update({ status: 'PROCESSING', updated_at: new Date().toISOString() })
                .eq('id', event.id);

            const handler = eventHandlers[event.type as EventType];
            if (!handler) {
                throw new Error(`No handler for event type: ${event.type}`);
            }

            await handler(event.data);

            await supabase
                .from('queue_events')
                .update({ status: 'COMPLETED', updated_at: new Date().toISOString() })
                .eq('id', event.id);

            console.log(`Event processed successfully: ${event.type}`);
        } catch (error) {
            console.error(`Error processing event (${event.type}):`, error);
            const newRetries = event.retries + 1;

            if (newRetries >= this.maxRetries) {
                await supabase
                    .from('queue_events')
                    .update({ status: 'FAILED', retries: newRetries, updated_at: new Date().toISOString() })
                    .eq('id', event.id);
                console.log(`Event failed after ${this.maxRetries} retries: ${event.type}`);
            } else {
                await supabase
                    .from('queue_events')
                    .update({ status: 'PENDING', retries: newRetries, updated_at: new Date().toISOString() })
                    .eq('id', event.id);
                console.log(`Event retry ${newRetries}/${this.maxRetries}: ${event.type}`);
            }
        }
    }
}
