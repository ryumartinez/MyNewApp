import { synchronize } from '@nozbe/watermelondb/sync'
import { database } from './index'

export async function pullAndPush() {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt, schemaVersion, migration }) => {
      const isFirstSync = lastPulledAt === null || lastPulledAt === 0;
      const useTurbo = isFirstSync;

      const urlParams = `last_pulled_at=${lastPulledAt ?? 0}&schema_version=${schemaVersion}&turbo=${useTurbo}`;
      const response = await fetch(`http://10.0.2.2:5117/api/sync/pull?${urlParams}`);

      if (!response.ok) {
        throw new Error(await response.text());
      }

      if (useTurbo) {

        const json = await response.text();
        return { syncJson: json };
      } else {
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
    unsafeTurbo: true,
  });
}