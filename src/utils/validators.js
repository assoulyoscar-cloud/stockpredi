/**
 * Validation functions for StockPredi forms
 */

// Email validation regex (RFC 5322 simplified)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation: min 8 chars, at least 1 uppercase, at least 1 digit
const validatePassword = (password) => {
  if (!password) return 'Mot de passe requis';
  if (password.length < 8) return 'Minimum 8 caractères';
  if (!/[A-Z]/.test(password)) return 'Au moins 1 majuscule';
  if (!/[0-9]/.test(password)) return 'Au moins 1 chiffre';
  return '';
};

// Email validation
const validateEmail = (email) => {
  if (!email) return 'Email requis';
  if (!EMAIL_REGEX.test(email)) return 'Email invalide';
  return '';
};

// Login form validation
export const validateLoginForm = (values) => {
  const errors = {};
  
  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;
  
  return errors;
};

// Signup form validation
export const validateSignupForm = (values) => {
  const errors = {};
  
  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = validatePassword(values.password);
  if (passwordError) errors.password = passwordError;
  
  if (!values.confirm) {
    errors.confirm = 'Confirmation requis';
  } else if (values.password !== values.confirm) {
    errors.confirm = 'Les mots de passe ne correspondent pas';
  }
  
  return errors;
};

// Contact form validation
export const validateContactForm = (values) => {
  const errors = {};
  
  if (!values.name || !values.name.trim()) {
    errors.name = 'Nom requis';
  }
  
  const emailError = validateEmail(values.email);
  if (emailError) errors.email = emailError;
  
  if (!values.subject) {
    errors.subject = 'Sujet requis';
  }
  
  if (!values.message || values.message.trim().length < 10) {
    errors.message = 'Message minimum 10 caractères';
  }
  
  return errors;
};
