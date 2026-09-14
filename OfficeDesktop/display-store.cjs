// The one place that decides which physical display this client uses.
//
// The low-resolution workstation preview and high-definition screen sharing both
// follow this selection, so the two can never disagree, and sharing never asks
// the user to choose again: pick the display once (right-clicking your own scene
// monitor) and every later share uses it.
const fs = require('node:fs');

function createDisplayStore(file) {
  let selected = '';
  try { selected = String(JSON.parse(fs.readFileSync(file, 'utf8')).id || ''); } catch { /* first run */ }

  const keyOf = (source) => String(source?.display_id || source?.id || '');

  return {
    id: () => selected,
    select(id) {
      selected = String(id ?? '');
      fs.writeFileSync(file, JSON.stringify({ id: selected }));
      return selected;
    },
    /** Every screen source, in the order the picker should show them. */
    list(desktopCapturer, screenApi) {
      return desktopCapturer.getSources({ types: ['screen'], thumbnailSize: { width: 480, height: 480 } })
        .then((sources) => sources.map((source, index) => {
          const display = screenApi.getAllDisplays().find((item) => String(item.id) === keyOf(source));
          return {
            source,
            id: keyOf(source),
            name: `屏幕 ${index + 1}${keyOf(source) === String(screenApi.getPrimaryDisplay().id) ? '（主屏幕）' : ''}`,
            width: display?.size.width,
            height: display?.size.height,
            selected: keyOf(source) === selected,
          };
        }));
    },
    /** The source to capture: the selected display, else the primary one. */
    async source(desktopCapturer, screenApi) {
      const rows = await this.list(desktopCapturer, screenApi);
      const primary = String(screenApi.getPrimaryDisplay().id);
      return (rows.find((row) => row.id === selected) ||
        rows.find((row) => row.id === primary) || rows[0])?.source;
    },
  };
}

module.exports = { createDisplayStore };
