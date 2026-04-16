import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MaintenanceGate from "@/components/MaintenanceGate";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminProducts from "./pages/AdminProducts.tsx";
import AdminLogin from "./pages/AdminLogin.tsx";
import AdminHome from "./pages/AdminHome.tsx";
import AdminUsers from "./pages/AdminUsers.tsx";
import AdminCoupons from "./pages/AdminCoupons.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MaintenanceGate>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
            <Route path="/esqueci-senha" element={<ForgotPassword />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/produtos" element={<AdminProducts />} />
            <Route path="/admin/home" element={<AdminHome />} />
            <Route path="/admin/usuarios" element={<AdminUsers />} />
            <Route path="/admin/cupons" element={<AdminCoupons />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MaintenanceGate>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
