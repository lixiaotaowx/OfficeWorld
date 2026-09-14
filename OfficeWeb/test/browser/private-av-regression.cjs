const { chromium } = require("./playwright.cjs");
const assert = require('node:assert/strict');
const fs = require('node:fs');
const BASE = 'http://127.0.0.1:3200';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true,
    args: ['--autoplay-policy=no-user-gesture-required'] });
  const evidence = { checks: [], errors: [], samples: [], input: 'synthetic oscillator/canvas; real VPS SFU' };
  const check = name => { evidence.checks.push(name); console.log('PASS', name); };
  const pages = [];
  try {
    for (const label of ['A', 'B', 'C']) {
      const context = await browser.newContext();
      const response = await context.request.post(BASE + '/api/auth/register', {
        headers: { origin: BASE }, data: { name: `PAV-${label}-${Date.now()}`, password: 'qa' },
      });
      assert.equal(response.status(), 200);
      await context.addInitScript(() => {
        window.__pcs = []; window.__captures = []; window.__microphones = [];
        window.__denyMic = false; window.__denyScreen = false;
        const PC = window.RTCPeerConnection;
        window.RTCPeerConnection = class extends PC {
          constructor(...args) { super(...args); window.__pcs.push(this); }
        };
        navigator.mediaDevices.getUserMedia = async () => {
          if (window.__denyMic) throw new DOMException('test permission denial', 'NotAllowedError');
          const audio = new AudioContext(); await audio.resume();
          const oscillator = audio.createOscillator(), gain = audio.createGain();
          gain.gain.value = .12;
          const output = audio.createMediaStreamDestination();
          oscillator.connect(gain).connect(output); oscillator.start();
          window.__microphones.push(output.stream); return output.stream;
        };
        navigator.mediaDevices.getDisplayMedia = async () => {
          if (window.__denyScreen) throw new DOMException('test chooser cancel', 'NotAllowedError');
          const canvas = document.createElement('canvas'); canvas.width = 800; canvas.height = 600;
          const ctx = canvas.getContext('2d');
          setInterval(() => { ctx.fillStyle = '#2d6348'; ctx.fillRect(0, 0, 800, 600);
            ctx.fillStyle = 'white'; ctx.font = '30px sans-serif'; ctx.fillText(Date.now(), 20, 100); }, 100);
          const stream = canvas.captureStream(12); window.__captures.push(stream); return stream;
        };
        window.__stats = async () => {
          const rows = [];
          for (const pc of window.__pcs) {
            if (pc.connectionState === 'closed') continue;
            for (const stat of (await pc.getStats()).values()) {
              if (stat.type === 'inbound-rtp') rows.push({ kind: stat.kind, bytes: stat.bytesReceived,
                energy: stat.totalAudioEnergy || 0, frames: stat.framesDecoded || 0 });
            }
          }
          return rows;
        };
      });
      await context.route(BASE + '/qa-harness', route => route.fulfill({ contentType: 'text/html',
        body: '<html><body><script src="/qa-harness.js"></script></body></html>' }));
      await context.route(BASE + '/qa-harness.js', route => route.fulfill({
        path: 'Build/media-harness.js', contentType: 'text/javascript',
      }));
      const page = await context.newPage();
      page.on('pageerror', error => evidence.errors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error' && /PC manager|publisher|negotiation timed out/.test(message.text()))
          evidence.errors.push(message.text());
      });
      await page.goto(BASE + '/qa-harness');
      await page.waitForFunction(() => window.qa?.s.connected);
      pages.push(page);
    }
    const [a, b, c] = pages;
    const ids = await Promise.all(pages.map(page => page.evaluate(() => window.qa.s.id)));
    async function received(page, kind) {
      const deadline = Date.now() + 40000;
      while (Date.now() < deadline) {
        const rows = await page.evaluate(() => window.__stats());
        if (rows.some(row => row.kind === kind && (kind === 'audio' ? row.energy > 0 : row.frames > 5))) {
          evidence.samples.push(rows); return;
        }
        await page.waitForTimeout(250);
      }
      throw Error('No received ' + kind + ': ' + JSON.stringify(await page.evaluate(() => ({
        notices: window.qa.notices, status: window.qa.media.privateVoiceStatus(),
        rooms: window.qa.media.connections.values().map(([name, room]) => ({name, state: room.state, peers: room.remoteParticipants.size})),
      }))));
    }
    async function invite(page, target, kind, offer = false) {
      await page.evaluate(data => window.qa.s.emit('request', data), { target, kind, offer });
      await page.waitForFunction(peer => [...window.qa.sessions.values()].some(s => s.peer === peer), target);
    }
    await invite(a, ids[1], 'voice');
    await received(a, 'audio'); await received(b, 'audio');
    const original = await a.evaluate(() => [...window.qa.sessions.values()][0]);
    check('voice-only call sends bidirectional audio without screen capture');
    assert.equal(await a.evaluate(() => window.__captures.length), 0);
    const sourceDenied = await a.evaluate(async () => {
      const track = (await navigator.mediaDevices.getDisplayMedia({video:true})).getVideoTracks()[0];
      const room = window.qa.media.connections.values()[0][1];
      try { await room.localParticipant.publishTrack(track, {source:'screen_share'}); return false; }
      catch { return true; }
      finally { track.stop(); }
    });
    assert.equal(sourceDenied, true);
    check('real SFU refuses an unconsented screen publication in a voice-only call');
    await a.evaluate(() => window.qa.media.toggleMute(true));
    await a.evaluate(() => window.qa.media.startScreen(false));
    await invite(b, ids[0], 'screen');
    await received(b, 'video');
    const upgraded = await a.evaluate(() => [...window.qa.sessions.values()][0]);
    assert.equal(upgraded.id, original.id); assert.equal(upgraded.room, original.room);
    assert.equal(await a.evaluate(() => window.qa.media.privateVoiceStatus()), '已静音');
    assert.equal(await a.evaluate(() => window.qa.media.connections.values().length), 1);
    check('request-view direction upgrades same voice room, preserves manual mute, receives video');
    await a.evaluate(() => window.qa.media.toggleMute(false));
    await a.evaluate(() => window.qa.media.stopScreen());
    await b.waitForFunction(() => window.qa.videos.size === 0);
    assert.equal(await b.evaluate(() => window.qa.sessions.size), 1);
    await a.evaluate(id => window.qa.s.emit('end', id), original.id);
    await b.waitForFunction(() => window.qa.sessions.size === 0);
    check('stop-screen keeps voice; hangup removes the call');

    await a.evaluate(() => { window.__denyMic = true; });
    await b.evaluate(() => window.qa.media.startScreen(false));
    await invite(b, ids[0], 'screen', true);
    await received(a, 'video'); await received(a, 'audio');
    await a.waitForFunction(() => window.qa.media.privateVoiceStatus() === '等待授权或开启失败');
    assert.equal(await a.evaluate(() => window.qa.sessions.size), 1);
    check('offer-screen direction retains video after simulated microphone denial and reports failure');
    await a.evaluate(() => { window.__denyMic = false; return window.qa.media.toggleMute(false); });
    await received(b, 'audio');
    check('microphone retry restores bidirectional voice');
    await invite(b, ids[2], 'screen', true);
    await received(c, 'audio'); await received(c, 'video');
    const rooms = await b.evaluate(() => window.qa.media.connections.values().map(([name, room]) => ({
      name, peers: room.remoteParticipants.size, mic: room.localParticipant.isMicrophoneEnabled,
    })));
    console.log("ROOMS", JSON.stringify(rooms));
    assert.equal(rooms.length, 2); assert.equal(rooms.filter(room => room.mic).length, 1);
    assert.ok(rooms.every(room => room.peers === 1));
    const ab = await a.evaluate(() => [...window.qa.sessions.values()][0]);
    const denied = await c.evaluate(room => window.qa.s.timeout(3000).emitWithAck('livekit-token', room), ab.room);
    assert.ok(denied.error);
    check('two viewers use distinct pair rooms, one microphone destination, third party denied');

    const meeting = await a.evaluate(() => window.qa.s.timeout(5000).emitWithAck('meeting-action', {
      action: 'create', title: 'Private media isolation QA', microphone: false, invitees: [],
    }));
    assert.equal(meeting.ok, true);
    // The meeting-room name follows the authenticated meeting id.
    await a.evaluate(id => window.qa.media.joinMeeting('meeting-' + id, true), meeting.id);
    await a.waitForFunction(() => window.qa.media.meetingStatus().mic);
    assert.equal(await a.evaluate(() => window.qa.media.privateVoiceStatus()), '声音已暂停');
    assert.equal(await a.evaluate(() => window.qa.media.connections.values().filter(([, room]) =>
      room.localParticipant.isMicrophoneEnabled).length), 1);
    await a.evaluate(() => window.qa.media.toggleMute(false));
    assert.equal(await a.evaluate(() => window.qa.media.meetingStatus().mic), false);
    check('meeting/private audio focus mutes the previous destination');
    await a.evaluate(id => window.qa.s.emit('meeting-action', { action: 'end', id }, () => {}), meeting.id);
    await a.evaluate(() => window.qa.media.leaveMeeting());

    await a.evaluate(() => {
      for (const [, room] of window.qa.media.connections.values()) {
        const track = room.localParticipant.getTrackPublication('microphone')?.track?.mediaStreamTrack;
        if (track) { track.stop(); track.dispatchEvent(new Event('ended')); }
      }
    });
    await a.waitForFunction(() => window.qa.media.privateVoiceStatus() !== '已开启');
    await a.evaluate(() => window.qa.media.toggleMute(false));
    await a.waitForFunction(() => window.qa.media.privateVoiceStatus() === '已开启');
    check('simulated microphone track loss reports unavailable and can reacquire');
    await b.evaluate(() => window.qa.media.stopScreen());
    for (const page of [a, c]) await page.waitForFunction(() => window.qa.videos.size === 0);
    assert.equal(await b.evaluate(() => window.qa.sessions.size), 2);
    check('stop shared capture removes video from both authorized viewers, keeps each voice session');
    await b.context().setOffline(true);
    console.log('WAIT long network interruption: 55 seconds');
    await b.waitForTimeout(55000);
    assert.equal(await b.evaluate(() => window.qa.sessions.size), 0);
    for (const page of [a, c]) await page.waitForFunction(() => window.qa.sessions.size === 0);
    await b.context().setOffline(false);
    await b.waitForFunction(() => window.qa.s.connected, null, {timeout:30000});
    await b.evaluate(() => window.qa.media.startScreen(false));
    for (const page of pages) await page.waitForFunction(() => window.qa.s.connected);
    const recoveredIds = await Promise.all(pages.map(page => page.evaluate(() => window.qa.s.id)));
    console.log('RECOVERED', JSON.stringify(recoveredIds));
    await invite(b, recoveredIds[0], 'screen', true);
    await received(a, 'video'); await received(a, 'audio'); await received(b, 'audio');
    check('55-second network outage clears obsolete calls; fresh consent after reconnect restores audio/video');
    for (const page of pages) await page.evaluate(() => {
      for (const id of window.qa.sessions.keys()) window.qa.s.emit('end', id);
    });
    for (const page of pages) await page.waitForFunction(() => window.qa.sessions.size === 0);
    assert.deepEqual(evidence.errors, []);
    check('all calls hang up without page or media negotiation exceptions');
  } finally {
    evidence.finalConnections = await Promise.all(pages.map(page => page.evaluate(() => ({connected:window.qa?.s.connected,id:window.qa?.s.id})).catch(()=>null)));
    for (const page of pages) evidence.notices = [...(evidence.notices || []),
      await page.evaluate(() => window.qa?.notices || []).catch(() => [])];
    fs.writeFileSync('Build/private-av-evidence.json', JSON.stringify(evidence, null, 2));
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

