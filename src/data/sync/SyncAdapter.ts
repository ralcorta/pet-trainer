/**
 * Stub for future cloud sync per user.
 * Repositories write locally; a future adapter can push/pull by userId.
 */
export interface SyncAdapter {
  pull(userId: string): Promise<void>
  push(userId: string): Promise<void>
}

export class NoopSyncAdapter implements SyncAdapter {
  async pull(_userId: string): Promise<void> {
    // Cloud sync not wired yet
  }

  async push(_userId: string): Promise<void> {
    // Cloud sync not wired yet
  }
}

export const syncAdapter: SyncAdapter = new NoopSyncAdapter()
