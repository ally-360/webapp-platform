import { string, object, boolean, ref } from 'yup';
import { t } from 'i18next';

export const LoginSchema = object().shape({
  email: string()
    .email('Ingrese un correo valido')
    .required('Email is required')
    .email('Email must be a valid email address'),
  password: string().required('Contraseña es requerida')
});

export const RegisterSchema = object().shape({
  email: string().email('Ingrese un correo valido').required('Correo es requerido'),
  password: string()
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(16, 'La contraseña debe tener menos de 16 caracteres'),
  profile: object().shape({
    lastname: string()
      .min(3, 'Ingrese un apellido valido')
      .max(50, 'Ingrese un apellido más corto')
      .required('Ingrese el apellido'),
    name: string().min(3, 'Ingrese un nombre valido').max(50, 'Ingrese un nombre valido').required('Ingrese el nombre'),
    personalPhoneNumber: string()
      .required('Ingrese un número de teléfono')
      .min(12, 'Ingrese un número de teléfono')
      .max(13, 'Ingrese un número de teléfono'),
    dni: string()
      .min(10, 'Ingrese un número de Cédula de ciudadanía')
      .max(10, 'Ingrese un número de Cédula de ciudadanía')
      .required('Ingrese un número de Cédula de ciudadanía'),
    photo: string()
  })
});

export const RegisterCompanySchema = object().shape({
  name: string().min(3, 'Ingrese un nombre valido').max(50, 'Ingrese un nombre valido').required('Ingrese el nombre'),
  address: string()
    .min(3, 'Ingrese una dirección valida')
    .max(50, 'Ingrese una dirección valida')
    .required('Ingrese la dirección'),
  nit: string().required('Ingrese un número de NIT valido'),
  phoneNumber: string().required('Ingrese un número de teléfono valido'),
  quantityEmployees: string().required('Ingrese la cantidad de empleados'),
  economicActivity: string().required('Ingrese la actividad económica'),
  website: string().required('Ingrese el sitio web').min(3, 'Ingrese un sitio web valido')
});

export const RegisterPDVSchema = object().shape({
  name: string().required('Nombre requerido'),
  description: string().required('Descripción requerida'),
  departamento: object().required('Departamento requerido'),
  municipio: object().required('Ciudad requerida'),
  address: string().required('Dirección requerida'),
  phoneNumber: string().required('Teléfono requerido'),
  main: boolean().optional(),
  company: object().optional()
});

export const ChangePassWordSchema = object().shape({
  oldPassword: string().required(t('Old Password is required')),
  newPassword: string()
    .required(t('New Password is required'))
    .min(6, t('Password must be at least 6 characters'))
    .test('no-match', t('New password must be different'), (value, { parent }) => value !== parent.oldPassword),
  confirmNewPassword: string().oneOf([ref('newPassword')], t('Passwords must match'))
});
