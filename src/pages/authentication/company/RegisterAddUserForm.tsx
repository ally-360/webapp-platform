import React from 'react';
import * as Yup from 'yup';
import { Form, FormikProvider, useFormik } from 'formik';
import { useSnackbar } from 'notistack5';
import { Stack, TextField } from '@mui/material';

export default function RegisterAddUserForm() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const RegisterAddUserSchema = Yup.object().shape({
    name: Yup.string().required('Nombre requerido'),
    lastName: Yup.string().required('Apellido requerido'),
    email: Yup.string().email('Ingrese un correo valido').required('Correo es requerido')
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      lastName: '',
      email: ''
    },
    validationSchema: RegisterAddUserSchema,
    onSubmit: async (values, { setErrors, setSubmitting }) => {
      try {
        // await register(values.email, values.password, values.firstName, values.lastName, values.dni, values.tel);
        enqueueSnackbar('Registro del usuario completado', {
          variant: 'success'
        });

        setSubmitting(false);
      } catch (error) {
        console.error(error);

        setErrors({ afterSubmit: error.message });
        setSubmitting(false);
      }
    }
  });

  const { errors, touched, handleSubmit, getFieldProps, isSubmitting } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={formik.handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            label="Nombre"
            {...getFieldProps('name')}
            error={Boolean(touched.name && errors.name)}
            helperText={touched.name && errors.name}
          />
          <TextField
            fullWidth
            label="Apellido"
            {...getFieldProps('lastName')}
            error={Boolean(touched.lastName && errors.lastName)}
            helperText={touched.lastName && errors.lastName}
          />
          <TextField
            fullWidth
            type="email"
            label="Correo"
            {...getFieldProps('email')}
            error={Boolean(touched.email && errors.email)}
            helperText={touched.email && errors.email}
          />
        </Stack>
      </Form>
    </FormikProvider>
  );
}
