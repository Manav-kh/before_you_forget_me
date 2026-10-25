// The server emits these codes only after checking that this idempotency key
// has no saved order. HTTP status alone cannot prove a previous attempt failed.
const definitiveRejections = new Set([
  'ORDERING_PAUSED',
  'EDITION_UNAVAILABLE',
  'INSUFFICIENT_STOCK',
]);

export function canReviseOrderAttempt(status: number, code: unknown): boolean {
  return status === 409 && typeof code === 'string' && definitiveRejections.has(code);
}
