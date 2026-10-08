let audio: AudioContext | undefined;
export function buildSound(kind: 'place' | 'remove' | 'open' | 'rotate', enabled: boolean) {
  if (!enabled) return;
  try {
    audio ||= new AudioContext();
    void audio.resume();
    const notes = { place: [320, 480], remove: [180, 85], open: [440, 660, 880], rotate: [520] }[kind];
    notes.forEach((frequency, index) => {
      const oscillator = audio!.createOscillator();
      const gain = audio!.createGain();
      const at = audio!.currentTime + index * 0.055;
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.055, at + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, at + 0.16);
      oscillator.connect(gain).connect(audio!.destination);
      oscillator.start(at);
      oscillator.stop(at + 0.18);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    });
  } catch { /* Audio is optional; building remains available. */ }
}
