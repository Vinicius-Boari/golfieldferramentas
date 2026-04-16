import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Save, LogOut, Home, Type, Image, Palette, LayoutGrid,
  ChevronUp, ChevronDown, Eye, EyeOff, Plus, Trash2, Upload, Link2, Loader2, GripVertical,
  Film, Volume2, VolumeX, Repeat, Settings
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { useHomeConfig, useSaveHomeConfig, defaultHomeConfig, type HomeConfig } from "@/hooks/useHomeConfig";
import HeroVideoPanel from "@/components/admin/HeroVideoPanel";
import SystemSettingsPanel from "@/components/admin/SystemSettingsPanel";
import { toast } from "sonner";

const sectionLabels: Record<string, string> = {
  hero: "Hero / Banner Principal",
  trustBadges: "Selos de Confiança",
  products: "Seção de Produtos",
  cta: "Chamada para Ação (CTA)",
  about: "Sobre a Golfield",
  footer: "Rodapé",
};

const tabs = [
  { id: "sections", label: "Seções", icon: LayoutGrid },
  { id: "hero", label: "Hero", icon: Home },
  { id: "heroVideo", label: "Vídeo Hero", icon: Film },
  { id: "trust", label: "Selos", icon: Palette },
  { id: "products", label: "Produtos", icon: Type },
  { id: "cta", label: "CTA", icon: Type },
  { id: "about", label: "Sobre", icon: Type },
  { id: "footer", label: "Rodapé", icon: Type },
  { id: "system", label: "Sistema", icon: Settings },
];

const InputField = ({ label, value, onChange, type = "text", placeholder = "", rows }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; rows?: number;
}) => (
  <div>
    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{label}</label>
    {rows ? (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 resize-none transition-colors"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors"
      />
    )}
  </div>
);

const ImageField = ({ label, value, onChange, userId }: {
  label: string; value: string; onChange: (v: string) => void; userId?: string;
}) => {
  const [mode, setMode] = useState<"upload" | "url">(value ? "url" : "upload");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File | null) => {
    if (!file || !userId) return;
    if (!file.type.startsWith("image/")) { toast.error("Selecione uma imagem válida"); return; }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const safeName = file.name.replace(/\.[^.]+$/, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
      const filePath = `${userId}/${Date.now()}-${safeName}.${ext.toLowerCase()}`;
      const { error } = await supabase.storage.from("product-images").upload(filePath, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);
      onChange(data.publicUrl);
      toast.success("Imagem enviada!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar imagem");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-muted-foreground">{label}</label>
        <div className="flex items-center gap-1 rounded-lg bg-secondary/60 p-0.5">
          <button type="button" onClick={() => setMode("upload")}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${mode === "upload" ? "bg-background text-foreground" : "text-muted-foreground"}`}>
            <Upload size={10} /> Upload
          </button>
          <button type="button" onClick={() => setMode("url")}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${mode === "url" ? "bg-background text-foreground" : "text-muted-foreground"}`}>
            <Link2 size={10} /> URL
          </button>
        </div>
      </div>
      {mode === "upload" ? (
        <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-3">
          <input type="file" accept="image/*" disabled={uploading}
            onChange={e => void handleUpload(e.target.files?.[0] ?? null)}
            className="block w-full text-xs text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground"
          />
          {uploading && <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground"><Loader2 size={12} className="animate-spin" /> Enviando...</div>}
        </div>
      ) : (
        <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="https://..."
          className="w-full px-3 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors" />
      )}
      {value && (
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-secondary/50 overflow-hidden">
            <img src={value} alt="" className="w-full h-full object-contain" />
          </div>
          <button type="button" onClick={() => onChange("")} className="text-xs text-muted-foreground hover:text-destructive transition-colors">Remover</button>
        </div>
      )}
    </div>
  );
};

const AdminHome = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading, user } = useAdmin();
  const { data: savedConfig, isLoading } = useHomeConfig();
  const saveConfigMutation = useSaveHomeConfig();
  const [config, setConfig] = useState<HomeConfig>(defaultHomeConfig);
  const [activeTab, setActiveTab] = useState("sections");
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("Acesso negado.");
      navigate("/");
    }
  }, [adminLoading, isAdmin, navigate]);

  useEffect(() => {
    if (savedConfig) {
      setConfig(savedConfig);
    }
  }, [savedConfig]);

  const updateConfig = (updater: (prev: HomeConfig) => HomeConfig) => {
    setConfig(prev => {
      const next = updater(prev);
      setHasChanges(true);
      return next;
    });
  };

  const handleSave = async () => {
    try {
      await saveConfigMutation.mutateAsync(config);
      toast.success("Configurações salvas com sucesso!");
      setHasChanges(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    }
  };

  const handleResetToDefault = () => {
    if (!confirm("Restaurar todas as configurações para o padrão original?")) return;
    setConfig(defaultHomeConfig);
    setHasChanges(true);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    updateConfig(prev => {
      const sections = [...prev.sections].sort((a, b) => a.order - b.order);
      const swapIdx = direction === "up" ? index - 1 : index + 1;
      if (swapIdx < 0 || swapIdx >= sections.length) return prev;
      const tempOrder = sections[index].order;
      sections[index] = { ...sections[index], order: sections[swapIdx].order };
      sections[swapIdx] = { ...sections[swapIdx], order: tempOrder };
      return { ...prev, sections };
    });
  };

  const toggleSection = (sectionId: string) => {
    updateConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.id === sectionId ? { ...s, enabled: !s.enabled } : s),
    }));
  };

  if (adminLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const sortedSections = [...config.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admin/produtos")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10"><Home size={18} className="text-primary" /></div>
              <div>
                <h1 className="text-base font-bold">Editor da Home</h1>
                <p className="text-xs text-muted-foreground">Personalize a página inicial</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleResetToDefault} className="px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
              Restaurar padrão
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saveConfigMutation.isPending || !hasChanges}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 transition-colors"
            >
              <Save size={14} />
              {saveConfigMutation.isPending ? "Salvando..." : "Salvar"}
            </motion.button>
            <button onClick={async () => { await supabase.auth.signOut(); navigate("/"); }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar tabs */}
          <div className="lg:w-56 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${activeTab === tab.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 min-w-0">
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-6">
              {/* SECTIONS TAB */}
              {activeTab === "sections" && (
                <div>
                  <h2 className="text-lg font-bold mb-1">Gerenciar Seções</h2>
                  <p className="text-sm text-muted-foreground mb-6">Ative, desative e reordene as seções da página inicial.</p>
                  <div className="space-y-2">
                    {sortedSections.map((section, idx) => (
                      <div key={section.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
                        <GripVertical size={16} className="text-muted-foreground/40" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{sectionLabels[section.id] || section.id}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveSection(idx, "up")} disabled={idx === 0}
                            className="p-1.5 rounded-lg hover:bg-secondary transition-colors disabled:opacity-20">
                            <ChevronUp size={14} />
                          </button>
                          <button onClick={() => moveSection(idx, "down")} disabled={idx === sortedSections.length - 1}
                            className="p-1.5 rounded-lg hover:bg-secondary transition-colors disabled:opacity-20">
                            <ChevronDown size={14} />
                          </button>
                        </div>
                        <button onClick={() => toggleSection(section.id)}
                          className={`p-1.5 rounded-lg transition-colors ${section.enabled ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-secondary"}`}>
                          {section.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* HERO TAB */}
              {activeTab === "hero" && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold mb-1">Hero / Banner Principal</h2>
                  <ImageField label="Logo" value={config.hero.logoImage}
                    onChange={v => updateConfig(c => ({ ...c, hero: { ...c.hero, logoImage: v } }))} userId={user?.id} />
                  <InputField label="Texto do Badge" value={config.hero.badgeText}
                    onChange={v => updateConfig(c => ({ ...c, hero: { ...c.hero, badgeText: v } }))} />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InputField label="Título Linha 1" value={config.hero.titleLine1}
                      onChange={v => updateConfig(c => ({ ...c, hero: { ...c.hero, titleLine1: v } }))} />
                    <InputField label="Título Linha 2 (destaque)" value={config.hero.titleLine2}
                      onChange={v => updateConfig(c => ({ ...c, hero: { ...c.hero, titleLine2: v } }))} />
                    <InputField label="Título Linha 3" value={config.hero.titleLine3}
                      onChange={v => updateConfig(c => ({ ...c, hero: { ...c.hero, titleLine3: v } }))} />
                  </div>
                  <InputField label="Descrição" value={config.hero.description}
                    onChange={v => updateConfig(c => ({ ...c, hero: { ...c.hero, description: v } }))} rows={3} />
                  <InputField label="Texto pedido mínimo" value={config.hero.minOrderText}
                    onChange={v => updateConfig(c => ({ ...c, hero: { ...c.hero, minOrderText: v } }))} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Botão principal - Texto" value={config.hero.ctaButtonText}
                      onChange={v => updateConfig(c => ({ ...c, hero: { ...c.hero, ctaButtonText: v } }))} />
                    <InputField label="Botão principal - Link" value={config.hero.ctaButtonLink}
                      onChange={v => updateConfig(c => ({ ...c, hero: { ...c.hero, ctaButtonLink: v } }))} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Botão secundário - Texto" value={config.hero.secondaryButtonText}
                      onChange={v => updateConfig(c => ({ ...c, hero: { ...c.hero, secondaryButtonText: v } }))} />
                    <InputField label="Botão secundário - Link" value={config.hero.secondaryButtonLink}
                      onChange={v => updateConfig(c => ({ ...c, hero: { ...c.hero, secondaryButtonLink: v } }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Cards de Estatísticas</label>
                    <div className="space-y-3">
                      {config.hero.stats.map((stat, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <input value={stat.label} onChange={e => updateConfig(c => {
                              const stats = [...c.hero.stats]; stats[i] = { ...stats[i], label: e.target.value }; return { ...c, hero: { ...c.hero, stats } };
                            })} placeholder="Título" className="px-3 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" />
                            <input value={stat.desc} onChange={e => updateConfig(c => {
                              const stats = [...c.hero.stats]; stats[i] = { ...stats[i], desc: e.target.value }; return { ...c, hero: { ...c.hero, stats } };
                            })} placeholder="Descrição" className="px-3 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" />
                          </div>
                          <button onClick={() => updateConfig(c => ({ ...c, hero: { ...c.hero, stats: c.hero.stats.filter((_, j) => j !== i) } }))}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                        </div>
                      ))}
                      <button onClick={() => updateConfig(c => ({ ...c, hero: { ...c.hero, stats: [...c.hero.stats, { label: "", desc: "" }] } }))}
                        className="flex items-center gap-2 text-xs text-primary hover:underline"><Plus size={12} /> Adicionar card</button>
                    </div>
                  </div>
                </div>
              )}

              {/* HERO VIDEO TAB */}
              {activeTab === "heroVideo" && (
                <HeroVideoPanel
                  value={config.heroVideo ?? defaultHomeConfig.heroVideo}
                  onChange={next => updateConfig(c => ({ ...c, heroVideo: next }))}
                />
              )}

              {/* TRUST BADGES TAB */}
              {activeTab === "trust" && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold mb-1">Selos de Confiança</h2>
                  <div className="space-y-3">
                    {config.trustBadges.items.map((item, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <input value={item.text} onChange={e => updateConfig(c => {
                          const items = [...c.trustBadges.items]; items[i] = { text: e.target.value }; return { ...c, trustBadges: { ...c.trustBadges, items } };
                        })} className="flex-1 px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" />
                        <button onClick={() => updateConfig(c => ({ ...c, trustBadges: { ...c.trustBadges, items: c.trustBadges.items.filter((_, j) => j !== i) } }))}
                          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                      </div>
                    ))}
                    <button onClick={() => updateConfig(c => ({ ...c, trustBadges: { ...c.trustBadges, items: [...c.trustBadges.items, { text: "" }] } }))}
                      className="flex items-center gap-2 text-xs text-primary hover:underline"><Plus size={12} /> Adicionar selo</button>
                  </div>
                </div>
              )}

              {/* PRODUCTS SECTION TAB */}
              {activeTab === "products" && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold mb-1">Seção de Produtos</h2>
                  <InputField label="Badge" value={config.productsSection.badge}
                    onChange={v => updateConfig(c => ({ ...c, productsSection: { ...c.productsSection, badge: v } }))} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Título" value={config.productsSection.title}
                      onChange={v => updateConfig(c => ({ ...c, productsSection: { ...c.productsSection, title: v } }))} />
                    <InputField label="Título (destaque)" value={config.productsSection.titleHighlight}
                      onChange={v => updateConfig(c => ({ ...c, productsSection: { ...c.productsSection, titleHighlight: v } }))} />
                  </div>
                  <InputField label="Subtítulo" value={config.productsSection.subtitle}
                    onChange={v => updateConfig(c => ({ ...c, productsSection: { ...c.productsSection, subtitle: v } }))} />
                  <InputField label="Texto disclaimer" value={config.productsSection.disclaimerText}
                    onChange={v => updateConfig(c => ({ ...c, productsSection: { ...c.productsSection, disclaimerText: v } }))} rows={2} />
                  <InputField label="Texto botão 'ver todos'" value={config.productsSection.showAllButtonText}
                    onChange={v => updateConfig(c => ({ ...c, productsSection: { ...c.productsSection, showAllButtonText: v } }))} />
                </div>
              )}

              {/* CTA TAB */}
              {activeTab === "cta" && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold mb-1">Chamada para Ação (CTA)</h2>
                  <InputField label="Título" value={config.ctaSection.title}
                    onChange={v => updateConfig(c => ({ ...c, ctaSection: { ...c.ctaSection, title: v } }))} />
                  <InputField label="Descrição" value={config.ctaSection.description}
                    onChange={v => updateConfig(c => ({ ...c, ctaSection: { ...c.ctaSection, description: v } }))} rows={3} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Texto do botão" value={config.ctaSection.buttonText}
                      onChange={v => updateConfig(c => ({ ...c, ctaSection: { ...c.ctaSection, buttonText: v } }))} />
                    <InputField label="Link do botão" value={config.ctaSection.buttonLink}
                      onChange={v => updateConfig(c => ({ ...c, ctaSection: { ...c.ctaSection, buttonLink: v } }))} />
                  </div>
                </div>
              )}

              {/* ABOUT TAB */}
              {activeTab === "about" && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold mb-1">Sobre a Golfield</h2>
                  <InputField label="Badge" value={config.aboutSection.badge}
                    onChange={v => updateConfig(c => ({ ...c, aboutSection: { ...c.aboutSection, badge: v } }))} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Título" value={config.aboutSection.title}
                      onChange={v => updateConfig(c => ({ ...c, aboutSection: { ...c.aboutSection, title: v } }))} />
                    <InputField label="Título (destaque)" value={config.aboutSection.titleHighlight}
                      onChange={v => updateConfig(c => ({ ...c, aboutSection: { ...c.aboutSection, titleHighlight: v } }))} />
                  </div>
                  <InputField label="Parágrafo 1" value={config.aboutSection.paragraph1}
                    onChange={v => updateConfig(c => ({ ...c, aboutSection: { ...c.aboutSection, paragraph1: v } }))} rows={3} />
                  <InputField label="Parágrafo 2" value={config.aboutSection.paragraph2}
                    onChange={v => updateConfig(c => ({ ...c, aboutSection: { ...c.aboutSection, paragraph2: v } }))} rows={3} />
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Cards de Diferenciais</label>
                    <div className="space-y-3">
                      {config.aboutSection.features.map((feat, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <input value={feat.title} onChange={e => updateConfig(c => {
                              const features = [...c.aboutSection.features]; features[i] = { ...features[i], title: e.target.value }; return { ...c, aboutSection: { ...c.aboutSection, features } };
                            })} placeholder="Título" className="px-3 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" />
                            <input value={feat.desc} onChange={e => updateConfig(c => {
                              const features = [...c.aboutSection.features]; features[i] = { ...features[i], desc: e.target.value }; return { ...c, aboutSection: { ...c.aboutSection, features } };
                            })} placeholder="Descrição" className="px-3 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" />
                          </div>
                          <button onClick={() => updateConfig(c => ({ ...c, aboutSection: { ...c.aboutSection, features: c.aboutSection.features.filter((_, j) => j !== i) } }))}
                            className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
                        </div>
                      ))}
                      <button onClick={() => updateConfig(c => ({ ...c, aboutSection: { ...c.aboutSection, features: [...c.aboutSection.features, { title: "", desc: "" }] } }))}
                        className="flex items-center gap-2 text-xs text-primary hover:underline"><Plus size={12} /> Adicionar card</button>
                    </div>
                  </div>
                </div>
              )}

              {/* FOOTER TAB */}
              {activeTab === "footer" && (
                <div className="space-y-5">
                  <h2 className="text-lg font-bold mb-1">Rodapé</h2>
                  <InputField label="Descrição" value={config.footer.description}
                    onChange={v => updateConfig(c => ({ ...c, footer: { ...c.footer, description: v } }))} rows={2} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Telefone" value={config.footer.phone}
                      onChange={v => updateConfig(c => ({ ...c, footer: { ...c.footer, phone: v } }))} />
                    <InputField label="Email" value={config.footer.email}
                      onChange={v => updateConfig(c => ({ ...c, footer: { ...c.footer, email: v } }))} />
                    <InputField label="Localização" value={config.footer.location}
                      onChange={v => updateConfig(c => ({ ...c, footer: { ...c.footer, location: v } }))} />
                    <InputField label="Horário" value={config.footer.hours}
                      onChange={v => updateConfig(c => ({ ...c, footer: { ...c.footer, hours: v } }))} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="URL Instagram" value={config.footer.instagramUrl}
                      onChange={v => updateConfig(c => ({ ...c, footer: { ...c.footer, instagramUrl: v } }))} />
                    <InputField label="URL WhatsApp" value={config.footer.whatsappUrl}
                      onChange={v => updateConfig(c => ({ ...c, footer: { ...c.footer, whatsappUrl: v } }))} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-2 block">Categorias do Rodapé</label>
                    <div className="space-y-2">
                      {config.footer.categories.map((cat, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input value={cat} onChange={e => updateConfig(c => {
                            const categories = [...c.footer.categories]; categories[i] = e.target.value; return { ...c, footer: { ...c.footer, categories } };
                          })} className="flex-1 px-3 py-2 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" />
                          <button onClick={() => updateConfig(c => ({ ...c, footer: { ...c.footer, categories: c.footer.categories.filter((_, j) => j !== i) } }))}
                            className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={12} /></button>
                        </div>
                      ))}
                      <button onClick={() => updateConfig(c => ({ ...c, footer: { ...c.footer, categories: [...c.footer.categories, ""] } }))}
                        className="flex items-center gap-2 text-xs text-primary hover:underline"><Plus size={12} /> Adicionar categoria</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating save indicator */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saveConfigMutation.isPending}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-2xl shadow-primary/30 disabled:opacity-50"
          >
            <Save size={16} />
            {saveConfigMutation.isPending ? "Salvando..." : "Salvar alterações"}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default AdminHome;
