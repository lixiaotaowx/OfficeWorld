const container = document.querySelector('#sources');
window.sourcePicker.onSources(sources => {
  container.replaceChildren();
  if (!sources.length) container.textContent = '没有找到可共享的窗口。请打开目标窗口后重试。';
  for (const source of sources) {
    const button = document.createElement('button');
    const image = document.createElement('img');
    const name = document.createElement('span');
    image.src = source.thumbnail;
    image.alt = '';
    name.textContent = source.name;
    button.append(image, name);
    button.addEventListener('click', () => window.sourcePicker.choose(source.id));
    container.append(button);
  }
});
document.querySelector('#cancel').addEventListener('click', () => window.sourcePicker.choose(null));
document.addEventListener('keydown', event => { if (event.key === 'Escape') window.sourcePicker.choose(null); });
