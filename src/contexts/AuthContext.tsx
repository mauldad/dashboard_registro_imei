import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

interface User {
  email: string;
  name: string;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TEST_EMAIL = 'admin@test.com';
const TEST_PASSWORD = '123456';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (email === TEST_EMAIL && password === TEST_PASSWORD) {
      setUser({ email: TEST_EMAIL, name: 'Admin Test' });
    } else {
      throw new Error('Invalid credentials');
    }
    setLoading(false);
  };

  const signOut = async () => {
    setUser(null);
  };

  const updateEmail = async (newEmail: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (user) {
      setUser({ ...user, email: newEmail });
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (currentPassword !== TEST_PASSWORD) {
      throw new Error('Invalid current password');
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    updateEmail,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};