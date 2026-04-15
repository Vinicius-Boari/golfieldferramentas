import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Wrench, Shield, Truck, Zap, Package } from "lucide-react";
import { products } from "@/data/products";

const WhatsAppIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

/* ========== REALISTIC TOOL SVGs ========== */

const WrenchSVG = () => (
  <svg width="220" height="220" viewBox="0 0 200 200" className="filter drop-shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
    <defs>
      <linearGradient id="wBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(215,25%,78%)" />
        <stop offset="25%" stopColor="hsl(215,20%,62%)" />
        <stop offset="50%" stopColor="hsl(215,18%,50%)" />
        <stop offset="75%" stopColor="hsl(215,15%,42%)" />
        <stop offset="100%" stopColor="hsl(215,12%,32%)" />
      </linearGradient>
      <linearGradient id="wShine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(215,25%,90%)" stopOpacity="0.6" />
        <stop offset="40%" stopColor="hsl(215,25%,90%)" stopOpacity="0.1" />
        <stop offset="100%" stopColor="transparent" stopOpacity="0" />
      </linearGradient>
      <linearGradient id="wGrip" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(0,65%,35%)" />
        <stop offset="30%" stopColor="hsl(0,75%,48%)" />
        <stop offset="70%" stopColor="hsl(0,78%,52%)" />
        <stop offset="100%" stopColor="hsl(0,65%,35%)" />
      </linearGradient>
      <linearGradient id="wGripHL" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="transparent" />
        <stop offset="30%" stopColor="hsl(0,78%,65%)" stopOpacity="0.35" />
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
      <filter id="wShadow"><feDropShadow dx="2" dy="5" stdDeviation="6" floodColor="hsl(0,0%,0%)" floodOpacity="0.5"/></filter>
      <filter id="wInner"><feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="hsl(0,0%,0%)" floodOpacity="0.3"/></filter>
    </defs>
    {/* Handle shaft */}
    <rect x="88" y="70" width="24" height="105" rx="4" fill="url(#wBody)" filter="url(#wShadow)" />
    <rect x="90" y="72" width="6" height="100" rx="3" fill="url(#wShine)" />
    <rect x="110" y="72" width="2" height="100" rx="1" fill="hsl(215,10%,28%)" opacity="0.5" />
    {/* Red grip */}
    <rect x="85" y="132" width="30" height="45" rx="5" fill="url(#wGrip)" />
    <rect x="85" y="132" width="30" height="45" rx="5" fill="url(#wGripHL)" />
    {/* Grip texture */}
    {[0,1,2,3,4,5,6,7,8].map(i => (
      <React.Fragment key={i}>
        <rect x="88" y={136 + i * 4.5} width="24" height="1.2" rx="0.6" fill="hsl(0,55%,30%)" opacity="0.5" />
        <rect x="88" y={137.5 + i * 4.5} width="24" height="0.6" rx="0.3" fill="hsl(0,78%,62%)" opacity="0.15" />
      </React.Fragment>
    ))}
    {/* Grip end cap */}
    <rect x="87" y="174" width="26" height="5" rx="2.5" fill="hsl(0,60%,28%)" />
    {/* Head - left jaw */}
    <path d="M78 70 L78 22 Q78 10 88 6 L92 5 L92 45 L88 70Z" fill="url(#wBody)" filter="url(#wShadow)" />
    <rect x="80" y="15" width="4" height="52" rx="2" fill="url(#wShine)" opacity="0.5" />
    {/* Head - right jaw */}
    <path d="M122 70 L122 22 Q122 10 112 6 L108 5 L108 45 L112 70Z" fill="url(#wBody)" filter="url(#wShadow)" />
    <rect x="119" y="15" width="2" height="52" rx="1" fill="hsl(215,10%,28%)" opacity="0.4" />
    {/* Jaw opening (dark interior) */}
    <rect x="92" y="5" width="16" height="55" fill="hsl(220,25%,3%)" />
    {/* Jaw serrations */}
    {[0,1,2,3,4,5,6].map(i => (
      <React.Fragment key={`s${i}`}>
        <rect x="92" y={12 + i * 6} width="2" height="3" rx="0.5" fill="hsl(215,15%,45%)" opacity="0.4" />
        <rect x="106" y={12 + i * 6} width="2" height="3" rx="0.5" fill="hsl(215,15%,45%)" opacity="0.4" />
      </React.Fragment>
    ))}
    {/* Head top bevels */}
    <rect x="78" y="18" width="14" height="2" rx="1" fill="hsl(215,20%,70%)" opacity="0.3" />
    <rect x="108" y="18" width="14" height="2" rx="1" fill="hsl(215,20%,70%)" opacity="0.3" />
    {/* Size marking */}
    <text x="100" y="68" textAnchor="middle" fontSize="6" fill="hsl(215,10%,55%)" fontFamily="Inter,sans-serif" fontWeight="700" letterSpacing="0.5">24mm</text>
    {/* Golfield branding on handle */}
    <text x="100" y="128" textAnchor="middle" fontSize="5" fill="hsl(0,0%,100%)" fontFamily="Inter,sans-serif" fontWeight="600" opacity="0.5">GOLFIELD</text>
  </svg>
);

const HammerSVG = () => (
  <svg width="160" height="160" viewBox="0 0 160 160" className="filter drop-shadow-[0_6px_25px_rgba(0,0,0,0.45)]">
    <defs>
      <linearGradient id="hMetal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(215,22%,72%)" /><stop offset="40%" stopColor="hsl(215,18%,52%)" /><stop offset="100%" stopColor="hsl(215,14%,35%)" />
      </linearGradient>
      <linearGradient id="hWood" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(28,50%,30%)" /><stop offset="25%" stopColor="hsl(28,55%,42%)" /><stop offset="75%" stopColor="hsl(28,52%,38%)" /><stop offset="100%" stopColor="hsl(28,50%,30%)" />
      </linearGradient>
      <linearGradient id="hWoodShine" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="transparent" /><stop offset="30%" stopColor="hsl(28,50%,55%)" stopOpacity="0.3" /><stop offset="100%" stopColor="transparent" />
      </linearGradient>
      <filter id="hSh"><feDropShadow dx="2" dy="4" stdDeviation="5" floodColor="hsl(0,0%,0%)" floodOpacity="0.45"/></filter>
    </defs>
    {/* Wooden handle */}
    <rect x="72" y="55" width="16" height="95" rx="4" fill="url(#hWood)" filter="url(#hSh)" />
    <rect x="72" y="55" width="16" height="95" rx="4" fill="url(#hWoodShine)" />
    {/* Wood grain lines */}
    {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
      <rect key={i} x="75" y={60 + i * 8} width="10" height="0.8" rx="0.4" fill="hsl(28,45%,28%)" opacity="0.35" />
    ))}
    {/* Metal head */}
    <rect x="30" y="28" width="100" height="32" rx="5" fill="url(#hMetal)" filter="url(#hSh)" />
    {/* Head top highlight */}
    <rect x="32" y="29" width="96" height="4" rx="2" fill="hsl(215,25%,80%)" opacity="0.4" />
    {/* Head bottom edge */}
    <rect x="32" y="56" width="96" height="2" rx="1" fill="hsl(215,10%,28%)" opacity="0.5" />
    {/* Striking face - flat end */}
    <rect x="118" y="26" width="16" height="36" rx="3" fill="hsl(215,15%,45%)" />
    <rect x="118" y="27" width="16" height="3" rx="1.5" fill="hsl(215,20%,65%)" opacity="0.4" />
    {/* Claw end */}
    <path d="M30 34 L18 16 Q14 10 18 6" stroke="url(#hMetal)" strokeWidth="8" fill="none" strokeLinecap="round" />
    <path d="M30 50 L20 36 Q16 30 20 24" stroke="url(#hMetal)" strokeWidth="7" fill="none" strokeLinecap="round" />
    {/* Claw highlights */}
    <path d="M29 35 L19 18" stroke="hsl(215,25%,75%)" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3" />
    {/* Handle wedge */}
    <rect x="74" y="52" width="12" height="6" rx="1" fill="hsl(215,15%,45%)" opacity="0.6" />
    {/* Brand mark */}
    <text x="80" y="48" textAnchor="middle" fontSize="5" fill="hsl(215,10%,65%)" fontFamily="Inter,sans-serif" fontWeight="700" letterSpacing="1" opacity="0.5">GF</text>
  </svg>
);

const ScrewdriverSVG = () => (
  <svg width="140" height="160" viewBox="0 0 120 170" className="filter drop-shadow-[0_6px_25px_rgba(0,0,0,0.45)]">
    <defs>
      <linearGradient id="sMetal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(215,22%,75%)" /><stop offset="50%" stopColor="hsl(215,18%,55%)" /><stop offset="100%" stopColor="hsl(215,14%,40%)" />
      </linearGradient>
      <linearGradient id="sGrip" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(45,75%,38%)" /><stop offset="20%" stopColor="hsl(45,80%,48%)" /><stop offset="50%" stopColor="hsl(45,85%,55%)" /><stop offset="80%" stopColor="hsl(45,80%,48%)" /><stop offset="100%" stopColor="hsl(45,75%,38%)" />
      </linearGradient>
      <linearGradient id="sGripHL" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="transparent" /><stop offset="25%" stopColor="hsl(45,80%,65%)" stopOpacity="0.3" /><stop offset="100%" stopColor="transparent" />
      </linearGradient>
      <filter id="sSh"><feDropShadow dx="1" dy="4" stdDeviation="5" floodColor="hsl(0,0%,0%)" floodOpacity="0.4"/></filter>
    </defs>
    {/* Shaft */}
    <rect x="54" y="10" width="12" height="72" rx="3" fill="url(#sMetal)" filter="url(#sSh)" />
    <rect x="56" y="12" width="4" height="68" rx="2" fill="hsl(215,25%,85%)" opacity="0.3" />
    <rect x="64" y="12" width="1.5" height="68" rx="0.75" fill="hsl(215,10%,30%)" opacity="0.4" />
    {/* Tip - flathead */}
    <path d="M54 10 L57 2 L63 2 L66 10Z" fill="hsl(215,18%,50%)" />
    <path d="M58 3 L62 3 L62 5 L58 5Z" fill="hsl(215,15%,60%)" opacity="0.5" />
    {/* Ferrule (metal collar) */}
    <rect x="50" y="80" width="20" height="10" rx="3" fill="hsl(215,18%,55%)" />
    <rect x="51" y="81" width="18" height="2" rx="1" fill="hsl(215,25%,75%)" opacity="0.4" />
    {/* Handle */}
    <rect x="46" y="88" width="28" height="72" rx="10" fill="url(#sGrip)" filter="url(#sSh)" />
    <rect x="46" y="88" width="28" height="72" rx="10" fill="url(#sGripHL)" />
    {/* Handle ridges */}
    {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
      <rect key={i} x="49" y={94 + i * 5} width="22" height="1.2" rx="0.6" fill="hsl(45,65%,32%)" opacity="0.35" />
    ))}
    {/* Handle cap */}
    <ellipse cx="60" cy="158" rx="12" ry="4" fill="hsl(45,70%,35%)" />
    {/* Brand mark */}
    <text x="60" y="108" textAnchor="middle" fontSize="4.5" fill="hsl(45,20%,25%)" fontFamily="Inter,sans-serif" fontWeight="700" opacity="0.5">GF</text>
  </svg>
);

const PliersSVG = () => (
  <svg width="150" height="160" viewBox="0 0 130 160" className="filter drop-shadow-[0_6px_25px_rgba(0,0,0,0.45)]">
    <defs>
      <linearGradient id="pMetal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(215,22%,72%)" /><stop offset="50%" stopColor="hsl(215,18%,50%)" /><stop offset="100%" stopColor="hsl(215,14%,35%)" />
      </linearGradient>
      <linearGradient id="pGrip" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(0,65%,32%)" /><stop offset="30%" stopColor="hsl(0,75%,45%)" /><stop offset="70%" stopColor="hsl(0,78%,50%)" /><stop offset="100%" stopColor="hsl(0,65%,32%)" />
      </linearGradient>
      <filter id="pSh"><feDropShadow dx="2" dy="4" stdDeviation="5" floodColor="hsl(0,0%,0%)" floodOpacity="0.45"/></filter>
    </defs>
    {/* Left jaw */}
    <path d="M48 8 Q32 22 38 48 L55 65" stroke="url(#pMetal)" strokeWidth="10" fill="none" strokeLinecap="round" filter="url(#pSh)" />
    <path d="M46 12 Q35 24 40 44" stroke="hsl(215,25%,75%)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.3" />
    {/* Right jaw */}
    <path d="M82 8 Q98 22 92 48 L75 65" stroke="url(#pMetal)" strokeWidth="10" fill="none" strokeLinecap="round" filter="url(#pSh)" />
    {/* Jaw teeth */}
    {[0,1,2,3].map(i => (
      <React.Fragment key={`t${i}`}>
        <rect x="44" y={15 + i * 8} width="3" height="4" rx="1" fill="hsl(215,15%,58%)" opacity="0.4" transform="rotate(-15 46 30)" />
        <rect x="83" y={15 + i * 8} width="3" height="4" rx="1" fill="hsl(215,15%,58%)" opacity="0.4" transform="rotate(15 84 30)" />
      </React.Fragment>
    ))}
    {/* Pivot joint */}
    <circle cx="65" cy="62" r="9" fill="hsl(215,15%,45%)" filter="url(#pSh)" />
    <circle cx="65" cy="62" r="5" fill="hsl(215,18%,55%)" />
    <circle cx="65" cy="62" r="2.5" fill="hsl(215,20%,65%)" />
    <circle cx="64" cy="61" r="1" fill="hsl(215,25%,80%)" opacity="0.5" />
    {/* Left handle */}
    <rect x="40" y="68" width="18" height="80" rx="7" fill="url(#pGrip)" filter="url(#pSh)" transform="rotate(-10 49 108)" />
    {/* Right handle */}
    <rect x="72" y="68" width="18" height="80" rx="7" fill="url(#pGrip)" filter="url(#pSh)" transform="rotate(10 81 108)" />
    {/* Grip textures */}
    {[0,1,2,3,4,5,6,7,8].map(i => (
      <React.Fragment key={`g${i}`}>
        <rect x="43" y={76 + i * 7} width="12" height="1.2" rx="0.6" fill="hsl(0,55%,28%)" opacity="0.4" transform="rotate(-10 49 108)" />
        <rect x="75" y={76 + i * 7} width="12" height="1.2" rx="0.6" fill="hsl(0,55%,28%)" opacity="0.4" transform="rotate(10 81 108)" />
      </React.Fragment>
    ))}
    {/* Handle end caps */}
    <ellipse cx="44" cy="148" rx="8" ry="3" fill="hsl(0,60%,28%)" transform="rotate(-10 44 148)" />
    <ellipse cx="86" cy="148" rx="8" ry="3" fill="hsl(0,60%,28%)" transform="rotate(10 86 148)" />
  </svg>
);

const TapeMeasureSVG = () => (
  <svg width="140" height="140" viewBox="0 0 140 140" className="filter drop-shadow-[0_6px_25px_rgba(0,0,0,0.45)]">
    <defs>
      <linearGradient id="tBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(0,72%,50%)" /><stop offset="50%" stopColor="hsl(0,78%,45%)" /><stop offset="100%" stopColor="hsl(0,68%,35%)" />
      </linearGradient>
      <linearGradient id="tTape" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="hsl(48,90%,60%)" /><stop offset="100%" stopColor="hsl(48,85%,50%)" />
      </linearGradient>
      <filter id="tSh"><feDropShadow dx="2" dy="4" stdDeviation="6" floodColor="hsl(0,0%,0%)" floodOpacity="0.45"/></filter>
    </defs>
    {/* Main body */}
    <rect x="20" y="20" width="100" height="100" rx="18" fill="url(#tBody)" filter="url(#tSh)" />
    {/* Body highlight */}
    <rect x="22" y="22" width="96" height="10" rx="5" fill="hsl(0,78%,60%)" opacity="0.3" />
    {/* Inner circle (tape reel) */}
    <circle cx="70" cy="70" r="30" fill="hsl(0,68%,30%)" />
    <circle cx="70" cy="70" r="25" fill="hsl(48,90%,55%)" />
    <circle cx="70" cy="70" r="20" fill="hsl(48,85%,50%)" />
    <circle cx="70" cy="70" r="8" fill="hsl(0,68%,35%)" />
    <circle cx="70" cy="70" r="3" fill="hsl(215,15%,50%)" />
    {/* Tape marks on reel */}
    {[0,1,2,3,4,5,6,7].map(i => (
      <rect key={i} x="69" y={48 + i * 2.5} width="2" height="1" fill="hsl(0,0%,20%)" opacity="0.4" />
    ))}
    {/* Extended tape */}
    <rect x="116" y="65" width="20" height="10" rx="1" fill="url(#tTape)" />
    <rect x="116" y="66" width="20" height="1" fill="hsl(48,80%,65%)" opacity="0.4" />
    {/* Tape hook */}
    <rect x="134" y="63" width="4" height="14" rx="1" fill="hsl(215,15%,50%)" />
    {/* Lock button */}
    <rect x="95" y="55" width="18" height="10" rx="3" fill="hsl(0,0%,15%)" />
    <rect x="97" y="56" width="14" height="3" rx="1.5" fill="hsl(0,0%,25%)" />
    {/* Belt clip */}
    <rect x="25" y="115" width="30" height="6" rx="2" fill="hsl(215,15%,45%)" />
    {/* Size text */}
    <text x="70" y="115" textAnchor="middle" fontSize="7" fill="hsl(0,0%,100%)" fontFamily="Inter,sans-serif" fontWeight="800" opacity="0.7">5m</text>
    <text x="70" y="108" textAnchor="middle" fontSize="4" fill="hsl(0,0%,100%)" fontFamily="Inter,sans-serif" fontWeight="600" opacity="0.4">GOLFIELD</text>
  </svg>
);

const DrillBitSVG = () => (
  <svg width="120" height="160" viewBox="0 0 100 160" className="filter drop-shadow-[0_6px_25px_rgba(0,0,0,0.45)]">
    <defs>
      <linearGradient id="dMetal" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="hsl(215,25%,78%)" /><stop offset="50%" stopColor="hsl(215,20%,58%)" /><stop offset="100%" stopColor="hsl(215,15%,40%)" />
      </linearGradient>
      <filter id="dSh"><feDropShadow dx="1" dy="3" stdDeviation="4" floodColor="hsl(0,0%,0%)" floodOpacity="0.45"/></filter>
    </defs>
    {/* Tip */}
    <path d="M48 5 L50 0 L52 5" fill="hsl(215,20%,55%)" />
    {/* Fluted shaft with spiral */}
    <rect x="44" y="5" width="12" height="100" rx="2" fill="url(#dMetal)" filter="url(#dSh)" />
    {/* Spiral flutes */}
    {[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14].map(i => (
      <React.Fragment key={i}>
        <path d={`M44 ${10 + i * 6.5} Q50 ${7 + i * 6.5} 56 ${10 + i * 6.5}`} stroke="hsl(215,12%,35%)" strokeWidth="1" fill="none" opacity="0.5" />
        <path d={`M44 ${12 + i * 6.5} Q50 ${15 + i * 6.5} 56 ${12 + i * 6.5}`} stroke="hsl(215,25%,72%)" strokeWidth="0.8" fill="none" opacity="0.3" />
      </React.Fragment>
    ))}
    {/* Shaft highlight */}
    <rect x="46" y="6" width="3" height="98" rx="1.5" fill="hsl(215,25%,85%)" opacity="0.25" />
    {/* Shank (smooth part) */}
    <rect x="42" y="105" width="16" height="45" rx="3" fill="url(#dMetal)" filter="url(#dSh)" />
    <rect x="44" y="107" width="4" height="40" rx="2" fill="hsl(215,25%,80%)" opacity="0.2" />
    {/* Shank grooves */}
    <rect x="43" y="135" width="14" height="2" rx="1" fill="hsl(215,10%,32%)" opacity="0.4" />
    <rect x="43" y="140" width="14" height="2" rx="1" fill="hsl(215,10%,32%)" opacity="0.4" />
    {/* Size */}
    <text x="50" y="125" textAnchor="middle" fontSize="5" fill="hsl(215,10%,60%)" fontFamily="Inter,sans-serif" fontWeight="700" opacity="0.6">10mm</text>
  </svg>
);

/* ========== FLOATING TOOL VISUAL ========== */
const FloatingToolVisual = ({ scrollScale }: { scrollScale: any }) => (
  <motion.div style={{ scale: scrollScale }} className="relative w-full h-full flex items-center justify-center min-h-[500px]">
    {/* Ambient glows */}
    <motion.div
      animate={{ scale: [1, 1.25, 1], opacity: [0.06, 0.16, 0.06] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      className="absolute w-96 h-96 bg-primary rounded-full blur-[140px]"
    />
    <motion.div
      animate={{ scale: [1.2, 0.85, 1.2], opacity: [0.03, 0.1, 0.03] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute w-72 h-72 bg-gold rounded-full blur-[120px] translate-x-16 translate-y-12"
    />
    <motion.div
      animate={{ opacity: [0.02, 0.06, 0.02] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      className="absolute w-48 h-48 bg-[hsl(215,50%,50%)] rounded-full blur-[80px] -translate-x-20 -translate-y-16"
    />

    {/* Rotating orbital rings */}
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute w-[420px] h-[420px]">
      <div className="absolute inset-0 rounded-full border border-border/8" />
      <div className="absolute inset-6 rounded-full border border-dashed border-primary/[0.04]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary/25" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gold/20" />
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/15" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gold/15" />
    </motion.div>
    <motion.div animate={{ rotate: -360 }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }} className="absolute w-[300px] h-[300px]">
      <div className="absolute inset-0 rounded-full border border-primary/[0.05]" />
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary/20 blur-[1px]" />
    </motion.div>
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute w-[480px] h-[480px]">
      <div className="absolute inset-0 rounded-full border border-border/[0.04]" />
    </motion.div>

    {/* CENTER: Wrench (biggest) */}
    <motion.div
      animate={{ rotateY: [0, 25, -18, 0], rotateX: [-8, 10, -8] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      style={{ perspective: 1200, transformStyle: "preserve-3d" }}
      className="relative z-10"
    >
      <motion.div animate={{ y: [0, -18, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
        <WrenchSVG />
      </motion.div>
    </motion.div>

    {/* TOP-RIGHT: Hammer */}
    <motion.div
      animate={{ rotateY: [-12, 22, -12], rotateX: [6, -8, 6] }}
      transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      className="absolute -top-2 right-2 z-[5]"
    >
      <motion.div animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [-8, 8, -8] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}>
        <HammerSVG />
      </motion.div>
    </motion.div>

    {/* BOTTOM-LEFT: Screwdriver */}
    <motion.div
      animate={{ rotateY: [15, -25, 15], rotateX: [-6, 10, -6] }}
      transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      className="absolute bottom-0 -left-2 z-[5]"
    >
      <motion.div animate={{ y: [0, 16, 0], x: [0, -8, 0], rotate: [12, -6, 12] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}>
        <ScrewdriverSVG />
      </motion.div>
    </motion.div>

    {/* TOP-LEFT: Pliers */}
    <motion.div
      animate={{ rotateY: [-18, 15, -18], rotateX: [10, -10, 10] }}
      transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      className="absolute top-6 -left-4 z-[5]"
    >
      <motion.div animate={{ y: [0, -14, 0], x: [0, -10, 0], rotate: [-12, 4, -12] }} transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}>
        <PliersSVG />
      </motion.div>
    </motion.div>

    {/* BOTTOM-RIGHT: Tape Measure */}
    <motion.div
      animate={{ rotateY: [10, -20, 10], rotateX: [-8, 8, -8] }}
      transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
      style={{ perspective: 1000, transformStyle: "preserve-3d" }}
      className="absolute bottom-4 right-0 z-[5]"
    >
      <motion.div animate={{ y: [0, 18, 0], x: [0, 8, 0], rotate: [6, -10, 6] }} transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}>
        <TapeMeasureSVG />
      </motion.div>
    </motion.div>

    {/* MID-RIGHT: Drill Bit */}
    <motion.div
      animate={{ rotateY: [-8, 18, -8], rotateX: [5, -12, 5] }}
      transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      style={{ perspective: 900, transformStyle: "preserve-3d" }}
      className="absolute top-1/2 -translate-y-1/2 -right-6 z-[4]"
    >
      <motion.div animate={{ y: [0, -12, 0], rotate: [20, 35, 20] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 3 }}>
        <DrillBitSVG />
      </motion.div>
    </motion.div>

    {/* Floating particles */}
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={`p${i}`}
        animate={{
          y: [0, -30 - i * 10, 0],
          x: [0, (i % 2 === 0 ? 15 : -15), 0],
          opacity: [0, 0.4, 0],
        }}
        transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
        className="absolute rounded-full bg-primary/30"
        style={{
          width: 3 + (i % 3),
          height: 3 + (i % 3),
          top: `${20 + i * 12}%`,
          left: `${15 + i * 13}%`,
        }}
      />
    ))}
  </motion.div>
);

/* ========== HERO COMPONENT ========== */
const Hero = () => {
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 600], [0, 120]);
  const toolScale = useTransform(scrollY, [0, 300, 600], [1, 1.18, 0.82]);

  return (
    <section className="relative overflow-hidden py-20 md:py-32 lg:py-40">
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(220,10%,50%) 1px, transparent 1px), linear-gradient(90deg, hsl(220,10%,50%) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.06, 0.12, 0.06] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-primary rounded-full blur-[200px]"
      />
      <motion.div
        animate={{ scale: [1.1, 0.9, 1.1], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute -bottom-32 right-0 w-[500px] h-[500px] bg-gold rounded-full blur-[180px]"
      />

      <motion.div style={{ y: parallaxY }} className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-4 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="mb-12"
            >
              <div className="relative inline-block group">
                <motion.div
                  animate={{ opacity: [0.08, 0.18, 0.08], scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-8 bg-gradient-to-br from-primary/15 via-gold/10 to-primary/15 rounded-[2rem] blur-[40px]"
                />
                <div className="absolute -inset-[2px] bg-gradient-to-br from-primary/20 via-transparent to-gold/15 rounded-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
                <img src="/images/golfield-logo.jpeg" alt="Golfield" className="relative h-24 md:h-36 lg:h-40 rounded-2xl object-contain shadow-2xl shadow-primary/10 bg-card/40 p-2 backdrop-blur-sm transition-transform duration-500 group-hover:scale-[1.03]" />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="mb-8">
              <span className="section-badge">
                <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity }}><Wrench size={12} /></motion.span>
                Orçamentos por Atacado
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="text-5xl md:text-7xl lg:text-7xl xl:text-8xl font-bold leading-[0.92] mb-8 tracking-tight"
            >
              <motion.span initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.3 }} className="block text-foreground">Ferramentas</motion.span>
              <motion.span initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.45 }} className="block text-gradient-gold mt-1">Premium</motion.span>
              <motion.span initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.6 }} className="block text-muted-foreground text-3xl md:text-4xl lg:text-4xl xl:text-5xl mt-3 font-medium">para Profissionais</motion.span>
            </motion.h1>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }} className="space-y-4 mb-10">
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                Centenas de produtos com preços exclusivos de atacado. Monte seu orçamento online e receba atendimento personalizado.
              </p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-sm font-medium text-primary"
              >
                <motion.span animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-primary" />
                Pedido mínimo para orçamento: R$ 2.000,00
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.65 }} className="flex flex-wrap gap-4">
              <motion.a href="#produtos" className="btn-golfield text-base" whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.97 }}>
                <Zap size={18} /> Ver Produtos <ArrowRight size={18} />
              </motion.a>
              <motion.a href="https://wa.me/5511959409051" target="_blank" rel="noopener noreferrer" className="btn-outline-golfield text-base" whileHover={{ scale: 1.06, y: -2 }} whileTap={{ scale: 0.97 }}>
                <WhatsAppIcon size={18} /> Falar com Vendedor
              </motion.a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.7, rotateY: -20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="hidden lg:flex items-center justify-center min-h-[500px]"
          >
            <FloatingToolVisual scrollScale={toolScale} />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-20 max-w-2xl"
        >
          {[
            { icon: Shield, label: "Qualidade Garantida", desc: "Produtos certificados" },
            { icon: Truck, label: "Envio Nacional", desc: "Para todo o Brasil" },
            { icon: Package, label: `${products.length} Produtos`, desc: "Catálogo completo" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 + i * 0.12 }}
              whileHover={{ y: -4, borderColor: "hsl(0, 78%, 52%)" }}
              className="stat-card flex items-center gap-4"
            >
              <motion.div whileHover={{ rotate: 360, scale: 1.1 }} transition={{ duration: 0.6 }} className="p-2.5 rounded-xl bg-primary/10">
                <item.icon size={18} className="text-primary" />
              </motion.div>
              <div>
                <p className="font-semibold text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
