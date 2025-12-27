
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { User } from './types';
import { getCurrentUser } from './db';

interface AuthContextType {
  user: User | null;
  isLoginModalOpen: boolean;
  login: (user: User) => void;
  logout: () => void;
  showLoginModal: () => void;
  closeLoginModal: () => void;
  /**
   * 鉴权执行：如果已登录则执行 action，否则保存 action 并弹出登录框
   */
  executeWithAuth: (action: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // 使用 ref 存储待执行动作，避免闭包过时问题
  const pendingActionRef = useRef<(() => void) | null>(null);

  const login = useCallback((newUser: User) => {
    setUser(newUser);
    localStorage.setItem('APP_SESSION', JSON.stringify(newUser));
    
    // 如果有被中断的任务，立即执行
    if (pendingActionRef.current) {
      const action = pendingActionRef.current;
      pendingActionRef.current = null;
      // 使用 setTimeout 确保在 Modal 关闭及 Context 更新后的下一帧执行
      setTimeout(action, 100);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('APP_SESSION');
  }, []);

  const showLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => {
    setIsLoginModalOpen(false);
    pendingActionRef.current = null; // 关闭弹窗则清空意图
  }, []);

  const executeWithAuth = useCallback((action: () => void) => {
    const currentUser = getCurrentUser(); // 实时检查最新的存储状态
    if (currentUser) {
      action();
    } else {
      pendingActionRef.current = action;
      setIsLoginModalOpen(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoginModalOpen, 
      login, 
      logout, 
      showLoginModal, 
      closeLoginModal,
      executeWithAuth
    }}>
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
