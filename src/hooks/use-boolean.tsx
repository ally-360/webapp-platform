import { useCallback, useState } from 'react';

// ----------------------------------------------------------------------
interface useBooleanInterface {
  value: boolean;
  onTrue: () => void;
  onFalse: () => void;
  onToggle: () => void;
  setValue: (value: boolean) => void;
}

export function useBoolean(defaultValue: boolean): useBooleanInterface {
  const [value, setValue] = useState(!!defaultValue);

  const onTrue = useCallback(() => {
    setValue(true);
  }, []);

  const onFalse = useCallback(() => {
    setValue(false);
  }, []);

  const onToggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return {
    value,
    onTrue,
    onFalse,
    onToggle,
    setValue
  };
}
