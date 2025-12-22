
import { loadDb, saveDb, getCurrentUser } from '../../../platform/core/db';
import { AssetsModuleSchema, AuditTask, AuditRecord, AuditResult, Asset, AuditReportData } from '../types';

interface CreateTaskParams {
  name: string;
  categoryIds: string[];
  locationIds: string[];
  departmentIds: string[];
  auditorIds: string[];
  reviewerId: string;
}

export const createAuditTask = (params: CreateTaskParams) => {
  const db = loadDb();
  const assetData = db.modules.assets as AssetsModuleSchema;
  
  const targetAssets = assetData.assets.filter(a => {
    const catMatch = params.categoryIds.length === 0 || params.categoryIds.includes(a.categoryId);
    const locMatch = params.locationIds.length === 0 || params.locationIds.includes(a.locationId);
    const deptMatch = params.departmentIds.length === 0 || (a.departmentId && params.departmentIds.includes(a.departmentId));
    return catMatch && locMatch && deptMatch;
  });

  const newTask: AuditTask = {
    id: `task_${Date.now()}`,
    name: params.name,
    startDate: new Date().toISOString(),
    status: 'active',
    scopeType: (params.categoryIds.length > 0 || params.locationIds.length > 0 || params.departmentIds.length > 0) ? 'partial' : 'all',
    targetCategoryIds: params.categoryIds,
    targetLocationIds: params.locationIds,
    targetDepartmentIds: params.departmentIds,
    auditorIds: params.auditorIds,
    reviewerId: params.reviewerId,
    totalCount: targetAssets.length
  };

  assetData.auditTasks = [newTask, ...(assetData.auditTasks || [])];
  saveDb(db);
  return newTask;
};

export const submitForReview = (taskId: string) => {
  const db = loadDb();
  const assetData = db.modules.assets as AssetsModuleSchema;
  const task = assetData.auditTasks.find(t => t.id === taskId);
  if (task) {
    task.status = 'reviewing';
    saveDb(db);
  }
};

export const rejectAudit = (taskId: string, reason: string) => {
  const db = loadDb();
  const assetData = db.modules.assets as AssetsModuleSchema;
  const task = assetData.auditTasks.find(t => t.id === taskId);
  if (task) {
    task.status = 'rejected';
    task.rejectReason = reason;
    saveDb(db);
  }
};

export const approveAudit = (taskId: string) => {
  const db = loadDb();
  const assetData = db.modules.assets as AssetsModuleSchema;
  const task = assetData.auditTasks.find(t => t.id === taskId);
  const records = (assetData.auditRecords || []).filter(r => r.taskId === taskId);

  if (task) {
    const normal = records.filter(r => r.result === 'normal').length;
    const missing = records.filter(r => r.result === 'missing').length;
    const damaged = records.filter(r => r.result === 'damaged').length;
    
    const reportData: AuditReportData = {
      total: task.totalCount,
      normal,
      missing,
      damaged,
      completionRate: Math.round((records.length / task.totalCount) * 100),
      integrityRate: Math.round((normal / task.totalCount) * 100)
    };

    task.status = 'closed';
    task.endDate = new Date().toISOString();
    task.reportData = reportData;
    saveDb(db);
  }
};

export const validateAssetScope = (taskId: string, asset: Asset): { valid: boolean; message?: string } => {
  const db = loadDb();
  const assetData = db.modules.assets as AssetsModuleSchema;
  const task = assetData.auditTasks.find(t => t.id === taskId);
  
  if (!task) return { valid: false, message: '任务不存在' };
  
  const catMatch = task.targetCategoryIds.length === 0 || task.targetCategoryIds.includes(asset.categoryId);
  const locMatch = task.targetLocationIds.length === 0 || task.targetLocationIds.includes(asset.locationId);
  const deptMatch = task.targetDepartmentIds.length === 0 || (asset.departmentId && task.targetDepartmentIds.includes(asset.departmentId));
  
  if (!catMatch) return { valid: false, message: '资产分类不在任务范围内' };
  if (!locMatch) return { valid: false, message: '资产地点不在任务范围内' };
  if (!deptMatch) return { valid: false, message: '资产部门不在任务范围内' };
  
  return { valid: true };
};

export const submitAuditRecord = (params: {
  taskId: string;
  assetCode: string;
  result: AuditResult;
  remark: string;
  photoUrl?: string;
}) => {
  const db = loadDb();
  const assetData = db.modules.assets as AssetsModuleSchema;
  const asset = assetData.assets.find(a => a.assetCode === params.assetCode);
  const user = getCurrentUser();

  if (!asset) throw new Error('资产编码无效');
  const scopeCheck = validateAssetScope(params.taskId, asset);
  if (!scopeCheck.valid) throw new Error(scopeCheck.message);

  const existing = (assetData.auditRecords || []).find(r => r.taskId === params.taskId && r.assetId === asset.id);
  const record: AuditRecord = {
    id: existing?.id || `rec_${Date.now()}`,
    taskId: params.taskId,
    assetId: asset.id,
    assetCode: asset.assetCode,
    result: params.result,
    operatorId: user?.id || 'unknown',
    timestamp: new Date().toISOString(),
    remark: params.remark,
    photoUrl: params.photoUrl
  };

  if (existing) {
    assetData.auditRecords = assetData.auditRecords.map(r => r.id === existing.id ? record : r);
  } else {
    assetData.auditRecords = [record, ...(assetData.auditRecords || [])];
  }

  saveDb(db);
  return record;
};

export const getAuditProgress = (taskId: string) => {
  const db = loadDb();
  const assetData = db.modules.assets as AssetsModuleSchema;
  const task = assetData.auditTasks.find(t => t.id === taskId);
  const records = (assetData.auditRecords || []).filter(r => r.taskId === taskId);
  
  const totalInTask = task?.totalCount || 0;
  return {
    total: totalInTask,
    audited: records.length,
    percentage: totalInTask > 0 ? Math.round((records.length / totalInTask) * 100) : 0,
    results: {
      normal: records.filter(r => r.result === 'normal').length,
      missing: records.filter(r => r.result === 'missing').length,
      damaged: records.filter(r => r.result === 'damaged').length,
    }
  };
};
