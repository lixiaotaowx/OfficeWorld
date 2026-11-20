import { isCommsHostEnabled } from './hostCommands.js';
import { OfficeCommsView } from './OfficeCommsView.js';
import { Ss } from './standalone.js';
import { r as I, j as v } from '../chunks/dockGreeting.js';
import { useBrowserOffice } from './useBrowserOffice.js';
import { useHostOffice } from './useHostOffice.js';
function OfficeSpace({
  account: i,
  onLogout: e
}) {
  return isCommsHostEnabled() && Ss() ? v.jsx(HostedOffice, {
    account: i,
    onLogout: e
  }) : v.jsx(BrowserOffice, {
    account: i,
    onLogout: e
  });
}
function BrowserOffice({
  account: i,
  onLogout: e
}) {
  const t = useBrowserOffice(i);
  return v.jsx(OfficeCommsView, {
    office: t,
    account: i,
    onLogout: e
  });
}
function HostedOffice({
  account: i,
  onLogout: e
}) {
  const t = useHostOffice(),
    n = I.useRef(t);
  n.current = t;
  const s = I.useMemo(() => ({
    snapshot: () => {
      const r = n.current;
      return {
        people: r.people,
        myId: r.myId,
        previews: r.previews,
        sharing: r.sharing,
        connected: r.connected,
        transfers: r.files.dockRows()
      };
    }
  }), []);
  return v.jsx(OfficeCommsView, {
    office: t,
    account: i,
    onLogout: e,
    dockPublisher: s
  });
}

export { OfficeSpace };
