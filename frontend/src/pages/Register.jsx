import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { Card } from '../components/UI/Card';

export const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, login } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.name) tempErrors.name = 'Name is required';
    
    if (!formData.email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else {
      if (formData.password.length < 8) {
        tempErrors.password = 'Password must be at least 8 characters';
      }
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(formData.password)) {
        tempErrors.password = 'Password must include uppercase, lowercase, number, and special character';
      }
    }

    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
    if (globalError) setGlobalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setGlobalError('');

    try {
      // Register user
      await register(formData.name, formData.email, formData.password);
      // Auto login user after registration
      await login(formData.email, formData.password);
      navigate('/'); // Go home
    } catch (err) {
      if (Array.isArray(err)) {
        // Handle array of details returned from Zod validation middleware
        setGlobalError(err.join(' | '));
      } else {
        setGlobalError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      {/* Decorative gradient blur background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />

      <Card className="w-full max-w-md relative z-10 p-8 shadow-2xl border border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-md shadow-brand-500/30 mb-3">
            F
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-sans">Create Account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Start tracking your wealth today</p>
        </div>

        {globalError && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium">
            {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            id="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            disabled={isLoading}
          />

          <Input
            label="Email Address"
            id="email"
            type="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={isLoading}
          />

          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            disabled={isLoading}
          />

          <Input
            label="Confirm Password"
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            disabled={isLoading}
          />

          <Button
            type="submit"
            className="w-full mt-2"
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6 font-sans">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-brand-500 hover:text-brand-600 transition-colors"
          >
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  );
};
export default Register;
