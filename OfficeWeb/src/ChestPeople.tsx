import { useEffect, useState } from 'react';
import type { ChestPeople as People, ChestPerson } from './buildTypes';
import { chestPortrait } from './chestPortrait';
function Face({ person, label }: { person?: ChestPerson; label: string }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    let active = true;
    if (person) void chestPortrait(person).then(url => { if (active) setSrc(url); }).catch(() => {});
    return () => { active = false; };
  }, [person]);
  return <span className="chest-person" title={`${label}：${person?.name || '未记录'}`}>
    {src ? <img src={src} alt={`${label}：${person?.name}`} /> : <span>{person?.name?.slice(0,1) || '?'}</span>}
  </span>;
}
export function ChestPeople({ people }: { people: People }) {
  return <div className="chest-people" aria-label="宝箱创建人与已读人">
    <small>创建人</small><Face person={people.creator} label="创建人" />
    <small>已读 {people.readers.length}</small>
    {people.readers.map(p => <Face key={p.id} person={p} label="已读" />)}
  </div>;
}
