
import { loadDb, saveDb, getCurrentUser } from '../../../platform/core/db';
import { AssetsModuleSchema, AssetLog, AssetOperationType, AssetStatus } from '../types';

interface OperationParams {
  assetId: string;
  remark: string;
  photoUrl?: string;
  targetUserId?: string;
  locationId?: string;
}

const recordLog = (
  db: any, 
  assetId: string, 
  type: AssetOperationType, 
  remark: string, 
  targetUserId?: string, 
  photoUrl?: string
) => {
  const user = getCurrentUser();
  const assetData = db.modules.assets as AssetsModuleSchema;
  
  const newLog: AssetLog = {
    id: `alog_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    assetId,
    type,
    operatorId: user?.id || 'system',
    targetUserId,
    timestamp: new Date().toISOString(),
    remark,
    photoUrl
  };

  assetData.logs = [newLog, ...(assetData.logs || [])];
};

export const assignAsset = (params: OperationParams) => {
  const db = loadDb();
  const assetData = db.modules.assets as AssetsModuleSchema;
  const asset = assetData.assets.find(a => a.id === params.assetId);

  if (asset) {
    asset.status = 'in_use';
    asset.currentUserId = params.targetUserId;
    if (params.locationId) asset.locationId = params.locationId;
    
    recordLog(db, params.assetId, 'assign', params.remark, params.targetUserId, params.photoUrl);
    saveDb(db);
  }
};

export const returnAsset = (params: OperationParams) => {
  const db = loadDb();
  const assetData = db.modules.assets as AssetsModuleSchema;
  const asset = assetData.assets.find(a => a.id === params.assetId);

  if (asset) {
    asset.status = 'idle';
    asset.currentUserId = undefined;
    if (params.locationId) asset.locationId = params.locationId;

    recordLog(db, params.assetId, 'return', params.remark, undefined, params.photoUrl);
    saveDb(db);
  }
};

export const reportRepair = (params: OperationParams) => {
  const db = loadDb();
  const assetData = db.modules.assets as AssetsModuleSchema;
  const asset = assetData.assets.find(a => a.id === params.assetId);

  if (asset) {
    asset.status = 'maintenance';
    recordLog(db, params.assetId, 'repair', params.remark, undefined, params.photoUrl);
    saveDb(db);
  }
};

export const scrapAsset = (params: OperationParams) => {
  const db = loadDb();
  const assetData = db.modules.assets as AssetsModuleSchema;
  const asset = assetData.assets.find(a => a.id === params.assetId);

  if (asset) {
    asset.status = 'scrapped';
    asset.currentUserId = undefined;
    recordLog(db, params.assetId, 'scrap', params.remark, undefined, params.photoUrl);
    saveDb(db);
  }
};
