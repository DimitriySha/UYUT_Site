import { User, Mail, LogOut, ChevronRight, Edit2, Check, X, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React, { useState, useEffect } from 'react';
import { authService, bookingService } from '../services/api';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateUser, isAuthenticated } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      bookingService.getByUserId(user.id).then(setBookings).catch(console.error);
    }
  }, [isAuthenticated, user]);

  const totalBookings = bookings.length;
  const totalExpenses = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const updatedUser = await authService.updateProfile({
        id: user.id,
        name,
        email,
        password: password || undefined
      });
      updateUser(updatedUser);
      setSuccess(true);
      setIsEditing(false);
      setPassword('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-6">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
           <User size={40} />
        </div>
        <h2 className="text-2xl font-bold text-gray-400">Пожалуйста, войдите в аккаунт</h2>
        <button 
          onClick={() => navigate('/login')}
          className="gradient-bg text-white px-8 py-3 rounded-full font-bold shadow-lg"
        >
          Войти
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-20 space-y-12">
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-[3rem] shadow-xl shadow-indigo-100/50 border border-indigo-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />
        
        <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-brand-start flex items-center justify-center text-white text-4xl font-extrabold shadow-lg uppercase relative group">
          {user?.name.charAt(0)}
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center text-indigo-600 hover:scale-110 transition-transform active:scale-95"
          >
            {isEditing ? <X size={18} /> : <Edit2 size={18} />}
          </button>
        </div>
        
        <div className="flex-grow space-y-4">
          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.div 
                key="view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div>
                  <h1 className="text-3xl font-extrabold text-brand-dark tracking-tight">{user?.name}</h1>
                  <p className="text-gray-400 font-medium flex items-center gap-2">
                    <Mail size={14} className="text-indigo-400" />
                    {user?.email}
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-indigo-100 italic">
                    Верифицирован
                  </span>
                  {success && (
                    <motion.span 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      className="bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100 flex items-center gap-2"
                    >
                      <Check size={12} /> Профиль обновлен
                    </motion.span>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.form 
                key="edit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleUpdate}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Имя</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-gray-50 p-3 rounded-2xl border border-gray-100 text-sm font-bold text-brand-dark outline-none focus:border-indigo-200" 
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-gray-50 p-3 rounded-2xl border border-gray-100 text-sm font-bold text-brand-dark outline-none focus:border-indigo-200" 
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Новый пароль (оставьте пустым чтобы не менять)</label>
                  <div className="flex gap-4">
                    <input 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="flex-grow bg-gray-50 p-3 rounded-2xl border border-gray-100 text-sm font-bold text-brand-dark outline-none focus:border-indigo-200" 
                    />
                    <button 
                      type="submit"
                      disabled={loading}
                      className="gradient-bg text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-lg hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      {loading ? '...' : 'Сохранить'}
                    </button>
                  </div>
                  {error && <p className="text-[10px] text-red-500 font-bold mt-1 ml-1">{error}</p>}
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Statistics & History */}
        <div className="space-y-10">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-50 soft-shadow space-y-8">
            <h3 className="text-xl font-bold font-sans">Моя активность</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Всего броней</p>
                <p className="text-3xl font-bold text-brand-dark">{totalBookings}</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Всего затрат</p>
                <p className="text-3xl font-bold text-indigo-600">{totalExpenses.toLocaleString()} ₸</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3rem] border border-gray-50 soft-shadow space-y-6">
            <h3 className="text-xl font-bold font-sans">История бронирований</h3>
            {bookings.length === 0 ? (
                <p className="text-gray-400">У вас пока нет бронирований.</p>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking: any) => (
                        <div key={booking.id} className="p-4 border border-gray-100 rounded-2xl flex items-center gap-4">
                            <div className="font-bold text-sm tracking-tight text-brand-dark">{booking.apt.title}</div>
                            <div className="text-xs text-gray-400">{booking.startDate} - {booking.endDate}</div>
                            <div className="font-bold text-sm text-indigo-600 ml-auto">{booking.totalPrice.toLocaleString()} ₸</div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          {[
            { icon: MessageSquare, label: 'Сообщения', desc: 'Общение с администратором', path: '/messages' },
          ].map((item, i) => (
            <button key={i} onClick={() => item.path && navigate(item.path)} className="w-full group bg-white hover:bg-gray-50 p-6 rounded-[2rem] border border-gray-50 transition-all flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-indigo-600 group-hover:scale-110 transition-all shadow-sm border border-gray-50">
                  <item.icon size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-brand-dark text-sm">{item.label}</p>
                  <p className="text-xs text-gray-400 font-medium">{item.desc}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-200 group-hover:text-indigo-400 transition-colors" />
            </button>
          ))}
          
          <button 
            onClick={handleLogout}
            className="w-full p-6 text-red-400 hover:text-red-500 font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut size={16} />
            Выйти из аккаунта
          </button>
        </div>
      </div>
    </div>
  );
}
