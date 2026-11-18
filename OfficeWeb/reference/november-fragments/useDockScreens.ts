  const busy = useRef(false);\
  const [error, setError] = useState('');\
      name: own ? '我正在共享' : `${person?.name || '同事'}的屏幕`, annotatable: own || person?.annotate === true });\
      name: own ? '我正在共享' : `${person?.name || '同事'}的屏幕`, annotatable: own || person?.annotate === true, busy: busy.current, error });\
    busy.current = true;\
    setError(''); changed(n => n + 1);\
      if (value.text === 'mute') await (screen.meeting ? office.meetings.toggleMic() : office.mute(screen.sessionId));\
      if (value.text === 'mute' && await (screen.meeting ? office.meetings.toggleMic() : office.mute(screen.sessionId)) === false) throw Error('麦克风切换失败，请检查权限或设备');\
        else await office.shareInCall(screen.sessionId);\
        else if (await office.shareInCall(screen.sessionId) === false<truncated omitted_approx_tokens="32" />})\
    })().catch(e => setError(e instanceof Error ? e.message : '操作失败，请重试'))\
