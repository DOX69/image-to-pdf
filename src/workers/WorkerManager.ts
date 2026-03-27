import type { TransformConfig } from '../lib/imageMath';
import type { WorkerResponse } from './pdf.worker';
import { SlotError, SystemError } from '../pipeline/errors';

interface WorkerMessage {
  slotId: string;
  file: File;
  config: TransformConfig;
  port: MessagePort;
}

const RESTART_TRIGGERS = {
  CONSECUTIVE_TIMEOUTS: 3,
  SLOTS_PER_REFRESH: 50,
  TIMEOUT_MS: 10_000,
} as const;

export class WorkerManager {
  private worker: Worker | null = null;
  private consecutiveTimeouts = 0;
  private totalProcessed = 0;
  private isDead = false;

  // ─── Cycle de vie ────────────────────────────────────────────────

  private spawn(): Worker {
    const w = new Worker(
      new URL('./pdf.worker.ts', import.meta.url),
      { type: 'module' }
    );
    w.onerror = (e) => {
      console.error('[WorkerManager] Fatal worker error:', e.message);
      this.isDead = true;
    };
    return w;
  }

  private restart(reason: string): void {
    console.warn(`[WorkerManager] Restart — ${reason}`);
    this.worker?.terminate();
    this.worker = this.spawn();
    this.consecutiveTimeouts = 0;
    this.isDead = false;
    // totalProcessed volontairement NON remis à zéro
    // → le compteur /50 reste cohérent sur toute la session
  }

  private getOrSpawn(): Worker {
    if (!this.worker || this.isDead) {
      this.worker = this.spawn();
      this.isDead = false;
    }
    return this.worker;
  }

  terminate(): void {
    this.worker?.terminate();
    this.worker = null;
    this.consecutiveTimeouts = 0;
    this.totalProcessed = 0;
    this.isDead = false;
  }

  // ─── Transform ───────────────────────────────────────────────────

  async transform(
    slotId: string,
    file: File,
    config: TransformConfig
  ): Promise<Uint8Array> {
    // Guard : restart préventif tous les 50 slots
    if (this.totalProcessed > 0 && this.totalProcessed % RESTART_TRIGGERS.SLOTS_PER_REFRESH === 0) {
      this.restart(`preventive refresh at slot ${this.totalProcessed}`);
    }

    // Guard : Worker mort détecté avant le slot
    if (this.isDead) {
      this.restart('WORKER_DEAD detected before transform');
    }

    const worker = this.getOrSpawn();
    const { port1, port2 } = new MessageChannel();

    const transformPromise = new Promise<Uint8Array>((resolve, reject) => {
      port1.onmessage = (e: MessageEvent<WorkerResponse>) => {
        port1.close();
        const response = e.data;
        if (response.ok) {
          resolve(new Uint8Array(response.buffer));
        } else {
          reject(new SlotError(slotId, response.errorKind, response.message));
        }
      };
      port1.onmessageerror = (e) => {
        port1.close();
        reject(new SlotError(slotId, 'TRANSFER_FAILED', `MessagePort error: ${e}`));
      };
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new SlotError(slotId, 'TIMEOUT', `Slot exceeded ${RESTART_TRIGGERS.TIMEOUT_MS}ms`)),
        RESTART_TRIGGERS.TIMEOUT_MS
      )
    );

    const message: WorkerMessage = { slotId, file, config, port: port2 };
    worker.postMessage(message, [port2]); // port2 transféré → plus accessible ici

    try {
      const result = await Promise.race([transformPromise, timeoutPromise]);
      this.consecutiveTimeouts = 0;
      this.totalProcessed++;
      return result;

    } catch (err) {
      if (err instanceof SlotError && err.kind === 'TIMEOUT') {
        this.consecutiveTimeouts++;

        if (this.consecutiveTimeouts >= RESTART_TRIGGERS.CONSECUTIVE_TIMEOUTS) {
          this.restart(`${this.consecutiveTimeouts} consecutive timeouts`);

          // Si on a déjà restarté et qu'on timeout encore → SystemError fatale
          if (this.consecutiveTimeouts >= RESTART_TRIGGERS.CONSECUTIVE_TIMEOUTS * 2) {
            throw new SystemError('WORKER_DEAD', 'Worker unresponsive after restart');
          }
        }
      }
      throw err; // SlotError propagée à l'orchestrateur
    }
  }
}

// Singleton exporté — une seule instance par session
export const workerManager = new WorkerManager();
