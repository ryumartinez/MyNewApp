import { synchronize, SyncPullArgs, SyncPushArgs } from '@nozbe/watermelondb/sync';
import SyncLogger from '@nozbe/watermelondb/sync/SyncLogger';
import axios from 'axios';
import { database } from './index';

export const api = axios.create({
  baseURL: 'https://dev.azeta.com.py/api/big/sync',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Variable to store the interceptor ID so we can clear it if the token changes
let interceptorId: number | null = null;

export const setAuthToken = (token: string) => {
  // Clear existing interceptor if it exists
  if (interceptorId !== null) {
    api.interceptors.request.eject(interceptorId);
  }

  if (token) {
    interceptorId = api.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }
};

export async function pullAndPush(): Promise<void> {
  const logger = new SyncLogger(10);

  try {
    await synchronize({
      database,
      log: logger.newLog(),
      pullChanges: async ({ lastPulledAt, schemaVersion, migration }: SyncPullArgs) => {
        const isFirstSync = lastPulledAt === null || lastPulledAt === 0;

        // Axios uses 'params' for query strings
        const response = await api.get('/pull', {
          params: {
            last_pulled_at: lastPulledAt ?? 0,
            turbo: isFirstSync,
          },
          // If it's the first sync, we want the raw string for Turbo Mode
          responseType: isFirstSync ? 'text' : 'json',
        });

        if (isFirstSync) {
          // response.data will be the raw string because of responseType: 'text'
          return { syncJson: response.data };
        } else {
          const { changes, timestamp } = response.data;

          if (__DEV__ && changes.products) {
            const all = [...changes.products.created, ...changes.products.updated];
            all.forEach((r, i) => {
              if (!r.id) console.error(`Product ${i} missing ID!`, r);
            });
          }

          return { changes, timestamp };
        }
      },
      pushChanges: async ({ changes, lastPulledAt }: SyncPushArgs) => {
        // Axios automatically stringifies the body
        await api.post('/push', {
          changes,
          last_pulled_at: lastPulledAt,
        });
      },
      migrationsEnabledAtVersion: 1,
      unsafeTurbo: true,
      sendCreatedAsUpdated: true,
    });

    console.log('Sync successful. Diagnostics:', logger.formattedLogs);
  } catch (error: any) {
    // Axios errors contain more detail in the 'response' object
    const errorMessage = error.response?.data || error.message;
    console.error('Sync failed:', errorMessage);
    console.log('Failure Diagnostics:', logger.formattedLogs);
  }
}