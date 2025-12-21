import { synchronize, SyncPullArgs, SyncPushArgs } from '@nozbe/watermelondb/sync';
// Use the built-in SyncLogger for structured diagnostics [cite: 1608]
import SyncLogger from '@nozbe/watermelondb/sync/SyncLogger';
import { database } from './index';

export async function pullAndPush(): Promise<void> {
  // Initialize logger with a limit of 10 logs kept in memory [cite: 1608]
  const logger = new SyncLogger(10);

  try {
    await synchronize({
      database,
      // Pass a new log instance to be populated by the sync process [cite: 1609]
      log: logger.newLog(),
      pullChanges: async ({ lastPulledAt, schemaVersion, migration }: SyncPullArgs) => {
        const isFirstSync = lastPulledAt === null || lastPulledAt === 0;
        const url = `http://10.0.2.2:5117/api/sync/pull?last_pulled_at=${lastPulledAt ?? 0}&turbo=${isFirstSync}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(await response.text());

        if (isFirstSync) {
          const json = await response.text();
          return { syncJson: json };
        } else {
          const { changes, timestamp } = await response.json();

          if (__DEV__ && changes.products) {
            const all = [...changes.products.created, ...changes.products.updated];
            all.forEach((r, i) => { if (!r.id) console.error(`Product ${i} missing ID!`, r); });
          }

          return { changes, timestamp };
        }
      },
      pushChanges: async ({ changes, lastPulledAt }: SyncPushArgs) => {
        const response = await fetch(`http://10.0.2.2:5117/api/sync/push`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ changes, last_pulled_at: lastPulledAt }),
        });

        if (!response.ok) throw new Error(await response.text());
      },
      migrationsEnabledAtVersion: 1, // Required if using migrations [cite: 1517]
      unsafeTurbo: true,
      sendCreatedAsUpdated: true,
    });

    // Log the results after a successful sync
    console.log('Sync successful. Diagnostics:', logger.formattedLogs);
  } catch (error) {
    // Log the results even if it fails to see where it broke
    console.error('Sync failed:', error);
    console.log('Failure Diagnostics:', logger.formattedLogs);
  }
}