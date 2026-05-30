// ============================================
// DecideNow - 认证 Hook
// 自动匿名登录，支持升级为正式账号
// ============================================

"use client";

import { useEffect, useState, useCallback, createContext, useContext } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAnonymous: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  isLoading: true,
  isAnonymous: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

/**
 * AuthProvider - 包裹整个应用，自动处理匿名登录
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
    const { data: sessionData } = await supabase.auth.getSession();
    setSession(sessionData.session);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const supabase = createClient();

        // 先检查是否有现有会话
        const { data: sessionData } = await supabase.auth.getSession();

        if (!sessionData.session) {
          // 无会话 → 自动匿名登录
          const { data: anonData, error } = await supabase.auth.signInAnonymously();
          if (error) {
            console.warn("[Auth] 匿名登录失败:", error.message);
          } else {
            setUser(anonData.user);
            setSession(anonData.session);
          }
        } else {
          setUser(sessionData.session.user);
          setSession(sessionData.session);
        }
      } catch (err) {
        console.warn("[Auth] 初始化失败:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const isAnonymous = user?.is_anonymous ?? true;

  return (
    <AuthContext.Provider
      value={{ user, session, isLoading, isAnonymous, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth - 在任意 Client Component 中获取认证状态
 */
export function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext };
