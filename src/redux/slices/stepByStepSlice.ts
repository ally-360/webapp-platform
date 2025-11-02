// ========================================
// 🎯 STEP BY STEP SLICE - Refactored
// ========================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  StepByStepState,
  CompanyFormData,
  CompanyResponse,
  PDVFormData,
  PDVResponse,
  PlanFormData,
  SubscriptionResponse,
  StepType
} from 'src/interfaces/stepByStep';

// ========================================
// PERSISTENCE HELPERS
// ========================================

const STEP_BY_STEP_STORAGE_KEY = 'ally360-step-by-step';

const loadFromLocalStorage = (): Partial<StepByStepState> | null => {
  try {
    const savedState = localStorage.getItem(STEP_BY_STEP_STORAGE_KEY);
    if (savedState) {
      return JSON.parse(savedState);
    }
  } catch (error) {
    console.warn('❌ Error loading step-by-step state from localStorage:', error);
  }
  return null;
};

const saveToLocalStorage = (state: StepByStepState) => {
  try {
    const stateToSave = {
      activeStep: state.activeStep,
      completedSteps: state.completedSteps,
      companyData: state.companyData,
      companyResponse: state.companyResponse,
      pdvData: state.pdvData,
      pdvResponse: state.pdvResponse,
      planData: state.planData,
      subscriptionResponse: state.subscriptionResponse
    };
    localStorage.setItem(STEP_BY_STEP_STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.warn('❌ Error saving step-by-step state to localStorage:', error);
  }
};

// ========================================
// INITIAL STATE
// ========================================

const defaultInitialState: StepByStepState = {
  activeStep: StepType.COMPANY,
  completedSteps: [],

  companyData: undefined,
  companyResponse: undefined,

  pdvData: undefined,
  pdvResponse: undefined,

  planData: undefined,
  subscriptionResponse: undefined,

  loading: {
    company: false,
    pdv: false,
    plan: false,
    summary: false
  },

  errors: {
    company: undefined,
    pdv: undefined,
    plan: undefined,
    summary: undefined
  }
};

const savedState = loadFromLocalStorage();
const initialState: StepByStepState = savedState
  ? {
      ...defaultInitialState,
      ...savedState,
      loading: defaultInitialState.loading,
      errors: defaultInitialState.errors
    }
  : defaultInitialState;

// ========================================
// SLICE
// ========================================

const stepByStepSlice = createSlice({
  name: 'stepByStep',
  initialState,
  reducers: {
    // ========================================
    // NAVIGATION ACTIONS
    // ========================================

    setStep: (state, action: PayloadAction<number>) => {
      state.activeStep = action.payload;
      saveToLocalStorage(state);
    },

    setCompletedStep: (state, action: PayloadAction<number>) => {
      if (!state.completedSteps.includes(action.payload)) {
        state.completedSteps.push(action.payload);
      }
      saveToLocalStorage(state);
    },

    // ========================================
    // COMPANY ACTIONS
    // ========================================

    setCompanyData: (state, action: PayloadAction<CompanyFormData>) => {
      state.companyData = action.payload;
      saveToLocalStorage(state);
    },

    setCompanyResponse: (state, action: PayloadAction<CompanyResponse>) => {
      state.companyResponse = action.payload;
      if (!state.completedSteps.includes(StepType.COMPANY)) {
        state.completedSteps.push(StepType.COMPANY);
      }
      saveToLocalStorage(state);
    },

    // ========================================
    // PDV ACTIONS
    // ========================================

    setPDVData: (state, action: PayloadAction<PDVFormData>) => {
      state.pdvData = action.payload;
      saveToLocalStorage(state);
    },

    setPDVResponse: (state, action: PayloadAction<PDVResponse>) => {
      state.pdvResponse = action.payload;
      if (!state.completedSteps.includes(StepType.PDV)) {
        state.completedSteps.push(StepType.PDV);
      }
      saveToLocalStorage(state);
    },

    // ========================================
    // PLAN ACTIONS
    // ========================================

    setPlanData: (state, action: PayloadAction<PlanFormData>) => {
      state.planData = action.payload;
      saveToLocalStorage(state);
    },

    setSubscriptionResponse: (state, action: PayloadAction<SubscriptionResponse>) => {
      state.subscriptionResponse = action.payload;
      if (!state.completedSteps.includes(StepType.PLAN)) {
        state.completedSteps.push(StepType.PLAN);
      }
      saveToLocalStorage(state);
    },

    // ========================================
    // LOADING ACTIONS
    // ========================================

    setLoading: (state, action: PayloadAction<{ step: keyof StepByStepState['loading']; loading: boolean }>) => {
      const { step, loading } = action.payload;
      state.loading[step] = loading;
    },

    // ========================================
    // ERROR ACTIONS
    // ========================================

    setError: (state, action: PayloadAction<{ step: keyof StepByStepState['errors']; error?: string }>) => {
      const { step, error } = action.payload;
      state.errors[step] = error;
    },

    clearError: (state, action: PayloadAction<keyof StepByStepState['errors']>) => {
      state.errors[action.payload] = undefined;
    },

    clearAllErrors: (state) => {
      state.errors = {
        company: undefined,
        pdv: undefined,
        plan: undefined,
        summary: undefined
      };
    },

    // ========================================
    // RESET ACTIONS
    // ========================================

    resetStep: (state, action: PayloadAction<number>) => {
      const step = action.payload;

      if (step >= StepType.COMPANY) {
        state.companyData = undefined;
        state.companyResponse = undefined;
        state.completedSteps = state.completedSteps.filter((s) => s !== StepType.COMPANY);
      }

      if (step >= StepType.PDV) {
        state.pdvData = undefined;
        state.pdvResponse = undefined;
        state.completedSteps = state.completedSteps.filter((s) => s !== StepType.PDV);
      }

      if (step >= StepType.PLAN) {
        state.planData = undefined;
        state.subscriptionResponse = undefined;
        state.completedSteps = state.completedSteps.filter((s) => s !== StepType.PLAN);
      }

      state.activeStep = step;
      state.errors = initialState.errors;
      saveToLocalStorage(state);
    },

    resetAll: () => {
      localStorage.removeItem(STEP_BY_STEP_STORAGE_KEY);
      return initialState;
    },

    // ========================================
    // NAVIGATION HELPERS
    // ========================================

    goToNextStep: (state) => {
      const currentStep = state.activeStep;
      const isUniquePDV = state.companyResponse?.uniquePDV;

      if (isUniquePDV) {
        switch (currentStep) {
          case 0:
            state.activeStep = 1;
            break;
          case 1:
            state.activeStep = 2;
            break;
          default:
            break;
        }
      } else {
        switch (currentStep) {
          case StepType.COMPANY:
            state.activeStep = StepType.PDV;
            break;
          case StepType.PDV:
            state.activeStep = StepType.PLAN;
            break;
          case StepType.PLAN:
            state.activeStep = StepType.SUMMARY;
            break;
          default:
            break;
        }
      }
      saveToLocalStorage(state);
    },

    goToPreviousStep: (state) => {
      const currentStep = state.activeStep;
      const isUniquePDV = state.companyResponse?.uniquePDV;
      console.log('🔄 goToPreviousStep called from step:', currentStep, 'isUniquePDV:', isUniquePDV);

      if (isUniquePDV) {
        switch (currentStep) {
          case 1:
            state.activeStep = 0;
            break;
          case 2:
            state.activeStep = 1;
            break;
          default:
            break;
        }
      } else {
        switch (currentStep) {
          case StepType.PDV:
            state.activeStep = StepType.COMPANY;
            break;
          case StepType.PLAN:
            state.activeStep = StepType.PDV;
            break;
          case StepType.SUMMARY:
            state.activeStep = StepType.PLAN;
            break;
          default:
            break;
        }
      }
      saveToLocalStorage(state);
    },

    // ========================================
    // ONBOARDING COMPLETION
    // ========================================

    completeOnboarding: (state) => {
      state.completedSteps = [StepType.COMPANY, StepType.PDV, StepType.PLAN, StepType.SUMMARY];
      state.activeStep = StepType.SUMMARY;
      saveToLocalStorage(state);
    }
  }
});

// ========================================
// EXPORTS
// ========================================

export const {
  // Navigation
  setStep,
  setCompletedStep,
  goToNextStep,
  goToPreviousStep,

  // Company
  setCompanyData,
  setCompanyResponse,

  // PDV
  setPDVData,
  setPDVResponse,

  // Plan
  setPlanData,
  setSubscriptionResponse,

  // Loading & Errors
  setLoading,
  setError,
  clearError,
  clearAllErrors,

  // Reset
  resetStep,
  resetAll,

  // Onboarding
  completeOnboarding
} = stepByStepSlice.actions;

export default stepByStepSlice.reducer;

// ========================================
// SELECTORS
// ========================================

export const selectActiveStep = (state: { stepByStep: StepByStepState }) => state.stepByStep.activeStep;
export const selectCompletedSteps = (state: { stepByStep: StepByStepState }) => state.stepByStep.completedSteps;
export const selectCompanyData = (state: { stepByStep: StepByStepState }) => state.stepByStep.companyData;
export const selectCompanyResponse = (state: { stepByStep: StepByStepState }) => state.stepByStep.companyResponse;
export const selectPDVData = (state: { stepByStep: StepByStepState }) => state.stepByStep.pdvData;
export const selectPDVResponse = (state: { stepByStep: StepByStepState }) => state.stepByStep.pdvResponse;
export const selectPlanData = (state: { stepByStep: StepByStepState }) => state.stepByStep.planData;
export const selectSubscriptionResponse = (state: { stepByStep: StepByStepState }) =>
  state.stepByStep.subscriptionResponse;

export const selectLoading = (state: { stepByStep: StepByStepState }) => state.stepByStep.loading;

export const selectErrors = (state: { stepByStep: StepByStepState }) => state.stepByStep.errors;

export const selectIsUniquePDV = (state: { stepByStep: StepByStepState }) =>
  state.stepByStep.companyResponse?.uniquePDV;
