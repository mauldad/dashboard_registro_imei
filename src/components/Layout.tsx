import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FileSpreadsheet,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import useAuthStore from "../store/auth";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const removeToken = useAuthStore((state) => state.removeToken);

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Users, label: "Clientes", path: "/clients" },
    { icon: FileSpreadsheet, label: "Reportes", path: "/reports" },
    { icon: Settings, label: "Configuración", path: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="h-16 flex items-center px-6 border-b">
          <div>
            <h1 className="text-lg font-bold text-gray-800">
              Registro de IMEI
            </h1>
            <p className="text-xs text-gray-600">
              Sistema de Gestión de MB Services
            </p>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                location.pathname === item.path
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
          <button
            onClick={removeToken}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors mt-8"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </nav>
      </aside>
      <main className="flex-1">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">admin@company.com</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-200"></div>
          </div>
        </header>
        <div className="container mx-auto">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
