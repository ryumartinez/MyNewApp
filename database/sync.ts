import { synchronize, SyncPullArgs, SyncPushArgs } from '@nozbe/watermelondb/sync';
import { database } from './index';

export async function pullAndPush(): Promise<void> {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt, schemaVersion }: SyncPullArgs) => {
      const isFirstSync = lastPulledAt === null || lastPulledAt === 0;
      const url = `http://10.0.2.2:5117/api/sync/pull?last_pulled_at=${lastPulledAt ?? 0}&turbo=${isFirstSync}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(await response.text());

      if (isFirstSync) {
        const json = await response.text();
        return { syncJson: json }; // Turbo mode requires raw text [cite: 1556]
      } else {
        const { changes, timestamp } = await response.json();

        // MANUAL DEBUG: Check for missing IDs which cause "Failed to get ID"
        if (__DEV__ && changes.products) {
          const all = [...changes.products.created, ...changes.products.updated];
          all.forEach((r, i) => { if (!r.id) console.error(`Product ${i} missing ID!`, r); });
        }

        return { changes, timestamp };
      }
    },
    pushChanges: async ({ changes, lastPulledAt }: SyncPushArgs) => {
      await fetch(`http://10.0.2.2:5117/api/sync/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes, last_pulled_at: lastPulledAt }), // Match C# property name
      });
    },
    unsafeTurbo: true, // Requires JSI [cite: 1543]
    sendCreatedAsUpdated: true, // Handles existing records sent as "created" [cite: 1672]
  });
}