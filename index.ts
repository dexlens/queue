import { QueueWorker } from './queueWorker.ts';

// Example usage
async function main() {
  const queueWorker = new QueueWorker();
  await queueWorker.start();
}

main().catch(console.error);