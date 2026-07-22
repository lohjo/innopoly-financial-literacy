import { Check, X } from "lucide-react";

export function CourseArt({ size = 170 }: { size?: number }) {
  return (
    <svg viewBox="0 0 180 160" width={size} height={(size * 160) / 180} aria-hidden="true">
      <path d="M25 22h120v111H25z" fill="#6f35cc" rx="6" />
      <path d="M37 22h111v111H37z" fill="#a367ff" />
      <path d="M37 22h111v28H37z" fill="#7c3fd9" />
      <circle cx="49" cy="36" r="4" fill="#ffc820" /><circle cx="61" cy="36" r="4" fill="#ffc820" /><circle cx="73" cy="36" r="4" fill="#ffc820" />
      <path d="M37 49h110v22H37z" fill="#bd90ff" />
      <path d="M78 49h69v22H78z" fill="#cfaeff" />
      <path d="M46 75h64l-11 48H59z" fill="#caa5ff" stroke="#6e39cf" strokeWidth="3" />
      <path d="M55 77l17 45M83 77l-17 45M96 77l-17 45" stroke="#7c48dc" strokeWidth="3" />
      <rect x="107" y="75" width="50" height="20" rx="5" fill="#8242e2" />
      <path d="M76 115h33l11-28h25l10 46H89z" fill="#d0adff" />
      <path d="M103 95h28l11 39h-31z" fill="#7040d0" stroke="#5b2cb7" strokeWidth="3" />
      <Check x={111} y={103} width={20} height={20} color="#f8cd25" strokeWidth={3.5} />
      <path d="M148 111l27 0-27 27z" fill="#c8a800" />
      <path d="M25 45h12v88H25z" fill="#4d238d" opacity=".65" />
    </svg>
  );
}

export function SchedulerArt() {
  return (
    <div className="b-player-illustration" aria-hidden="true">
      <span className="tile" style={{ left: 106, top: 68 }}><X /></span>
      <span className="tile ok" style={{ left: 156, top: 30 }}><Check /></span>
      <span className="tile" style={{ left: 204, top: 52 }}><X /></span>
      <span className="tile ok" style={{ left: 245, top: 86 }}><Check /></span>
    </div>
  );
}

export function Bolt({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 58" width={size} height={(size * 58) / 40} aria-hidden="true">
      <path d="M23 1L3 34h15l-3 23 22-36H23z" fill="#ddff1f" stroke="#efff8a" strokeLinejoin="round" strokeWidth="3" />
    </svg>
  );
}

export function MiniDisc({ locked = false }: { locked?: boolean }) {
  return (
    <svg viewBox="0 0 90 62" width="74" aria-hidden="true" style={{ filter: locked ? "grayscale(1)" : undefined, opacity: locked ? .55 : 1 }}>
      <ellipse cx="45" cy="37" rx="39" ry="20" fill="#6523ac" />
      <ellipse cx="45" cy="30" rx="38" ry="21" fill="#9e5dff" />
      <ellipse cx="45" cy="28" rx="25" ry="14" fill="#d5bcff" />
      <ellipse cx="45" cy="27" rx="18" ry="10" fill="#b383ff" />
      <Check x={36} y={17} width={18} height={18} color="white" strokeWidth={3} />
    </svg>
  );
}
