// Shared inline SVG icons for the left rail and other UI chrome. They are
// stroke icons drawn in `currentColor`, so their colour follows the button text
// (dim on the dark rail, dark green when a rail item is active).
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function MicIcon(props: IconProps) {
  return <Svg {...props}><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8" /></Svg>;
}

export function ScreenIcon(props: IconProps) {
  return <Svg {...props}><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M12 17v4m-4 0h8M9 10l3-3 3 3m-3-3v7" /></Svg>;
}

export function PreviewIcon(props: IconProps) {
  return <Svg {...props}><path d="M2 12s3-6 10-6 10 6 10 6-3 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></Svg>;
}

/** Update prompt: a download arrow into a tray. */
export function DownloadIcon(props: IconProps) {
  return <Svg {...props}><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 20h14" /></Svg>;
}

/** "Me": head and shoulders, used where the top-right chip used to say 我. */
export function PersonIcon(props: IconProps) {
  return <Svg {...props}><circle cx="12" cy="8.4" r="3.6" /><path d="M5.4 20a6.6 6.6 0 0 1 13.2 0" /></Svg>;
}

function Svg(props: IconProps) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

/** The 3D space overview (a 2×2 layout of panes). */
export function OverviewIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.4" y="3.4" width="7.2" height="7.2" rx="1.6" />
      <rect x="13.4" y="3.4" width="7.2" height="7.2" rx="1.6" />
      <rect x="3.4" y="13.4" width="7.2" height="7.2" rx="1.6" />
      <rect x="13.4" y="13.4" width="7.2" height="7.2" rx="1.6" />
    </Svg>
  );
}

/** Team members (two people). */
export function MembersIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9" cy="8" r="3.1" />
      <path d="M3.6 19c.6-2.9 2.7-4.5 5.4-4.5s4.8 1.6 5.4 4.5" />
      <circle cx="16.4" cy="9.2" r="2.4" />
      <path d="M16.2 14.7c2.1.2 3.6 1.5 4.1 3.7" />
    </Svg>
  );
}

/** Room chat (a speech bubble). */
export function ChatIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 6.3A2.3 2.3 0 0 1 6.3 4h11.4A2.3 2.3 0 0 1 20 6.3v7.4a2.3 2.3 0 0 1-2.3 2.3H9.6L4.6 19.3V6.3Z" />
      <path d="M8.2 9.2h7.6M8.2 12.5h4.6" />
    </Svg>
  );
}

/** Administrator panel (a shield with a check mark). */
export function AdminIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5 5.5 6v4.6c0 4.1 2.7 7.6 6.5 8.9 3.8-1.3 6.5-4.8 6.5-8.9V6L12 3.5Z" />
      <path d="M9.3 11.7l1.9 1.9 3.5-3.7" />
    </Svg>
  );
}

/** Help / usage guide (a circled question mark). */
export function HelpIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.3" />
      <path d="M9.7 9.2a2.3 2.3 0 1 1 3.7 1.9c-.8.5-1.3 1-1.3 2.1" />
      <path d="M12 16.5h.01" />
    </Svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return <Svg {...props}>
    <path d="M4 7h16M4 17h16M8 4v6M16 14v6" />
  </Svg>;
}

export function MicOffIcon(props: IconProps) {
  return <Svg {...props}><path d="m3 3 18 18M9 9v3a3 3 0 0 0 5 2M9 5a3 3 0 0 1 6 0v5M5 10v2a7 7 0 0 0 12 5M19 10v2M12 19v3m-4 0h8" /></Svg>;
}
export function PhoneIcon(props: IconProps) {
  return <Svg {...props}><path d="M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2C10 21 3 14 3 5a2 2 0 0 1 2-2Z" /></Svg>;
}
export function HangupIcon(props: IconProps) {
  return <Svg {...props}><path d="M3 16v-4c5-5 13-5 18 0v4h-5v-4M8 12v4H3" /></Svg>;
}
export function CloseIcon(props: IconProps) {
  return <Svg {...props}><path d="m6 6 12 12M6 18 18 6" /></Svg>;
}
export function BellIcon(props: IconProps) {
  return <Svg {...props}><path d="M5 17h14l-2-3V9a5 5 0 0 0-10 0v5l-2 3ZM10 21h4M12 2v2" /></Svg>;
}
