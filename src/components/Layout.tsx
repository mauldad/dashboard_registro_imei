import React, { useEffect, useState } from "react";
import { MenuIcon } from "lucide-react";
import Sidebar from "./Sidebar";
import supabase from "@/data/supabase";
import { User } from "@supabase/supabase-js";
import useAuthStore from "@/store/auth";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore((state) => state);

  useEffect(() => {
    const fetchSignedUser = async () => {
      setLoading(true);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      setLoading(false);

      if (error) {
        console.error(error);
        return;
      }

      setUserInfo(user);
    };

    if (!userInfo) {
      fetchSignedUser();
    }
  }, [loading, userInfo]);

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        onClose={() => setIsSidebarOpen(false)}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4 ml-auto">
            <div className="text-right">
              {loading ? (
                <p className="text-sm font-medium text-gray-900">...</p>
              ) : (
                <p className="text-sm font-medium text-gray-900">
                  {userInfo?.email} -{" "}
                  {token?.is_admin
                    ? "Admin"
                    : token?.is_operator
                      ? "Operador"
                      : "Usuario"}
                </p>
              )}
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <img
                src="https://mbservices.cl/wp-content/uploads/2024/11/mb-4.webp"
                alt="Avatar"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm font-medium text-blue-600"></span>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto bg-gray-50 relative">
          <div className="container mx-auto h-full p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
