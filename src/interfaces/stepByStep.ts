// ========================================
// 🎯 STEP BY STEP INTERFACES
// ========================================

// ========================================
// 📋 COMPANY INTERFACES
// ========================================

export interface CompanyFormData {
  name: string;
  description: string;
  address: string;
  phone_number: string;
  nit: string;
  economic_activity: string;
  quantity_employees: string;
  social_reason: string;
  logo?: string;
  uniquePDV: boolean;
}

export interface CompanyResponse {
  id: string;
  name: string;
  description: string;
  address: string;
  phone_number: string;
  nit: string;
  economic_activity: string;
  quantity_employees: string;
  social_reason: string;
  logo?: string;
  uniquePDV: boolean;
  created_at: string;
  updated_at: string;
}

// ========================================
// 📍 PDV INTERFACES
// ========================================

export interface Location {
  id: string;
  name: string;
}

export interface Departamento {
  id: string;
  name: string;
  towns: Location[];
}

export interface PDVFormData {
  name: string;
  description: string;
  address: string;
  phone_number: string;
  location: Location;
  main: boolean;
  company_id: string;
}

export interface PDVResponse {
  id: string;
  name: string;
  address: string;
  phone_number: string;
  location?: Location; // Legacy field for backward compatibility
  departamento?: Departamento; // Legacy field for backward compatibility
  department_id?: number; // New backend field
  city_id?: number; // New backend field
  main: boolean;
  company_id: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// 💳 PLAN INTERFACES
// ========================================

export interface PlanOption {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  recommended?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_transfer';
  name: string;
  last_four?: string;
  expires?: string;
}

export interface PlanFormData {
  plan_id: string;
  payment_method?: string | null;
  trial_days?: number | null;
  auto_renewal: boolean;
}

export interface SubscriptionResponse {
  id: string;
  plan: PlanOption;
  status: 'trial' | 'active' | 'cancelled' | 'expired';
  trial_ends_at?: string;
  current_period_start: string;
  current_period_end: string;
  auto_renewal: boolean;
}

// ========================================
// 🎯 STEP BY STEP STATE
// ========================================

export enum StepType {
  COMPANY = 0,
  PDV = 1,
  PLAN = 2,
  SUMMARY = 3
}

export interface StepByStepState {
  activeStep: number;
  completedSteps: number[];

  // Company data
  companyData?: CompanyFormData;
  companyResponse?: CompanyResponse;

  // PDV data (only when uniquePDV is false)
  pdvData?: PDVFormData;
  pdvResponse?: PDVResponse;

  // Plan data
  planData?: PlanFormData;
  subscriptionResponse?: SubscriptionResponse;

  // Loading states
  loading: {
    company: boolean;
    pdv: boolean;
    plan: boolean;
    summary: boolean;
  };

  // Error states
  errors: {
    company?: string;
    pdv?: string;
    plan?: string;
    summary?: string;
  };
}

// ========================================
// 🎬 ACTION TYPES
// ========================================

export interface SetStepAction {
  type: 'stepByStep/setStep';
  payload: number;
}

export interface SetCompanyDataAction {
  type: 'stepByStep/setCompanyData';
  payload: CompanyFormData;
}

export interface SetCompanyResponseAction {
  type: 'stepByStep/setCompanyResponse';
  payload: CompanyResponse;
}

export interface SetPDVDataAction {
  type: 'stepByStep/setPDVData';
  payload: PDVFormData;
}

export interface SetPDVResponseAction {
  type: 'stepByStep/setPDVResponse';
  payload: PDVResponse;
}

export interface SetPlanDataAction {
  type: 'stepByStep/setPlanData';
  payload: PlanFormData;
}

export interface SetSubscriptionResponseAction {
  type: 'stepByStep/setSubscriptionResponse';
  payload: SubscriptionResponse;
}

export interface SetLoadingAction {
  type: 'stepByStep/setLoading';
  payload: { step: keyof StepByStepState['loading']; loading: boolean };
}

export interface SetErrorAction {
  type: 'stepByStep/setError';
  payload: { step: keyof StepByStepState['errors']; error?: string };
}

export interface ResetStepByStepAction {
  type: 'stepByStep/reset';
}

export type StepByStepActions =
  | SetStepAction
  | SetCompanyDataAction
  | SetCompanyResponseAction
  | SetPDVDataAction
  | SetPDVResponseAction
  | SetPlanDataAction
  | SetSubscriptionResponseAction
  | SetLoadingAction
  | SetErrorAction
  | ResetStepByStepAction;

// ========================================
// 🔧 UTILITY TYPES
// ========================================

export type StepComponent = 'company' | 'pdv' | 'plan' | 'summary';

export interface StepConfig {
  key: StepComponent;
  label: string;
  optional?: boolean;
  description?: string;
}

export type StepValidation = (state: StepByStepState) => boolean;

export interface StepDefinition {
  config: StepConfig;
  validation: StepValidation;
}
