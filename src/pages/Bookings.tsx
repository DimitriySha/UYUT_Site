import { motion } from 'motion/react';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';
import { bookingService } from '../services/api';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Bookings() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    if (user) {
      bookingService.getByUserId(user.id)
        .then(setBookings)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user, isAuthenticated]);

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
          <Calendar size={40} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-gray-900">Войдите в аккаунт</h3>
          <p className="text-gray-500 max-w-sm mx-auto">Чтобы просматривать свои бронирования, необходимо авторизоваться.</p>
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
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-20 space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Ваши поездки</h1>
        <p className="text-gray-500 font-light">Управляйте своими предстоящими и прошлыми бронированиями.</p>
      </div>

      <div className="space-y-6">
        {bookings.length > 0 ? bookings.map((booking) => (
          <motion.div 
            key={booking.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="group bg-white p-6 rounded-[32px] soft-shadow border border-gray-100 flex flex-col md:flex-row gap-8 items-center"
          >
            <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0">
              <img src={booking.apt.images[0]} alt={booking.apt.title} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-grow space-y-4 w-full">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">{booking.apt.title}</h3>
                  <p className="text-sm text-gray-500 font-light">{booking.apt.location}</p>
                </div>
                <div className={`flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  booking.status === 'upcoming' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                }`}>
                  {booking.status === 'upcoming' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                  {booking.status === 'upcoming' ? 'Предстоящее' : 'Завершено'}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-gray-50">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Заезд</p>
                  <p className="text-sm font-semibold">{booking.startDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Выезд</p>
                  <p className="text-sm font-semibold">{booking.endDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Оплачено</p>
                  <p className="text-sm font-bold text-brand-start">{booking.totalPrice.toLocaleString()} ₸</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-2 w-full md:w-auto">
               <button className="px-6 py-3 bg-gray-50 text-gray-900 rounded-2xl text-sm font-bold hover:bg-gray-100 transition-colors w-full">
                Детали
               </button>
               {booking.status === 'completed' && (
                 <button className="px-6 py-3 gradient-bg text-white rounded-2xl text-sm font-bold hover:opacity-90 transition-opacity w-full">
                  Оставить отзыв
                 </button>
               )}
            </div>
          </motion.div>
        )) : (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-gray-100 border-dashed">
            <p className="text-gray-400 font-medium">У вас пока нет бронирований</p>
          </div>
        )}
      </div>
    </div>
  );
}
