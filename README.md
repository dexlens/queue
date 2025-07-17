# @dexlens/queue

A robust, database-backed event queue system built with Deno and Supabase. This system provides reliable event processing with automatic retry mechanisms, status tracking, and extensible event handlers.

## Features

- **Database-backed Queue**: Uses Supabase PostgreSQL for persistent event storage
- **Automatic Retry Logic**: Configurable retry attempts with exponential backoff
- **Event Status Tracking**: Real-time status updates (PENDING, PROCESSING, COMPLETED, FAILED)
- **Extensible Event Handlers**: Easy to add new event types and handlers
- **Polling-based Processing**: Continuous event processing with configurable intervals
- **TypeScript Support**: Full type safety with comprehensive type definitions

## Architecture

The system consists of several key components:

- **QueueWorker**: Continuously polls for pending events and processes them
- **QueueManager**: Provides an API for adding new events to the queue
- **Event Handlers**: Extensible functions that process specific event types
- **Database Layer**: Supabase integration for persistent storage

## Installation

1. Clone the repository
2. Install dependencies (Deno handles this automatically)
3. Set up environment variables

### Environment Variables

Create a `.env` file with your Supabase credentials:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

### Database Setup

Create a `queue_events` table in your Supabase database:

```sql
CREATE TABLE queue_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  retries INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_queue_events_status ON queue_events(status);
CREATE INDEX idx_queue_events_created_at ON queue_events(created_at);
```

## Usage

### Starting the Queue Worker

```typescript
import { QueueWorker } from './queueWorker.ts';

async function main() {
  const queueWorker = new QueueWorker();
  await queueWorker.start();
}

main().catch(console.error);
```

### Adding Events to the Queue

```typescript
import { QueueManager } from './queueManager.ts';
import { EventType } from './types.ts';

const queueManager = new QueueManager();

// Add a new event
await queueManager.addEvent(EventType.NEW_TOKEN, {
  tokenId: '123',
  name: 'MyToken',
  metadata: { /* additional data */ }
});
```

### Defining Custom Event Types

1. Add new event types to the `EventType` enum in `types.ts`:

```typescript
export enum EventType {
  NEW_TOKEN = 'NEW_TOKEN',
  USER_REGISTRATION = 'USER_REGISTRATION',
  EMAIL_NOTIFICATION = 'EMAIL_NOTIFICATION',
  // Add your custom event types here
}
```

2. Create event handlers in `eventHandler.ts`:

```typescript
import { EventType, EventHandler } from './types.ts';

export const eventHandlers: Record<EventType, EventHandler> = {
  [EventType.NEW_TOKEN]: async (data) => {
    console.log('Processing NEW_TOKEN event:', data);
    // Your custom logic here
    await processNewToken(data);
  },
  
  [EventType.USER_REGISTRATION]: async (data) => {
    console.log('Processing USER_REGISTRATION event:', data);
    // Your custom logic here
    await sendWelcomeEmail(data.email);
  },
  
  // Add handlers for your custom event types
};
```

## Event Lifecycle

1. **PENDING**: Event is added to the queue and waiting to be processed
2. **PROCESSING**: Event is currently being handled by a worker
3. **COMPLETED**: Event was successfully processed
4. **FAILED**: Event failed after maximum retry attempts

## Configuration

### QueueWorker Configuration

The `QueueWorker` class has configurable parameters:

```typescript
export class QueueWorker {
  private readonly maxRetries = 3;        // Maximum retry attempts
  private readonly pollInterval = 5000;   // Polling interval in milliseconds
  // ...
}
```

### Event Handler Function Signature

```typescript
type EventHandler = (data: Record<string, any>) => Promise<void>;
```

Event handlers should:
- Accept event data as a parameter
- Return a Promise
- Handle errors appropriately (the worker will catch and retry)
- Be idempotent (safe to retry multiple times)

## Error Handling

The system includes robust error handling:

- **Automatic Retries**: Failed events are automatically retried up to the configured maximum
- **Status Tracking**: Failed events are marked as FAILED after max retries
- **Logging**: Comprehensive logging for debugging and monitoring
- **Graceful Degradation**: Worker continues processing other events even if one fails

## Testing

Run the test script to add sample events:

```bash
deno run --allow-env --allow-net testQ.ts
```

This will add random events to the queue every second for testing purposes.

## Monitoring

Monitor your queue by querying the `queue_events` table:

```sql
-- Check pending events
SELECT * FROM queue_events WHERE status = 'PENDING';

-- Check failed events
SELECT * FROM queue_events WHERE status = 'FAILED';

-- Check processing statistics
SELECT status, COUNT(*) FROM queue_events GROUP BY status;
```

## Best Practices

1. **Idempotent Handlers**: Ensure your event handlers can be safely retried
2. **Error Logging**: Log meaningful error messages for debugging
3. **Resource Management**: Clean up resources in your handlers
4. **Monitoring**: Regularly check for failed events and investigate
5. **Scaling**: Consider running multiple workers for high-throughput scenarios
