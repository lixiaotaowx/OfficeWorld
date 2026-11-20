// message sound preferences + synth.
// Recovered verbatim from the production bundle; bindings renamed to semantic names.
const MESSAGE_SOUNDS = [["default", "默认"], ["cat", "猫咪"], ["dog", "小狗"], ["bird", "小鸟"], ["duck", "鸭子"], ["rooster", "公鸡"], ["owl", "猫头鹰"], ["frog", "青蛙"], ["sheep", "绵羊"], ["cow", "奶牛"], ["horse", "小马"], ["pig", "小猪"], ["cricket", "蟋蟀"]],
  SOUND_STORAGE_KEY = "office-message-sound";
function getNotificationSound() {
  var n;
  try {
    const e = window.localStorage.getItem(SOUND_STORAGE_KEY);
    return ((n = MESSAGE_SOUNDS.find(([t]) => t === e)) == null ? void 0 : n[0]) ?? "default";
  } catch {
    return "default";
  }
}
function setNotificationSound(n) {
  try {
    return window.localStorage.setItem(SOUND_STORAGE_KEY, n), !0;
  } catch {
    return !1;
  }
}
const ANIMAL_SOUND_PROFILES = {
  cat: {
    wave: "sawtooth",
    filter: 1500,
    syllables: [[0, .65, 420, 760, 290]]
  },
  dog: {
    wave: "sawtooth",
    filter: 900,
    syllables: [[0, .16, 240, 320, 100], [.25, .2, 220, 300, 90]]
  },
  bird: {
    wave: "sine",
    filter: 6e3,
    syllables: [[0, .12, 2200, 3600, 2700], [.18, .1, 2800, 4100, 3100], [.34, .16, 2300, 3500, 1900]]
  },
  duck: {
    wave: "sawtooth",
    filter: 1800,
    syllables: [[0, .18, 420, 600, 260], [.24, .18, 400, 560, 240], [.48, .16, 380, 520, 230]]
  },
  rooster: {
    wave: "sawtooth",
    filter: 2200,
    syllables: [[0, .12, 600, 800, 720], [.16, .13, 720, 950, 850], [.33, .13, 800, 1050, 940], [.49, .43, 940, 1100, 540]]
  },
  owl: {
    wave: "sine",
    filter: 900,
    syllables: [[0, .28, 380, 460, 360], [.4, .42, 330, 400, 300]]
  },
  frog: {
    wave: "square",
    filter: 650,
    tremolo: 35,
    syllables: [[0, .25, 130, 210, 90], [.35, .3, 120, 190, 80]]
  },
  sheep: {
    wave: "sawtooth",
    filter: 1600,
    tremolo: 18,
    syllables: [[0, .72, 270, 430, 240]]
  },
  cow: {
    wave: "sawtooth",
    filter: 500,
    syllables: [[0, .85, 95, 155, 85]]
  },
  horse: {
    wave: "sawtooth",
    filter: 2400,
    tremolo: 12,
    syllables: [[0, .25, 500, 1200, 900], [.26, .55, 900, 1e3, 300]]
  },
  pig: {
    wave: "sawtooth",
    filter: 750,
    tremolo: 28,
    syllables: [[0, .22, 110, 180, 90], [.32, .28, 120, 210, 80]]
  },
  cricket: {
    wave: "sine",
    filter: 6500,
    tremolo: 50,
    syllables: [[0, .12, 4200, 4400, 4200], [.22, .12, 4200, 4400, 4200], [.44, .12, 4200, 4400, 4200]]
  }
};
function playAnimalSound(n, e) {
  const t = ANIMAL_SOUND_PROFILES[e],
    s = [];
  for (const [r, i, o, a, f] of t.syllables) {
    const d = n.createOscillator(),
      m = n.createBiquadFilter(),
      _ = n.createGain(),
      y = n.currentTime + r,
      A = y + i;
    d.type = t.wave, d.frequency.setValueAtTime(o, y), d.frequency.exponentialRampToValueAtTime(a, y + i * .3), d.frequency.exponentialRampToValueAtTime(f, A), m.type = "lowpass", m.frequency.value = t.filter, m.Q.value = .7, _.gain.setValueAtTime(0, y), _.gain.linearRampToValueAtTime(.1, y + .015), _.gain.exponentialRampToValueAtTime(.001, A), d.connect(m), m.connect(_), _.connect(n.destination);
    let E, b;
    t.tremolo && (E = n.createOscillator(), b = n.createGain(), E.frequency.value = t.tremolo, b.gain.value = a * .045, E.connect(b), b.connect(d.frequency), E.start(y), E.stop(A)), d.onended = () => {
      d.disconnect(), m.disconnect(), _.disconnect(), E == null || E.disconnect(), b == null || b.disconnect();
    }, d.start(y), d.stop(A), s.push(() => {
      try {
        d.stop(), E == null || E.stop();
      } catch {}
    });
  }
  return () => s.forEach(r => r());
}
let sharedAudioContext;
async function unlockAudioAndNotifications() {
  try {
    sharedAudioContext ?? (sharedAudioContext = new AudioContext());
    const n = sharedAudioContext.resume(),
      e = "Notification" in window && Notification.permission === "default" ? Notification.requestPermission() : Promise.resolve();
    await Promise.all([n, e]);
  } catch {}
}
function startNotificationChime(n = !1, e = "default") {
  let t = !1,
    s,
    r = () => {};
  try {
    sharedAudioContext ?? (sharedAudioContext = new AudioContext());
    const i = sharedAudioContext;
    i.resume().then(() => {
      if (t || i.state !== "running") return;
      if (n && e !== "default") {
        r = playAnimalSound(i, e);
        return;
      }
      s = i.createOscillator();
      const o = i.createGain(),
        a = i.currentTime,
        f = [];
      if (n) {
        s.type = "sawtooth", s.frequency.setValueAtTime(230, a), s.frequency.linearRampToValueAtTime(280, a + .24), s.frequency.linearRampToValueAtTime(330, a + .48);
        for (const [m, _] of [[500, 300], [900, 2300], [2400, 3e3]]) {
          const y = i.createBiquadFilter();
          y.type = "bandpass", y.Q.value = 5, y.frequency.setValueAtTime(m, a), y.frequency.setValueAtTime(m, a + .16), y.frequency.exponentialRampToValueAtTime(_, a + .33), s.connect(y), y.connect(o), f.push(y);
        }
      } else s.type = "sine", s.frequency.value = 660, s.connect(o);
      const d = n ? .6 : .2;
      o.gain.setValueAtTime(0, a), o.gain.linearRampToValueAtTime(n ? .16 : .12, a + .025), o.gain.setValueAtTime(n ? .16 : .12, a + (n ? .35 : .04)), o.gain.exponentialRampToValueAtTime(.001, a + d - .02), o.connect(i.destination), s.onended = () => {
        s == null || s.disconnect(), o.disconnect(), f.forEach(m => m.disconnect());
      }, s.start(a), s.stop(a + d);
    }).catch(() => {});
  } catch {}
  return () => {
    t = !0, r();
    try {
      s == null || s.stop();
    } catch {}
  };
}
function ringCallChime(n) {
  return startNotificationChime(!0, n);
}

function closeSharedAudioContext() {
  if (sharedAudioContext) {
    sharedAudioContext.close().catch(() => {});
    sharedAudioContext = undefined;
  }
}

export { closeSharedAudioContext, MESSAGE_SOUNDS, getNotificationSound, setNotificationSound, unlockAudioAndNotifications, startNotificationChime, ringCallChime };
