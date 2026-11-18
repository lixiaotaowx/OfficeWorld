import DockMeetingScreens from './DockMeetingScreens';\
import DockPreviewCard, { type DockPreviewAction } from './DockPreviewCard';\
import { useDockHover } from './useDockHover';\
import { previewPlaceholder, cardActions, greetAlive, greetMode, frameColors, mergeState,\
  callLabel, CALL_BAR_HEIGHT, GREET_CANVAS, stickyOrder, orderPeople, cardTipOffset,\
import { greetAlive, greetMode, frameColors, mergeState,\
  callLabel, CALL_BAR_HEIGHT, GREET_CANVAS, stickyOrder, orderPeople,\
import { MicIcon, MutedMicIcon, PhoneIcon, PreviewIcon, ScreenIcon } from './icons';\
import { MicIcon, MutedMicIcon, PhoneIcon, ScreenIcon } from './icons';\
/** 从头像挪到卡片要跨过 8px 空隙：给一点宽限，别让卡片在手上消失。 */\
const CLOSE_GRACE_MS = 350;\
  const [hovered, setHovered] = useState('');\
  const { hovered, open, focus, close, scheduleClose } = useDockHover(meetingPerson !== null || statusMenu);\
  const hoveredRef = useRef('');\
  hoveredRef.current = hovered;\
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();\
  const openTimer = useRef<ReturnType<typeof setTimeout>>();\
  // 打开某个人的卡片（挪到卡片上也算）；离开时给一点宽限再关。\
  const open = useCallback((id: string, delayed = false) => {\
    if (meetingPerson !== null || statusMenu) return;\
    if (openTimer.current) clearTimeout(openTimer.current);\
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = undefined; }\
    if (delayed) openTimer.current = setTimeout(() => setHovered(id), 80);\
    else setHovered(id);\
  }, [meetingPerson, statusMenu]);\
  const scheduleClose = useCallback(() => {\
    if (openTimer.current) clearTimeout(openTimer.current);\
    if (closeTimer.current) clearTimeout(closeTimer.current);\
    closeTimer.current = setTimeout(() => {\
      closeTimer.current = undefined;\
      setHovered('');\
    }, CLOSE_GRACE_MS);\
  }, []);\
  useEffect(() => () => {\
    if (closeTimer.current) clearTimeout(closeTimer.current);\
    if (openTimer.current) clearTimeout(openTimer.current);\
  }, []);\
\
  /** 卡片下面那个尖对准头像（用户 2026-09-2X）：量头像中点与卡片左边界的差，夹在卡片里。 */\
  const [tipOffset, setTipOffset] = useState<number | null>(null);\
  useEffect(() => {\
    const id = person?.id;\
    if (!id) { setTipOffset(null); return; }\
    const row = [...document.querySelectorAll('.dock-avatar')]\
      .find(node => node.getAttribute('aria-label') === (person.self ? '我' : person.name));\
    const card = document.querySelector('.dock-card');\
    if (!row || !card) { setTipOffset(null); return; }\
    const box = row.getBoundingClientRect();\
    const frame = card.getBoundingClientRect();\
    setTipOffset(cardTipOffset(frame.left, frame.width, box.left + box.width / 2));\
  }, [person?.id, person?.self, person?.name, image]);\
\
  const act = useCallback((kind: 'watch' | 'share' | 'call') => {\
    if (!hoveredRef.current) return;\
    void window.officeDock?.action?.(kind, hoveredRef.current);\
    setHovered('');\
  }, []);\
  const act = useCallback((kind: DockPreviewAction, personId: string) => {\
    if (!state.people.some(row => row.id === personId && !row.self)) return;\
    close();\
    void window.officeDock?.action?.(kind, personId);\
  }, [state.people, close]);\
    setHovered('');\
    close();\
  }, [canDrop, carriesFiles, complain]);\
  }, [canDrop, carriesFiles, complain, close]);\
    if (openTimer.current) clearTimeout(openTimer.current);\
    setHovered('');\
    close();\
  }, [state.hidden, state.meeting?.id, state.meeting?.active]);\
  }, [state.hidden, state.meeting?.id, state.meeting?.active, close]);\
        onSelf={() => {\
          if (openTimer.current) clearTimeout(openTimer.current);\
          setHovered(''); setStatusMenu(true);\
          close(); setStatusMenu(true);\
        }}\
        onEnter={() => open(row.id, true)} onLeave={scheduleClose}\
        onEnter={() => open(row.id, true)} onFocus={() => focus(row.id)} onLeave={scheduleClose}\
    {person && !statusMenu && !sharedHover && meetingPerson === null && <div className={`dock-card ${image ? 'has-image' : ''}`} role="dialog"\
      aria-label={person.self ? '我的工位预览' : `${person.name} 的屏幕预览`}\
      onMouseEnter={() => open(person.id)} onMouseLeave={scheduleClose}>\
      <div className="dock-shot">\
        {image\
          ? <img src={image} alt={person.self ? '我的工位小图' : `${person.name} 的屏幕小图`} />\
          : <span className="dock-shot-empty">{previewPlaceholder(person, !waiting)}</span>}\
      </div>\
      {person.status && <p className="dock-person-status">{person.status}</p>}\
      {cardActions(person).length > 0 && <div className="dock-card-actions">\
        <button type="button" title="请求观看对方屏幕" onClick={() => act('watch')}><PreviewIcon /><span>看屏幕</span></button>\
        <button type="button" title="把我的屏幕分享给对方" onClick={() => act('share')}><ScreenIcon /><span>分享屏幕</span></button>\
        <button type="button" title="邀请语音通话" onClick={() => act('call')}><PhoneIcon /><span>语音通话</span></button>\
      </div>}\
      <div className="dock-card-name">\
        <span className="dock-card-who">\
          {person.self ? `${person.name}（我 · 我的工位）` : person.name}\
        </span>\
        <button className="dock-start-meeting" onClick={() => {\
          setMeetingPerson(person.id);\
          setHovered('');\
          if (openTimer.current) clearTimeout(openTimer.current);\
          if (closeTimer.current) clearTimeout(closeTimer.current);\
        }}>发起会议</button>\
        {/* 在座/离座直接写成字，颜色一眼能分（用户 2026-09-18：「在座就显示暗绿色在座\
            离座显示暗红色离座」）；离座时后面跟着离座时长。 */}\
        <span className={`dock-card-state ${person.atDesk ? 'here' : 'away'}`}>\
          {person.atDesk ? '在座' : (person.away || '离座')}\
        </span>\
      </div>\
      {/* 气泡的尖指向下面那个头像（用户 2026-09-2X）。位置由上面那段 effect 量出来。 */}\
      {tipOffset !== null && <i className="dock-card-tip" aria-hidden="true"\
        style={{ left: `${tipOffset}px` }} />}\
    </div>}\
    {person && !statusMenu && !sharedHover && meetingPerson === null && <DockPreviewCard\
      key={person.id} person={person} image={image} waiting={waiting}\
      onEnter={() => open(person.id)} onLeave={scheduleClose} onAction={act}\
      onMeeting={id => { close(); setMeetingPerson(id); }} />}\
function DockAvatar({ person, greeting, dropping, open, onEnter, onLeave, onSelf, onDragOver, onDragLeave, onDrop }: {\
function DockAvatar({ person, greeting, dropping, open, onEnter, onFocus, onLeave, onSelf, onDragOver, onDragLeave, onDrop }: {\
  onEnter: () => void; onLeave: () => void;\
  onEnter: () => void; onFocus: () => void; onLeave: () => void;\
    onMouseEnter={onEnter} onMouseLeave={onLeave} onFocus={onEnter} onBlur={onLeave}\
    onMouseEnter={onEnter} onMouseLeave={onLeave} onFocus={onFocus}\
    onBlur={event => { if (!event.currentTarget.closest('.dock')?.contains(event.relatedTarget as Node | null)) onLeave(); }}\
