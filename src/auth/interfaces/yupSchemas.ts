import * as Yup from 'yup';

export const LoginSchema = Yup.object().shape({
  email: Yup.string().required('Email is required').email('Email must be a valid email address'),
  password: Yup.string().required('Password is required')
});

export const RegisterSchema = Yup.object().shape({
  password: Yup.string().required('La contraseña es requerida'),
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
    personalPhoneNumber: Yup.string(),
    dni: Yup.string()
      .min(10, 'Ingrese un número de Cédula de ciudadanía')
      .max(10, 'Ingrese un número de Cédula de ciudadanía')
      .required('Ingrese un número de Cédula de ciudadanía'),
    photo: Yup.string()
  })
});
