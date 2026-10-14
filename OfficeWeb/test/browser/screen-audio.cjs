// Isolated business server over the existing QA tunnel, real VPS LiveKit SFU.
// Synthetic inputs: never call real users or capture their microphone/desktop.
const { chromium } = require('./playwright.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const BASE = 'http://127.0.0.1:3200';
const output = path.resolve(__dirname, '../../../Build/screen-audio-evidence.json');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true,
    args: ['--autoplay-policy=no-user-gesture-required'] });
  const evidence = { checks: [], errors: [], input: 'synthetic canvas + oscillator; real VPS SFU' };
  const check = name => { evidence.checks.push(name); console.log('PASS', name); };
  const pages = [];
  try {
    for (const label of ['a', 'b']) {
      const ctx = await browser.newContext();
      const reply = await ctx.request.post(BASE + '/api/auth/register', {
        headers: { origin: BASE }, data: { name: `AudioQA-${label}-${Date.now()}`, password: 'qa' },
      });
      assert.equal(reply.status(), 200);
      await ctx.addInitScript(() => {
        window.__captures = []; window.__silentShare = false;
        const sound = async (frequency, gain = .15) => {
          const ac = new AudioContext(); await ac.resume();
          const osc = ac.createOscillator(), volume = ac.createGain(), dest = ac.createMediaStreamDestination();
          osc.frequency.value = frequency; volume.gain.value = gain;
          osc.connect(volume).connect(dest); osc.start(); return dest.stream;
        };
        navigator.mediaDevices.getUserMedia = () => sound(220, 0);
        navigator.mediaDevices.getDisplayMedia = async () => {
          const c = document.createElement('canvas'); c.width = 640; c.height = 360;
          const x = c.getContext('2d');
          setInterval(() => { x.fillStyle = 'green'; x.fillRect(0, 0, 640, 360);
            x.fillStyle = 'white'; x.fillText(Date.now(), 10, 30); }, 100);
          const stream = c.captureStream(10);
          if (!window.__silentShare) stream.addTrack((await sound(660)).getAudioTracks()[0]);
          window.__captures.push(stream); return stream;
        };
        window.__sharedAudio = () => {
          for (const [, room] of window.qa.media.connections.values()) {
            for (const person of room.remoteParticipants.values()) {
              const p = person.getTrackPublication('screen_share_audio');
              if (p?.track) return p.track;
            }
          }
        };
        window.__energy = async () => {
          const track = window.__sharedAudio(); if (!track) return 0;
          const ac = new AudioContext(); await ac.resume();
          const source = ac.createMediaStreamSource(new MediaStream([track.mediaStreamTrack]));
          const analyser = ac.createAnalyser(); source.connect(analyser);
          await new Promise(r => setTimeout(r, 250));
          const samples = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(samples);
          const rms = Math.sqrt(samples.reduce((sum, n) => sum + n * n, 0) / samples.length);
          source.disconnect(); await ac.close(); return rms;
        };
      });
      await ctx.route(BASE + '/qa-audio', r => r.fulfill({ contentType: 'text/html',
        body: '<html><body><script src="/qa-audio.js"></script></body></html>' }));
      await ctx.route(BASE + '/qa-audio.js', r => r.fulfill({ contentType: 'text/javascript',
        path: path.resolve(__dirname, '../../../Build/screen-audio-harness.js') }));
      const p = await ctx.newPage(); p.on('pageerror', e => evidence.errors.push(e.message));
      await p.goto(BASE + '/qa-audio'); await p.waitForFunction(() => window.qa?.s.connected);
      pages.push(p);
    }
    const [a, b] = pages;
    const bid = await b.evaluate(() => window.qa.s.id);
    await a.evaluate(id => window.qa.s.emit('request', { target: id, kind: 'voice' }), bid);
    for (const p of pages) await p.waitForFunction(() => window.qa.media.privateVoiceStatus() === '已开启');
    await a.evaluate(() => window.qa.media.shareInCall([...window.qa.sessions.keys()][0]));
    async function audible(p) {
      await p.waitForFunction(async () => await window.__energy() > .01, null, { timeout: 35000 });
      await p.waitForFunction(() => [...document.querySelectorAll('audio')].some(e => !e.muted && !e.paused));
    }
    await audible(b); check('private screen audio decoded with nonzero energy and active playback');
    await a.evaluate(() => window.qa.media.toggleMute(true));
    await audible(b); check('microphone mute leaves screen audio audible');
    await a.evaluate(() => window.qa.media.switchScreenDisplay());
    await audible(b); check('private display switch retains audible screen audio');
    await a.evaluate(() => { window.__silentShare = true; return window.qa.media.switchScreenDisplay(); });
    await b.waitForFunction(() => !window.__sharedAudio());
    check('silent replacement removes old shared audio');
    await a.evaluate(() => { window.__silentShare = false; return window.qa.media.switchScreenDisplay(); });
    await audible(b); check('switching back publishes shared audio again');
    await a.evaluate(() => window.qa.media.stopScreen());
    await b.waitForFunction(() => !window.__sharedAudio());
    assert.equal(await a.evaluate(() => window.qa.sessions.size), 1);
    check('stopping private share removes screen audio and preserves call');
    const account = await b.request.get(BASE + '/api/auth/me');
    const buser = await account.json();
    const created = await a.evaluate(invitee => window.qa.s.timeout(5000).emitWithAck('meeting-action', {
      action: 'create', title: 'Screen audio isolated QA', invitees: [invitee],
    }), buser.user?.id || buser.account?.id || buser.id);
    assert.equal(created.ok, true);
    const joined = await b.evaluate(id => window.qa.s.timeout(5000).emitWithAck('meeting-action', {
      action: 'accept', id,
    }), created.id);
    assert.equal(joined.ok, true, JSON.stringify(joined));
    const room = 'meeting-' + created.id;
    for (const p of pages) await p.evaluate(name => window.qa.media.joinMeeting(name, false), room);
    await a.evaluate(name => window.qa.media.meetingScreens.start(name), room);
    await audible(b); check('meeting screen audio decoded through SFU');
    await a.evaluate(() => window.qa.media.switchScreenDisplay());
    await audible(b); check('meeting display switch retains screen audio');
    await b.evaluate(name => window.qa.media.meetingScreens.start(name), room);
    await audible(a);
    await b.waitForFunction(() => !window.__sharedAudio());
    check('meeting takeover removes previous sharer audio and plays new sharer');
    await b.evaluate(name => window.qa.media.meetingScreens.stop(name), room);
    await a.waitForFunction(() => !window.__sharedAudio());
    check('meeting stop removes shared audio');
    assert.deepEqual(evidence.errors, []);
  } finally {
    for (const p of pages) await p.evaluate(() => { window.qa?.media.dispose(); window.qa?.s.disconnect(); }).catch(() => {});
    fs.writeFileSync(output, JSON.stringify(evidence, null, 2)); await browser.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
