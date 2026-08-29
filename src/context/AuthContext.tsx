'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export type OnboardingStep = 'workspace' | 'integrations' | 'guardrails' | 'activation' | 'completed';

export interface WorkspaceConfig {
  companyName: string;
  businessType: string;
  monthlyVolume: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  onboardingCompleted?: boolean;
  onboardingStep?: OnboardingStep;
  workspace?: WorkspaceConfig;
  connectedIntegrations?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  updateUserOnboarding: (data: {
    onboardingCompleted?: boolean;
    onboardingStep?: OnboardingStep;
    workspace?: Partial<WorkspaceConfig>;
    connectedIntegrations?: string[];
  }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'reclaim_auth_user';
const USERS_DB_KEY = 'reclaim_users_database';

// Seed default accounts
const DEFAULT_DEMO_USER: User = {
  id: 'usr_demo',
  name: 'Demo User',
  email: 'demo@reclaim.ai',
  onboardingCompleted: true,
  onboardingStep: 'completed',
  workspace: {
    companyName: 'Acme Corp',
    businessType: 'SaaS',
    monthlyVolume: '₹50L – ₹1Cr',
  },
  connectedIntegrations: ['razorpay_sandbox', 'reclaim_billing', 'business_bank', 'email', 'whatsapp'],
};

// In-memory cache synced with localStorage
function getUsersDatabase(): Map<string, { user: User; password: string }> {
  const map = new Map<string, { user: User; password: string }>();
  map.set('demo@reclaim.ai', {
    user: DEFAULT_DEMO_USER,
    password: 'Reclaim@2026',
  });

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(USERS_DB_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<string, { user: User; password: string }>;
        Object.entries(parsed).forEach(([k, v]) => {
          map.set(k.toLowerCase().trim(), v);
        });
      }
    } catch {
      // ignore JSON parse errors
    }
  }
  return map;
}

function saveUsersDatabase(map: Map<string, { user: User; password: string }>) {
  if (typeof window !== 'undefined') {
    try {
      const obj: Record<string, { user: User; password: string }> = {};
      map.forEach((v, k) => {
        obj[k] = v;
      });
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(obj));
    } catch {
      // ignore
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Hydrate session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as User;
        // Also re-verify against latest users db
        const db = getUsersDatabase();
        const existing = db.get(parsed.email.toLowerCase().trim());
        if (existing) {
          setUser(existing.user);
        } else {
          setUser(parsed);
        }
      }
    } catch {
      // ignore parse errors
    }
    setIsLoading(false);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      // Simulate network latency
      await new Promise((res) => setTimeout(res, 600));

      const key = email.toLowerCase().trim();
      const db = getUsersDatabase();
      const entry = db.get(key);

      if (!entry) {
        return { success: false, error: 'No account found with this email.' };
      }
      if (entry.password !== password) {
        return { success: false, error: 'Incorrect password. Try again.' };
      }

      setUser(entry.user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entry.user));
      return { success: true };
    },
    []
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      // Simulate network latency
      await new Promise((res) => setTimeout(res, 800));

      const key = email.toLowerCase().trim();
      const db = getUsersDatabase();

      if (db.has(key)) {
        return { success: false, error: 'An account with this email already exists.' };
      }

      const newUser: User = {
        id: `usr_${Date.now().toString(36)}`,
        name: name.trim(),
        email: key,
        onboardingCompleted: false,
        onboardingStep: 'workspace',
        workspace: {
          companyName: 'Acme Technologies',
          businessType: 'SaaS',
          monthlyVolume: '₹10L – ₹50L',
        },
        connectedIntegrations: [],
      };

      db.set(key, { user: newUser, password });
      saveUsersDatabase(db);

      setUser(newUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      return { success: true };
    },
    []
  );

  const updateUserOnboarding = useCallback(
    (data: {
      onboardingCompleted?: boolean;
      onboardingStep?: OnboardingStep;
      workspace?: Partial<WorkspaceConfig>;
      connectedIntegrations?: string[];
    }) => {
      setUser((prev) => {
        if (!prev) return null;
        const updated: User = {
          ...prev,
          ...(data.onboardingCompleted !== undefined && { onboardingCompleted: data.onboardingCompleted }),
          ...(data.onboardingStep !== undefined && { onboardingStep: data.onboardingStep }),
          ...(data.workspace && {
            workspace: {
              companyName: data.workspace.companyName || prev.workspace?.companyName || 'Acme Technologies',
              businessType: data.workspace.businessType || prev.workspace?.businessType || 'SaaS',
              monthlyVolume: data.workspace.monthlyVolume || prev.workspace?.monthlyVolume || '₹10L – ₹50L',
            },
          }),
          ...(data.connectedIntegrations !== undefined && {
            connectedIntegrations: data.connectedIntegrations,
          }),
        };

        // Persist to user session
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

        // Persist to users database
        const db = getUsersDatabase();
        const entry = db.get(updated.email.toLowerCase().trim());
        if (entry) {
          entry.user = updated;
          db.set(updated.email.toLowerCase().trim(), entry);
          saveUsersDatabase(db);
        }

        return updated;
      });
    },
    []
  );

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    router.push('/');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateUserOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
