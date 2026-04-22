import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Search, Tag, LogOut, Save, X, ArrowLeft,
  Eye, EyeOff, Copy, Package, Home, Users, UserRound, Loader2, BarChart3,
  Calendar, Percent, DollarSign, Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { useCoupons, useCouponUsage, type Coupon } from "@/hooks/useCoupons";
import { useAllProducts } from "@/hooks/useProducts";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const emptyCoupon: Partial<Coupon> = {
  code: "",
  name: "",
  description: "",
  discount_type: "percentage",
  discount_value: 0,
  max_discount: null,
  min_order_value: 0,
  usage_limit: null,
  per_user_limit: 1,
  starts_at: new Date().toISOString().slice(0, 16),
  expires_at: null,
  active: true,
  applies_to: "all",
  product_ids: [],
  category_ids: [],
  exclude_product_ids: [],
  exclude_category_ids: [],
  logged_in_only: false,
  first_purchase_only: false,
  cumulative: false,
  notes: "",
};

const AdminCoupons = () => {
  const navigate = useNavigate();
  const { isAdmin, isOwner, loading: adminLoading } = useAdmin();
  const { data: coupons, isLoading } = useCoupons();
  const { data: products } = useAllProducts();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "expired">("all");
  const [filterType, setFilterType] = useState<"all" | "percentage" | "fixed">("all");
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detailCoupon, setDetailCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("Acesso negado.");
      navigate("/");
    }
  }, [adminLoading, isAdmin, navigate]);

  const categories = useMemo(() => {
    return [...new Set(products?.map(p => p.category).filter(Boolean) ?? [])].sort();
  }, [products]);

  const filtered = useMemo(() => {
    if (!coupons) return [];
    return coupons.filter(c => {
      const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase());
      const now = new Date();
      const isExpired = c.expires_at && new Date(c.expires_at) < now;
      let matchStatus = true;
      if (filterStatus === "active") matchStatus = c.active && !isExpired;
      else if (filterStatus === "inactive") matchStatus = !c.active;
      else if (filterStatus === "expired") matchStatus = !!isExpired;
      let matchType = true;
      if (filterType !== "all") matchType = c.discount_type === filterType;
      return matchSearch && matchStatus && matchType;
    });
  }, [coupons, search, filterStatus, filterType]);

  if (adminLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const openNew = () => { setEditingCoupon({ ...emptyCoupon }); setIsNew(true); };
  const openEdit = (c: Coupon) => { setEditingCoupon({ ...c, starts_at: c.starts_at ? new Date(c.starts_at).toISOString().slice(0, 16) : null, expires_at: c.expires_at ? new Date(c.expires_at).toISOString().slice(0, 16) : null }); setIsNew(false); };

  const handleDuplicate = (c: Coupon) => {
    setEditingCoupon({ ...c, id: undefined, code: c.code + "-COPY", name: c.name + " (cópia)", times_used: 0, starts_at: c.starts_at ? new Date(c.starts_at).toISOString().slice(0, 16) : null, expires_at: c.expires_at ? new Date(c.expires_at).toISOString().slice(0, 16) : null });
    setIsNew(true);
  };

  const handleSave = async () => {
    if (!editingCoupon) return;
    if (!editingCoupon.code?.trim()) { toast.error("Código é obrigatório"); return; }
    if (!editingCoupon.discount_value || editingCoupon.discount_value <= 0) { toast.error("Valor do desconto deve ser maior que zero"); return; }
    if (editingCoupon.discount_type === "percentage" && editingCoupon.discount_value > 100) { toast.error("Porcentagem não pode ser maior que 100%"); return; }
    if (editingCoupon.expires_at && editingCoupon.starts_at && new Date(editingCoupon.expires_at) <= new Date(editingCoupon.starts_at)) { toast.error("Data final deve ser posterior à data inicial"); return; }

    setSaving(true);
    try {
      const payload = {
        code: editingCoupon.code!.toUpperCase().trim(),
        name: editingCoupon.name || "",
        description: editingCoupon.description || "",
        discount_type: editingCoupon.discount_type || "percentage",
        discount_value: editingCoupon.discount_value || 0,
        max_discount: editingCoupon.max_discount || null,
        min_order_value: editingCoupon.min_order_value || 0,
        usage_limit: editingCoupon.usage_limit || null,
        per_user_limit: editingCoupon.per_user_limit || 1,
        starts_at: editingCoupon.starts_at ? new Date(editingCoupon.starts_at).toISOString() : null,
        expires_at: editingCoupon.expires_at ? new Date(editingCoupon.expires_at).toISOString() : null,
        active: editingCoupon.active ?? true,
        applies_to: editingCoupon.applies_to || "all",
        product_ids: editingCoupon.product_ids || [],
        category_ids: editingCoupon.category_ids || [],
        exclude_product_ids: editingCoupon.exclude_product_ids || [],
        exclude_category_ids: editingCoupon.exclude_category_ids || [],
        logged_in_only: editingCoupon.logged_in_only || false,
        first_purchase_only: editingCoupon.first_purchase_only || false,
        cumulative: editingCoupon.cumulative || false,
        notes: editingCoupon.notes || "",
      };

      if (isNew) {
        const { error } = await supabase.from("coupons").insert(payload as any);
        if (error) {
          if (error.message.includes("unique")) toast.error("Já existe um cupom com este código");
          else throw error;
          return;
        }
        toast.success("Cupom criado com sucesso!");
      } else {
        const { error } = await supabase.from("coupons").update(payload as any).eq("id", editingCoupon.id!);
        if (error) throw error;
        toast.success("Cupom atualizado!");
      }
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      setEditingCoupon(null);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este cupom?")) return;
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) { toast.error("Erro ao excluir"); return; }
    toast.success("Cupom excluído");
    queryClient.invalidateQueries({ queryKey: ["coupons"] });
  };

  const handleToggleActive = async (c: Coupon) => {
    const { error } = await supabase.from("coupons").update({ active: !c.active } as any).eq("id", c.id);
    if (error) { toast.error("Erro ao alterar status"); return; }
    queryClient.invalidateQueries({ queryKey: ["coupons"] });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const isExpired = (c: Coupon) => c.expires_at && new Date(c.expires_at) < new Date();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Tag size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Cupons de Desconto</h1>
                <p className="text-xs text-muted-foreground">{coupons?.length ?? 0} cupons cadastrados</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/admin/produtos")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-semibold">
              <Package size={16} /> Produtos
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/admin/home")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-semibold">
              <Home size={16} /> Home
            </motion.button>
            {isOwner && (
              <>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/admin/clientes")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-semibold">
                  <UserRound size={16} /> Clientes
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate("/admin/usuarios")} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-semibold">
                  <Users size={16} /> Usuários
                </motion.button>
              </>
            )}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
              <Plus size={16} /> Novo Cupom
            </motion.button>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-end">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input type="text" placeholder="Buscar por nome ou código..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none">
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="expired">Expirados</option>
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value as any)} className="px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none">
            <option value="all">Todos os tipos</option>
            <option value="percentage">Porcentagem</option>
            <option value="fixed">Valor fixo</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground p-3 pl-4">Nome</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground p-3">Código</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground p-3">Tipo</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-3">Desconto</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground p-3">Status</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground p-3">Usos</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground p-3">Validade</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-3 pr-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                    <td className="p-3 pl-4 text-sm font-medium truncate max-w-[180px]">{c.name || "—"}</td>
                    <td className="p-3">
                      <code className="text-xs px-2 py-1 rounded-md bg-secondary/60 text-primary font-mono font-bold">{c.code}</code>
                    </td>
                    <td className="p-3">
                      <span className="text-xs flex items-center gap-1">
                        {c.discount_type === "percentage" ? <><Percent size={12} /> Porcentagem</> : <><DollarSign size={12} /> Valor fixo</>}
                      </span>
                    </td>
                    <td className="p-3 text-right text-sm font-semibold text-primary">
                      {c.discount_type === "percentage" ? `${Number(c.discount_value)}%` : `R$ ${Number(c.discount_value).toFixed(2).replace(".", ",")}`}
                    </td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleToggleActive(c)}>
                        {isExpired(c) ? (
                          <span className="text-xs px-2 py-1 rounded-md bg-destructive/10 text-destructive">Expirado</span>
                        ) : c.active ? (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-secondary text-foreground"><Eye size={12} /> Ativo</span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"><EyeOff size={12} /> Inativo</span>
                        )}
                      </button>
                    </td>
                    <td className="p-3 text-center text-sm text-muted-foreground">
                      {c.times_used}{c.usage_limit ? `/${c.usage_limit}` : ""}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {formatDate(c.starts_at)} — {formatDate(c.expires_at)}
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setDetailCoupon(c)} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Detalhes">
                          <BarChart3 size={14} />
                        </button>
                        <button onClick={() => handleDuplicate(c)} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Duplicar">
                          <Copy size={14} />
                        </button>
                        <button onClick={() => openEdit(c)} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Editar">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive" title="Excluir">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Tag size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Nenhum cupom encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit/Create Modal */}
      <AnimatePresence>
        {editingCoupon && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingCoupon(null)} className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed left-1/2 top-[4vh] -translate-x-1/2 w-[calc(100%-2rem)] max-w-2xl bg-card rounded-2xl border border-border z-50 flex flex-col max-h-[92vh] overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-bold text-lg">{isNew ? "Novo Cupom" : "Editar Cupom"}</h3>
                <button onClick={() => setEditingCoupon(null)} className="p-2 rounded-lg hover:bg-secondary transition-colors"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome interno</label>
                    <input type="text" value={editingCoupon.name || ""} onChange={e => setEditingCoupon({ ...editingCoupon, name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" placeholder="Ex: Black Friday 2026" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Código *</label>
                    <input type="text" value={editingCoupon.code || ""} onChange={e => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 font-mono uppercase" placeholder="BLACKFRIDAY" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição interna</label>
                  <textarea value={editingCoupon.description || ""} onChange={e => setEditingCoupon({ ...editingCoupon, description: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 resize-none" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Tipo de desconto</label>
                    <select value={editingCoupon.discount_type || "percentage"} onChange={e => setEditingCoupon({ ...editingCoupon, discount_type: e.target.value as any })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none">
                      <option value="percentage">Porcentagem (%)</option>
                      <option value="fixed">Valor fixo (R$)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Valor do desconto *</label>
                    <input type="number" step="0.01" min="0" value={editingCoupon.discount_value || ""} onChange={e => setEditingCoupon({ ...editingCoupon, discount_value: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Desconto máximo (R$)</label>
                    <input type="number" step="0.01" min="0" value={editingCoupon.max_discount ?? ""} onChange={e => setEditingCoupon({ ...editingCoupon, max_discount: e.target.value ? parseFloat(e.target.value) : null })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" placeholder="Sem limite" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Valor mínimo do pedido</label>
                    <input type="number" step="0.01" min="0" value={editingCoupon.min_order_value || ""} onChange={e => setEditingCoupon({ ...editingCoupon, min_order_value: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Limite total de uso</label>
                    <input type="number" min="0" value={editingCoupon.usage_limit ?? ""} onChange={e => setEditingCoupon({ ...editingCoupon, usage_limit: e.target.value ? parseInt(e.target.value) : null })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" placeholder="Ilimitado" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Limite por cliente</label>
                    <input type="number" min="0" value={editingCoupon.per_user_limit || ""} onChange={e => setEditingCoupon({ ...editingCoupon, per_user_limit: parseInt(e.target.value) || 1 })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Data de início</label>
                    <input type="datetime-local" value={editingCoupon.starts_at || ""} onChange={e => setEditingCoupon({ ...editingCoupon, starts_at: e.target.value || null })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Data de expiração</label>
                    <input type="datetime-local" value={editingCoupon.expires_at || ""} onChange={e => setEditingCoupon({ ...editingCoupon, expires_at: e.target.value || null })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Aplicação</label>
                  <select value={editingCoupon.applies_to || "all"} onChange={e => setEditingCoupon({ ...editingCoupon, applies_to: e.target.value as any })} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none">
                    <option value="all">Todos os produtos</option>
                    <option value="categories">Categorias específicas</option>
                  </select>
                </div>
                {editingCoupon.applies_to === "categories" && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Categorias incluídas</label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(cat => (
                        <button key={cat} type="button" onClick={() => {
                          const ids = editingCoupon.category_ids || [];
                          setEditingCoupon({ ...editingCoupon, category_ids: ids.includes(cat!) ? ids.filter(c => c !== cat) : [...ids, cat!] });
                        }} className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${editingCoupon.category_ids?.includes(cat!) ? "bg-primary text-primary-foreground border-primary" : "bg-secondary/50 border-border/50 hover:border-primary/50"}`}>
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={editingCoupon.active ?? true} onChange={e => setEditingCoupon({ ...editingCoupon, active: e.target.checked })} className="rounded" />
                    Ativo
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={editingCoupon.logged_in_only || false} onChange={e => setEditingCoupon({ ...editingCoupon, logged_in_only: e.target.checked })} className="rounded" />
                    Só clientes logados
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={editingCoupon.first_purchase_only || false} onChange={e => setEditingCoupon({ ...editingCoupon, first_purchase_only: e.target.checked })} className="rounded" />
                    Primeira compra
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={editingCoupon.cumulative || false} onChange={e => setEditingCoupon({ ...editingCoupon, cumulative: e.target.checked })} className="rounded" />
                    Cumulativo
                  </label>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Observações internas</label>
                  <textarea value={editingCoupon.notes || ""} onChange={e => setEditingCoupon({ ...editingCoupon, notes: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 resize-none" />
                </div>
              </div>
              <div className="p-5 border-t border-border flex gap-3">
                <button onClick={() => setEditingCoupon(null)} className="flex-1 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-semibold">Cancelar</button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {isNew ? "Criar Cupom" : "Salvar"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
        {detailCoupon && (
          <CouponDetailModal coupon={detailCoupon} onClose={() => setDetailCoupon(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

const CouponDetailModal = ({ coupon, onClose }: { coupon: Coupon; onClose: () => void }) => {
  const { data: usage, isLoading } = useCouponUsage(coupon.id);

  const totalDiscounted = usage?.reduce((s, u) => s + Number(u.discount_amount), 0) ?? 0;
  const lastUsed = usage?.length ? usage[0].created_at : null;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed left-1/2 top-[10vh] -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg bg-card rounded-2xl border border-border z-50 flex flex-col max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h3 className="font-bold text-lg">Detalhes: {coupon.code}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 text-center">
              <p className="text-2xl font-bold text-primary">{coupon.times_used}</p>
              <p className="text-xs text-muted-foreground mt-1">Total de usos</p>
            </div>
            <div className="p-4 rounded-xl bg-secondary/30 border border-border/40 text-center">
              <p className="text-2xl font-bold text-primary">R$ {totalDiscounted.toFixed(2).replace(".", ",")}</p>
              <p className="text-xs text-muted-foreground mt-1">Total descontado</p>
            </div>
          </div>
          {lastUsed && (
            <p className="text-xs text-muted-foreground">Último uso: {new Date(lastUsed).toLocaleDateString("pt-BR")} {new Date(lastUsed).toLocaleTimeString("pt-BR")}</p>
          )}
          {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-primary" /></div>
          ) : usage && usage.length > 0 ? (
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left text-xs font-semibold text-muted-foreground p-2 pl-3">Data</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground p-2">Total pedido</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground p-2 pr-3">Desconto</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.map(u => (
                    <tr key={u.id} className="border-b border-border/40">
                      <td className="p-2 pl-3 text-xs">{new Date(u.created_at).toLocaleDateString("pt-BR")}</td>
                      <td className="p-2 text-right text-xs">R$ {Number(u.order_total).toFixed(2).replace(".", ",")}</td>
                      <td className="p-2 pr-3 text-right text-xs text-primary font-semibold">-R$ {Number(u.discount_amount).toFixed(2).replace(".", ",")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhum uso registrado</p>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default AdminCoupons;
