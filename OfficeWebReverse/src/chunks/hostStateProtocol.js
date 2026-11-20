import { io as ue } from '../vendor/socket.io.js';
var Ge = Object.defineProperty;
var Qe = (n, e, t) => e in n ? Ge(n, e, {
  enumerable: !0,
  configurable: !0,
  writable: !0,
  value: t
}) : n[e] = t;
var V = (n, e, t) => Qe(n, typeof e != "symbol" ? e + "" : e, t);
import {
  f as Ze,
  o as et,
  g as tt,
  u as nt,
  l as Ee,
  m as st,
  P as rt,
  h as Se,
  A as it,
  i as J,
  C as oe,
  W as ot,
  j as K,
  d as at,
  t as Ae,
  b as ct,
  F as ht,
  k as Te,
  B as Oe,
  n as ft,
  p as lt,
  q as ut,
  v as dt,
  w as pt
} from "./chatLocal.js";

import { setNotificationSound as Bn } from '../app/notificationSounds.js';
import { ringCallChime as qn } from '../app/notificationSounds.js';
import { unlockAudioAndNotifications as Ce } from '../app/notificationSounds.js';
import { StateAccumulator as ns } from '../app/socketStateSync.js';
import { MESSAGE_SOUNDS as mt } from '../app/notificationSounds.js';
import { createOfficeActions as Yn } from '../app/officeSocket.js';
import { attachDesktopNotifications as In } from '../app/desktopNotifications.js';
import { createTransferManager as Fn } from '../app/transferManager.js';
import { IDLE_POLL_SECONDS as xn } from '../app/deskPresence.js';
import { createChatStore as Ln } from '../app/chatLocalStore.js';
import { createSocketBridge as Kn } from '../app/officeSocket.js';
import { subscribeSocketRoom as jn } from '../app/officeSocket.js';
import { formatDeskTooltip as Un } from '../app/deskPresence.js';
import { computeDeskGeometry as Dn } from '../app/deskPresence.js';
import { sameCursorPayload as Xn } from '../app/socketStateSync.js';
import { createBilliardsSync as Nn } from '../app/billiardsSync.js';
import { computeDeskSnapshot as zn } from '../app/deskPresence.js';
import { trackSocketPreview as $n } from '../app/officeSocket.js';
import { createCatFeeder as ts } from '../app/socketStateSync.js';
import { createDeskBookings as Gn } from '../app/socketStateSync.js';
import { sameDeskBookings as Qn } from '../app/socketStateSync.js';
import { filterRowFields as Mn } from '../app/officeTransfers.js';
import { disposeSocketHooks as Jn } from '../app/socketStateSync.js';
import { sameBuildState as Zn } from '../app/socketStateSync.js';
import { sameCatState as es } from '../app/socketStateSync.js';
import { createDeskSensor as Hn } from '../app/deskPresence.js';
import { sameDeskOccupancy as Vn } from '../app/deskPresence.js';
import { sameCallStates as Pn } from '../app/officeTransfers.js';
import { createBilliardsPoller as ss } from '../app/socketStateSync.js';
import { getNotificationSound as gt } from '../app/notificationSounds.js';
export {
  Bn as A, qn as B, Ce as C, ns as H, mt as M, Yn as a, In as b, Fn as c, xn as d, Ln as e, Kn as f, jn as g, Un as h, Dn as i, Xn as j, Nn as k, ue as l, zn as m, $n as n, ts as o, Gn as p, Qn as q, Mn as r, Jn as s, Zn as t, es as u, Hn as v, Vn as w, Pn as x, ss as y, gt as z
};