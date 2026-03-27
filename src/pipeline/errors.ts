export type SlotErrorKind =
  | 'DECODE_FAILED'      // createImageBitmap rejected — fichier corrompu
  | 'ENCODE_FAILED'      // canvas.convertToBlob rejected
  | 'TIMEOUT'            // Worker > 10s sans réponse
  | 'TRANSFER_FAILED';   // MessageChannel error

export type SystemErrorKind =
  | 'WORKER_DEAD'        // Worker a crashé (onerror non récupérable)
  | 'OOM_GLOBAL'         // navigator.deviceMemory heuristic breach
  | 'PDF_CORRUPT';       // pdf-lib embedJpg rejected sur tous les slots

export class SlotError extends Error {
  public readonly slotId: string;
  public readonly kind: SlotErrorKind;

  constructor(
    slotId: string,
    kind: SlotErrorKind,
    message: string
  ) {
    super(message);
    this.slotId = slotId;
    this.kind = kind;
    this.name = 'SlotError';
  }
}

export class SystemError extends Error {
  public readonly kind: SystemErrorKind;

  constructor(
    kind: SystemErrorKind,
    message: string
  ) {
    super(message);
    this.kind = kind;
    this.name = 'SystemError';
  }
}
