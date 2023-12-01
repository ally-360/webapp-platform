import * as Yup from 'yup';

export const LoginSchema = Yup.object().shape({
  email: Yup.string().required('Email is required').email('Email must be a valid email address'),
  password: Yup.string().required('Password is required')
});

export const RegisterSchema = Yup.object().shape({
  password: Yup.string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(16, 'La contraseña debe tener menos de 16 caracteres'),
  profile: Yup.object().shape({
    email: Yup.string().email('Ingrese un correo valido').required('Correo es requerido'),
    name: Yup.string()
      .min(3, 'Ingrese un nombre valido')
      .max(50, 'Ingrese un nombre valido')
      .required('Ingrese el nombre'),
    lastname: Yup.string()
      .min(3, 'Ingrese un apellido valido')
      .max(50, 'Ingrese un apellido más corto')
      .required('Ingrese el apellido'),
    personalPhoneNumber: Yup.string()
      .required('Ingrese un número de teléfono')
      .min(12, 'Ingrese un número de teléfono')
      .max(13, 'Ingrese un número de teléfono'),
    dni: Yup.string()
      .min(10, 'Ingrese un número de Cédula de ciudadanía')
      .max(10, 'Ingrese un número de Cédula de ciudadanía')
      .required('Ingrese un número de Cédula de ciudadanía'),
    photo: Yup.string()
  })
});

export const RegisterCompanySchema = Yup.object().shape({
  name: Yup.string()
    .min(3, 'Ingrese un nombre valido')
    .max(50, 'Ingrese un nombre valido')
    .required('Ingrese el nombre'),
  address: Yup.string()
    .min(3, 'Ingrese una dirección valida')
    .max(50, 'Ingrese una dirección valida')
    .required('Ingrese la dirección'),
  nit: Yup.string().required('Ingrese un número de NIT valido'),
  phoneNumber: Yup.string().required('Ingrese un número de teléfono valido'),
  quantityEmployees: Yup.string().required('Ingrese la cantidad de empleados'),
  economicActivity: Yup.string().required('Ingrese la actividad económica'),
  website: Yup.string().required('Ingrese el sitio web').min(3, 'Ingrese un sitio web valido')
});

export const RegisterPDVSchema = Yup.object().shape({
  name: Yup.string().required('Nombre requerido'),
  description: Yup.string().required('Descripción requerida'),
  departamento: Yup.object().required('Departamento requerido'),
  municipio: Yup.object().required('Ciudad requerida'),
  address: Yup.string().required('Dirección requerida'),
  phoneNumber: Yup.string().required('Teléfono requerido'),
  main: Yup.boolean().optional(),
  company: Yup.object().optional()
});
