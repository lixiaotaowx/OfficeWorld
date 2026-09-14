const { test } = require('node:test');
const assert = require('node:assert/strict');
const { trusted, microphoneOnly } = require('../policy.cjs');

test('only the authoritative HTTPS origin is trusted', () => {
  assert.equal(trusted('https://115.159.43.237/'), true);
  assert.equal(trusted('https://115.159.43.237/api/auth/me'), true);
  for (const url of ['http://115.159.43.237/', 'https://115.159.43.237.evil.test/',
    'https://115.159.43.237:444/', 'file:///tmp/example.html', 'invalid']) assert.equal(trusted(url), false);
});

test('app authorization grants audio only and rejects camera/unknown requests', () => {
  assert.equal(microphoneOnly(['audio']), true);
  for (const types of [['video'], ['audio', 'video'], [], undefined, ['unknown']]) {
    assert.equal(microphoneOnly(types), false);
  }
});
