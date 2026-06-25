import { createContext, useContext, ReactNode, useEffect } from "react";
import { useGetMe } from "@workspace/api-client-react";
import type { User } from "@workspace/api-client-react";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading, isError } = useGetMe({
    query: {
      retry: false,
    }
  });

  const isAuthenticated = !!user && !isError;

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && location !== "/login" && location !== "/register") {
        setLocation("/login");
      } else if (isAuthenticated) {
        if (!user.onboardingComplete && location !== "/onboarding") {
          setLocation("/onboarding");
        } else if (user.onboardingComplete && (location === "/login" || location === "/register" || location === "/onboarding")) {
          setLocation("/");
        }
      }
    }
  }, [isLoading, isAuthenticated, user, location, setLocation]);

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
