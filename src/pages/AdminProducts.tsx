import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Search, Package, LogOut, Save, X, ArrowLeft, Eye, EyeOff, Upload, Link2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/useAdmin";
import { useAllProducts, type DbProduct } from "@/hooks/useProducts";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const emptyProduct = {
  name: "",
  description: "",
  price: 0,
  image: "",
  category: "",
  min_qty: 1,
  active: true,
  sort_order: 0,
};

const sanitizeFileName = (fileName: string) =>
  fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();

const AdminProducts = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading, user } = useAdmin();
  const { data: products, isLoading } = useAllProducts();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<Partial<DbProduct> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      toast.error("Acesso negado. Apenas administradores.");
      navigate("/");
    }
  }, [adminLoading, isAdmin, navigate]);

  if (adminLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const categories = [...new Set(products?.map(p => p.category) ?? [])].sort();

  const openNewProductModal = () => {
    setEditingProduct({ ...emptyProduct });
    setIsNew(true);
    setImageMode("upload");
  };

  const openEditProductModal = (product: DbProduct) => {
    setEditingProduct({ ...product });
    setIsNew(false);
    setImageMode(product.image ? "url" : "upload");
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido");
      return;
    }

    if (!user) {
      toast.error("Sessão inválida. Faça login novamente.");
      return;
    }

    setUploadingImage(true);

    try {
      const extension = file.name.split(".").pop() || "png";
      const safeName = sanitizeFileName(file.name.replace(/\.[^.]+$/, ""));
      const filePath = `${user.id}/${Date.now()}-${safeName}.${extension.toLowerCase()}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("product-images").getPublicUrl(filePath);

      setEditingProduct((current) => current ? { ...current, image: data.publicUrl } : current);
      setImageMode("upload");
      toast.success("Imagem enviada com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar imagem");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    if (!editingProduct?.name?.trim()) {
      toast.error("Nome do produto é obrigatório");
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const { error } = await supabase.from("products").insert({
          name: editingProduct.name,
          description: editingProduct.description || "",
          price: editingProduct.price || 0,
          image: editingProduct.image || "",
          category: editingProduct.category || "",
          min_qty: editingProduct.min_qty || 1,
          active: editingProduct.active ?? true,
          sort_order: editingProduct.sort_order || 0,
        });
        if (error) throw error;
        toast.success("Produto criado com sucesso!");
      } else {
        const { error } = await supabase
          .from("products")
          .update({
            name: editingProduct.name,
            description: editingProduct.description,
            price: editingProduct.price,
            image: editingProduct.image,
            category: editingProduct.category,
            min_qty: editingProduct.min_qty,
            active: editingProduct.active,
            sort_order: editingProduct.sort_order,
          })
          .eq("id", editingProduct.id!);
        if (error) throw error;
        toast.success("Produto atualizado!");
      }
      queryClient.invalidateQueries({ queryKey: ["products-admin"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditingProduct(null);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("Erro ao excluir produto");
      return;
    }
    toast.success("Produto excluído");
    queryClient.invalidateQueries({ queryKey: ["products-admin"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const handleToggleActive = async (product: DbProduct) => {
    const { error } = await supabase
      .from("products")
      .update({ active: !product.active })
      .eq("id", product.id);
    if (error) {
      toast.error("Erro ao alterar status");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["products-admin"] });
    queryClient.invalidateQueries({ queryKey: ["products"] });
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
            <button onClick={() => navigate("/")} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package size={20} className="text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Painel de Produtos</h1>
                <p className="text-xs text-muted-foreground">{products?.length ?? 0} produtos cadastrados</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={openNewProductModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
            >
              <Plus size={16} />
              Novo Produto
            </motion.button>
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Buscar produto ou categoria..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left text-xs font-semibold text-muted-foreground p-3 pl-4">Imagem</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground p-3">Nome</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground p-3">Categoria</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-3">Preço</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-3">Qtd Mín</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground p-3">Status</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground p-3 pr-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="border-b border-border/40 hover:bg-secondary/20 transition-colors">
                    <td className="p-3 pl-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary/50 overflow-hidden flex items-center justify-center">
                        {product.image ? (
                          <img src={product.image} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <Package size={16} className="text-muted-foreground/30" />
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      <p className="text-sm font-medium truncate max-w-[250px]">{product.name}</p>
                    </td>
                    <td className="p-3">
                      <span className="text-xs px-2 py-1 rounded-md bg-secondary/60 text-muted-foreground">{product.category}</span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-sm font-semibold text-primary">R$ {Number(product.price).toFixed(2).replace('.', ',')}</span>
                    </td>
                    <td className="p-3 text-right text-sm text-muted-foreground">{product.min_qty}</td>
                    <td className="p-3 text-center">
                      <button onClick={() => handleToggleActive(product)} className="inline-flex items-center gap-1">
                        {product.active ? (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-secondary text-foreground">
                            <Eye size={12} /> Ativo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                            <EyeOff size={12} /> Inativo
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditProductModal(product)}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                        >
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
              <Package size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {editingProduct && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProduct(null)}
              className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-[8vh] -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg bg-card rounded-2xl border border-border z-50 flex flex-col max-h-[84vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-border">
                <h3 className="font-bold text-lg">{isNew ? "Novo Produto" : "Editar Produto"}</h3>
                <button onClick={() => setEditingProduct(null)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Nome *</label>
                  <input
                    type="text"
                    value={editingProduct.name || ""}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Descrição</label>
                  <textarea
                    value={editingProduct.description || ""}
                    onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingProduct.price || ""}
                      onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Qtd Mínima</label>
                    <input
                      type="number"
                      value={editingProduct.min_qty || ""}
                      onChange={e => setEditingProduct({ ...editingProduct, min_qty: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Categoria</label>
                  <input
                    type="text"
                    list="categories-list"
                    value={editingProduct.category || ""}
                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50"
                  />
                  <datalist id="categories-list">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-xs font-medium text-muted-foreground block">Imagem do Produto</label>
                    <div className="flex items-center gap-2 rounded-lg bg-secondary/60 p-1">
                      <button
                        type="button"
                        onClick={() => setImageMode("upload")}
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${imageMode === "upload" ? "bg-background text-foreground" : "text-muted-foreground"}`}
                      >
                        <Upload size={12} /> Upload
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode("url")}
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${imageMode === "url" ? "bg-background text-foreground" : "text-muted-foreground"}`}
                      >
                        <Link2 size={12} /> URL
                      </button>
                    </div>
                  </div>

                  {imageMode === "upload" ? (
                    <div className="rounded-xl border border-dashed border-border bg-secondary/30 p-4 space-y-3">
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={e => void handleImageUpload(e.target.files?.[0] ?? null)}
                        className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:opacity-90"
                      />
                      <p className="text-xs text-muted-foreground">
                        Envie uma imagem do seu computador. Após o upload, ela será preenchida automaticamente no produto.
                      </p>
                      {uploadingImage && (
                        <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                          <Loader2 size={14} className="animate-spin" /> Enviando imagem...
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">URL da Imagem</label>
                      <input
                        type="text"
                        value={editingProduct.image || ""}
                        onChange={e => setEditingProduct({ ...editingProduct, image: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50"
                      />
                    </div>
                  )}

                  {!!editingProduct.image && (
                    <div className="rounded-xl border border-border bg-secondary/20 p-3 space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-muted-foreground">Pré-visualização</span>
                        <button
                          type="button"
                          onClick={() => setEditingProduct({ ...editingProduct, image: "" })}
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Remover imagem
                        </button>
                      </div>
                      <div className="w-24 h-24 rounded-lg bg-secondary/50 overflow-hidden">
                        <img src={editingProduct.image} alt="Prévia da imagem do produto" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Ordem de Exibição</label>
                  <input
                    type="number"
                    value={editingProduct.sort_order || ""}
                    onChange={e => setEditingProduct({ ...editingProduct, sort_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/50 text-sm outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditingProduct({ ...editingProduct, active: !editingProduct.active })}
                    className={`relative w-10 h-6 rounded-full transition-colors ${editingProduct.active ? "bg-primary" : "bg-secondary"}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-primary-foreground transition-transform ${editingProduct.active ? "left-5" : "left-1"}`} />
                  </button>
                  <span className="text-sm">{editingProduct.active ? "Produto ativo" : "Produto inativo"}</span>
                </div>
              </div>

              <div className="p-5 border-t border-border flex gap-3">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 rounded-xl bg-secondary text-sm font-semibold hover:bg-secondary/80 transition-colors"
                >
                  Cancelar
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving || uploadingImage}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? "Salvando..." : "Salvar"}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;
