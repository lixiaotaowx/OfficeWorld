const { createChatTargetOpener } = require('./chat-target.cjs');
const { cleanPrivateCalls } = require('./dock-private-bridge.cjs');
const { cleanMeeting, installMeetingVideo } = require('./dock-meeting-bridge.cjs');
const { cleanHuddles, cleanChat, cleanCommandExtra } = require('./dock-chat-bridge.cjs');
const { grantDockCapture } = require('./dock-capture-intent.cjs');

const { trusted } = require('./policy.cjs');
const { cleanHitRegions } = require('./dock-pointer.cjs');

const dockStageMode = value => (value === 'peek' || value === 'call' ? value : '');

const THEME_POLL_MS = 20000;

function cleanTheme(value) {
  if (!value) return null;
  const accent = String(value.accent || '');
  return {
    light: value.light === true,
    tinted: value.tinted === true,
    accent: /^#[0-9a-f]{6}$/i.test(accent) ? accent.toLowerCase() : '',
    transparent: value.transparent !== false,
  };
}

const LOOK_SLOTS = ['glasses', 'hair', 'beard', 'hat'];
const ID_RE = /^[a-z0-9_]{1,24}$/;

function cleanAppearance(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const color = String(raw.color || '');
  if (!ID_RE.test(color)) return null;
  const source = raw.accessories && typeof raw.accessories === 'object' ? raw.accessories : {};
  const accessories = {};
  for (const slot of LOOK_SLOTS) {
    const id = String(source[slot] || '');
    accessories[slot] = ID_RE.test(id) ? id : '';
  }
  return { color, accessories };
}

function installDockBridge(dependencies) {
  const { dock, getWindow } = dependencies;
  const getHost = dependencies.getHost || (() => undefined);
  const ipcMain = dependencies.ipcMain || require('electron').ipcMain;

  let state = { people: [], sharing: false, missed: 0, hidden: true, transfers: [] };

  const senderIs = (event, target) => Boolean(target) && !target.isDestroyed?.() &&
    event.sender === target.webContents;
  const allowApp = event => {
    const window = getWindow();
    if (!senderIs(event, window) || !trusted(event.senderFrame?.url)) {
      throw Error('Untrusted dock request');
    }
  };
  const allowDock = event => {
    const window = dock?.window();
    if (!senderIs(event, window) || !trusted(event.senderFrame?.url)) {
      throw Error('Untrusted dock request');
    }
  };
  const toApp = (channel, payload) => {
    const window = getWindow();
    if (!window || window.isDestroyed()) return false;
    window.webContents.send(channel, payload);
    return true;
  };
  // Media stays in the main window; the host never captures the screen.
  const grantCapture = () => {
    const target = getWindow();
    const wc = target?.webContents;
    if (wc && !wc.isDestroyed?.()) grantDockCapture(wc);
  };

  let lastTheme = null;
  async function refreshTheme() {
    try {
      const next = cleanTheme(await dock?.theme?.());
      if (JSON.stringify(next) === JSON.stringify(lastTheme)) return lastTheme;
      lastTheme = next;

      state = { ...state, theme: lastTheme };
      dock?.send('office:dock-state', state);
      return lastTheme;
    } catch { return lastTheme; }
  }
  void refreshTheme();
  const themeTimer = setInterval(() => { void refreshTheme(); }, THEME_POLL_MS);
  themeTimer.unref?.();

  dock?.setVisible?.(false, 'starting');

  installMeetingVideo({ ipcMain, allowApp, allowDock, toApp, getDock: () => dock });
  function publish(payload) {
    const people = Array.isArray(payload?.people) ? payload.people.slice(0, 64) : [];

    state = {
      people: people.map(person => ({
        id: String(person?.id || ''), name: String(person?.name || '').slice(0, 24),
        ...(person?.account ? { account: String(person.account).slice(0, 64) } : {}),
        character: String(person?.character || ''), atDesk: person?.atDesk !== false,
        sharing: person?.sharing === true, hasPreview: person?.hasPreview === true,

        inCall: person?.inCall === true,
        unread: Math.max(0, Number(person?.unread) || 0),
        self: person?.self === true, missed: person?.missed === true,
        away: typeof person?.away === 'string' ? person.away.slice(0, 24) : '',
        ...(typeof person?.status === 'string' ? { status: person.status.slice(0, 80) } : {}),
      })).filter(person => person.id),
      ...(payload?.privateCalls ? { privateCalls: cleanPrivateCalls(payload.privateCalls) } : {}),
      ...(payload?.meeting ? { meeting: cleanMeeting(payload.meeting) } : {}),
      screens: (Array.isArray(payload?.screens) ? payload.screens : []).slice(0, 16).map(row => ({
        id: String(row?.id || '').slice(0, 64), personId: String(row?.personId || '').slice(0, 64),
        name: String(row?.name || '').slice(0, 60), streamId: String(row?.streamId || '').slice(0, 80),
        sessionId: String(row?.sessionId || '').slice(0, 64), own: row?.own === true,
        meeting: row?.meeting === true, annotatable: row?.annotatable === true,
        busy: row?.busy === true, error: String(row?.error || '').slice(0, 180),
      })).filter(row => row.id && row.personId && row.sessionId),
      ...(Array.isArray(payload?.huddles) ? { huddles: cleanHuddles(payload.huddles) } : {}),
      ...(payload?.chat ? { chat: cleanChat(payload.chat) } : {}),
      ...(payload?.statusControl ? { statusControl: { busy: payload.statusControl.busy === true,
        error: String(payload.statusControl.error || '').slice(0, 160) } } : {}),
      sharing: payload?.sharing === true,
      missed: Math.max(0, Number(payload?.missed) || 0),
      hidden: payload?.hidden === true,

      edge: dock?.edge?.() || 'bottom',

      popup: dock?.popup?.() === 'right' ? 'right' : 'left',

      stripHeight: dock?.stripHeight?.() || 40,

      theme: cleanTheme(payload?.theme) ?? lastTheme,

      connected: payload?.connected !== false,

      transfers: (Array.isArray(payload?.transfers) ? payload.transfers : []).slice(0, 8)
        .map(row => ({
          id: String(row?.id || ''),
          name: String(row?.name || '').slice(0, 80),
          percent: Math.max(0, Math.min(1, Number(row?.percent) || 0)),
          direction: row?.direction === 'receive' ? 'receive' : 'send',
          done: row?.done === true,
          failed: row?.failed === true,
        })).filter(row => row.id),
    };
    dock?.send('office:dock-state', state);

    dock?.resize?.(state.people.length);

    return dock?.setVisible((!state.sharing || state.meeting?.active === true || state.privateCalls?.sessions.length > 0 || state.privateCalls?.invitations.length > 0) && !state.hidden, state.sharing ? 'sharing' : '') || false;
  }
  ipcMain.handle('office:dock-publish', (event, payload) => { allowApp(event); return publish(payload); });

  // The main window is gone: project the host's authoritative snapshot into the
  // existing Dock shape. Media (screens/videos) stays in the main window, so the
  // Dock only receives presence, calls, meetings, chat and transfers here.
  function publishHostState(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return false;
    return publish({
      people: snapshot.presence?.people,
      sharing: snapshot.media?.sharing === true,
      meeting: snapshot.meetings,
      transfers: snapshot.files?.transfers,
      chat: snapshot.chat ? { contacts: snapshot.chat.contacts, hidden: snapshot.chat.hiddenContacts } : undefined,
      connected: snapshot.identity?.connected !== false,
      hidden: false,
    });
  }

  ipcMain.handle('office:dock-preview', (event, payload) => {
    allowApp(event);
    const id = String(payload?.id || '');
    if (!id) return false;
    return dock?.send('office:dock-preview', { id, image: typeof payload?.image === 'string' ? payload.image : '' });
  });

  const openChatTarget = createChatTargetOpener(dependencies.shell || require('electron').shell);
  ipcMain.handle('office:dock-chat-target', (event, payload) => { allowDock(event); return openChatTarget(state, payload); });

  ipcMain.handle('office:dock-state', event => { allowDock(event); return state; });
  ipcMain.handle('office:dock-preview-want', (event, personId) => {
    allowDock(event);
    return toApp('office:dock-preview-want', String(personId || ''));
  });
  ipcMain.handle('office:dock-action', (event, payload) => {
    allowDock(event);
    const kind = String(payload?.kind || '');
    if (!['status', 'status-clear', 'watch', 'share', 'call', 'focus', 'meeting', 'meeting-create', 'meeting-mute', 'meeting-share', 'meeting-view', 'meeting-fullscreen',
      'meeting-leave', 'meeting-end', 'meeting-accept', 'meeting-decline', 'private-share', 'private-mute',
      'huddle-start', 'huddle-join', 'huddle-invite', 'gather', 'chat-open', 'chat-send', 'chat-file', 'screen-control', 'screen-ink'].includes(kind)) throw Error('Unknown dock action');
    // chat and huddles happen in the dock itself: they never pull the main window forward
    const inDock = kind.startsWith('screen-') || kind.startsWith('huddle-') || kind.startsWith('chat-') || ['gather', 'watch', 'share', 'call'].includes(kind);
    const personId = String(payload?.personId || '');
    const privateSession = state.privateCalls?.sessions.find(row => row.id === personId);
    const screen = state.screens?.find(row => row.id === personId);
    if (kind.startsWith('screen-') && !screen) return false;
    if (kind.startsWith('private-') && (!privateSession?.connected || state.privateCalls.busy || state.meeting?.active)) return false;

    const window = getWindow();
    if (kind === 'screen-control' && payload?.text === 'share') grantCapture();

    if (['share', 'meeting-share'].includes(kind) || kind === 'private-share' && !privateSession.sharing) {
      grantCapture();
    }
    if (!inDock && !kind.startsWith('private-') && kind !== 'status-clear' && (!kind.startsWith('meeting-') || ['meeting-view', 'meeting-fullscreen'].includes(kind)) && window && !window.isDestroyed()) {
      if (window.isMinimized()) window.restore();
      window.show(); window.moveTop(); window.focus();
    }
    const meeting = kind === 'meeting-create' ? {
      title: String(payload?.meeting?.title || '').slice(0, 60),
      invitees: (Array.isArray(payload?.meeting?.invitees) ? payload.meeting.invitees : [])
        .filter(id => typeof id === 'string').slice(0, 32).map(id => id.slice(0, 64)),
      microphone: payload?.meeting?.microphone === true,
    } : undefined;
    return toApp('office:dock-command', { kind, personId, ...(meeting ? { meeting } : {}), ...cleanCommandExtra(kind, payload) });
  });
  ipcMain.handle('office:dock-drag', (event, payload) => {
    allowDock(event);
    return dock?.moveBy(Number(payload?.dx) || 0, Number(payload?.dy) || 0) || null;
  });

  ipcMain.handle('office:dock-answer', (event, payload) => {
    allowDock(event);
    const requestId = String(payload?.requestId || '').slice(0, 64);
    if (!requestId) return false;
    const invitation = state.privateCalls?.invitations.find(row => row.id === requestId);
    if (state.privateCalls && (!invitation || state.privateCalls.busy)) return false;
    if (payload?.accept === true && invitation?.kind === 'screen' && !invitation.offer) {
      grantCapture();
    }
    return toApp('office:dock-answer', { requestId, accept: payload?.accept === true });
  });

  ipcMain.handle('office:dock-files', (event, payload) => {
    allowDock(event);
    const personId = String(payload?.personId || '').slice(0, 64);
    const paths = (Array.isArray(payload?.paths) ? payload.paths : [])
      .filter(item => typeof item === 'string' && item.length > 0 && item.length <= 1024)
      .slice(0, 64);
    if (!personId || !paths.length) return false;
    return toApp('office:dock-files', { personId, paths });
  });

  ipcMain.handle('office:dock-layout', (event, payload) => {
    allowDock(event);
    return dock?.applyLayout?.({ expanded: payload?.expanded === true,
      stage: payload?.stage === true, stageMode: dockStageMode(payload?.stageMode),
      ...(payload?.cardPx ? { cardPx: Math.max(0, Math.min(700, Math.round(Number(payload.cardPx) || 0))) } : {}),
      ...(payload?.cardWidth ? { cardWidth: Math.max(0, Math.min(4096, Math.round(Number(payload.cardWidth) || 0))) } : {}),
      stagePx: Math.max(0, Math.min(900, Math.round(Number(payload?.stagePx) || 0))),
      width: Number(payload?.width) || 0,
      ...(Array.isArray(payload?.hitRegions) ? { hitRegions: cleanHitRegions(payload.hitRegions) } : {}) }) || null;
  });

  ipcMain.handle('office:dock-greet', (event, payload) => {
    allowApp(event);
    const id = String(payload?.id || '');
    if (!id) return false;
    const kind = ['voice', 'screen', 'meeting'].includes(payload?.kind) ? payload.kind : '';
    return dock?.send('office:dock-greet', {
      id, name: String(payload?.name || '').slice(0, 24),

      appearance: cleanAppearance(payload?.appearance),
      mode: payload?.mode === 'call' ? 'call' : 'peek',
      requestId: String(payload?.requestId || '').slice(0, 64),
      kind, offer: payload?.offer === true,
    }) || false;
  });
  ipcMain.handle('office:dock-visible', (event, payload) => {
    allowApp(event);
    return dock?.setVisible(payload?.visible !== false, String(payload?.reason || '')) || false;
  });
  return { state: () => state, refreshTheme, publishHostState };
}

module.exports = { installDockBridge };
