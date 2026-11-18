import { loadCharacter, setCharacterAppearance, type LoadedCharacter } from '../characterModel';\
import { loadCharacter, releaseCharacter, setCharacterAppearance, type LoadedCharacter } from '../characterModel';\
  private vy = 0; private stuck = 0; private current = '';\
  private disposed = false;\
  dress(appearance: Appearance) { setCharacterAppearance(this.c, appearance); }\
  dispose() { if (this.disposed) return; this.disposed=true; this.holder.removeFromParent(); releaseCharacter(this.c); }\
