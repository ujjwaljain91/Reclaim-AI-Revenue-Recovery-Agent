// ─── Idempotency Registry ────────────────────────────────────────────────────
// Prevents duplicate recovery actions from being triggered by the same event.
// Uses an in-memory Set for the buildathon demo. In production this would be
// a persistent store (Redis / DB).

export interface IdempotencyResult {
  isNew: boolean;
  message: string;
}

export class IdempotencyRegistry {
  private processedEventIds: Set<string> = new Set();

  registerEvent(eventId: string): IdempotencyResult {
    if (this.processedEventIds.has(eventId)) {
      return {
        isNew: false,
        message: `Duplicate event detected: ${eventId}. No duplicate action will be created.`,
      };
    }
    this.processedEventIds.add(eventId);
    return {
      isNew: true,
      message: `Event ${eventId} registered for processing.`,
    };
  }

  isDuplicate(eventId: string): boolean {
    return this.processedEventIds.has(eventId);
  }

  getProcessedIds(): Set<string> {
    return new Set(this.processedEventIds);
  }

  getProcessedCount(): number {
    return this.processedEventIds.size;
  }

  // Expose for policy gate integration
  getRegistry(): Set<string> {
    return this.processedEventIds;
  }
}

export const idempotencyRegistry = new IdempotencyRegistry();
