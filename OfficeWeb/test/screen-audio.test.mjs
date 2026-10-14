import test from 'node:test';
import assert from 'node:assert/strict';
import { loadMedia } from './media-test-loader.mjs';
import { screenSources } from '../livekit.mjs';
const { syncScreenAudio, unpublishScreen, publishPrivateScreen } = loadMedia('screenAudio');
function track(kind = 'audio') {
  return { kind, readyState: 'live', stopped: false,
    clone() { return track(kind); }, stop() { this.stopped = true; this.readyState = 'ended'; } };
}
function fixture() {
  const publications = new Map();
  const room = { state: 'connected', localParticipant: {
    permissions: { canPublish: true, canPublishSources: [2, 3, 4] },
    getTrackPublication: source => publications.get(source),
    async publishTrack(mediaStreamTrack, options) {
      const publication = { track: { mediaStreamTrack,
        async replaceTrack(next) { this.mediaStreamTrack = next; } }, options };
      publications.set(options.source, publication); return publication;
    },
    async unpublishTrack(local) {
      for (const [source, p] of publications) if (p.track === local) {
        local.mediaStreamTrack.stop(); publications.delete(source);
      }
    },
  } };
  return { room, publications };
}
test('private sharing publishes video and stereo audio separately, stop retains microphone', async () => {
  const { room, publications } = fixture();
  const video = track('video'), audio = track();
  await room.localParticipant.publishTrack(track(), { source: 'microphone' });
  await publishPrivateScreen(room, { getVideoTracks: () => [video], getAudioTracks: () => [audio] }, () => true, () => {});
  assert.deepEqual([...publications.keys()], ['microphone', 'screen_share', 'screen_share_audio']);
  const sent = publications.get('screen_share_audio');
  assert.notEqual(sent.track.mediaStreamTrack, audio);
  assert.equal(sent.options.forceStereo, true);
  await unpublishScreen(room);
  assert.deepEqual([...publications.keys()], ['microphone']);
  assert.equal(sent.track.mediaStreamTrack.stopped, true);
  assert.equal(audio.stopped, false, 'another room may still use the capture');
});
test('switch replaces audio; switching to silent capture removes old audio', async () => {
  const { room, publications } = fixture();
  await syncScreenAudio(room, track());
  const previous = publications.get('screen_share_audio').track.mediaStreamTrack;
  await syncScreenAudio(room, track());
  assert.equal(previous.stopped, true);
  assert.equal(publications.size, 1);
  await syncScreenAudio(room);
  assert.equal(publications.size, 0);
});
test('failed audio publication stops its clone without stopping capture', async () => {
  const { room } = fixture(); const source = track(); let clone;
  room.localParticipant.publishTrack = async t => { clone = t; throw Error('denied'); };
  await assert.rejects(syncScreenAudio(room, source), /denied/);
  assert.equal(clone.stopped, true); assert.equal(source.stopped, false);
});
test('only screen owner gets both video and audio permission', () => {
  assert.deepEqual(screenSources('a', ['a']), [2, 3, 4]);
  assert.deepEqual(screenSources('b', ['a']), [2]);
  assert.deepEqual(screenSources('a', []), [2]);
});
