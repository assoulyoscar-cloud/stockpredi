import { useState } from 'react';

export function useFormValidation(initialValues, onSubmit, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setValues({
      ...values,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
    const newErrors = validate(values);
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate(values);
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  };
}
