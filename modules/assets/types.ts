
export type AssetStatus = 'idle' | 'in_use' | 'maintenance' | 'scrapped';

export type AssetOperationType = 'assign' | 'return' | 'repair' | 'audit' | 'scrap' | 'import';

export interface AssetCodeRule {
  prefix: string;
  includeDate: boolean;
  dateFormat: 'YYYY' | 'YYYYMM';
  seqDigits: number;
  currentSeq: number;
  separator: string;
}

export interface AssetCategory {
  id: string;
  name: string;
  code: string;
  parentId?: string;
}

export interface AssetLocation {
  id: string;
  name: string;
  building: string;
  floor: string;
}

export interface AssetProvider {
  id: string;
  name: string;
  contact: string;
  phone: string;
}

export interface Department {
  id: string;
  name: string;
  managerId: string; // Linked to User ID
}

export interface AssetLog {
  id: string;
  assetId: string;
  type: AssetOperationType;
  operatorId: string;
  targetUserId?: string;
  timestamp: string;
  remark: string;
  photoUrl?: string;
}

export interface Asset {
  id: string;
  assetCode: string;
  name: string;
  model: string;
  price: number;
  purchaseDate: string;
  categoryId: string;
  locationId: string;
  departmentId?: string; // New: Department dimension
  status: AssetStatus;
  currentUserId?: string;
  spec?: string;
  provider?: string;
  image?: string;
  createdAt: string;
}

// --- Enhanced Audit (Inventory) Models ---

export type AuditTaskStatus = 'active' | 'reviewing' | 'rejected' | 'closed';
export type AuditResult = 'normal' | 'missing' | 'damaged';

export interface AuditReportData {
  total: number;
  normal: number;
  missing: number;
  damaged: number;
  completionRate: number;
  integrityRate: number;
}

export interface AuditTask {
  id: string;
  name: string;
  status: AuditTaskStatus;
  startDate: string;
  endDate?: string;
  
  // Scope Definition
  scopeType: 'all' | 'partial';
  targetCategoryIds: string[];
  targetLocationIds: string[];
  targetDepartmentIds: string[]; // New: Filter by Department
  
  // Workflow Roles
  auditorIds: string[]; // Workers
  reviewerId: string;    // Approval authority
  
  // Snapshot data
  totalCount: number;
  reportData?: AuditReportData; // Only populated when closed
  rejectReason?: string;
}

export interface AuditRecord {
  id: string;
  taskId: string;
  assetId: string;
  assetCode: string;
  result: AuditResult;
  operatorId: string;
  timestamp: string;
  remark: string;
  photoUrl?: string;
}

export interface AssetsModuleSchema {
  categories: AssetCategory[];
  locations: AssetLocation[];
  providers: AssetProvider[];
  departments: Department[]; // New: List of departments
  assets: Asset[];
  logs: AssetLog[];
  auditTasks: AuditTask[];
  auditRecords: AuditRecord[];
  codeRule: AssetCodeRule;
}
