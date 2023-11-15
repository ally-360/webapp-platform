const { createSlice } = require('@reduxjs/toolkit');

const initialState = {
  user: {},
  company: {},
  profile: {},
  userLoading: false,
  error: null,
  success: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    startLoading(state) {
      state.userLoading = true;
    }
  }
});
