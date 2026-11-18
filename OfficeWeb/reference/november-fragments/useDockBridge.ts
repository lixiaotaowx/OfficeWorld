  enabled: boolean;\
  screens?: import('./dock-screen-contract').DockScreen[];\
  onScreenCommand?: (value: DockCommand) => boolean;\
      state.meeting = current.meeting;\
      state.screens = current.screens;\
      if (latest.current.onChatCommand?.(payload)) return;\
      if (latest.current.onScreenCommand?.(payload)) return;\
