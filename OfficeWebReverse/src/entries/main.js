import { AccountGate } from '../app/AccountGate.js';
import { markDesktopDocument } from '../app/desktopChrome.js';
import { chooseHostRole, isCommsHostEnabled, logoutHost } from '../app/hostCommands.js';
import { OfficeSpace } from '../app/OfficeSpace.js';
import { j as jsxRuntime, R as ReactDOM } from '../chunks/dockGreeting.js';

markDesktopDocument();
ReactDOM.createRoot(document.getElementById('root')).render(jsxRuntime.jsx(AccountGate, {
  isHostEnabled: isCommsHostEnabled,
  chooseHostRole,
  logoutHost,
  OfficeSpace,
}));
