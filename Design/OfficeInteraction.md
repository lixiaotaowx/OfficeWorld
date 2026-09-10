# Virtual office interaction

## First implementation

Native UE UMG HUD over the existing OfficeNatural_A level. Default permission is
view-only. No screen is captured or transmitted by this local UI implementation.
Demo participants and permission responses must be visibly identified as local
simulation until a real authenticated session and media transport are connected.

- Nearby workstation: name, availability, occupancy, request to view screen.
- Own chair: sit, stand, occupied state, safe standing location.
- Outgoing request: pending, cancel, declined, expired, approved.
- Incoming request: identity, requested scope, allow once, decline.
- Active viewing: viewing identity, read-only badge, disconnect.
- Active sharing: viewer identity, stop sharing; permission ends on disconnect.
- Busy/offline: no request; proximity must never imply permission.

## Runtime boundaries

Seat ownership, participant identity, proximity and consent must be checked by
the authoritative server when network support is added. Request IDs are unique;
responses must match requester, target, session and pending request. Permissions
expire and are revoked on disconnect, leaving the office or explicit stop.
An approval must not automatically select or capture a desktop. The sharer must
choose a window/screen through the media capture integration.

Native UI/seat interaction is separate from MetaHuman production readiness.
The existing editor preview is not the runtime avatar or a seated animation.

## Validation

Test in actual PIE: proximity enter/leave, sit/stand twice, occupied rejection,
cancel and late approval, timeout, decline/retry, allow then stop, focus restoration,
and menu dismissal. Run two authenticated clients before claiming network support.

## Implemented and verified on 2026-09-08

`WBP_OfficeHUD` and `BP_OfficeInteraction` are saved native Blueprint assets, and
the manager plus A-01 seat camera are placed in `OfficeNatural_A`. Ordinary PIE
starts by the user's own station. The screen UI is not a browser overlay.

Twenty actual PIE tests passed in `OfficeWorld/Saved/office-interaction-tests.json`.
They use the real UMG button delegates and player movement component, covering
proximity, repeated sit/stand, chair ownership, pending/cancel/late approval,
decline, view-only approval, stop, a real 30-second outgoing timeout, incoming
allow/deny, late incoming approval, busy/offline, and leaving the proximity area.
Native Slate clicks and Tab input were also checked; menu mode switched true to
false and back to true. Screenshots were inspected in the running UE viewport.

Controls: WASD moves; Tab switches cursor/camera mode. Own-seat interaction is
available through either the proximity card or bottom toolbar. The local consent
test controls explicitly say “演示”. No real desktop/window was captured or sent.

Seat movement now uses a visible third-person body, native authored SitDown / Work / StandUp animations, a transition gate and seated camera pitch limits. Eight native Enhanced Input/body checks passed, including actual second seating and post-stand movement. Return-to-standing uses the prior position; dynamic-obstacle handling and server seat arbitration remain required before multiplayer use.

Source builders and corrective scripts are under `OfficeWorld/Content/Python`.
Several are one-time asset builders, not a generic idempotent migration system;
do not overwrite a subsequently edited widget by rerunning the original layout
builder. Saved Blueprint assets contain the tested final graph state.

## Independent build validation

DeliveryBuild6 and DeliveryBuild7 completed Win64 cook, stage, package and archive successfully. The independent executable loaded OfficeNatural_A and BP_OfficeGameMode_C. A dedicated -OfficeWorldSmokeTest native Blueprint probe verifies stable-frame HUD, character and Enhanced Input displacement in the packaged program; results are not yet accepted. Editor-only tools are excluded from Game targets and disabled during cooking. VC++ runtime updated from Microsoft-signed installer without automatically rebooting.

Important save fix: duplicated character/GameMode and authored animation packages required forced save with only_if_is_dirty=False. Their on-disk files now exist, and independent cooking/loading replaces earlier editor-memory-only evidence.
