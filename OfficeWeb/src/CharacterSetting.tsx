// Settings entry for 我的角色: the same two-step chooser the first visit shows
// (1 配色 → 2 配件), so the player never reads a bare dropdown.
import LookChooser from './LookChooser';
import type { Appearance } from './look';
import DockLookPreview from './DockLookPreview';

export default function CharacterSetting({ value, onChange }: {
  value: Appearance; onChange: (next: Appearance) => void;
}) {
  return <section className="character-setting" aria-label="我的角色">
    <span className="character-setting-title">我的角色</span>
    <LookChooser value={value} onChange={onChange} />
    <DockLookPreview value={value} />
  </section>;
}
