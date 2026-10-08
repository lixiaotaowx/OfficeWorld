import { useEffect, useState } from 'react';

export function BuildHeight({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [text, setText] = useState(value ? String(value) : '');
  useEffect(() => { setText(value ? String(value) : ''); }, [value]);
  return <label className="build-height">高度
    <input type="number" aria-label="搭建高度" step="0.25" placeholder="自动"
      title="单位米；负数可向地下搭建，清空恢复自动吸附" value={text}
      onChange={event => {
        const next = event.target.value;
        setText(next);
        if (!event.target.validity.badInput && Number.isFinite(Number(next))) onChange(Number(next));
      }} onBlur={() => setText(value ? String(value) : '')} />
  </label>;
}
