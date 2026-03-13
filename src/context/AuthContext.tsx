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

import { auth, provider } from "@/firebase";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

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
  loginWithGoogle: () => Promise<AuthUser | null>;
  completeOnboarding: (profile: UserProfile) => AuthActionResult;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const newUser: AuthUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
          role: "buyer",
          onboardingComplete: true,
        };

        setUser(newUser);
      } else {
        setUser(getSessionUser());
      }

      setIsLoading(false);
    });

    return () => unsubscribe();
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

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      const newUser: AuthUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || "",
        role: "buyer",
        onboardingComplete: true,
      };

      setUser(newUser);

      return newUser;
    } catch (error) {
      console.error("Google login error:", error);
      return null;
    }
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

  const logout = async () => {
    await signOut(auth);
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
        loginWithGoogle,
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