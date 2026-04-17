import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, Loader2 } from "lucide-react";

/**
 * Recomendações de qualidade de vídeo para produtos.
 * - Apenas informativo (não bloqueia o upload)
 * - Analisa metadata real do vídeo enviado quando disponível (File)
 * - Quando só houver URL, mostra apenas as recomendações estáticas
 */

export interface VideoQualityRecommendationsProps {
  /** Arquivo recém-enviado (preferido para análise local: dimensões, duração, tamanho) */
  file?: File | null;
  /** URL pública do vídeo (fallback para análise via metadata) */
  url?: string | null;
}

type Status = "good" | "warn" | "bad" | "unknown";

interface Metric {
  key: string;
  label: string;
  recommendation: string;
  value: string;
  status: Status;
  hint?: string;
}

const RECOMMENDED_MIN_WIDTH = 1280;
const RECOMMENDED_MIN_HEIGHT = 720;
const RECOMMENDED_FORMAT = "MP4 (H.264)";
const RECOMMENDED_RATIO_LABEL = "16:9 ou 1:1";
const RECOMMENDED_DURATION_MIN = 5; // s
const RECOMMENDED_DURATION_MAX = 30; // s
const RECOMMENDED_MAX_SIZE_MB = 10;

const StatusIcon = ({ s }: { s: Status }) => {
  if (s === "good") return <CheckCircle2 size={14} className="text-[hsl(142,70%,45%)]" />;
  if (s === "warn") return <AlertTriangle size={14} className="text-[hsl(38,92%,50%)]" />;
  if (s === "bad") return <XCircle size={14} className="text-destructive" />;
  return <Info size={14} className="text-muted-foreground" />;
};

const statusBadgeClass = (s: Status) =>
  s === "good"
    ? "bg-[hsl(142,70%,45%,0.12)] text-[hsl(142,70%,45%)] border-[hsl(142,70%,45%,0.3)]"
    : s === "warn"
      ? "bg-[hsl(38,92%,50%,0.12)] text-[hsl(38,92%,50%)] border-[hsl(38,92%,50%,0.3)]"
      : s === "bad"
        ? "bg-destructive/10 text-destructive border-destructive/30"
        : "bg-secondary text-muted-foreground border-border";

const statusLabel = (s: Status) =>
  s === "good" ? "Ideal" : s === "warn" ? "Pode melhorar" : s === "bad" ? "Fora do ideal" : "Não analisado";

const ratioStatus = (w: number, h: number): { status: Status; label: string } => {
  if (!w || !h) return { status: "unknown", label: "—" };
  const r = w / h;
  // 16:9 ≈ 1.7778 ; 1:1 = 1 ; 4:5 = 0.8 ; 9:16 ≈ 0.5625
  const within = (target: number, tol = 0.05) => Math.abs(r - target) <= tol;
  if (within(16 / 9)) return { status: "good", label: "16:9 (horizontal)" };
  if (within(1)) return { status: "good", label: "1:1 (quadrado)" };
  if (within(4 / 5) || within(9 / 16)) return { status: "warn", label: `${w}x${h} (vertical)` };
  return { status: "warn", label: `${w}x${h}` };
};

const formatStatus = (mime: string, name: string): { status: Status; label: string; hint?: string } => {
  const ext = (name.split(".").pop() || "").toLowerCase();
  if (mime === "video/mp4" || ext === "mp4") return { status: "good", label: "MP4" };
  if (mime === "video/webm" || ext === "webm") return { status: "warn", label: "WebM", hint: "Prefira MP4 (H.264) para máxima compatibilidade." };
  if (mime === "video/quicktime" || ext === "mov") return { status: "warn", label: "MOV", hint: "Converta para MP4 (H.264) para reduzir tamanho e melhorar compatibilidade." };
  if (mime === "video/ogg" || ext === "ogg") return { status: "warn", label: "OGG", hint: "Prefira MP4 (H.264)." };
  return { status: "warn", label: mime || ext || "—", hint: "Formato pouco comum para web. Prefira MP4 (H.264)." };
};

const VideoQualityRecommendations = ({ file, url }: VideoQualityRecommendationsProps) => {
  const [meta, setMeta] = useState<{ width: number; height: number; duration: number } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);

  const sourceUrl = useMemo(() => {
    if (file) return URL.createObjectURL(file);
    if (url) return url;
    return null;
  }, [file, url]);

  useEffect(() => {
    setAnalyzeError(null);
    setMeta(null);
    if (!sourceUrl) return;

    setAnalyzing(true);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.playsInline = true;
    v.crossOrigin = "anonymous";

    const cleanup = () => {
      v.removeAttribute("src");
      v.load();
    };

    v.onloadedmetadata = () => {
      setMeta({
        width: v.videoWidth || 0,
        height: v.videoHeight || 0,
        duration: isFinite(v.duration) ? v.duration : 0,
      });
      setAnalyzing(false);
      cleanup();
    };
    v.onerror = () => {
      setAnalyzeError("Não foi possível analisar a metadata do vídeo.");
      setAnalyzing(false);
      cleanup();
    };
    v.src = sourceUrl;

    return () => {
      if (file && sourceUrl) URL.revokeObjectURL(sourceUrl);
      cleanup();
    };
  }, [sourceUrl, file]);

  const metrics: Metric[] = useMemo(() => {
    const items: Metric[] = [];

    // Resolução
    if (meta) {
      const { width, height } = meta;
      let status: Status = "good";
      let hint: string | undefined;
      if (!width || !height) {
        status = "unknown";
      } else if (width >= 1920 && height >= 1080) {
        status = "good";
      } else if (width >= RECOMMENDED_MIN_WIDTH && height >= RECOMMENDED_MIN_HEIGHT) {
        status = "good";
      } else if (width >= 854 && height >= 480) {
        status = "warn";
        hint = "Recomendamos usar Full HD (1920x1080) para melhor qualidade.";
      } else {
        status = "bad";
        hint = "Resolução muito baixa. Mínimo recomendado: 1280x720 (HD).";
      }
      items.push({
        key: "resolution",
        label: "Resolução",
        recommendation: "HD (1280x720) ou superior",
        value: width && height ? `${width}x${height}` : "—",
        status,
        hint,
      });
    } else {
      items.push({
        key: "resolution",
        label: "Resolução",
        recommendation: "HD (1280x720) ou superior",
        value: "—",
        status: "unknown",
      });
    }

    // Proporção
    if (meta) {
      const r = ratioStatus(meta.width, meta.height);
      items.push({
        key: "ratio",
        label: "Proporção",
        recommendation: RECOMMENDED_RATIO_LABEL,
        value: r.label,
        status: r.status,
      });
    }

    // Formato
    if (file) {
      const f = formatStatus(file.type, file.name);
      items.push({
        key: "format",
        label: "Formato",
        recommendation: RECOMMENDED_FORMAT,
        value: f.label,
        status: f.status,
        hint: f.hint,
      });
    } else if (url) {
      const ext = (url.split("?")[0].split(".").pop() || "").toLowerCase();
      const f = formatStatus("", ext);
      items.push({
        key: "format",
        label: "Formato",
        recommendation: RECOMMENDED_FORMAT,
        value: f.label.toUpperCase(),
        status: f.status,
        hint: f.hint,
      });
    }

    // Duração
    if (meta) {
      const d = meta.duration;
      let status: Status = "good";
      let hint: string | undefined;
      if (!d) {
        status = "unknown";
      } else if (d >= RECOMMENDED_DURATION_MIN && d <= RECOMMENDED_DURATION_MAX) {
        status = "good";
      } else if (d > 0 && d < RECOMMENDED_DURATION_MIN) {
        status = "warn";
        hint = `Vídeo muito curto. Ideal entre ${RECOMMENDED_DURATION_MIN}s e ${RECOMMENDED_DURATION_MAX}s.`;
      } else if (d > RECOMMENDED_DURATION_MAX && d <= 60) {
        status = "warn";
        hint = `Vídeo um pouco longo. Ideal entre ${RECOMMENDED_DURATION_MIN}s e ${RECOMMENDED_DURATION_MAX}s.`;
      } else if (d > 60) {
        status = "bad";
        hint = "Vídeo muito longo para um produto. Reduza para até 30s.";
      }
      items.push({
        key: "duration",
        label: "Duração",
        recommendation: `Entre ${RECOMMENDED_DURATION_MIN}s e ${RECOMMENDED_DURATION_MAX}s`,
        value: d ? `${d.toFixed(1)}s` : "—",
        status,
        hint,
      });
    }

    // Tamanho
    if (file) {
      const mb = file.size / (1024 * 1024);
      let status: Status = "good";
      let hint: string | undefined;
      if (mb <= RECOMMENDED_MAX_SIZE_MB) {
        status = "good";
      } else if (mb <= RECOMMENDED_MAX_SIZE_MB * 2.5) {
        status = "warn";
        hint = "Reduza o tamanho para melhor carregamento.";
      } else {
        status = "bad";
        hint = `Muito pesado (${mb.toFixed(1)}MB). Comprima o vídeo para até ${RECOMMENDED_MAX_SIZE_MB}MB.`;
      }
      items.push({
        key: "size",
        label: "Tamanho do arquivo",
        recommendation: `Até ${RECOMMENDED_MAX_SIZE_MB}MB`,
        value: `${mb.toFixed(1)}MB`,
        status,
        hint,
      });
    }

    return items;
  }, [meta, file, url]);

  const staticTips = [
    { label: "FPS", recommendation: "24fps ou 30fps" },
    { label: "Qualidade visual", recommendation: "Vídeo nítido, bem iluminado e sem ruídos" },
  ];

  return (
    <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold">Recomendações do Vídeo</h4>
        {analyzing && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Loader2 size={12} className="animate-spin" /> Analisando...
          </span>
        )}
      </div>

      {!sourceUrl ? (
        <p className="text-xs text-muted-foreground">
          Envie ou informe o vídeo para ver a análise automática de qualidade. Boas práticas: HD ou superior, MP4 (H.264), 16:9 ou 1:1, entre 5s e 30s, até 10MB.
        </p>
      ) : (
        <>
          {analyzeError && (
            <p className="text-xs text-muted-foreground">{analyzeError} As recomendações abaixo continuam valendo.</p>
          )}

          {metrics.length > 0 && (
            <ul className="space-y-2">
              {metrics.map((m) => (
                <li key={m.key} className="flex items-start gap-2.5 rounded-lg bg-background/40 border border-border/40 p-2.5">
                  <StatusIcon s={m.status} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-medium">{m.label}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${statusBadgeClass(m.status)}`}>
                        {statusLabel(m.status)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Atual: <span className="text-foreground/80 font-medium">{m.value}</span>
                      <span className="mx-1.5">•</span>
                      Recomendado: {m.recommendation}
                    </p>
                    {m.hint && <p className="text-[11px] text-muted-foreground mt-1">{m.hint}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <div className="pt-1 border-t border-border/40">
        <p className="text-[11px] text-muted-foreground mb-1.5">Outras boas práticas:</p>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {staticTips.map((t) => (
            <li key={t.label} className="text-[11px] text-muted-foreground flex items-start gap-1.5">
              <Info size={11} className="mt-0.5 shrink-0 opacity-70" />
              <span><span className="text-foreground/80 font-medium">{t.label}:</span> {t.recommendation}</span>
            </li>
          ))}
        </ul>
        <p className="text-[10px] text-muted-foreground mt-2">
          Estas recomendações são apenas sugestões — o upload nunca será bloqueado.
        </p>
      </div>
    </div>
  );
};

export default VideoQualityRecommendations;
