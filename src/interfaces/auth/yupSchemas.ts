import { string, object, ref } from 'yup';
import * as yup from 'yup';
import { t } from 'i18next';

export const LoginSchema = object().shape({
  email: string()
    .email('Ingrese un correo valido')
    .required('Email is required')
    .email('Email must be a valid email address'),
  password: string().required('Contraseña es requerida')
});

export const RegisterSchema = object().shape({
  email: string()
    .email('Ingrese un correo válido')
    .required('Correo es requerido')
    .test('email-domain', 'El correo debe tener un dominio válido (.com, .co, .net, etc.)', (value) => {
      if (!value) return false;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      return emailRegex.test(value);
    }),
  password: string()
    .required('La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(50, 'La contraseña debe tener menos de 50 caracteres')
    .test('password-strength', 'La contraseña debe contener al menos una letra y un número', (value) => {
      if (!value) return false;
      const hasLetter = /[a-zA-Z]/.test(value);
      const hasNumber = /\d/.test(value);
      return hasLetter && hasNumber;
    }),
  profile: object().shape({
    lastname: string()
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(50, 'El apellido debe tener menos de 50 caracteres')
      .required('El apellido es requerido')
      .test('lastname-format', 'El apellido solo debe contener letras y espacios', (value) => {
        if (!value) return false;
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        return nameRegex.test(value);
      }),
    name: string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(50, 'El nombre debe tener menos de 50 caracteres')
      .required('El nombre es requerido')
      .test('name-format', 'El nombre solo debe contener letras y espacios', (value) => {
        if (!value) return false;
        const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        return nameRegex.test(value);
      }),
    personalPhoneNumber: string()
      .required('El número de teléfono es requerido')
      .test(
        'phone-format',
        'Usa un número correcto. Formato válido: +573XXXXXXXXX (móvil) o +571XXXXXXX (fijo)',
        (value) => {
          if (!value) return false;
          // Remove spaces and normalize
          const cleanPhone = value.replace(/\s+/g, '');

          // Colombian phone patterns
          // Mobile: +573XXXXXXXXX or 3XXXXXXXXX (10 digits starting with 3)
          // Landline: +571XXXXXXX or 1XXXXXXX (8 digits starting with 1)
          const mobileRegex = /^(\+57)?3\d{9}$/;
          const landlineRegex = /^(\+57)?[124567]\d{7}$/;

          return mobileRegex.test(cleanPhone) || landlineRegex.test(cleanPhone);
        }
      ),
    dni: string()
      .required('La cédula de ciudadanía es requerida')
      .test('dni-format', 'Ingresa una cédula válida (entre 6 y 10 dígitos)', (value) => {
        if (!value) return false;
        // Colombian ID (cédula) validation: 6-10 digits, no leading zeros for short numbers
        const dniRegex = /^\d{6,10}$/;
        const isValidLength = dniRegex.test(value);

        if (!isValidLength) return false;

        // Additional validation: should not be all zeros or sequential numbers
        const allZeros = /^0+$/.test(value);
        const sequential = /^(0123456789|1234567890|9876543210)/.test(value);

        return !allZeros && !sequential;
      }),
    photo: string().nullable()
  })
});

export const RegisterCompanySchema = object().shape({
  name: string().min(1, 'Ingrese un nombre valido').required('Ingrese el nombre'),
  description: string().required('Ingrese una descripción'),
  address: string().min(3, 'Ingrese una dirección valida').required('Ingrese la dirección'),
  phone_number: string()
    .required('Ingrese un número de teléfono')
    .test(
      'phone-format',
      'Número de teléfono inválido. Use formato colombiano: +573XXXXXXXXX (móvil) o +571XXXXXXX (fijo)',
      (value) => {
        if (!value) return false;
        // Regex para formato colombiano con o sin +57
        const phoneRegex = /^(\+57)?[13]\d{9}$/;
        return phoneRegex.test(value.replace(/\s+/g, ''));
      }
    ),
  nit: string()
    .required('Ingrese un número de NIT valido')
    .test('nit-format', 'NIT inválido. Debe ser un NIT colombiano válido de 8-9 dígitos', (value) => {
      if (!value) return false;
      // Regex para NIT colombiano (8-9 dígitos, no puede empezar con 0)
      const nitRegex = /^[1-9]\d{7,8}$/;
      return nitRegex.test(value);
    }),
  economic_activity: string().required('Seleccione la actividad económica'),
  quantity_employees: string().required('Seleccione la cantidad de empleados'),
  social_reason: string().required('Ingrese la razón social'),
  logo: string().nullable(),
  uniquePDV: yup.boolean().default(false)
});

export const RegisterPDVSchema = object().shape({
  name: yup.string().required('Nombre requerido'),
  departamento: yup.object().nullable().default(null).required('Departamento requerido'),
  municipio: yup.object().nullable().default(null).required('Ciudad requerida'),
  address: yup.string().required('Dirección requerida'),
  phone_number: yup.string().required('Teléfono requerido'),
  main: yup.boolean().default(true),
  company_id: yup.string().required('ID de empresa requerido')
});

export const PlanSelectionSchema = object().shape({
  plan_id: yup.string().required('Selecciona un plan'),
  billing_cycle: yup.string().oneOf(['monthly', 'yearly'], 'Ciclo de facturación inválido').default('monthly'),
  auto_renew: yup.boolean().default(true),
  start_date: yup.string().optional(),
  end_date: yup.string().optional(),
  trial_end_date: yup.string().optional(),
  amount: yup.number().optional().min(0, 'El monto debe ser positivo'),
  currency: yup.string().default('COP'),
  notes: yup.string().optional()
});

export const ChangePassWordSchema = object().shape({
  oldPassword: string().required(t('Old Password is required')),
  newPassword: string()
    .required(t('New Password is required'))
    .min(6, t('Password must be at least 6 characters'))
    .test('no-match', t('New password must be different'), (value, { parent }) => value !== parent.oldPassword),
  confirmNewPassword: string().oneOf([ref('newPassword')], t('Passwords must match'))
});

// Company Form Schema specifically for CompanyFormData interface
export const CompanyFormSchema = object().shape({
  name: string().min(1, 'Ingrese un nombre valido').required('Ingrese el nombre'),
  description: string().required('Ingrese una descripción'),
  address: string().min(3, 'Ingrese una dirección valida').required('Ingrese la dirección'),
  phone_number: string()
    .required('Ingrese un número de teléfono')
    .test(
      'phone-format',
      'Número de teléfono inválido. Use formato colombiano: +573XXXXXXXXX (móvil) o +571XXXXXXX (fijo)',
      (value) => {
        if (!value) return false;
        // Regex para formato colombiano con o sin +57
        const phoneRegex = /^(\+57)?[13]\d{9}$/;
        return phoneRegex.test(value.replace(/\s+/g, ''));
      }
    ),
  nit: string()
    .required('Ingrese un número de NIT valido')
    .test('nit-format', 'NIT inválido. Debe ser un NIT colombiano válido de 8-9 dígitos', (value) => {
      if (!value) return false;
      // Regex para NIT colombiano (8-9 dígitos, no puede empezar con 0)
      const nitRegex = /^[1-9]\d{7,8}$/;
      return nitRegex.test(value);
    }),
  economic_activity: string().required('Seleccione la actividad económica'),
  quantity_employees: string().required('Seleccione la cantidad de empleados'),
  social_reason: string().required('Ingrese la razón social'),
  logo: string().optional(),
  uniquePDV: yup.boolean().default(false)
});
