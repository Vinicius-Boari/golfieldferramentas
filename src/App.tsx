import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MaintenanceGate from "@/components/MaintenanceGate";
import VisualEditorBridge from "@/components/VisualEditorBridge";
import { useApplyMobileMotionClass } from "@/hooks/useMobileMotion";
import { useApplyGlobalBackground } from "@/hooks/useGlobalBackground";
import Index from "./pages/Index.tsx";

// Lazy-load secondary routes — they are not needed for the initial paint of "/".
// This significantly shrinks the first JS chunk and speeds up TTI on the homepage.
const Login = lazy(() => import("./pages/Login.tsx"));
const Register = lazy(() => import("./pages/Register.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const AdminProducts = lazy(() => import("./pages/AdminProducts.tsx"));
const AdminLogin = lazy(() => import("./pages/AdminLogin.tsx"));
const AdminHome = lazy(() => import("./pages/AdminHome.tsx"));
const AdminUsers = lazy(() => import("./pages/AdminUsers.tsx"));
const AdminCustomers = lazy(() => import("./pages/AdminCustomers.tsx"));
const AdminCoupons = lazy(() => import("./pages/AdminCoupons.tsx"));
const AdminVisual = lazy(() => import("./pages/AdminVisual.tsx"));
const AdminAI = lazy(() => import("./pages/AdminAI.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache config/products for a minute — avoids redundant network refetches
      // when the user navigates between sections or remounts components.
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Minimal fallback (no spinner -> no layout flash). Background matches theme.
const RouteFallback = () => <div className="min-h-screen bg-background" />;

const AppShell = () => {
  useApplyMobileMotionClass();
  useApplyGlobalBackground();
  return (
    <BrowserRouter>
      {/* Global: applies persisted visual overrides on the public site,
          and bridges live-preview messages when running inside the editor iframe. */}
      <VisualEditorBridge />
      <MaintenanceGate>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
            <Route path="/esqueci-senha" element={<ForgotPassword />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/produtos" element={<AdminProducts />} />
            <Route path="/admin/home" element={<AdminHome />} />
            <Route path="/admin/visual" element={<AdminVisual />} />
            <Route path="/admin/usuarios" element={<AdminUsers />} />
            <Route path="/admin/clientes" element={<AdminCustomers />} />
            <Route path="/admin/cupons" element={<AdminCoupons />} />
            <Route path="/admin/ia" element={<AdminAI />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </MaintenanceGate>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppShell />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
