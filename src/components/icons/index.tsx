import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  width: "1em",
  height: "1em",
};

// ── Dashboard / Navigation ──
export function IconDashboard(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="3.5" y="3.5" width="7" height="9" rx="1" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1" />
      <rect x="3.5" y="15.5" width="7" height="5" rx="1" />
      <rect x="13.5" y="11.5" width="7" height="9" rx="1" />
    </svg>
  );
}

export function IconOrders(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M3.5 7.5l8.5-4 8.5 4v9l-8.5 4-8.5-4v-9z" />
      <path d="M3.5 7.5L12 11.5l8.5-4" />
      <path d="M12 11.5V20.5" />
      <path d="M7.75 5.5l8.5 4" opacity="0.5" />
    </svg>
  );
}

export function IconProducts(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M9 3h6M9.5 3v3.5l-2 2A4 4 0 006 11.5v6A2.5 2.5 0 008.5 20h7a2.5 2.5 0 002.5-2.5v-6a4 4 0 00-1.5-3.12l-2-2V3" />
      <path d="M6.5 13.5h11" opacity="0.5" />
    </svg>
  );
}

export function IconCustomers(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M3 19.5c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5" />
      <circle cx="16.5" cy="9" r="2.5" />
      <path d="M14.5 14h.5c2.5 0 4.5 1.8 4.5 4.5" />
    </svg>
  );
}

export function IconVoucher(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M3.5 8.5v-2A1.5 1.5 0 015 5h14a1.5 1.5 0 011.5 1.5v2a2 2 0 000 4v2A1.5 1.5 0 0119 16H5a1.5 1.5 0 01-1.5-1.5v-2a2 2 0 000-4z" />
      <path d="M9 5v15" strokeDasharray="1 2.5" />
    </svg>
  );
}

export function IconArticle(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M5 3.5h10l4 4v13a1 1 0 01-1 1H5a1 1 0 01-1-1V4.5a1 1 0 011-1z" />
      <path d="M14.5 3.5v4h4" />
      <path d="M7.5 12h9M7.5 15h9M7.5 18h6" />
    </svg>
  );
}

export function IconSettings(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.5 12a7.5 7.5 0 00-.18-1.62l2.05-1.55-1.5-2.6-2.4.85a7.5 7.5 0 00-2.8-1.6l-.4-2.55h-3l-.4 2.55a7.5 7.5 0 00-2.8 1.6l-2.4-.85-1.5 2.6 2.05 1.55A7.5 7.5 0 004.5 12c0 .55.06 1.1.18 1.62l-2.05 1.55 1.5 2.6 2.4-.85a7.5 7.5 0 002.8 1.6l.4 2.55h3l.4-2.55a7.5 7.5 0 002.8-1.6l2.4.85 1.5-2.6-2.05-1.55c.12-.52.18-1.07.18-1.62z" />
    </svg>
  );
}

// ── Stats ──
export function IconRevenue(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="2.5" y="6" width="19" height="12" rx="1.5" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M5.5 9.5h.5M18 14.5h.5" opacity="0.5" />
      <path d="M9.5 12h-.25M14.5 12h.25" opacity="0.5" />
    </svg>
  );
}

export function IconTrendUp(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M3 17l5-5 4 4 6-7" />
      <path d="M14 9h4v4" />
      <path d="M3 20.5h18" opacity="0.4" />
    </svg>
  );
}

export function IconClock(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function IconPackage(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M3.5 7.5l8.5-4 8.5 4v9l-8.5 4-8.5-4v-9z" />
      <path d="M3.5 7.5L12 11.5l8.5-4M12 11.5V20.5" />
    </svg>
  );
}

// ── Contact ──
export function IconPhone(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M5 4.5h2.5l1.5 4-2 1.5a11 11 0 005 5l1.5-2 4 1.5V17a2.5 2.5 0 01-2.5 2.5C8.5 19.5 4.5 15.5 4.5 7A2.5 2.5 0 015 4.5z" />
    </svg>
  );
}

export function IconMail(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="2.5" y="5" width="19" height="14" rx="1.5" />
      <path d="M3 7l9 6.5L21 7" />
    </svg>
  );
}

export function IconMapPin(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 21.5s7-6 7-11.5a7 7 0 10-14 0c0 5.5 7 11.5 7 11.5z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

// ── Decorative ──
export function IconStar(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3l2.7 5.8 6.3.7-4.7 4.4 1.3 6.4L12 17.3l-5.6 3 1.3-6.4L3 9.5l6.3-.7L12 3z" />
    </svg>
  );
}

export function IconStarFilled(p: IconProps) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...p}>
      <path d="M12 3l2.7 5.8 6.3.7-4.7 4.4 1.3 6.4L12 17.3l-5.6 3 1.3-6.4L3 9.5l6.3-.7L12 3z" />
    </svg>
  );
}

export function IconDiamond(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M6 3.5h12l3 5.5-9 11-9-11 3-5.5z" />
      <path d="M3 9h18M9 9l3-5.5L15 9M9 9l3 11M15 9l-3 11" opacity="0.6" />
    </svg>
  );
}

export function IconCrown(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M3 18.5h18M4 7l4 4 4-7 4 7 4-4-1.5 11.5h-13L4 7z" />
      <circle cx="4" cy="6" r="1" fill="currentColor" />
      <circle cx="12" cy="3" r="1" fill="currentColor" />
      <circle cx="20" cy="6" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconShield(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 3l8 3v5.5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function IconLeaf(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M5 21c.5-9 6-15 16-16-1 11-6 15-12 15.5C7 20.5 6 20 5 21z" />
      <path d="M5 21c4-7 8-10 14-12" opacity="0.5" />
    </svg>
  );
}

export function IconGem(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M5 8l3-4h8l3 4-7 12L5 8z" />
      <path d="M5 8h14M9 4l-1 4 4 12 4-12-1-4M9 4l3 4 3-4" opacity="0.6" />
    </svg>
  );
}

// ── Trust badges ──
export function IconTruck(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M2.5 6.5h11v11h-11z" />
      <path d="M13.5 9.5h4l3 3.5v4.5h-7" />
      <circle cx="6.5" cy="17.5" r="2" />
      <circle cx="17" cy="17.5" r="2" />
    </svg>
  );
}

export function IconRefresh(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M21 12a9 9 0 11-3-6.7" />
      <path d="M21 4v5h-5" />
    </svg>
  );
}

export function IconCheckCircle(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </svg>
  );
}

// ── Common ──
export function IconArrowRight(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconArrowLeft(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function IconChevronDown(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function IconClose(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconPlus(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconHeart(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M12 20.5l-1.4-1.3C5.4 14.6 2 11.5 2 7.7 2 4.6 4.4 2 7.5 2c1.7 0 3.3.8 4.5 2 1.2-1.2 2.8-2 4.5-2C19.6 2 22 4.6 22 7.7c0 3.8-3.4 6.9-8.6 11.5L12 20.5z" />
    </svg>
  );
}

export function IconHeartFilled(p: IconProps) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...p}>
      <path d="M12 20.5l-1.4-1.3C5.4 14.6 2 11.5 2 7.7 2 4.6 4.4 2 7.5 2c1.7 0 3.3.8 4.5 2 1.2-1.2 2.8-2 4.5-2C19.6 2 22 4.6 22 7.7c0 3.8-3.4 6.9-8.6 11.5L12 20.5z" />
    </svg>
  );
}

export function IconSearch(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="M16 16l5 5" />
    </svg>
  );
}

export function IconCart(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M2.5 4.5h2.5l2.5 12.5h11l2-9h-13" />
      <circle cx="9" cy="20.5" r="1.5" />
      <circle cx="17" cy="20.5" r="1.5" />
    </svg>
  );
}

export function IconUser(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}

export function IconEye(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconEdit(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M14 4l6 6L9 21H3v-6L14 4z" />
      <path d="M13 5l6 6" />
    </svg>
  );
}

export function IconTrash(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M3.5 6.5h17M8 6.5V4.5a1 1 0 011-1h6a1 1 0 011 1v2M5.5 6.5L7 21h10l1.5-14.5M10 11v6M14 11v6" />
    </svg>
  );
}

export function IconFlower(p: IconProps) {
  // A delicate flower / lotus motif for luxurious accent
  return (
    <svg {...base} {...p}>
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10c-1-3-3-4.5-3-7 0-1.5 1.5-2 3-2s3 .5 3 2c0 2.5-2 4-3 7z" />
      <path d="M14 12c3-1 4.5-3 7-3 1.5 0 2 1.5 2 3s-.5 3-2 3c-2.5 0-4-2-7-3z" />
      <path d="M12 14c1 3 3 4.5 3 7 0 1.5-1.5 2-3 2s-3-.5-3-2c0-2.5 2-4 3-7z" />
      <path d="M10 12c-3 1-4.5 3-7 3-1.5 0-2-1.5-2-3s.5-3 2-3c2.5 0 4 2 7 3z" />
    </svg>
  );
}
