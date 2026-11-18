export default function DockScreen({ screen, state }: { screen: Screen; state: DockState }) {\
export default function DockScreen({ screen, state, compact = false, showTitle = true }: {\
  screen: Screen; state: DockState; compact?: boolean; showTitle?: boolean;\
}) {\
  const { video, status, retry } = useDockScreenVideo(screen, !collapsed);\
  const { video, status, retry } = useDockScreenVideo(screen, compact || !collapsed);\
  return <div className="dk-screen" aria-label={screen.name}>\
    <div className="dk-screen-title"><strong>{screen.name}</strong><small>{screen.own ? '正在共享' : '共享画面'}</small>\
  return <div className={'dk-screen' + (compact ? ' dk-screen-compact' : '')} aria-label={screen.name}>\
    {!compact && (showTitle || screen.own) && <div className="dk-screen-title">\
      {showTitle && <strong>{screen.name}</strong>}\
    </div>\
    {screen.own && choosing && <ScreenPicker bridge={window.officeDock} onSelected={() => setChoosing(false)} />}\
    <div hidden={collapsed}>\
    <div className="dk-screen-scroll"><div className="dk-screen-picture" style={{ width: `${zoom * 100}%`, aspectRatio: ratio }}>\
    </div>}\
    {!compact && screen.own && choosing && <ScreenPicker bridge={window.officeDock} onSelected={() => setChoosing(false)} />}\
    <div hidden={!compact && collapsed}>\
    <div className="dk-screen-scroll"><div className="dk-screen-picture" style={{ width: `${compact ? 100 : zoom * 100}%`, aspectRatio: compact ? 16 / 9 : ratio }}>\
      {ink && <svg viewBox="0 0 1000 562.5" preserveAspectRatio="none" aria-label="在共享画面上标注"\
      {!compact && ink && <svg viewBox="0 0 1000 562.5" preserveAspectRatio="none" aria-label="在共享画面上标注"\
    {status && <div className="dk-scre<truncated omitted_approx_tokens="783" /> }\
.dk-screen-fly > header { display:flex; padding:8px 12px; gap:8px; align-items:center; }\
.dk-screen-fly > header strong { flex:1; }\
/* Native Dock height is measured from this card: a vh cap would prevent it growing. */\
.dk-screen-fly { width:min(340px,calc(100vw - 16px)); overflow:hidden; }\
.dk-screen-fly.big { width:min(660px,calc(100vw - 16px)); max-height:640px; overflow:auto; scrollbar-width:thin; }\
.dk-screen-fly > header { display:flex; padding:4px 8px 4px 12px; gap:4px; align-items:center; }\
.dk-screen-fly > header strong { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; font-weight:500; }\
.dk-screen-fly > header .dk-icon { flex:none; width:32px; height:32px; }\
.dk-screen-fly > header button:focus-visible { outline:2px solid var(--dk-live); outline-offset:-2px; }\
.dk-screen-fly > header button:active { background:var(--dk-hover); }\
.dk-screen-chat { border:0; border-radius:8px; background:transparent; color:inherit; padding:8px; cursor:pointer; }\
.dk-screen-chat:hover { background:var(--dk-hover); }\
.dk-screen-fly > .dk-screen { border-bottom:0; }\
.dk-screen-compact { position:relative; }\
.dk-screen-compact .dk-screen-scroll { max-height:none; overflow:hidden; }\
.dk-screen-compact .dk-screen-status { position:absolute; inset:auto 0 0; display:flex; align-items:center; justify-content:center; gap:8px; padding:8px 12px; color:#eef3f1; background:rgba(17,24,23,.92); overflow-wrap:anywhere; }\
.dk-screen-compact .dk-screen-status[role=alert] { color:#f2a99a; }\
