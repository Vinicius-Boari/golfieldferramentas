import { MapPin, Navigation, ExternalLink } from "lucide-react";

interface Props {
  address?: string;
  city?: string;
}

/**
 * Compact location card shown inside the splash. Embeds an OpenStreetMap
 * iframe (no API key required) and links out to Google Maps for directions.
 */
const SplashLocation = ({
  address = "R. Camomil, 162 - Pari",
  city = "São Paulo - SP, 03032-010",
}: Props) => {
  const fullQuery = encodeURIComponent(`${address}, ${city}`);
  const gmapsUrl = `https://www.google.com/maps/search/?api=1&query=${fullQuery}`;
  const gmapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${fullQuery}`;

  // OpenStreetMap embed — coordinates approximated from the Pari address.
  // Bbox covers a tight area around R. Camomil, 162.
  const osmEmbed =
    "https://www.openstreetmap.org/export/embed.html?bbox=-46.6175%2C-23.5320%2C-46.6075%2C-23.5260&layer=mapnik&marker=-23.5290%2C-46.6125";

  return (
    <div className="pt-2 space-y-3">
      {/* Tiny header */}
      <div className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.18em] font-semibold" style={{ color: "#AAAAAA" }}>
        <MapPin size={12} />
        <span>Nossa loja física</span>
      </div>

      {/* Card: map + address side by side on desktop, stacked on mobile */}
      <div
        className="rounded-xl overflow-hidden border flex flex-col sm:flex-row"
        style={{ borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)" }}
      >
        {/* Map */}
        <a
          href={gmapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir mapa no Google Maps"
          className="relative block sm:w-1/2 w-full h-32 sm:h-auto sm:min-h-[140px] bg-black/40 group"
        >
          <iframe
            src={osmEmbed}
            title="Mapa da loja Golfield"
            className="absolute inset-0 w-full h-full border-0 pointer-events-none"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide bg-white/95 text-black shadow-lg">
              <ExternalLink size={11} /> Abrir mapa
            </span>
          </div>
          {/* Pin marker overlay (decorative — the iframe also shows one) */}
          <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-lg pointer-events-none"
            style={{ backgroundColor: "#E84A25", color: "#FFFFFF" }}>
            <MapPin size={10} /> Golfield
          </div>
        </a>

        {/* Address + CTA */}
        <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between gap-2 text-left">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#E84A25" }}>
              Golfield Ferramentas
            </div>
            <div className="text-sm font-semibold leading-snug" style={{ color: "#FFFFFF" }}>
              {address}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "#AAAAAA" }}>
              {city}
            </div>
          </div>

          <a
            href={gmapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide transition-all hover:scale-105 hover:brightness-110 shadow-[0_8px_24px_-4px_rgba(232,74,37,0.6)] ring-1 ring-white/20"
            style={{
              background: "linear-gradient(135deg, #FF5A2C 0%, #E84A25 50%, #C13A18 100%)",
              color: "#FFFFFF",
            }}
          >
            <Navigation size={14} />
            Como chegar
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default SplashLocation;
