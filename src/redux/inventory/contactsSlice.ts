import { createSlice } from '@reduxjs/toolkit';
import { ContactInterface } from '../../interfaces/auth/userInterfaces';
import RequestService from '../../axios/services/service';

// constantes

interface ContactsState {
  contacts: ContactInterface[];
  contactsLoading: boolean;
  error: any;
  success: any;
  contactsEmpty: boolean;

  contacsPopup: boolean;

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

  contacsPopup: false,

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
      state.contacts = action.payload;
      state.contactsLoading = false;
      state.error = null;
      state.success = true;
      state.contactsEmpty = action.payload.length === 0;
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
      state.contacsPopup = !state.contacsPopup;
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

export const getAllContacts = () => async (dispatch) => {
  try {
    dispatch(startLoading());
    const response = await RequestService.getContacts();
    dispatch(getAllContactsSuccess(response.data.data));
  } catch (error) {
    dispatch(hasError(error));
  }
};

export const deleteContact = (id) => async (dispatch) => {
  try {
    dispatch(startLoading());
    await RequestService.deleteContact(id);
    dispatch(deleteContactSuccess(id));
  } catch (error) {
    dispatch(hasError(error));
  }
};

// Contact detail

export const getContactById = (id) => async (dispatch) => {
  try {
    dispatch(startLoadingContact());
    const response = await RequestService.getContactById(id);
    dispatch(getContactByIdSuccess(response.data));
  } catch (error) {
    dispatch(getContactByIdError(error));
  }
};

export const updateContact =
  ({ id, databody }) =>
  async (dispatch) => {
    try {
      dispatch(startLoadingContact());
      const response = await RequestService.updateContact({ id, databody });
      dispatch(updateContactSuccess(response.data));
    } catch (error) {
      dispatch(updateContactError(error));
    }
  };

export const createContact = (databody) => async (dispatch) => {
  try {
    dispatch(startLoadingContact());
    const response = await RequestService.createContact(databody);
    dispatch(createContactSuccess(response.data));
  } catch (error) {
    dispatch(updateContactError(error));
  }
};
