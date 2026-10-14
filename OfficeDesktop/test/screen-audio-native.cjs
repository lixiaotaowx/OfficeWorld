// Hidden isolated Electron; real Windows loopback, no recording is saved.
const { app, BrowserWindow, session } = require('electron');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
const report = { checks: [], errors: [] };
app.whenReady().then(async () => {
  const ses = session.fromPartition('screen-audio-native-qa');
  ses.protocol.handle('https', () => new Response('<html><body>Screen audio QA</body></html>', {
    headers: { 'content-type': 'text/html' },
  }));
  const win = new BrowserWindow({ show: false, webPreferences: {
    session: ses, sandbox: true, contextIsolation: true, backgroundThrottling: false,
  } });
  let captureNumber = 0;
  require('../permissions.cjs').configurePermissions({
    setPermissionCheckHandler: fn => ses.setPermissionCheckHandler(fn),
    setPermissionRequestHandler: fn => ses.setPermissionRequestHandler(fn),
    setDisplayMediaRequestHandler: fn => ses.setDisplayMediaRequestHandler((request, callback) => {
      fn(request, value => callback(captureNumber++ === 0 ? { ...value, audio: 'loopback' } : value));
    }),
  }, () => win, {
    displays: { source: async () => win.webContents.mainFrame },
  });
  await win.loadURL('https://115.159.43.237/');
  const result = await win.webContents.executeJavaScript(`(async () => {
    const ac = new AudioContext(); await ac.resume();
    const osc = ac.createOscillator(), gain = ac.createGain();
    gain.gain.value = .025; osc.frequency.value = 880;
    osc.connect(gain).connect(ac.destination); osc.start();
    const samples = [];
    for (const restrictOwnAudio of [false, true]) {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true,
        audio: { restrictOwnAudio, echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const audio = stream.getAudioTracks()[0];
      if (!audio) throw Error('No system loopback track');
      const node = ac.createMediaStreamSource(new MediaStream([audio])), analyser = ac.createAnalyser();
      node.connect(analyser);
      await new Promise(r => setTimeout(r, 1500));
      const data = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(data);
      const spectrum = new Float32Array(analyser.frequencyBinCount); analyser.getFloatFrequencyData(spectrum);
      const band = frequency => {
        const bin = Math.round(frequency * analyser.fftSize / ac.sampleRate);
        return Math.max(...spectrum.slice(bin - 1, bin + 2));
      };
      samples.push({ restrictOwnAudio, tracks: stream.getAudioTracks().length,
        ownDb: band(880), externalDb: band(440),
        rms: Math.sqrt(data.reduce((v, n) => v + n*n, 0) / data.length), settings: audio.getSettings() });
      node.disconnect(); stream.getTracks().forEach(t => t.stop());
      if (stream.getTracks().some(t => t.readyState !== 'ended')) throw Error('Capture leaked');
    }
    osc.stop(); await ac.close(); return samples;
  })()`, true);
  report.checks = result;
  assert.ok(result[0].rms > .001, 'Windows loopback must contain the test sound');
  assert.ok(result[1].ownDb < result[0].ownDb - 25, 'own app playback must be excluded to prevent call echo');
  if (process.env.SCREEN_AUDIO_EXTERNAL === '1') {
    assert.ok(result[1].externalDb > -65, 'external program audio must remain captured');
  }
  win.destroy();
}).catch(error => { report.errors.push(error.stack); process.exitCode = 1; })
  .finally(() => {
    fs.writeFileSync(path.resolve(__dirname, '../../Build/screen-audio-native.json'), JSON.stringify(report, null, 2));
    app.exit(report.errors.length ? 1 : 0);
  });
