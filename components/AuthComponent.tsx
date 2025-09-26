import React, { useState } from 'react';
import { SpinnerIcon } from './IconComponents';
import type { RegistrationData } from '../types';

interface AuthProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (data: RegistrationData) => Promise<void>;
  isLoading: boolean;
  authError: string | null;
  t: (key: string) => string;
}

const AuthComponent: React.FC<AuthProps> = ({ onLogin, onRegister, isLoading, authError, t }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [school, setSchool] = useState('');
  const [industry, setIndustry] = useState('');
  const [phone, setPhone] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  const validateForm = () => {
    if (!email || !password) {
      setFormError(t('auth_error_empty'));
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError(t('auth_error_invalid_email'));
      return false;
    }
    if (password.length < 6) {
      setFormError(t('auth_error_password_length'));
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (isLoginView) {
      onLogin(email, password);
    } else {
      onRegister({ email, password, company, school, industry, phone });
    }
  };
  
  const renderInput = (id: string, value: string, onChange: (val: string) => void, labelKey: string, type = "text", autoComplete = "") => (
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 peer"
          placeholder=" "
          autoComplete={autoComplete || id}
        />
        <label htmlFor={id} className="absolute left-4 top-3 text-gray-400 transition-all duration-300 pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-400">
          {t(labelKey)}
        </label>
      </div>
  );


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-gray-900 to-purple-900 animate-[gradient_15s_ease_infinite]" style={{backgroundSize: '400% 400%'}}></div>
        <style>{`
            @keyframes gradient {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
        `}</style>
      <div className="relative w-full max-w-md p-8 space-y-4 bg-gray-800 bg-opacity-80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-y-auto max-h-[95vh]">
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">MazyLab</h1>
          <p className="text-gray-400 mt-2">{isLoginView ? t('auth_login_title') : t('auth_register_title')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderInput("email", email, setEmail, 'auth_email', 'email')}
          {renderInput("password", password, setPassword, 'auth_password', 'password', isLoginView ? "current-password" : "new-password")}

          {!isLoginView && (
            <>
              {renderInput("company", company, setCompany, 'auth_company')}
              {renderInput("school", school, setSchool, 'auth_school')}
              {renderInput("industry", industry, setIndustry, 'auth_industry')}
              {renderInput("phone", phone, setPhone, 'auth_phone', 'tel')}
            </>
          )}
          
          {(formError || authError) && (
            <p className="text-sm text-red-400 text-center">{formError || authError}</p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-500 disabled:opacity-70 transition-colors"
            >
              {isLoading ? <SpinnerIcon className="h-6 w-6 animate-spin" /> : (isLoginView ? t('auth_login_cta') : t('auth_register_cta'))}
            </button>
          </div>
        </form>
        <p className="text-sm text-center text-gray-400">
          {isLoginView ? t('auth_no_account') : t('auth_has_account')}{' '}
          <button onClick={() => { setIsLoginView(!isLoginView); setFormError(null); }} className="font-medium text-blue-400 hover:text-blue-300">
            {isLoginView ? t('auth_register_now') : t('auth_login_now')}
          </button>
        </p>
         <footer className="text-center text-gray-500 text-xs pt-4 border-t border-gray-700 mt-4">
          <p>mazy media studio 2025 copyright</p>
        </footer>
      </div>
    </div>
  );
};

export default AuthComponent;