import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, UserRound, Search, Trash2, Pencil, X, Loader2, LogOut,
  Mail, Phone, Building2, Calendar, Shield, ChevronLeft, ChevronRight, AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { formatCNPJ, formatPhone } from "@/lib/cnpj";

interface CustomerProfile {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  nome_responsavel: string;
  telefone: string;
  segmento: string;
  cargo: string;
  inscricao_estadual: string;
}

interface Customer {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  banned_until: string | null;
  providers: string[];
  profile: CustomerProfile;
}

const PAGE_SIZE = 15;

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
  } catch {
    return "—";
  }
};

const AdminCustomers = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAdmin, isOwner, loading: adminLoading } = useAdmin();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Customer | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit form state
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editConfirm, setEditConfirm] = useState("");
  const [editProfile, setEditProfile] = useState<CustomerProfile>({
    cnpj: "", razao_social: "", nome_fantasia: "", nome_responsavel: "",
    telefone: "", segmento: "", cargo: "", inscricao_estadual: "",
  });

  const { data: customers, isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("manage-customers", {
        body: { action: "list" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return (data?.customers ?? []) as Customer[];
    },
    enabled: isOwner,
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers ?? [];
    return (customers ?? []).filter(c =>
      c.email.toLowerCase().includes(term) ||
      c.profile.nome_responsavel.toLowerCase().includes(term) ||
      c.profile.razao_social.toLowerCase().includes(term) ||
      c.profile.nome_fantasia.toLowerCase().includes(term)
    );
  }, [customers, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openCustomer = (c: Customer) => {
    setSelected(c);
    setEditing(false);
    setEditEmail(c.email);
    setEditPassword("");
    setEditConfirm("");
    setEditProfile({ ...c.profile });
  };

  const closeDetails = () => {
    setSelected(null);
    setEditing(false);
    setEditPassword("");
    setEditConfirm("");
  };

  const handleSave = async () => {
    if (!selected) return;
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!editEmail.trim() || !re.test(editEmail.trim())) {
      toast.error("E-mail inválido");
      return;
    }
    if (editPassword || editConfirm) {
      if (editPassword.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres");
        return;
      }
      if (editPassword !== editConfirm) {
        toast.error("As senhas não conferem");
        return;
      }
    }

    setSaving(true);
    try {
      const body: any = {
        action: "update",
        userId: selected.id,
        profile: editProfile,
      };
      if (editEmail.trim() !== selected.email) body.email = editEmail.trim();
      if (editPassword) body.password = editPassword;

      const { data, error } = await supabase.functions.invoke("manage-customers", { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Cliente atualizado com sucesso");
      await queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      setEditing(false);
      setEditPassword("");
      setEditConfirm("");
      // Refresh selected from list
      const updated = (queryClient.getQueryData<Customer[]>(["admin-customers"]) ?? [])
        .find(c => c.id === selected.id);
      if (updated) setSelected(updated);
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-customers", {
        body: { action: "delete", userId: deleteTarget.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("Conta excluída");
      await queryClient.invalidateQueries({ queryKey: ["admin-customers"] });
      if (selected?.id === deleteTarget.id) closeDetails();
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao excluir");
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin || !isOwner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-4">
          <Shield size={48} className="mx-auto text-muted-foreground/30" />
          <h2 className="text-lg font-bold">Acesso não autorizado</h2>
          <p className="text-muted-foreground text-sm">
            Esta área é restrita ao dono do site.
          </p>
          <button onClick={() => navigate("/admin/produtos")} className="text-primary text-sm underline">
            Voltar ao painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin/produtos")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <UserRound size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Clientes</h1>
                <p className="text-xs text-muted-foreground">{filtered.length} cliente(s) cadastrado(s)</p>
              </div>
            </div>
          </div>
          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por nome, e-mail ou empresa..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          {isLoading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="text-left text-xs font-semibold text-muted-foreground p-3 pl-4">Nome</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground p-3">E-mail</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground p-3">Telefone</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground p-3">Cadastro</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground p-3">Status</th>
                    <th className="text-right text-xs font-semibold text-muted-foreground p-3 pr-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((c) => {
                    const active = !!c.email_confirmed_at && !c.banned_until;
                    return (
                      <tr
                        key={c.id}
                        onClick={() => openCustomer(c)}
                        className="border-b border-border/40 hover:bg-secondary/20 transition-colors cursor-pointer"
                      >
                        <td className="p-3 pl-4">
                          <p className="text-sm font-medium">{c.profile.nome_responsavel || "—"}</p>
                          {c.profile.razao_social && (
                            <p className="text-xs text-muted-foreground">{c.profile.razao_social}</p>
                          )}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{c.email}</td>
                        <td className="p-3 text-sm text-muted-foreground">
                          {c.profile.telefone ? formatPhone(c.profile.telefone) : "—"}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{formatDate(c.created_at)}</td>
                        <td className="p-3">
                          {active ? (
                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-semibold">
                              Ativa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-semibold">
                              Inativa
                            </span>
                          )}
                        </td>
                        <td className="p-3 pr-4 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openCustomer(c)}
                              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                              title="Editar cliente"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(c)}
                              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                              title="Excluir cliente"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {paged.length === 0 && (
                <div className="py-16 text-center text-muted-foreground">
                  <UserRound size={40} className="mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Nenhum cliente encontrado</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-muted-foreground">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail / Edit Drawer */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeDetails}
              className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-card border-l border-border z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-card/95 backdrop-blur-xl border-b border-border p-5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">
                    {editing ? "Editar cliente" : "Dados do cliente"}
                  </h3>
                  <p className="text-xs text-muted-foreground">{selected.email}</p>
                </div>
                <button onClick={closeDetails} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {!editing ? (
                  <>
                    {/* Login info */}
                    <section>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Dados de Login
                      </h4>
                      <div className="space-y-2.5 text-sm">
                        <div className="flex items-center gap-2.5">
                          <Mail size={14} className="text-muted-foreground" />
                          <span>{selected.email}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Shield size={14} className="text-muted-foreground" />
                          <span className="capitalize">
                            {selected.providers?.join(", ") || "email"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Calendar size={14} className="text-muted-foreground" />
                          <span>Cadastrado em {formatDate(selected.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Calendar size={14} className="text-muted-foreground" />
                          <span>Último acesso: {formatDate(selected.last_sign_in_at)}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {selected.email_confirmed_at && !selected.banned_until ? (
                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 font-semibold">
                              Conta ativa
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground font-semibold">
                              Conta inativa
                            </span>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* Profile */}
                    <section>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                        Empresa
                      </h4>
                      <div className="space-y-2.5 text-sm">
                        {selected.profile.razao_social && (
                          <div className="flex items-start gap-2.5">
                            <Building2 size={14} className="text-muted-foreground mt-0.5" />
                            <div>
                              <p>{selected.profile.razao_social}</p>
                              {selected.profile.nome_fantasia && (
                                <p className="text-xs text-muted-foreground">{selected.profile.nome_fantasia}</p>
                              )}
                            </div>
                          </div>
                        )}
                        {selected.profile.cnpj && (
                          <p className="text-muted-foreground">CNPJ: {formatCNPJ(selected.profile.cnpj)}</p>
                        )}
                        {selected.profile.telefone && (
                          <div className="flex items-center gap-2.5">
                            <Phone size={14} className="text-muted-foreground" />
                            <span>{formatPhone(selected.profile.telefone)}</span>
                          </div>
                        )}
                        {selected.profile.nome_responsavel && (
                          <p>Responsável: {selected.profile.nome_responsavel} {selected.profile.cargo && `(${selected.profile.cargo})`}</p>
                        )}
                        {selected.profile.segmento && (
                          <p className="text-muted-foreground">Segmento: {selected.profile.segmento}</p>
                        )}
                      </div>
                    </section>

                    <div className="flex items-center gap-2 pt-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setEditing(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
                      >
                        <Pencil size={14} /> Editar
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setDeleteTarget(selected)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold"
                      >
                        <Trash2 size={14} /> Excluir
                      </motion.button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Edit form */}
                    <section className="space-y-3">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Acesso
                      </h4>
                      <Field label="E-mail">
                        <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className={inputCls} />
                      </Field>
                      <Field label="Nova senha (opcional)">
                        <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Deixe em branco para manter" className={inputCls} />
                      </Field>
                      {editPassword && (
                        <Field label="Confirmar nova senha">
                          <input type="password" value={editConfirm} onChange={(e) => setEditConfirm(e.target.value)} className={inputCls} />
                        </Field>
                      )}
                    </section>

                    <section className="space-y-3">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Empresa
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Field label="Nome do responsável">
                          <input value={editProfile.nome_responsavel} onChange={(e) => setEditProfile(p => ({ ...p, nome_responsavel: e.target.value }))} className={inputCls} />
                        </Field>
                        <Field label="Cargo">
                          <input value={editProfile.cargo} onChange={(e) => setEditProfile(p => ({ ...p, cargo: e.target.value }))} className={inputCls} />
                        </Field>
                        <Field label="Telefone">
                          <input value={editProfile.telefone} onChange={(e) => setEditProfile(p => ({ ...p, telefone: formatPhone(e.target.value) }))} className={inputCls} />
                        </Field>
                        <Field label="CNPJ">
                          <input value={editProfile.cnpj} onChange={(e) => setEditProfile(p => ({ ...p, cnpj: formatCNPJ(e.target.value) }))} className={inputCls} />
                        </Field>
                        <Field label="Razão Social">
                          <input value={editProfile.razao_social} onChange={(e) => setEditProfile(p => ({ ...p, razao_social: e.target.value }))} className={inputCls} />
                        </Field>
                        <Field label="Nome Fantasia">
                          <input value={editProfile.nome_fantasia} onChange={(e) => setEditProfile(p => ({ ...p, nome_fantasia: e.target.value }))} className={inputCls} />
                        </Field>
                        <Field label="Inscrição Estadual">
                          <input value={editProfile.inscricao_estadual} onChange={(e) => setEditProfile(p => ({ ...p, inscricao_estadual: e.target.value }))} className={inputCls} />
                        </Field>
                        <Field label="Segmento">
                          <input value={editProfile.segmento} onChange={(e) => setEditProfile(p => ({ ...p, segmento: e.target.value }))} className={inputCls} />
                        </Field>
                      </div>
                    </section>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => { setEditing(false); setEditPassword(""); setEditConfirm(""); }}
                        className="px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-semibold"
                      >
                        Cancelar
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
                      >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />}
                        {saving ? "Salvando..." : "Salvar alterações"}
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !deleting && setDeleteTarget(null)}
              className="fixed inset-0 bg-background/70 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-card rounded-2xl border border-border z-[60] overflow-hidden"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10 shrink-0">
                    <AlertTriangle size={20} className="text-destructive" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">Excluir conta</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Tem certeza que deseja excluir a conta de{" "}
                      <strong className="text-foreground">
                        {deleteTarget.profile.nome_responsavel || deleteTarget.email}
                      </strong>
                      ? Essa ação não pode ser desfeita.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    disabled={deleting}
                    className="px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-semibold disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold disabled:opacity-50"
                  >
                    {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    {deleting ? "Excluindo..." : "Excluir conta"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const inputCls =
  "w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>
    {children}
  </div>
);

export default AdminCustomers;
