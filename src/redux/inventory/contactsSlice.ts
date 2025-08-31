import { createSlice } from '@reduxjs/toolkit';
import { ContactInterface } from '../../interfaces/auth/userInterfaces';
import { getContacts as getContactsApi, createContact as createContactApi } from '../../api';

// constantes

interface ContactsState {
  contacts: ContactInterface[];
  contactsLoading: boolean;
  error: string | null;
  success: boolean | null;
  contactsEmpty: boolean;

  contactsPopup: boolean;

  // Contact detail
  contact: ContactInterface | null;
  contactLoading: boolean;
  contactError: string | null;
  contactSuccess: boolean | null;
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
      state.error = action.payload as string;
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
      state.error = action.payload as string;
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
      state.contactError = null;
      state.contactSuccess = null;
    },
    hasErrorContact(state, action) {
      state.contactLoading = false;
      state.contactError = action.payload as string;
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
      state.contactError = action.payload as string;
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
      state.contactError = action.payload as string;
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
    },
    openPopup(state) {
      state.contactsPopup = true;
    },
    closePopup(state) {
      state.contactsPopup = false;
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
  togglePopup,
  openPopup,
  closePopup
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
    const list = (response as any)?.data?.data ?? (response as any)?.data ?? response ?? [];
    dispatch(getAllContactsSuccess(list));
  } catch (error: any) {
    const message = error?.message ? String(error.message) : String(error);
    dispatch(hasError(message));
  }
};

export const deleteContact = (_id) => async (dispatch) => {
  try {
    dispatch(startLoading());
    // Note: Delete functionality would need to be implemented in the API
    dispatch(getAllContacts());
  } catch (error: any) {
    const message = error?.message ? String(error.message) : String(error);
    dispatch(hasError(message));
  }
};

// Contact detail

export const getContactById = (_id) => async (dispatch) => {
  try {
    dispatch(startLoadingContact());
    // Note: This would need to be implemented to get contact by ID
    dispatch(getContactByIdSuccess(null));
  } catch (error: any) {
    const message = error?.message ? String(error.message) : String(error);
    dispatch(getContactByIdError(message));
  }
};

export const updateContact =
  ({ id: _id, databody: _databody }) =>
  async (dispatch) => {
    try {
      dispatch(startLoadingContact());
      // Note: Update functionality would need to be implemented in the API
      dispatch(getAllContacts());
    } catch (error: any) {
      const message = error?.message ? String(error.message) : String(error);
      dispatch(updateContactError(message));
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
    const created = (response as any)?.data?.data ?? (response as any)?.data ?? response;
    dispatch(createContactSuccess(created));
    dispatch(getAllContacts());
    return created;
  } catch (error: any) {
    const message = error?.message ? String(error.message) : String(error);
    dispatch(updateContactError(message));
    return null;
  }
};
