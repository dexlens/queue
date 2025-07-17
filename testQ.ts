import { QueueManager } from './queueManager.ts';
import { EventType } from './types.ts';

const queueManager = new QueueManager();

const pickRandomEvent = () => {
    const events = [EventType.NEW_TOKEN];
    return events[Math.floor(Math.random() * events.length)];
}

const addEvent = async () => {
    const event = pickRandomEvent();
    if (event === EventType.NEW_TOKEN) {
        await queueManager.addEvent(event, { tokenId: '123', name: 'MyToken', "eventType": event });
    }
}

// every 1 second add a random event
setInterval(addEvent, 1000);
