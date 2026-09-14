/** Decorative architectural study, separate from the interactive office. */
export default function SpaceArtwork() {
  return (
    <svg className="space-artwork" viewBox="0 0 640 360" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="space-floor" x1="120" y1="170" x2="450" y2="350" gradientUnits="userSpaceOnUse">
          <stop stopColor="#b4b89c" stopOpacity=".3" />
          <stop offset="1" stopColor="#b4b89c" stopOpacity=".03" />
        </linearGradient>
      </defs>
      <g stroke="#d0d3b9" strokeWidth="1" strokeLinejoin="round">
        <path d="M74 224 321 96 571 224 323 352Z" fill="url(#space-floor)" />
        <path d="M74 224V92L321 12V96M321 12 571 92V224" opacity=".35" />
        <path d="M94 213V104L301 36V107M122 198V94M160 179V82M198 159V69M237 140V56M275 120V44" opacity=".3" />
        <path d="M339 36 549 104V212M339 36V105M380 50V125M422 64V148M464 77V168M506 90V191" opacity=".3" />
        <path d="m174 208 107-55 116 60-108 57Z" fill="#7c8469" />
        <path d="M174 208v9l115 60 108-55v-9M184 222v52M289 277v51M387 227v48" />
        <path d="m219 192 43-22 1-35-44 22Z" fill="#263a31" />
        <path d="m237 187 1 14 14 7 17-8M304 235l42-22" opacity=".7" />
        <path d="M442 243v-37m-12 48 12-11 14 4" />
        <path d="M420 191q22-15 43 0v29q-22 16-43 0Z" fill="#596850" />
        <path d="M136 145v-34m0 20q-29-3-25-26 25 0 25 26Zm0-9q27-4 24-26-24 2-24 26Z" fill="#768565" />
        <path d="m123 143 26-2-4 29-18 1Z" fill="#b39e7c" />
        <path d="m449 113 32 10M431 121l32 10M413 129l32 10" opacity=".35" />
      </g>
      <circle cx="514" cy="46" r="24" fill="#ceb98f" opacity=".75" />
      <path d="M52 286h66m-33-33v66M518 298h66m-33-33v66" stroke="#d0d3b9" opacity=".2" />
    </svg>
  );
}
