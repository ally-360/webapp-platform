import { createSlice } from '@reduxjs/toolkit';
import { ContactInterface } from '../../interfaces/auth/userInterfaces';
import { getContacts as getContactsApi, createContact as createContactApi } from '../../api';

// constantes

interface ContactsState {
  contacts: ContactInterface[];
  contactsLoading: boolean;
  error: any;
  success: any;
  contactsEmpty: boolean;

  contactsPopup: boolean;

  // Contact detail
  contact: ContactInterface | null;
  contactLoading: boolean;
  contactError: any;
  contactSuccess: any;
}

const initialState: ContactsState = {
  contacts: [],
  contactsLoading: false,
  error: null,
  success: null,
  contactsEmpty: false,

  contactsPopup: false,

  // Contact detail
  contact: null,
  contactLoading: false,
  contactError: null,
  contactSuccess: null
};

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    startLoading(state) {
      state.contactsLoading = true;
    },
    hasError(state, action) {
      state.contactsLoading = false;
      state.error = action.payload;
      state.success = false;
      state.contactsEmpty = true;
    },
    getAllContactsSuccess(state, action) {
      state.contacts = action.payload || [];
      state.contactsLoading = false;
      state.error = null;
      state.success = true;
      state.contactsEmpty = (action.payload || []).length === 0;
    },
    getAllContactsError(state, action) {
      state.contacts = [];
      state.contactsLoading = false;
      state.error = action.payload;
      state.success = false;
      state.contactsEmpty = true;
    },
    deleteContactSuccess(state, action) {
      state.contacts = state.contacts.filter((contact) => contact.id !== action.payload);
      state.contactsLoading = false;
      state.error = null;
      state.success = true;
      state.contactsEmpty = false;
    },

    // Contact detail
    startLoadingContact(state) {
      state.contactLoading = true;
    },
    hasErrorContact(state, action) {
      state.contactLoading = false;
      state.contactError = action.payload;
      state.contactSuccess = false;
    },
    getContactByIdSuccess(state, action) {
      state.contact = action.payload;
      state.contactLoading = false;
      state.contactError = null;
      state.contactSuccess = true;
    },
    getContactByIdError(state, action) {
      state.contact = null;
      state.contactLoading = false;
      state.contactError = action.payload;
      state.contactSuccess = false;
    },
    updateContactSuccess(state, action) {
      state.contact = action.payload;
      state.contactLoading = false;
      state.contactError = null;
      state.contactSuccess = true;
    },
    updateContactError(state, action) {
      state.contactLoading = false;
      state.contactError = action.payload;
      state.contactSuccess = false;
    },
    createContactSuccess(state, action) {
      state.contact = action.payload;
      state.contactLoading = false;
      state.contactError = null;
      state.contactSuccess = true;
    },
    resetContact(state) {
      state.contact = null;
      state.contactLoading = false;
      state.contactError = null;
      state.contactSuccess = null;
    },
    togglePopup(state) {
      state.contactsPopup = !state.contactsPopup;
    }
  }
});

export default contactsSlice.reducer;

export const {
  startLoading,
  hasError,
  getAllContactsSuccess,
  getAllContactsError,
  deleteContactSuccess,
  startLoadingContact,
  hasErrorContact,
  getContactByIdSuccess,
  getContactByIdError,
  updateContactSuccess,
  updateContactError,
  createContactSuccess,
  resetContact,
  togglePopup
} = contactsSlice.actions;

// actions

export const getAllContacts = () => async (dispatch, getState) => {
  try {
    dispatch(startLoading());
    const { auth } = getState();
    const companyId = auth?.user?.companies?.[0]?.id;

    if (!companyId) {
      throw new Error('No company selected');
    }

    const response = await getContactsApi({ companyId });
    dispatch(getAllContactsSuccess(response.data.data || []));
  } catch (error) {
    dispatch(hasError(error.message || error));
  }
};

export const deleteContact = (_id) => async (dispatch) => {
  try {
    dispatch(startLoading());
    // Note: Delete functionality would need to be implemented in the API
    dispatch(getAllContacts());
  } catch (error) {
    dispatch(hasError(error.message || error));
  }
};

// Contact detail

export const getContactById = (_id) => async (dispatch) => {
  try {
    dispatch(startLoadingContact());
    // Note: This would need to be implemented to get contact by ID
    dispatch(getContactByIdSuccess(null));
  } catch (error) {
    dispatch(getContactByIdError(error.message || error));
  }
};

export const updateContact =
  ({ id: _id, databody: _databody }) =>
  async (dispatch) => {
    try {
      dispatch(startLoadingContact());
      // Note: Update functionality would need to be implemented in the API
      dispatch(getAllContacts());
    } catch (error) {
      dispatch(updateContactError(error.message || error));
    }
  };

export const createContact = (databody) => async (dispatch, getState) => {
  try {
    dispatch(startLoadingContact());
    const { auth } = getState();
    const companyId = auth?.user?.companies?.[0]?.id;

    if (!companyId) {
      throw new Error('No company selected');
    }

    const response = await createContactApi({ ...databody, companyId });
    dispatch(createContactSuccess(response.data));
    dispatch(getAllContacts());
  } catch (error) {
    dispatch(updateContactError(error.message || error));
  }
};
