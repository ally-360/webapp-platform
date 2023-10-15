/* eslint-disable class-methods-use-this */
import axios from 'axios';
import { configGetWithToken, configPostWithToken, configPatchWithToken, configDeleteWithToken } from '../configFetch';
import apiClient from '../axios';

class RequestService {
  fetchLoginUser = async ({ databody }) => apiClient(configPostWithToken('/auth/login', databody));

  fetchRegisterUser = async ({ databody }) => apiClient(configPostWithToken('/auth/register', databody));

  // Users

  fetchGetUserById = async ({ id }) => apiClient(configGetWithToken(`/user/${id}`));

  updateUser = async ({ id, databody }) => apiClient(configPatchWithToken(`/user/${id}`, databody));

  updateProfile = async ({ id, databody }) => apiClient(configPatchWithToken(`/profile/${id}`, databody));

  // Products

  getProducts = async () => apiClient(configGetWithToken('/product'));

  createProduct = async (databody) => apiClient(configPostWithToken('/product', databody));

  getProductById = async (id) => apiClient(configGetWithToken(`/product/${id}`));

  deleteProduct = async (id) => apiClient(configDeleteWithToken(`/product/${id}`));

  // Categories

  getCategories = async () => apiClient(configGetWithToken(`/category/?r=true`));

  createCategory = async (databody) => apiClient(configPostWithToken('/category', databody));

  deleteCategory = async (id) => apiClient(configDeleteWithToken(`/category/${id}`));

  editCategory = async ({ id, databody }) => apiClient(configPatchWithToken(`/category/${id}`, databody));

  getCategoryById = async (id) => apiClient(configGetWithToken(`/category/${id}?r=true`));

  // pdv

  getPDVS = async ({ r }) => apiClient(configGetWithToken(`/pdv?r=${r}`));

  createPDV = async (databody) => apiClient(configPostWithToken(`/pdv`, databody));

  getPDVById = async (id) => apiClient(configGetWithToken(`/pdv/${id}?r=true`));

  deletePDV = async (id) => apiClient(configDeleteWithToken(`/pdv/${id}`));

  editPDV = async ({ id, databody }) => apiClient(configPatchWithToken(`/pdv/${id}`, databody));

  // Brands

  getBrands = async ({ r }) => apiClient(configGetWithToken(`/brand?r=${r}`));

  createBrand = async (databody) => apiClient(configPostWithToken('/brand', databody));

  editBrand = async ({ id, databody }) => apiClient(configPatchWithToken(`/brand/${id}`, databody));

  deleteBrand = async ({ id }) => apiClient(configDeleteWithToken(`/brand/${id}`));

  // Companies

  getCompanies = async ({ r }) => apiClient(configGetWithToken('/company'));

  updateCompany = async ({ id, databody }) => apiClient(configPatchWithToken(`/company/${id}`, databody));

  createCompany = async ({ databody }) => apiClient(configPostWithToken('/company', databody));

  getCompanyById = async (id, r) => apiClient(configGetWithToken(`/company/${id}?r=true`));

  // TODO: retornar los pdvs de la compañia al filtrar por id
  // TODO: retornar la compañia al consultar el usuario

  // Location

  getLocations = async ({ r }) => apiClient(configGetWithToken(`/location?r=${r}`));

  // External API (deparments and cities)

  getDepartments = async () =>
    axios.get('https://www.datos.gov.co/resource/xdk5-pm3f.json?$select=distinct%20departamento');

  getCities = async ({ department }) =>
    axios.get(`https://www.datos.gov.co/resource/xdk5-pm3f.json?departamento=${department}`);

  // Contacts

  getContacts = async () => apiClient(configGetWithToken('/contacts'));

  createContact = async (databody) => apiClient(configPostWithToken('/contacts', databody));

  getContactById = async (id) => apiClient(configGetWithToken(`/contacts/${id}`));

  deleteContact = async (id) => apiClient(configDeleteWithToken(`/contacts/${id}`));

  updateContact = async ({ id, databody }) => apiClient(configPatchWithToken(`/contacts/${id}`, databody));
}

export default new RequestService();
