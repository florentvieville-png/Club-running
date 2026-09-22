type IconProps = { className?: string };

export function HomeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth={2} stroke="currentColor">
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H10v-5a2 2 0 0 1 4 0v5h3.5a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth={2} stroke="currentColor">
      <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
      <path d="M3.5 9.5h17" strokeLinecap="round" />
      <path d="M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

export function PlusCircleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth={2} stroke="currentColor">
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 8v8M8 12h8" strokeLinecap="round" />
    </svg>
  );
}

export function ShopIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth={2} stroke="currentColor">
      <path d="M4.5 8.5h15l-1 11a1.5 1.5 0 0 1-1.5 1.4H7a1.5 1.5 0 0 1-1.5-1.4z" strokeLinejoin="round" />
      <path d="M8 8.5V7a4 4 0 0 1 8 0v1.5" strokeLinecap="round" />
    </svg>
  );
}

export function UserIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth={2} stroke="currentColor">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" strokeLinecap="round" />
    </svg>
  );
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth={2} stroke="currentColor">
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ShieldCheckIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth={2} stroke="currentColor">
      <path d="M12 3.5 5 6v6c0 4.5 3 7.5 7 8.5 4-1 7-4 7-8.5V6z" strokeLinejoin="round" />
      <path d="m9.5 12 2 2 3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth={2} stroke="currentColor">
      <path d="M9 20H5.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1H9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 16.5 20.5 12 16 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function LocationPinIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} strokeWidth={2} stroke="currentColor">
      <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}
