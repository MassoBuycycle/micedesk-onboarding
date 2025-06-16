import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { PlusCircle, List, Shield, Users, FileText, FolderInput, Settings } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const { permissions } = useAuth();
  const { t } = useTranslation();
  
  const menuItems = [
    {
      key: "add_data",
      label: t("navigation.addHotel"),
      path: "/add",
      icon: PlusCircle,
      permission: "nav_add_hotel",
    },
    {
      key: "view_data",
      label: t("navigation.viewHotels"),
      path: "/view",
      icon: List,
      permission: "nav_view_hotels",
    },
    {
      key: "policies",
      label: t("navigation.policies"),
      path: "/policies",
      icon: Settings,
      permission: "nav_view_hotels",
    },
    {
      key: "secure_data",
      label: t("navigation.secure"),
      path: "/secure",
      icon: Shield,
      permission: "nav_secure",
    },
    {
      key: "user_management",
      label: t("navigation.users"),
      path: "/users",
      icon: Users,
      permission: "nav_users",
    },
  ];
  
  const adminItems = [
    {
      key: "file_management",
      label: t("navigation.filesManager"),
      path: "/admin/files",
      icon: FileText,
      permission: "nav_files_manager",
    },
    {
      key: "pending_approvals",
      label: t("navigation.approvals"),
      path: "/admin/approvals",
      icon: FolderInput,
      permission: "nav_approvals",
    },
    {
      key: "role_management",
      label: t("navigation.rolesPermissions"),
      path: "/admin/roles",
      icon: Shield,
      permission: "nav_roles_permissions",
    },
  ];

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <div className={`p-4 ${state === "collapsed" ? "hidden" : "flex flex-col items-center"}`}>
          <img 
            src="/logo.png" 
            alt="logo" 
            className="w-28 h-auto cursor-pointer" 
            onClick={() => navigate('/')} 
          />
        </div>
        <div className={`p-4 ${state !== "collapsed" ? "hidden" : "flex justify-center"}`}>
          <img 
            src="/logo.png" 
            alt="logo" 
            className="w-9 h-auto cursor-pointer" 
            onClick={() => navigate('/')} 
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70 font-medium text-xs uppercase tracking-wider px-4 py-2">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.filter(item => permissions.includes(item.permission)).map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    isActive={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    tooltip={item.label}
                    className={location.pathname === item.path 
                      ? "bg-white/20 text-white shadow-md backdrop-blur-sm" 
                      : "hover:bg-white/10 transition-colors duration-200"
                    }
                  >
                    <item.icon className={`${location.pathname === item.path ? "opacity-100" : "opacity-80"}`} />
                    <span className="font-medium">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70 font-medium text-xs uppercase tracking-wider px-4 py-2">
            {t("navigation.admin")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminItems.filter(item => permissions.includes(item.permission)).map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    isActive={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                    tooltip={item.label}
                    className={location.pathname === item.path 
                      ? "bg-white/20 text-white shadow-md backdrop-blur-sm" 
                      : "hover:bg-white/10 transition-colors duration-200"
                    }
                  >
                    <item.icon className={`${location.pathname === item.path ? "opacity-100" : "opacity-80"}`} />
                    <span className="font-medium">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className={`p-3 space-y-2 ${state === "collapsed" ? "hidden" : ""}`}>
          <div className="flex justify-center">
            <LanguageSwitcher />
          </div>
          <div className="text-xs text-white/70 text-center">
            {t("navigation.version")}
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
