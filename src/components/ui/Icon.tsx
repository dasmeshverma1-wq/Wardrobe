import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 20, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...rest,
  };
}

export const HangerIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 7a2 2 0 1 1 2-2" />
    <path d="M12 7v3" />
    <path d="M3 18l9-5 9 5v1H3v-1z" />
  </svg>
);

export const HomeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" />
  </svg>
);

export const PlusIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const CameraIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);

export const ImageIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.5" />
    <path d="m3 17 5-5 4 4 3-3 6 6" />
  </svg>
);

export const LinkIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 1 0-5.66-5.66L11 7" />
    <path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 1 0 5.66 5.66L13 17" />
  </svg>
);

export const BagIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 8h14l-1 12H6L5 8z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </svg>
);

export const CalendarIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

/** MDL straight-arrow-left (Figma CXgSzj5KIyX63AoEqE2P3p node 191:5). */
export const StraightArrowLeftIcon = ({ size = 24, ...rest }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
    {...rest}
  >
    <g transform="translate(3, 4)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.53033 15.7803C8.23744 16.0732 7.76256 16.0732 7.46967 15.7803L0.219669 8.53033C-0.0732231 8.23744 -0.0732231 7.76256 0.219669 7.46967L7.46967 0.21967C7.76256 -0.0732234 8.23744 -0.0732234 8.53033 0.21967C8.82322 0.512563 8.82322 0.987437 8.53033 1.28033L1.81066 8L8.53033 14.7197C8.82322 15.0126 8.82322 15.4874 8.53033 15.7803Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18 8C18 8.41421 17.6642 8.75 17.25 8.75H0.75C0.335787 8.75 0 8.41421 0 8C0 7.58579 0.335787 7.25 0.75 7.25H17.25C17.6642 7.25 18 7.58579 18 8Z"
        fill="currentColor"
      />
    </g>
  </svg>
);

export const ArrowLeftIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const ShareIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3v12" />
    <path d="m8 7 4-4 4 4" />
    <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
  </svg>
);

export const TrashIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16" />
    <path d="M9 7V4h6v3" />
    <path d="M6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m5 12 5 5 9-11" />
  </svg>
);

export const CloseIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const SunIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5" />
  </svg>
);

export const CloudIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 18a4 4 0 1 1 .8-7.9A6 6 0 0 1 19 12a4 4 0 0 1 0 6H7z" />
  </svg>
);

export const RainIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 14a4 4 0 1 1 .8-7.9A6 6 0 0 1 19 8a4 4 0 0 1 0 8" />
    <path d="M9 18l-1 3M13 18l-1 3M17 18l-1 3" />
  </svg>
);

export const RotateIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

export const LayersIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m12 3 9 5-9 5-9-5 9-5z" />
    <path d="m3 13 9 5 9-5" />
    <path d="m3 18 9 5 9-5" />
  </svg>
);

/** Stacked cards — clearer at 14px for Wardrobe → Sets. */
export const CollectionIcon = (p: IconProps) => (
  <svg {...base({ strokeWidth: 1.75, ...p })}>
    <rect x="3" y="11" width="13" height="10" rx="2" />
    <rect x="6" y="7" width="13" height="10" rx="2" />
    <rect x="9" y="3" width="13" height="10" rx="2" />
  </svg>
);

/** Saved look / outfit silhouette for Wardrobe → Outfits. */
export const OutfitIcon = (p: IconProps) => (
  <svg {...base({ strokeWidth: 1.75, ...p })}>
    <path d="M12 4v2.5" />
    <path d="M9 6.5h6" />
    <path d="M8 6.5 6 11v9h12v-9l-2-4.5" />
    <path d="M9.5 14h5" />
  </svg>
);

/** Calendar + pin — Plan a look hero affordance. */
export const PlanLookIcon = (p: IconProps) => (
  <svg {...base({ strokeWidth: 1.75, ...p })}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M16 3.5v3M8 3.5v3M3 10h18" />
    <path d="M12 16v-4" />
    <circle cx="12" cy="16" r="1.75" fill="currentColor" stroke="none" />
  </svg>
);

export const SparklesIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 2.5v2.5M12 19v2.5M4.5 12H2M22 12h-2.5" />
    <path d="M6.8 6.8l1.8 1.8M15.4 15.4l1.8 1.8M6.8 17.2l1.8-1.8M15.4 8.6l1.8-1.8" />
    <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

export const UserIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export const SnowIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3v18M5 7l14 10M5 17 19 7M3 12h18" />
  </svg>
);

export const WindIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 8h11a3 3 0 1 0-3-3" />
    <path d="M3 16h17a3 3 0 1 1-3 3" />
  </svg>
);

export const FunnelIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 5h16l-6 8v5l-4 2v-7L4 5z" />
  </svg>
);

export const UndoIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 14l-5-5 5-5" />
    <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
  </svg>
);

export const PinIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 2v6M9 8h6l-2 6h-2L9 8z" />
    <path d="M12 14v8" />
  </svg>
);

export const ArrowUpIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

export const ArrowDownIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
);

/** Myntra AI sparkle mark — Figma “Sparkle new” (Looks on PDP). */
const AI_SPARKLE_STAR_LG =
  'M5.64988 0.652813C5.77733 0.309189 6.26375 0.309094 6.39109 0.652813L7.55125 3.78855C7.67131 4.113 7.927 4.36967 8.25145 4.48973L11.3872 5.64988C11.7312 5.77717 11.7312 6.26381 11.3872 6.39109L8.25145 7.55125C7.92707 7.67131 7.67131 7.92707 7.55125 8.25145L6.39109 11.3872C6.26381 11.7312 5.77717 11.7312 5.64988 11.3872L4.48973 8.25145C4.36967 7.927 4.113 7.67131 3.78855 7.55125L0.652813 6.39109C0.309096 6.26375 0.309188 5.77733 0.652813 5.64988L3.78855 4.48973C4.113 4.36967 4.36967 4.113 4.48973 3.78855L5.64988 0.652813Z';

const AI_SPARKLE_STAR_SM =
  'M1.11982 0.109452C1.17382 -0.0364838 1.38023 -0.036484 1.43423 0.109452L1.68038 0.774644C1.69735 0.820526 1.73353 0.856701 1.77941 0.873679L2.4446 1.11982C2.59054 1.17382 2.59054 1.38023 2.4446 1.43423L1.77941 1.68038C1.73353 1.69735 1.69735 1.73353 1.68038 1.77941L1.43423 2.4446C1.38023 2.59054 1.17382 2.59054 1.11982 2.4446L0.873679 1.77941C0.856701 1.73353 0.820526 1.69735 0.774644 1.68038L0.109452 1.43423C-0.0364838 1.38023 -0.036484 1.17382 0.109452 1.11982L0.774644 0.873679C0.820526 0.856701 0.856701 0.820526 0.873679 0.774644L1.11982 0.109452Z';

const AI_SPARKLE_STAR_MD =
  'M1.54642 0.151147C1.62099 -0.0503828 1.90603 -0.0503822 1.98061 0.151148L2.32052 1.06975C2.34397 1.13311 2.39392 1.18306 2.45728 1.20651L3.37588 1.54642C3.57741 1.62099 3.57741 1.90603 3.37588 1.98061L2.45728 2.32052C2.39392 2.34397 2.34397 2.39392 2.32052 2.45728L1.98061 3.37588C1.90603 3.57741 1.62099 3.57741 1.54642 3.37588L1.20651 2.45728C1.18306 2.39392 1.13311 2.34397 1.06975 2.32052L0.151147 1.98061C-0.0503828 1.90603 -0.0503822 1.62099 0.151148 1.54642L1.06975 1.20651C1.13311 1.18306 1.18306 1.13311 1.20651 1.06975L1.54642 0.151147Z';

export const AiSparkleIcon = ({ size = 20, className, style, ...rest }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    className={className}
    style={style}
    aria-hidden
    {...rest}
  >
    <g transform="translate(0 1.07) scale(1.247)">
      <path fill="currentColor" d={AI_SPARKLE_STAR_LG} />
    </g>
    <g transform="translate(12.814 3.635) scale(1.252)">
      <path fill="currentColor" d={AI_SPARKLE_STAR_SM} />
    </g>
    <g transform="translate(9.176 0.635) scale(1.247)">
      <path fill="currentColor" d={AI_SPARKLE_STAR_MD} />
    </g>
  </svg>
);

/** @deprecated Use AiSparkleIcon — kept for existing imports. */
export const WandIcon = AiSparkleIcon;

export const CircleIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8" />
  </svg>
);

export const EditIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14.5 4.5 19 9 8 20H4v-4l10.5-11.5z" />
    <path d="m13 6 4 4" />
  </svg>
);

export const StackIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="12" height="12" rx="2" />
    <path d="M8 20h12a0 0 0 0 0 0 0V8" />
  </svg>
);

export const ExternalLinkIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14 4h6v6" />
    <path d="M20 4 10 14" />
    <path d="M14 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2h6" />
  </svg>
);

export const HeartIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 20s-7-4.5-9.2-9.1A5.5 5.5 0 0 1 12 5a5.5 5.5 0 0 1 9.2 5.9C19 15.5 12 20 12 20z" />
  </svg>
);

export const CardsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="7" width="13" height="14" rx="2" />
    <path d="M8 7V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v12" />
  </svg>
);

export const MixIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h6l4 10h6" />
    <path d="M14 7h6" />
    <path d="m17 4 3 3-3 3" />
    <path d="m7 14-3 3 3 3" />
    <path d="M4 17h6" />
  </svg>
);
