import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from 'firebase/auth';
import { auth } from './config';

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Returns user info or error
 */
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: userCredential.user,
      message: 'Registration successful!'
    };
  } catch (error) {
    console.log("Signup error:", error.code, error.message);
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code)
    };
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Returns user info or error
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: userCredential.user,
      message: 'Login successful!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: getErrorMessage(error.code)
    };
  }
};

/**
 * Logout user
 * @returns {Promise}
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return {
      success: true,
      message: 'Logout successful!'
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error.code)
    };
  }
};

/**
 * Listen to authentication state changes
 * @param {function} callback - Callback function when state changes
 * @returns {function} Function to stop listening
 */
export const onAuthStateChangedListener = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password requirements
 * @param {string} password - Password to validate
 * @param {string} confirmPassword - Password confirmation (optional, for signup)
 * @returns {object} Validation result with details
 */
export const validatePassword = (password, confirmPassword = null) => {
  const result = {
    isValid: true,
    errors: [],
    requirements: {
      minLength: password.length >= 6,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumbers: /[0-9]/.test(password),
      passwordMatch: confirmPassword === null ? true : password === confirmPassword,
    }
  };

  // Check basic requirements
  if (password.length < 6) {
    result.isValid = false;
    result.errors.push('Password must be at least 6 characters');
  }

  if (confirmPassword !== null && password !== confirmPassword) {
    result.isValid = false;
    result.errors.push('Passwords do not match');
  }

  // Optional: Check for stronger password (recommended but not required)
  if (!result.requirements.hasUpperCase) {
    result.errors.push('Password should contain uppercase letter');
  }
  if (!result.requirements.hasLowerCase) {
    result.errors.push('Password should contain lowercase letter');
  }
  if (!result.requirements.hasNumbers) {
    result.errors.push('Password should contain number');
  }

  return result;
};

/**
 * Validate all inputs for signup
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} confirmPassword - Password confirmation
 * @returns {object} Validation result
 */
export const validateSignupInputs = (email, password, confirmPassword) => {
  const errors = [];

  // Validate email
  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else if (!validateEmail(email)) {
    errors.push('Invalid email format');
  }

  // Validate password
  if (!password || password.trim() === '') {
    errors.push('Password is required');
  } else {
    const passwordValidation = validatePassword(password, confirmPassword);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  if (!confirmPassword || confirmPassword.trim() === '') {
    errors.push('Password confirmation is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate all inputs for login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {object} Validation result
 */
export const validateLoginInputs = (email, password) => {
  const errors = [];

  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else if (!validateEmail(email)) {
    errors.push('Invalid email format');
  }

  if (!password || password.trim() === '') {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * @param {string} errorCode - Firebase error code
 * @returns {string} Error message
 */
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/invalid-email': 'Invalid email format',
    'auth/user-disabled': 'User account has been disabled',
    'auth/user-not-found': 'User does not exist',
    'auth/wrong-password': 'Incorrect password',
    'auth/email-already-in-use': 'Email already registered',
    'auth/weak-password': 'Password is too weak (at least 6 characters)',
    'auth/operation-not-allowed': 'Registration is disabled',
    'auth/invalid-credential': 'Invalid email or password',
  };
  
  return errorMessages[errorCode] || 'Operation failed, please try again';
};
