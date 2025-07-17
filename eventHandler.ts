import { EventType, EventHandler } from './types.ts';

export const eventHandlers: Record<EventType, EventHandler> = {
  [EventType.NEW_TOKEN]: async (data) => {
    console.log('Processing NEW_TOKEN event:', data);
    // handle the event here
  },
}

