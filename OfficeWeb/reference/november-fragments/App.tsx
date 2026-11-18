      <FileTransferPanel files={office.files} />\
      {meetingView && office.connected && office.meetings.active && <MeetingScreenViewer\
      {dockScreens.view && office.connected && <MeetingScreenViewer\
        key={`${dockScreens.view.scope}:${dockScreens.view.id}`}\
        stream={dockScreens.view.stream} signal={office.signal}\
        scope={dockScreens.view.scope} annotation={office.annotation}\
        selfColor={colorFor(account.id)} own={dockScreens.view.own}\
        annotatable={dockScreens.view.annotatable} label={dockScreens.view.name}\
        onClose={() => {\
          dockScreens.closeView();\
          void window.officeDesktop?.setFullscreen?.(false).then(() => window.officeDesktop?.windowAct<truncated omitted_approx_tokens="78" />l, scope, annotation, selfColor, annotatable }: {\
export default function MeetingScreenViewer({ stream, label, onClose, signal, scope, annotation, selfColor, annotatable, own = false }: {\
  selfColor?: string; annotatable: boolean;\
  selfColor?: string; annotatable: boolean; own?: boolean;\
    selfColor={selfColor} annotatable={annotatable}\
    initialFullscreen\
    selfColor={selfColor} annotatable={annotatable && !own} clearsOwnBoard={own}\
    initialFullscreen onExitFullscreen={onClose}\
