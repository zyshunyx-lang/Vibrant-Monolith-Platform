
import React, { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { loadDb, getCurrentUser } from './db';
import { ModuleId } from './types';

/**
 * 权限检测 Hook
 * 逻辑：
 * 1. 检查全局 enabledModules（黑白名单第一关）
 * 2. 如果是超级管理员，默认拥有所有已开启模块的权限
 * 3. 检查用户自身的 allowedModules 列表
 */
export const useModulePermission = (moduleId: ModuleId): boolean => {
  const db = loadDb();
  const user = getCurrentUser();

  return useMemo(() => {
    // 1. 全局开关校验：如果系统全局禁用了该模块，任何人不可见
    const isGlobalEnabled = (db.sys_config.enabledModules || []).includes(moduleId);
    if (!isGlobalEnabled) return false;

    // 2. 身份校验
    if (!user) return false;
    
    // 超级管理员拥有全权限（只要全局开启）
    if (user.role === 'super_admin') return true;

    // 3. 用户具体权限校验
    return (user.allowedModules || []).includes(moduleId);
  }, [db.sys_config.enabledModules, user, moduleId]);
};

/**
 * 路由保护组件
 */
interface RequireModulePermissionProps {
  module: ModuleId;
  children: React.ReactNode;
}

export const RequireModulePermission: React.FC<RequireModulePermissionProps> = ({ module, children }) => {
  const hasPermission = useModulePermission(module);

  if (!hasPermission) {
    // 如果没有权限，重定向到首页
    // Fix: Use React.createElement to fix "Cannot find name 'to'" error in non-JSX .ts file
    return React.createElement(Navigate, { to: "/", replace: true });
  }

  // Fix: Use React.createElement to fix JSX error in non-JSX .ts file
  return React.createElement(React.Fragment, null, children);
};
