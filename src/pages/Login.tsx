import { Lock, Mail, ChevronLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login: setAuthUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Ошибка входа');
      }

      setAuthUser(data);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#f8fafc] relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50 space-y-10 relative z-10"
      >
        <div className="space-y-4 text-center">
          <Link to="/" className="inline-block mb-4">
            <span className="text-3xl font-black tracking-tighter text-brand-dark uppercase">Уют</span>
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight">Вход</h1>
          <p className="text-gray-400 font-medium text-sm">Введите свои данные для доступа к личному кабинету.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                  <div className="flex items-center gap-4 bg-white p-5 rounded-[24px] border border-gray-100 focus-within:ring-1 ring-indigo-500/20 transition-all soft-shadow">
                    <Mail size={18} className="text-gray-300" />
                    <input 
                      required
                      type="email" 
                      placeholder="name@example.com" 
                      className="bg-transparent outline-none text-sm font-medium w-full"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
              </div>
              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Пароль</label>
                  <div className="flex items-center gap-4 bg-white p-5 rounded-[24px] border border-gray-100 focus-within:ring-1 ring-indigo-500/20 transition-all soft-shadow">
                    <Lock size={18} className="text-gray-300" />
                    <input 
                      required
                      type="password" 
                      placeholder="••••••••" 
                      className="bg-transparent outline-none text-sm font-medium w-full"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" className="accent-indigo-600" />
                 <span className="text-xs text-gray-500 font-medium font-sans">Запомнить меня</span>
              </label>
              <button type="button" className="text-xs text-indigo-600 font-bold uppercase tracking-widest">Забыли пароль?</button>
            </div>

            <button type="submit" className="w-full gradient-bg text-white py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-indigo-100/10 hover:opacity-95 transition-all uppercase tracking-widest">
              Войти
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Нет аккаунта? {' '}
            <Link to="/register" className="text-indigo-600 font-bold">Зарегистрируйтесь бесплатно</Link>
          </p>

          <Link to="/" className="flex items-center justify-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-900 transition-colors pt-12">
            <ChevronLeft size={16} />
            Вернуться на главную
          </Link>
        </motion.div>
    </div>
  );
}
