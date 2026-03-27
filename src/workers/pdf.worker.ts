/// <reference lib="webworker" />
import { computeTargetDimensions, estimateCanvasRamBytes } from '../lib/imageMath';
import type { TransformConfig } from '../lib/imageMath';
import type { SlotErrorKind } from '../pipeline/errors';

// Contrat de réponse Worker → Main Thread
export type WorkerResponse =
  | { ok: true;  buffer: ArrayBuffer }
  | { ok: false; errorKind: SlotErrorKind; message: string };

interface WorkerMessage {
  slotId: string;
  file: File;
  config: TransformConfig;
  port: MessagePort;
}

// Global scope in a worker is `self`
const ctx = self as unknown as Worker;

ctx.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { file, config, port } = e.data;

  const reply = (response: WorkerResponse, transferables: Transferable[] = []) => {
    port.postMessage(response, transferables);
    port.close();
  };

  let bitmap: ImageBitmap | null = null;

  try {
    // 1. Décodage hardware-accelerated
    // On pourrait ajouter un guard HEIC ici en Phase 2
    bitmap = await createImageBitmap(file);

    // 2. Calcul dimensions A4-aware
    const { width, height } = computeTargetDimensions(
      bitmap.width,
      bitmap.height,
      config.pageFormat,
      config.targetDpi
    );

    // 3. Guard OOM — avant toute allocation Canvas
    const estimatedBytes = estimateCanvasRamBytes(width, height);
    if (estimatedBytes > 50_000_000) {
      bitmap.close();
      reply({
        ok: false,
        errorKind: 'ENCODE_FAILED',
        message: `Canvas allocation refused: ${Math.round(estimatedBytes / 1_000_000)}MB > 50MB limit`,
      });
      return;
    }

    // 4. Rendu OffscreenCanvas
    const canvas = new OffscreenCanvas(width, height);
    const canvasContext = canvas.getContext('2d');
    if (!canvasContext) {
      bitmap.close();
      reply({ ok: false, errorKind: 'ENCODE_FAILED', message: 'OffscreenCanvas context unavailable' });
      return;
    }

    canvasContext.drawImage(bitmap, 0, 0, width, height);
    bitmap.close(); // ← kill switch : libère les octets originaux ICI
    bitmap = null;

    // 5. Encodage JPEG
    const blob = await canvas.convertToBlob({
      type: 'image/jpeg',
      quality: config.jpegQuality,
    });
    const buffer = await blob.arrayBuffer();

    // 6. Transfert zéro-copie
    reply({ ok: true, buffer }, [buffer]);

  } catch (err) {
    // Filet de sécurité global — bitmap.close() si exception inattendue
    if (bitmap) {
      bitmap.close();
    }

    const isDomException = err instanceof DOMException;
    reply({
      ok: false,
      errorKind: isDomException ? 'DECODE_FAILED' : 'ENCODE_FAILED',
      message: err instanceof Error ? err.message : String(err),
    });
  }
};
