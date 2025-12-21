import { synchronize } from '@nozbe/watermelondb/sync'
import { database } from './index'

export async function pullAndPush() {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      const response = await fetch(`https://your-api.com/api/sync/pull?last_pulled_at=${lastPulledAt ?? 0}`);
      const { changes, timestamp } = await response.json();
      return { changes, timestamp };
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      await fetch(`https://your-api.com/api/sync/push?last_pulled_at=${lastPulledAt}`, {
        method: 'POST',
        body: JSON.stringify({ changes }),
      });
    },
  });
}