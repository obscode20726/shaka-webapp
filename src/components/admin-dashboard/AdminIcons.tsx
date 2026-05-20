type IconProps = {
  className?: string;
};

const iconProps = (className = "h-4 w-4") => ({
  className,
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 2,
  viewBox: "0 0 24 24",
});

export function PhoneIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)} aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72c.12.92.33 1.82.63 2.68a2 2 0 0 1-.45 2.11L8 9.79a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.86.3 1.76.51 2.68.63A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)} aria-hidden="true">
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function BriefcaseIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)} aria-hidden="true">
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

export function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function XCircleIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

export function AlertCircleIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)} aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function FilterIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)} aria-hidden="true">
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z" />
    </svg>
  );
}

export function UserCheckIcon({ className }: IconProps) {
  return (
    <svg {...iconProps(className)} aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="m16 11 2 2 4-4" />
    </svg>
  );
}
