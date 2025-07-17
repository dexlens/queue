export enum EventType {
    // Event types go here
    // like this: 
    NEW_TOKEN = 'NEW_TOKEN',
}

export interface QueueEvent {
    id?: string;
    type: EventType;
    data: Record<string, any>;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    retries: number;
    created_at?: string;
    updated_at?: string;
}

// Type for event handler functions
export type EventHandler = (data: Record<string, any>) => Promise<void>;