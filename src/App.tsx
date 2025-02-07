import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Users from "./pages/Users";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import useAuthStore from "./store/auth";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

const ProtectedRoute = ({
  children,
  isAllowed,
}: {
  children: React.ReactNode;
  isAllowed: boolean;
}) => {
  return isAllowed ? <>{children}</> : <Navigate to="/" replace />;
};

function App() {
  const { token } = useAuthStore();

  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/clients" element={<Clients />} />
                      <Route
                        path="/reports"
                        element={
                          <ProtectedRoute isAllowed={token?.is_admin || false}>
                            <Reports />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="/settings" element={<Settings />} />
                      <Route
                        path="/users"
                        element={
                          <ProtectedRoute isAllowed={token?.is_admin || false}>
                            <Users />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
