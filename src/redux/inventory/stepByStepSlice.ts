import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { GetCompanyResponse, GetPDVResponse } from 'src/interfaces/auth/userInterfaces';

export interface stepByStepState {
  activeStep: number;
  prevValuesCompany?: GetCompanyResponse;
  preValuesPDV?: GetPDVResponse;
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
    setPrevValuesCompany: (state: stepByStepState, { payload }: PayloadAction<GetCompanyResponse>) => {
      console.log('Setting previous values for company:', payload);
      state.prevValuesCompany = payload;
    },
    setPrevValuesPDV: (state: stepByStepState, { payload }: PayloadAction<GetPDVResponse>) => {
      state.preValuesPDV = payload;
    }
  }
});

// reducer
export default slice.reducer;

// actions
export const { setStep, setPrevValuesCompany, setPrevValuesPDV } = slice.actions;
