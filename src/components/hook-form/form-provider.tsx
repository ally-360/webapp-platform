import { FormProvider as Form, UseFormReturn } from 'react-hook-form';
import React from 'react';
// ----------------------------------------------------------------------

interface FormProviderProps {
  children: React.ReactNode;
  onSubmit: (e?: React.BaseSyntheticEvent) => void;
  methods: UseFormReturn<any>;
}

export default function FormProvider({ children, onSubmit, methods }: FormProviderProps) {
  return (
    <Form {...methods}>
      <form onSubmit={onSubmit}>{children}</form>
    </Form>
  );
}
