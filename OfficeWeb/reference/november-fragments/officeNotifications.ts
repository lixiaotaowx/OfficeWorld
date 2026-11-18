import type { MeetingState } from './meetingTypes';\
import { playAnimalSound, readMessageSound, type MessageSound } from './animalSounds';\
function beep(message = false): () => void {\
function beep(message = false, sound: MessageSound = 'default'): () => void {\
  let cancelled = false, tone: OscillatorNode | undefined;\
  let stopAnimal = () => {};\
      if (cancelled || context.state !== 'running') return;\
      if (message && sound !== 'default') { stopAnimal = playAnimalSound(context, sound); return; }\
  return () => { cancelled = true; try { tone?.stop(); } catch { /* Already stopped. */ } };\
  return () => { cancelled = true; stopAnimal(); try { tone?.stop(); } catch { /* Already stopped. */ } };\
}\
export function previewMessageSound(sound: MessageSound): () => void { return beep(true, sound); }\
    else if (Date.now() - lastSound > 500) { beep(section === 'chat'); lastSound = Date.now(); }\
    else if (Date.now() - lastSound > 500) { beep(section === 'chat', readMessageSound()); lastSound = Date.now(); }\
