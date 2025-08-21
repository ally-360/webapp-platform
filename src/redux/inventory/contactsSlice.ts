import { createSlice } from '@reduxjs/toolkit';
import { MOCK_CONTACTS } from 'src/_mock/pos-products';
import { ContactInterface } from '../../interfaces/auth/userInterfaces';
// import RequestService from '../../axios/services/service';

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

export const getAllContacts = () => async (dispatch) => {
  try {
    dispatch(startLoading());
    // Usar datos mockeados temporalmente
    setTimeout(() => {
      dispatch(getAllContactsSuccess(MOCK_CONTACTS));
    }, 300);
  } catch (error) {
    dispatch(hasError(error));
  }
};

export const deleteContact = (id) => async (dispatch) => {
  try {
    dispatch(startLoading());
    // Simular eliminación exitosa
    dispatch(deleteContactSuccess(id));
  } catch (error) {
    dispatch(hasError(error));
  }
};

// Contact detail

export const getContactById = (id) => async (dispatch) => {
  try {
    dispatch(startLoadingContact());
    // Buscar contacto mockeado por ID
    const contact = MOCK_CONTACTS.find((c) => c.id === id);
    if (contact) {
      dispatch(getContactByIdSuccess(contact));
    } else {
      dispatch(getContactByIdError('Contact not found'));
    }
  } catch (error) {
    dispatch(getContactByIdError(error));
  }
};

export const updateContact =
  ({ id, databody }) =>
  async (dispatch) => {
    try {
      dispatch(startLoadingContact());
      // Simular actualización exitosa
      const updatedContact = { ...MOCK_CONTACTS.find((c) => c.id === id), ...databody };
      dispatch(updateContactSuccess(updatedContact));
    } catch (error) {
      dispatch(updateContactError(error));
    }
  };

export const createContact = (databody) => async (dispatch) => {
  try {
    dispatch(startLoadingContact());
    // Simular creación exitosa
    const newContact = { id: Date.now().toString(), ...databody };
    dispatch(createContactSuccess(newContact));
  } catch (error) {
    dispatch(updateContactError(error));
  }
};
