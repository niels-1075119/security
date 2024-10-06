import React, { useState } from 'react';
import BaseLayout from './base';
import '../static/css/auth.css';
import { useNavigate, useLocation } from 'react-router-dom';
import bcrypt from 'bcryptjs'; // Installeer bcrypt

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleToggle = () => {
    setIsLogin(!isLogin);
    setMessage('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!password) {
      setMessage('Password is required');
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds); // Hash het wachtwoord

    const url = isLogin
      ? 'http://localhost:5000/auth/login'
      : 'http://localhost:5000/insert_user';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: hashedPassword, // Stuur het gehashte wachtwoord door
        }),
      });

      const data = await response.json();

      if (response.status === 200 || response.status === 201) {
        setMessage(isLogin ? 'Login successful' : 'Account created successfully');
        if (isLogin) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('idUsers', data.idUsers);
          localStorage.setItem('name', data.name);

          const tokenParts = data.token.split('.');
          const payload = tokenParts[1];
          const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
          const payloadObject = JSON.parse(decodedPayload);

          const isAdmin = payloadObject.sub.isAdmin;

          if (isAdmin) {
            navigate('/teacher');
          } else {
            navigate('/user-dashboard');
          }
        } else {
          navigate('/login');
        }
      } else {
        setMessage(data.message || (isLogin ? 'Login failed' : 'Registration failed'));
      }
    } catch (error) {
      setMessage('An error occurred');
    }
  };

  const fromProtectedRoute = location.state?.from === 'protected';

  return (
    <BaseLayout title={isLogin ? 'Login' : 'Create an account'} showSidebar={false}>
      {message && <div className="error-bar">{message}</div>}
      {fromProtectedRoute && <div className="error-bar">You have to be logged in for this page</div>}
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md form-bg rounded-lg shadow">
          <div className="p-6 space-y-4">
            <h1 className="text-xl font-bold leading-tight pink-text">{isLogin ? 'Login' : 'Create an account'}</h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium form-text">Your email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="student@hr.nl"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium form-text">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button type="submit" className="w-full text-white bg-register-btn focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                {isLogin ? 'Login' : 'Create an account'}
              </button>
              <p className="text-sm font-light form-text">
                {isLogin ? 'No account?' : 'Already have an account?'}{' '}
                <a href="#" onClick={handleToggle} className="font-medium login-text pink-text">
                  {isLogin ? 'Create an account here' : 'Login here'}
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </BaseLayout>
  );
}

export default AuthPage;
