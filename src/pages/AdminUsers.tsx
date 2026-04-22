import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, Plus, Trash2, Shield, Crown, X, Loader2, LogOut, Pencil, UserRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface AdminUser {
  id: string;
  email: string;
  role: string;
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading, user, isOwner } = useAdmin();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("manage-admins", {
        body: { action: "list" },
      });
      if (error) throw error;
      return (data?.users ?? []) as AdminUser[];
    },
    enabled: isOwner,
  });

  if (adminLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin || !isOwner) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield size={48} className="mx-auto text-muted-foreground/30" />
          <p className="text-muted-foreground">Acesso restrito ao dono do site.</p>
          <button onClick={() => navigate("/admin/produtos")} className="text-primary text-sm underline">
            Voltar ao painel
          </button>
        </div>
      </div>
    );
  }

  const handleAdd = async () => {
    if (!newEmail.trim() || !newPassword.trim()) {
      toast.error("Preencha e-mail e senha");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("manage-admins", {
        body: { action: "add", email: newEmail.trim(), password: newPassword },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Administrador adicionado com sucesso!");
      setShowAddModal(false);
      setNewEmail("");
      setNewPassword("");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: any) {
      toast.error(err.message || "Erro ao adicionar administrador");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editingUser) return;
    if (!editEmail.trim() && !editPassword.trim()) {
      toast.error("Preencha pelo menos um campo para atualizar");
      return;
    }
    setSaving(true);
    try {
      const body: any = { action: "update", userId: editingUser.id };
      if (editEmail.trim() && editEmail.trim() !== editingUser.email) body.email = editEmail.trim();
      if (editPassword.trim()) body.password = editPassword.trim();

      const { data, error } = await supabase.functions.invoke("manage-admins", { body });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Administrador atualizado!");
      setEditingUser(null);
      setEditEmail("");
      setEditPassword("");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar");
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (u: AdminUser) => {
    setEditingUser(u);
    setEditEmail(u.email);
    setEditPassword("");
  };

  const handleRemove = async (userId: string, email: string) => {
    if (!confirm(`Remover o administrador ${email}?`)) return;
    try {
      const { data, error } = await supabase.functions.invoke("manage-admins", {
        body: { action: "remove", userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Administrador removido");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/admin/produtos")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Gerenciamento de Administradores</h1>
                <p className="text-xs text-muted-foreground">{users?.length ?? 0} usuários no painel</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/admin/clientes")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-foreground text-sm font-semibold"
            >
              <UserRound size={16} />
              Clientes
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
            >
              <Plus size={16} />
              Adicionar Administrador
            </motion.button>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left text-xs font-semibold text-muted-foreground p-3 pl-4">E-mail</th>
                <th className="text-left text-xs font-semibold text-muted-foreground p-3">Tipo de Acesso</th>
                <th className="text-right text-xs font-semibold text-muted-foreground p-3 pr-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                  <td className="p-3 pl-4">
                    <p className="text-sm font-medium">{u.email}</p>
                  </td>
                  <td className="p-3">
                    {u.role === "owner" ? (
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-semibold">
                        <Crown size={12} />
                        Dono
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary font-semibold">
                        <Shield size={12} />
                        Administrador
                      </span>
                    )}
                  </td>
                  <td className="p-3 pr-4 text-right">
                    {u.role !== "owner" && (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                          title="Editar administrador"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleRemove(u.id, u.email)}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                          title="Remover administrador"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!users || users.length === 0) && (
            <div className="py-12 text-center text-muted-foreground">
              <Users size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Nenhum usuário encontrado</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-card rounded-2xl border border-border z-50 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-bold text-lg">Novo Administrador</h3>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-lg hover:bg-secondary transition-colors"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">E-mail *</label>
                  <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@exemplo.com" className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Senha *</label>
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" />
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAdd} disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {saving ? "Adicionando..." : "Adicionar Administrador"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}

        {editingUser && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingUser(null)} className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md bg-card rounded-2xl border border-border z-50 overflow-hidden">
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-bold text-lg">Editar Administrador</h3>
                <button onClick={() => setEditingUser(null)} className="p-2 rounded-lg hover:bg-secondary transition-colors"><X size={18} /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">E-mail</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} placeholder="Novo e-mail" className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Nova Senha</label>
                  <input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Deixe vazio para manter a atual" className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50" />
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleEdit} disabled={saving} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50">
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Pencil size={16} />}
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
