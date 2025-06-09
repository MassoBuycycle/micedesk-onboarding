import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Add from "./pages/Add";
import View from "./pages/View";
import ViewDetail from "./pages/ViewDetail";
import Secure from "./pages/Secure";
import UserManagement from "./pages/UserManagement";
import Policies from "./pages/Policies";
import FilesManagerPage from "./pages/admin/FilesManagerPage";
import RoleManagement from "./pages/admin/RoleManagement";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "@/components/ui/toaster";
import HotelView from "./pages/HotelView";
import PendingApprovalsPage from "./pages/admin/PendingApprovalsPage";
import UserSettings from "./pages/UserSettings";
import { ThemeProvider } from "./context/ThemeContext";
import "./i18n";

const queryClient = new QueryClient();

const AuthApp = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout><Index /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/add" element={
            <ProtectedRoute>
              <AppLayout><Add /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/edit/hotel/:id" element={
            <ProtectedRoute>
              <AppLayout><Add mode="edit" /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/view" element={
            <ProtectedRoute>
              <AppLayout><View /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/view/hotel/:id" element={
            <ProtectedRoute>
              <AppLayout><HotelView /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/policies" element={
            <ProtectedRoute>
              <AppLayout><Policies /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/secure" element={
            <ProtectedRoute>
              <AppLayout><Secure /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute>
              <AppLayout><UserManagement /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/users/add" element={
            <ProtectedRoute>
              <AppLayout><UserManagement mode="add" /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/users/edit/:id" element={
            <ProtectedRoute>
              <AppLayout><UserManagement mode="edit" /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/files" element={
            <ProtectedRoute>
              <AppLayout><FilesManagerPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/roles" element={
            <ProtectedRoute>
              <AppLayout><RoleManagement /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin/approvals" element={
            <ProtectedRoute>
              <AppLayout><PendingApprovalsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <AppLayout><UserSettings /></AppLayout>
            </ProtectedRoute>
          } />
          
          {/* Catch-all route (protected) */}
          <Route path="*" element={
            <ProtectedRoute>
              <AppLayout><NotFound /></AppLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </ThemeProvider>
    </AuthProvider>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <AuthApp />
          <Toaster />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
