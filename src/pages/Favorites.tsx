import { Heart, Star, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { favoriteService } from '../services/api';
import { Apartment } from '../types';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Favorites() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [favoriteApts, setFavoriteApts] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    if (user) {
      favoriteService.getByUserId(user.id)
        .then(setFavoriteApts)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, isAuthenticated]);

  const handleRemove = async (e: React.MouseEvent, aptId: string) => {
    e.preventDefault();
    if (user) {
      try {
        await favoriteService.toggle(user.id, aptId);
        setFavoriteApts(prev => prev.filter(a => a.id !== aptId));
      } catch (error) {
        console.error(error);
      }
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
          <Heart size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">Войдите в аккаунт</h3>
          <p className="text-gray-500 max-w-sm mx-auto">Чтобы сохранять апартаменты в избранное, необходимо авторизоваться.</p>
        </div>
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
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 space-y-12">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold text-brand-dark tracking-tight">Избранное</h1>
        <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Ваши сохраненные варианты для поездок</p>
      </div>

      {favoriteApts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {favoriteApts.map((apt) => (
            <motion.div
              layout
              key={apt.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2.5rem] p-4 border border-gray-100 shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-50 group"
            >
              <Link to={`/apartment/${apt.id}`} className="block">
                <div className="h-64 w-full rounded-[1.8rem] mb-6 overflow-hidden relative shadow-inner">
                  <img src={apt.images[0]} alt={apt.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <button 
                    onClick={(e) => handleRemove(e, apt.id)}
                    className="absolute top-4 right-4 bg-white p-2 rounded-full text-red-500 shadow-lg hover:scale-110 active:scale-95 transition-transform"
                  >
                    <Heart size={18} fill="currentColor" />
                  </button>
                  <div className="absolute bottom-6 left-6 text-white font-bold text-lg tracking-tight">{apt.title}</div>
                </div>
                <div className="px-3 pb-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-brand-dark">
                      {apt.price.toLocaleString()}₸<span className="text-xs text-gray-400 font-normal ml-1">/ночь</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold text-gray-700">{apt.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    {apt.type} • {apt.beds} Комн. • {apt.location}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-6">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
            <Heart size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900">Список пока пуст</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Сохраняйте понравившиеся апартаменты, чтобы вернуться к ним позже.</p>
          </div>
          <Link 
            to="/listings"
            className="inline-flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-widest text-sm hover:gap-3 transition-all"
          >
            В каталог <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
