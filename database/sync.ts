import { synchronize } from '@nozbe/watermelondb/sync'
import { database } from './index'

export async function pullAndPush() {
  // Turbo Login can ONLY be used for the initial sync (when database is empty)[cite: 1540, 1541].
  // We determine this based on whether lastPulledAt is null/zero.

  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
      const isFirstSync = lastPulledAt === null || lastPulledAt === 0;
      // You must only enable turbo if the database is truly empty.
      const useTurbo = isFirstSync;

      const urlParams = `last_pulled_at=${lastPulledAt ?? 0}&schema_version=${schemaVersion}&turbo=${useTurbo}`;
      const response = await fetch(`http://10.0.2.2:5117/api/sync/pull?${urlParams}`);

      if (!response.ok) {
        throw new Error(await response.text());
      }

      if (useTurbo) {
        // IMPORTANT: For Turbo mode, DO NOT parse JSON. Return raw text.
        const json = await response.text();
        return { syncJson: json }; // Use 'syncJson' key for Turbo Login.
      } else {
        // Standard path for incremental syncs[cite: 1559].
        const { changes, timestamp } = await response.json();
        return { changes, timestamp };
      }
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      await fetch(`http://10.0.2.2:5117/api/sync/push?last_pulled_at=${lastPulledAt}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes }),
      });
    },
    // Required to enable the Turbo optimization in the sync engine.
    unsafeTurbo: true,
  });
}