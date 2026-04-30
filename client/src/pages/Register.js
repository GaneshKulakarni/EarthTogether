/**
 * Register.js
 *
 * The registration UI is now part of the unified Login/Auth page.
 * This component simply redirects /register to the Login page
 * which internally renders the "Register" tab when mounted at /register.
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  // The combined auth component (Login.js) handles /register via its tab logic.
  // We mount Login directly here by re-exporting it.
  const navigate = useNavigate();

  useEffect(() => {
    // Already at /register — Login.js will render the register tab automatically.
    // No redirect needed; App.js routes /register → Register → we render Login directly.
  }, [navigate]);

  // Dynamically render the Login component (which handles both tabs)
  const AuthPage = require('./Login').default;
  return <AuthPage />;
};

export default Register;
