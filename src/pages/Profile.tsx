import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Camera, LogOut, Pencil, Save, X, Mail, Calendar, Building2, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, getInitials } from "@/hooks/useProfile";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import AuthLayout from "@/components/auth/AuthLayout";

const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { data: profile, isLoading } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate("/login", { replace: true });
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (profile) setName(profile.nome_responsavel || "");
  }, [profile]);

  const handleSave = async () => {
    if (!user || !profile) return;
    if (!name.trim()) {
      toast({ title: "Informe seu nome", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ nome_responsavel: name.trim() })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    setEditing(false);
    toast({ title: "Perfil atualizado!" });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Selecione uma imagem", variant: "destructive" });
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toast({ title: "Imagem muito grande", description: "Máximo 3MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ avatar_url: pub.publicUrl })
        .eq("user_id", user.id);
      if (updErr) throw updErr;
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({ title: "Foto atualizada!" });
    } catch (err: any) {
      toast({ title: "Erro ao enviar foto", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    toast({ title: "Sessão encerrada" });
    navigate("/", { replace: true });
  };

  if (authLoading || isLoading) {
    return (
      <AuthLayout title="Meu perfil">
        <div className="space-y-4">
          <div className="h-24 bg-secondary/40 rounded-xl animate-pulse" />
          <div className="h-12 bg-secondary/40 rounded-xl animate-pulse" />
          <div className="h-12 bg-secondary/40 rounded-xl animate-pulse" />
        </div>
      </AuthLayout>
    );
  }

  // Defensive fallback: user is logged in but profile row is missing.
  // Instead of an infinite skeleton (blank screen), show an actionable message.
  if (!profile) {
    return (
      <AuthLayout title="Perfil indisponível" subtitle="Não conseguimos carregar seus dados">
        <div className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Sua conta está autenticada, mas o perfil não foi encontrado. Tente sair e entrar novamente.
          </p>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive font-medium hover:bg-destructive/20 transition"
          >
            <LogOut size={16} /> Sair da conta
          </button>
        </div>
      </AuthLayout>
    );
  }

  const createdAt = new Date(profile.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <AuthLayout title="Meu perfil" subtitle="Gerencie suas informações de conta">
      <div className="space-y-6">
        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative"
          >
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-primary/60 shadow-lg shadow-primary/20">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.nome_responsavel} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-3xl font-bold">
                  {getInitials(profile.nome_responsavel)}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 transition-transform disabled:opacity-60"
              aria-label="Alterar foto"
            >
              <Camera size={16} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <span className="absolute top-1 right-1 block w-3 h-3 rounded-full bg-[hsl(142,70%,45%)] ring-2 ring-background" />
          </motion.div>

          {editing ? (
            <div className="w-full max-w-sm">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/60 border border-border/50 text-foreground text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
                placeholder="Seu nome"
              />
              <div className="flex gap-2 mt-3 justify-center">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
                >
                  <Save size={14} /> {saving ? "Salvando..." : "Salvar"}
                </button>
                <button
                  onClick={() => { setEditing(false); setName(profile.nome_responsavel); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/70 transition"
                >
                  <X size={14} /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">{profile.nome_responsavel || "—"}</h2>
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1.5 mt-1 text-xs text-primary hover:text-primary/80 transition"
              >
                <Pencil size={12} /> Editar nome e foto
              </button>
            </div>
          )}
        </div>

        {/* Info list */}
        <div className="space-y-2.5">
          <InfoRow icon={<Mail size={16} />} label="E-mail" value={profile.email} />
          <InfoRow icon={<Calendar size={16} />} label="Membro desde" value={createdAt} />
          {profile.razao_social && (
            <InfoRow icon={<Building2 size={16} />} label="Razão social" value={profile.razao_social} />
          )}
          {profile.telefone && (
            <InfoRow icon={<Phone size={16} />} label="Telefone" value={profile.telefone} />
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive font-medium hover:bg-destructive/20 transition"
        >
          <LogOut size={16} /> Sair da conta
        </button>
      </div>
    </AuthLayout>
  );
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/40 border border-border/40">
    <span className="text-primary shrink-0">{icon}</span>
    <div className="min-w-0 flex-1">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm text-foreground truncate">{value}</div>
    </div>
  </div>
);

export default Profile;
