import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_USERS } from '../data/seedData';

interface AuthContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  allUsers: UserProfile[];
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  switchUserById: (userId: string) => void;
  updateCurrentUserProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'mcu_council_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to staff user initially for testing administrative functions, but easily switchable
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    // Default to staff
    return INITIAL_USERS.find(u => u.role === 'staff') || INITIAL_USERS[0];
  });

  useEffect(() => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
  }, [currentUser]);

  const login = async (email: string, _password?: string): Promise<boolean> => {
    const found = INITIAL_USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (found) {
      setCurrentUser(found);
      return true;
    }
    // Allow demo fallback if contains role keyword
    const roleMatch = INITIAL_USERS.find(u => u.role === email.trim().toLowerCase());
    if (roleMatch) {
      setCurrentUser(roleMatch);
      return true;
    }
    return false;
  };

  const logout = () => {
    // For convenience in testing, set to member or clear
    const defaultUser = INITIAL_USERS.find(u => u.role === 'member') || INITIAL_USERS[0];
    setCurrentUser(defaultUser);
  };

  const switchRole = (role: UserRole) => {
    const matched = INITIAL_USERS.find(u => u.role === role);
    if (matched) {
      setCurrentUser(matched);
    } else {
      setCurrentUser(prev => ({ ...prev, role }));
    }
  };

  const switchUserById = (userId: string) => {
    const matched = INITIAL_USERS.find(u => u.id === userId);
    if (matched) {
      setCurrentUser(matched);
    }
  };

  const updateCurrentUserProfile = (data: Partial<UserProfile>) => {
    setCurrentUser(prev => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole: currentUser.role,
        allUsers: INITIAL_USERS,
        login,
        logout,
        switchRole,
        switchUserById,
        updateCurrentUserProfile
      }}
    >
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
