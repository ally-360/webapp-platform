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
  email: string().email('Ingrese un correo valido').required('Correo es requerido'),
  password: string()
    .required('La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres') // Backend requiere min 8
    .max(50, 'La contraseña debe tener menos de 50 caracteres'),
  profile: object().shape({
    lastname: string()
      .min(2, 'Ingrese un apellido valido') // Backend requiere min 2
      .max(50, 'Ingrese un apellido más corto')
      .required('Ingrese el apellido'),
    name: string()
      .min(2, 'Ingrese un nombre valido') // Backend requiere min 2
      .max(50, 'Ingrese un nombre valido')
      .required('Ingrese el nombre'),
    personalPhoneNumber: string().nullable().max(20, 'Número de teléfono muy largo'), // Backend permite hasta 20 chars
    dni: string().nullable().max(20, 'Número de identificación muy largo'), // Backend permite hasta 20 chars
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
