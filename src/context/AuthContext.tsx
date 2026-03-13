import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  completeStoredUserOnboarding,
  getSessionUser,
  loginUser,
  logoutUser,
  signupUser,
  type AuthUser,
  type UserProfile,
  type UserRole,
} from "@/lib/auth";

interface AuthActionResult {
  ok: boolean;
  message?: string;
  user?: AuthUser;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: { email: string; password: string }) => AuthActionResult;
  signup: (input: { name: string; email: string; password: string; role: UserRole }) => AuthActionResult;
  completeOnboarding: (profile: UserProfile) => AuthActionResult;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getSessionUser());
    setIsLoading(false);
  }, []);

  const login = (input: { email: string; password: string }) => {
    const result = loginUser(input);

    if (result.ok && result.user) {
      setUser(result.user);
    }

    return result;
  };

  const signup = (input: { name: string; email: string; password: string; role: UserRole }) => {
    const result = signupUser(input);

    if (result.ok && result.user) {
      setUser(result.user);
    }

    return result;
  };

  const completeOnboarding = (profile: UserProfile) => {
    if (!user) {
      return {
        ok: false,
        message: "Please log in again to finish setup.",
      };
    }

    const result = completeStoredUserOnboarding({
      userId: user.id,
      profile,
    });

    if (result.ok && result.user) {
      setUser(result.user);
    }

    return result;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        signup,
        completeOnboarding,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
