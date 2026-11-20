import { LookOnboarding, useHallVisibility, HallView } from './hallComponents.js';
import { useDockChat } from './useDockChat.js';
import { useShellTitleSync as useShellTitleSync } from './desktopChrome.js';
import { useScreenControls as useScreenControls } from './useDockVideoRelay.js';
import { usePresenceNotifications as usePresenceNotifications } from './usePresenceNotifications.js';
import { useDockStatePublisher as useDockStatePublisher } from './useDockStatePublisher.js';
import { useMicActivity as useMicActivity } from './useMicActivity.js';
import { usePresenceStatus } from './PresenceStatus.js';
import { FloatingCallPanels } from './CallAlerts.js';
import { j as jsxRuntime, r as React } from '../chunks/dockGreeting.js';
import { Vn as accountAccent } from './standalone.js';
import { e as defaultAppearance, r as normalizeAppearance } from '../chunks/chatLocal.js';

import { Ud as usePrivateCallControls, qd as useMeetingControls } from './comm-commands.js';
import { UpdatePrompt, useDesktopUpdate } from './update.js';
import { hr as MeetingScreenView, Ko as LocalSharePreview, ol as PrivateCallPanels } from './meeting.js';
export function OfficeCommsView({
  office: office,
  account: account,
  onLogout: onLogout,
  dockPublisher: dockPublisher
}) {
  var P, y, S, E, x, D, C, M, g;
  useShellTitleSync();
  const hallVisible = useHallVisibility(),
    presence = usePresenceStatus(account.id),
    update = useDesktopUpdate(),
    [meetingScreen, setMeetingScreen] = React.useState(null),
    micActivity = useMicActivity(office.activeMic, office.micLive, office.micLive),
    meetingControls = useMeetingControls(office.meetings, office.videos, office.people, office.myId, account.id, () => {}, T => setMeetingScreen({
      id: T
    }), micActivity);
  React.useEffect(() => {
    setMeetingScreen(null);
  }, [(P = office.meetings.active) == null ? void 0 : P.room]);
  const meetingStream = meetingScreen ? meetingControls.streams[meetingScreen.id] : void 0;
  React.useEffect(() => {
    var T;
    meetingScreen && !((T = office.meetings.active) != null && T.sharing) && !meetingStream && setMeetingScreen(null);
  }, [meetingScreen, (y = office.meetings.active) == null ? void 0 : y.sharing, meetingStream]);
  const privateCalls = usePrivateCallControls(office, micActivity),
    screenControls = useScreenControls(office, meetingControls.streams);
  usePresenceNotifications({
    requests: office.requests,
    people: office.people,
    sharing: office.sharing,
    ringing: (meetingControls.state.invitations || []).map(T => T.id)
  });
  const dockChat = useDockChat({
    messages: office.messages,
    contacts: office.contacts,
    hidden: office.hiddenContacts,
    people: office.people,
    seats: office.seats,
    accountId: account.id,
    visitor: ((S = office.people.find(T => T.id === office.myId)) == null ? void 0 : S.role) === "visitor",
    send: office.chat,
    sendFile: office.sendChatFile,
    loadFile: office.loadChatFile,
    files: office.files
  });
  useDockStatePublisher({
    screens: screenControls.screens,
    onScreenCommand: screenControls.command,
    privateCalls: privateCalls.state,
    onPrivateCommand: privateCalls.command,
    enabled: !!((E = window.officeDesktop) != null && E.dockState),
    meeting: meetingControls.state,
    statuses: presence.statuses,
    onStatus: presence.show,
    onStatusClear: presence.clear,
    statusControl: presence.control,
    onMeetingCommand: meetingControls.command,
    huddles: meetingControls.huddles,
    chat: dockChat.chat,
    onChatCommand: dockChat.command,
    people: office.people,
    myId: office.myId,
    previews: office.previews,
    unread: dockChat.unread,
    missed: new Set(office.callAlerts.map(T => T.target)),
    sharing: office.sharing,
    connected: office.connected,
    onPreviewWant: office.notifyWatching,
    onAnswer: privateCalls.answer,
    onCommand: (T, A) => {
      T === "call" ? office.request(A, "voice") : office.request(A, "screen", T === "share");
    },
    onFiles: (T, A) => {
      var F;
      return void office.files.sendFiles(T, A, ((F = office.people.find(H => H.id === T)) == null ? void 0 : F.name) || "");
    },
    transfers: office.files.dockRows()
  }, dockPublisher);
  const [appearance, setAppearance] = React.useState(() => account.appearance ? normalizeAppearance(account.appearance) : defaultAppearance());
  function updateAppearance(T) {
    setAppearance(T), office.setAppearance(T);
  }
  const insecureContext = typeof window < "u" && window.isSecureContext === !1;
  return jsxRuntime.jsxs(jsxRuntime.Fragment, {
    children: [jsxRuntime.jsx("div", {
      className: "hall-window-drag",
      "aria-hidden": "true"
    }), jsxRuntime.jsxs("div", {
      className: "app hall-app",
      children: [presence.dialog, hallVisible && jsxRuntime.jsx(React.Suspense, {
        fallback: null,
        children: jsxRuntime.jsx(HallView, {
          office: office,
          accountId: account.id,
          appearance: appearance,
          onAppearance: updateAppearance,
          onLogout: onLogout,
          update: update
        })
      }), insecureContext && jsxRuntime.jsxs("div", {
        className: "hall-insecure",
        role: "alert",
        children: ["这个页面走的是 HTTP，浏览器不让共享屏幕和用麦克风。要用的话请打开 ", jsxRuntime.jsx("a", {
          href: `https://${location.host}/`,
          children: `https://${location.host}/`
        })]
      }), jsxRuntime.jsxs(FloatingCallPanels, {
        children: [jsxRuntime.jsx(PrivateCallPanels, {
          office: office,
          dockMode: !!((x = window.officeDesktop) != null && x.screenDock)
        }), !((D = window.officeDesktop) != null && D.screenDock) && office.videos["local-screen"] && Object.values(office.callStates).some(T => T.connected && T.sharing) && !office.meetings.sharing && jsxRuntime.jsx(LocalSharePreview, {
          stream: office.videos["local-screen"],
          meeting: !1,
          onStop: office.stopShare
        })]
      }), jsxRuntime.jsx(UpdatePrompt, {
        update: update
      }), screenControls.view && office.connected && jsxRuntime.jsx(MeetingScreenView, {
        stream: screenControls.view.stream,
        signal: office.signal,
        scope: screenControls.view.scope,
        annotation: office.annotation,
        selfColor: accountAccent(account.id),
        own: screenControls.view.own,
        annotatable: screenControls.view.annotatable,
        label: screenControls.view.name,
        shareControl: {
          sharing: screenControls.view.meeting ? office.meetings.sharing : !!((C = office.callStates[screenControls.view.sessionId]) != null && C.sharing),
          busy: screenControls.view.busy,
          error: screenControls.view.error,
          onToggle: () => screenControls.command({
            kind: "screen-control",
            personId: screenControls.view.id,
            text: "share"
          })
        },
        onClose: () => {
          var T, A;
          screenControls.closeView(), (A = (T = window.officeDesktop) == null ? void 0 : T.setFullscreen) == null || A.call(T, !1).then(() => {
            var F, H;
            return (H = (F = window.officeDesktop) == null ? void 0 : F.windowAction) == null ? void 0 : H.call(F, "minimize");
          }).catch(() => {});
        }
      }, `${screenControls.view.scope}:${screenControls.view.id}`), !screenControls.view && meetingScreen && office.connected && office.meetings.active && jsxRuntime.jsx(MeetingScreenView, {
        stream: meetingControls.streams[meetingScreen.id],
        signal: office.signal,
        scope: office.meetings.active.room,
        annotation: office.annotation,
        selfColor: accountAccent(account.id),
        own: meetingScreen.id === office.myId,
        shareControl: {
          sharing: meetingControls.state.sharing,
          busy: meetingControls.state.busy,
          error: meetingControls.state.error,
          onToggle: () => meetingControls.command({
            kind: "meeting-share",
            personId: office.meetings.active.id
          })
        },
        annotatable: ((M = office.people.find(T => T.id === meetingScreen.id)) == null ? void 0 : M.annotate) === !0,
        label: `${((g = office.people.find(T => T.id === meetingScreen.id)) == null ? void 0 : g.name) || "同事"}共享的屏幕`,
        onClose: () => setMeetingScreen(null)
      }, `${office.meetings.active.room}:${meetingScreen.id}`), hallVisible && account.lookConfirmed !== !0 && jsxRuntime.jsx(React.Suspense, {
        fallback: null,
        children: jsxRuntime.jsx(LookOnboarding, {
          account: account,
          appearance: appearance,
          onAppearance: updateAppearance
        })
      })]
    })]
  });
}
