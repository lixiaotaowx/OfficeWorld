

const fs = require('node:fs');

function displayKey(value) {
  const text = String(value ?? '');
  if (/^-?\d+$/.test(text)) { const n = Number(text); if (Number.isSafeInteger(n) && n >= -2147483648 && n <= 4294967295) return String(n >>> 0); }
  return text;
}

function createDisplayStore(file) {
  let selected = '', fingerprint = null, lastRows = [];
  try { const saved = JSON.parse(fs.readFileSync(file, 'utf8')); selected = displayKey(saved.id || ''); fingerprint = saved.fingerprint || null; } catch { /* first run */ }

  const keyOf = (source) => displayKey(source?.display_id || source?.id || '');

  return {
    id: () => selected,
    select(id) {
      const next = displayKey(id);
      if (!next) throw Error('请选择屏幕');
      fs.writeFileSync(file + '.next', JSON.stringify({ id: next, fingerprint: lastRows.find(row => row.id === next)?.fingerprint || (next === selected ? fingerprint : null) }));
      fs.renameSync(file + '.next', file);
      fingerprint = lastRows.find(row => row.id === next)?.fingerprint || (next === selected ? fingerprint : null);
      selected = next;
      return selected;
    },

    list(desktopCapturer, screenApi) {
      return desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 480, height: 480 } })
        .then((sources) => { const rows = sources.map((source, index) => {
          const display = screenApi.getAllDisplays().find((item) => displayKey(item.id) === keyOf(source));
          return {
            source,
            fingerprint: { label: display?.label || '', width: display?.size.width, height: display?.size.height },
            id: keyOf(source),
            name: `Display ${index + 1}${keyOf(source) === displayKey(screenApi.getPrimaryDisplay().id) ? " (Primary display)" : ''}`,
            width: display?.size.width,
            height: display?.size.height,
            selected: keyOf(source) === (selected || displayKey(screenApi.getPrimaryDisplay().id)),
          };
        });
          lastRows = rows;
          if (selected && !rows.some(row => row.id === selected)) {
            const matches = fingerprint?.label ? rows.filter(row => row.fingerprint.label === fingerprint.label && row.width === fingerprint.width && row.height === fingerprint.height) : [];
            const recovered = matches.length === 1 ? matches[0] : !fingerprint && rows.length === 1 && screenApi.getAllDisplays().length === 1 ? rows[0] : null;
            if (recovered) this.select(recovered.id);
          } else if (selected && !fingerprint && rows.some(row => row.id === selected)) this.select(selected);
          return rows.map(row => ({ ...row, selected: row.id === (selected || displayKey(screenApi.getPrimaryDisplay().id)) }));
        });
    },

    choose(rows, screenApi) {
      if (selected) return rows.find(row => row.id === selected);
      return rows.find(row => row.id === displayKey(screenApi.getPrimaryDisplay().id)) || rows[0];
    },

    async source(desktopCapturer, screenApi) {
      const rows = await this.list(desktopCapturer, screenApi);
      return this.choose(rows, screenApi)?.source;
    },
  };
}

module.exports = { createDisplayStore, displayKey };
