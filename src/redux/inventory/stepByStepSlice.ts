import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { getCompanyResponse, getPDVResponse } from 'src/auth/interfaces/userInterfaces';

export interface stepByStepState {
  activeStep: number;
  prevValuesCompany?: getCompanyResponse;
  preValuesPDV?: getPDVResponse;
}

const initialState: stepByStepState = {
  activeStep: 0,
  prevValuesCompany: undefined,
  preValuesPDV: undefined
};

const slice = createSlice({
  name: 'stepByStep',
  initialState,
  reducers: {
    setStep: (state: stepByStepState, { payload }: PayloadAction<number>) => {
      state.activeStep = payload;
    },
    setPrevValuesCompany: (state: stepByStepState, { payload }: PayloadAction<getCompanyResponse>) => {
      state.prevValuesCompany = payload;
    },
    setPrevValuesPDV: (state: stepByStepState, { payload }: PayloadAction<getPDVResponse>) => {
      state.preValuesPDV = payload;
    }
  }
});

// reducer
export default slice.reducer;

// actions
export const { setStep, setPrevValuesCompany, setPrevValuesPDV } = slice.actions;
