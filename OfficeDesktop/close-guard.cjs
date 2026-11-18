'use strict';

// Decides what closing the main window may do. The main window is the only
// owner of LiveKit, capture and audio, so destroying it while anything below is
// true would cut a call or lose a transfer. Every input is a fact the main
// process owns or receives directly; anything unknown counts as a blocker.

const ACTIVE_TRANSFER = new Set(['sending', 'receiving']);

/** Work visible in the host snapshot that needs the main window to exist. */
function snapshotBlockers(state) {
  if (!state || typeof state !== 'object') return ['no-state'];
  const reasons = [];
  const calls = state.calls || {};
  if (calls.sessions?.length) reasons.push('call');
  if (calls.requests?.length) reasons.push('incoming-request');
  if (calls.outgoing?.length) reasons.push('outgoing-request');
  const meetings = state.meetings || {};
  if (meetings.active) reasons.push('meeting');
  if (meetings.invitations?.length) reasons.push('meeting-invitation');
  if (state.files?.transfers?.some(row => ACTIVE_TRANSFER.has(row?.status))) reasons.push('transfer');
  return reasons;
}

/**
 * Every reason the main window must stay alive; an empty list means it is safe
 * to destroy it and leave the comms host alone in the background.
 */
function closeBlockers(input = {}) {
  const reasons = [];
  if (input.hostEnabled !== true) reasons.push('host-disabled');
  const health = input.health || {};
  if (health.alive !== true) reasons.push('host-not-alive');
  if (health.connected !== true) reasons.push('host-disconnected');
  if (health.stale !== false) reasons.push('host-stale');
  if (input.forced === true) reasons.push('test-busy');
  if (input.mediaActive !== false) reasons.push('media');
  const handles = input.handles || {};
  if (handles.sends > 0 || handles.receives > 0) reasons.push('file-handles');
  reasons.push(...snapshotBlockers(input.snapshot));
  return reasons;
}

/**
 * Tracks whether the main window's media owner (LiveKit rooms, screen capture,
 * microphone) is doing anything. A page that has not reported since it started
 * loading is unknown, which blocks; a window that does not exist owns nothing.
 */
function createMediaFlag() {
  let active = null;
  return {
    report(value) { active = value === true; },
    /** The page is navigating or its renderer died: whatever it held is gone, the next page must report again. */
    unknown() { active = null; },
    /** No main window exists, so nothing can be capturing or connected. */
    none() { active = false; },
    active: () => active !== false,
  };
}

module.exports = { snapshotBlockers, closeBlockers, createMediaFlag };
