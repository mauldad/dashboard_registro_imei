import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Settings,
  UserCog,
  Users,
  X,
} from "lucide-react";
import useAuthStore from "../store/auth";

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

const Sidebar = ({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { removeToken, token } = useAuthStore((state) => state);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Users, label: "Clientes", path: "/clients" },
    { icon: FileSpreadsheet, label: "Reportes", path: "/reports" },
    { icon: Settings, label: "Configuración", path: "/settings" },
    { icon: UserCog, label: "Usuarios", path: "/users" },
  ].filter((item) => {
    if (item.path === "/users" && !token?.is_admin) {
      return false;
    }
    return true;
  });

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto h-screen flex flex-col ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } ${isCollapsed ? "w-20" : "w-64"}`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b flex-shrink-0">
        {!isCollapsed && (
          <div className="transition-opacity duration-200">
            <h1 className="text-lg font-bold text-gray-800">IMEI SYSTEM</h1>
            <p className="text-xs text-gray-600">Sistema MB Services vs1.0.4</p>
          </div>
        )}
        <div className="flex items-center">
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              navigate(item.path);
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
              location.pathname === item.path
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            title={isCollapsed ? item.label : undefined}
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </button>
        ))}
        <button
          onClick={() => {
            removeToken();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-200 mt-8"
          title={isCollapsed ? "Cerrar Sesión" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Cerrar Sesión</span>}
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
