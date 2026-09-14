import { CHARACTERS_BY_GENDER, type CharacterId } from './characters';

export default function CharacterSetting({ value, onChange }: {
  value: CharacterId; onChange: (id: CharacterId) => void;
}) {
  return <label className="character-setting">我的角色
    <select aria-label="选择角色" value={value}
      onChange={e => onChange(e.target.value as CharacterId)}>
      {(['woman', 'man'] as const).map(g => <optgroup key={g} label={g === 'woman' ? '女角色' : '男角色'}>
        {CHARACTERS_BY_GENDER[g].map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
      </optgroup>)}
    </select>
  </label>;
}
