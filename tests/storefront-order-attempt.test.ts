import test from 'node:test';
import assert from 'node:assert/strict';
import { canReviseOrderAttempt } from '../apps/storefront/ui/order-attempt';

test('ambiguous responses retain the original order payload and key', () => {
  for (const status of [400, 401, 403, 408, 409, 422, 429, 500, 502, 503]) {
    assert.equal(canReviseOrderAttempt(status, undefined), false, `HTTP ${status}`);
    assert.equal(canReviseOrderAttempt(status, 'IDEMPOTENCY_CONFLICT'), false);
  }
});

test('only post-idempotency business rejections allow revising the request', () => {
  for (const code of ['ORDERING_PAUSED', 'EDITION_UNAVAILABLE', 'INSUFFICIENT_STOCK']) {
    assert.equal(canReviseOrderAttempt(409, code), true);
    assert.equal(canReviseOrderAttempt(429, code), false);
    assert.equal(canReviseOrderAttempt(500, code), false);
  }
  assert.equal(canReviseOrderAttempt(409, 'UNRECOGNIZED_REASON'), false);
  assert.equal(canReviseOrderAttempt(409, { code: 'INSUFFICIENT_STOCK' }), false);
});
