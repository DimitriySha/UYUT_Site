import { ImageCarousel } from '../components/ImageCarousel';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Wifi, Wind, Tv, Utensils, Coffee, ShieldCheck, ChevronLeft, Calendar as CalendarIcon, Users, Ban, CheckCircle2, Heart, Info, ChevronRight } from 'lucide-react';
import { apartmentService, bookingService, favoriteService } from '../services/api';
import { Apartment } from '../types';
import { motion } from 'motion/react';
import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function ApartmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [apt, setApt] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Calendar display state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (id) {
      setLoading(true);
      apartmentService.getById(id)
        .then(setApt)
        .catch(console.error)
        .finally(() => setLoading(false));

      if (isAuthenticated && user) {
        favoriteService.check(user.id, id)
          .then(res => setIsFavorite(res.isFavorite))
          .catch(console.error);
      }
    }
  }, [id, isAuthenticated, user]);

  const [startDate, setStartDate] = useState(searchParams.get('start') || '');
  const [endDate, setEndDate] = useState(searchParams.get('end') || '');
  
  const getDatesInRange = (start: string, end: string) => {
    if (!start || !end) return [];
    try {
      const dates = [];
      let current = new Date(start);
      const last = new Date(end);
      if (current > last) return [];
      
      while (current <= last) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
      }
      return dates;
    } catch (e) {
      return [];
    }
  };

  const requestedDates = useMemo(() => getDatesInRange(startDate, endDate), [startDate, endDate]);
  
  const isAvailable = useMemo(() => {
    if (!apt || requestedDates.length === 0) return true;
    return !requestedDates.some(date => apt.bookedDates.includes(date));
  }, [apt, requestedDates]);

  const nightsCount = Math.max(0, requestedDates.length - 1);
  const serviceFee = 2500;
  const totalPrice = apt ? (apt.price * (nightsCount || 1)) + serviceFee : 0;

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isAvailable || !startDate || !endDate || !apt || !user) return;

    setBookingLoading(true);
    try {
      await bookingService.create({
        userId: user.id,
        apartmentId: apt.id,
        startDate,
        endDate,
        totalPrice
      });
      setBookingSuccess(true);
      setTimeout(() => navigate('/bookings'), 2000);
    } catch (error) {
      console.error(error);
      alert('Ошибка при бронировании');
    } finally {
      setBookingLoading(false);
    }
  };

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!id || !user) return;

    try {
      await favoriteService.toggle(user.id, id);
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!apt) return (
    <div className="h-[60vh] flex flex-col items-center justify-center space-y-4 text-center px-6">
      <Ban size={48} className="text-gray-300 mb-2" />
      <h2 className="text-2xl font-bold">Апартаменты не найдены</h2>
      <Link to="/" className="text-brand-start underline font-medium">Вернуться в каталог</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-6 pt-6 pb-20 space-y-12">
      {/* Navigation */}
      <nav className="flex items-center justify-between">
        <Link 
          to="/"
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ChevronLeft size={16} />
          Назад к результатам
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          {/* Photos */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-[16/8] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-indigo-100/30 relative"
          >
            <ImageCarousel images={apt.images} title={apt.title} className="w-full h-full" showControls={true} />
            <button 
              onClick={toggleFavorite}
              className={`absolute top-8 right-8 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 ${isFavorite ? 'bg-indigo-600 text-white' : 'bg-white/80 backdrop-blur-md text-gray-700'}`}
            >
              <Heart size={24} className={isFavorite ? 'fill-white' : ''} />
            </button>
          </motion.div>

          {/* Details */}
          <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <span className="bg-indigo-50 text-indigo-600 px-5 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-indigo-100">
                      {apt.type}
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-gray-700 bg-white px-4 py-1.5 rounded-full border border-gray-100 shadow-sm">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{apt.rating}</span>
                    </div>
                 </div>
                 <h1 className="text-5xl font-extrabold tracking-tight text-brand-dark">{apt.title}</h1>
                 <div className="flex items-center gap-2 text-gray-400 font-medium">
                    <MapPin size={18} className="text-indigo-600" />
                    <span>{apt.location}</span>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Кровати', value: apt.beds, icon: CalendarIcon },
                { label: 'Гостей', value: apt.maxGuests, icon: Users },
                { label: 'Ванные', value: apt.baths, icon: Utensils },
                { label: 'Площадь', value: `${apt.sqm} м²`, icon: TrendingUp },
              ].map((spec, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-2">
                   <p className="text-gray-400 text-[10px] font-extrabold uppercase tracking-widest">{spec.label}</p>
                   <p className="text-xl font-bold text-brand-dark">{spec.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-brand-dark">О жилье</h3>
              <p className="text-gray-600 leading-relaxed text-lg font-medium">
                {apt.description}
              </p>
            </div>

            {/* Calendar Widget */}
            <div className="space-y-8 pt-8">
               <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-brand-dark">Календарь занятости</h3>
                  <p className="text-sm text-gray-400 font-medium mt-1">Проверьте доступные даты перед бронированием</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentMonth(prev => addMonths(prev, -1))}
                    className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                  <button 
                    onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
                    className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    <ChevronRight size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-xl shadow-indigo-100/20 space-y-8">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xl font-extrabold text-brand-dark capitalize">
                    {format(currentMonth, 'LLLL yyyy', { locale: ru })}
                  </h4>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Занято</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-indigo-500" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ваш выбор</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-3">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                    <div key={day} className="text-[10px] font-bold text-center text-gray-300 uppercase tracking-widest py-2">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map((day, idx) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const isBooked = apt.bookedDates.includes(dateStr);
                    const isSelected = requestedDates.includes(dateStr);
                    const isPast = startOfDay(day) < startOfDay(new Date());

                    return (
                      <div 
                        key={idx}
                        className={`aspect-square flex items-center justify-center rounded-2xl text-sm font-bold transition-all relative group
                          ${isBooked ? 'bg-red-50 text-red-300 border border-red-100 cursor-not-allowed' : 
                            isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50' :
                            isPast ? 'text-gray-200' : 'bg-gray-50 text-gray-600 hover:bg-white hover:border-indigo-200 border border-transparent cursor-default px-2'}
                        `}
                      >
                        {format(day, 'd')}
                        {isBooked && (
                          <div className="absolute bottom-2 w-1 h-1 bg-red-300 rounded-full" />
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex items-start gap-4 bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-500 shrink-0 shadow-sm">
                    <Info size={20} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-indigo-900">Доступность в реальном времени</p>
                    <p className="text-xs text-indigo-700/70 font-medium leading-relaxed">
                      Квартира автоматически проверяется на коллизии. Вы сможете забронировать только полностью свободный период.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Sidebar (Booking Form) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white p-8 md:p-10 rounded-[3rem] border border-gray-100 shadow-2xl shadow-indigo-100/50 space-y-8">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Стоимость</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-brand-dark">{apt.price.toLocaleString()} ₸</span>
                <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">/ ночь</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Заезд</label>
                <div className="relative">
                   <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                   <input 
                    type="date" 
                    className="w-full bg-gray-50 p-4 pl-12 rounded-2xl outline-none border border-transparent focus:border-indigo-100 font-medium text-sm transition-all"
                    value={startDate}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Выезд</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                  <input 
                    type="date" 
                    className="w-full bg-gray-50 p-4 pl-12 rounded-2xl outline-none border border-transparent focus:border-indigo-100 font-medium text-sm transition-all"
                    value={endDate}
                    min={startDate || format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {startDate && endDate && (
              <div className="space-y-5 pt-6 border-t border-gray-50">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium text-gray-500">
                    <span>{apt.price.toLocaleString()} ₸ x {nightsCount} ночи</span>
                    <span className="text-brand-dark font-bold">{(apt.price * nightsCount).toLocaleString()} ₸</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-gray-500">
                    <span>Сервисный сбор</span>
                    <span className="text-brand-dark font-bold">{serviceFee.toLocaleString()} ₸</span>
                  </div>
                </div>

                {!isAvailable && (
                  <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 flex items-center justify-center gap-2">
                    <Ban size={14} /> Выбранные даты заняты
                  </div>
                )}

                <div className="pt-4 border-t border-dashed border-gray-100 flex justify-between items-center">
                  <span className="text-lg font-bold text-brand-dark">Итоговая сумма</span>
                  <span className="text-2xl font-extrabold text-indigo-600">{totalPrice.toLocaleString()} ₸</span>
                </div>
              </div>
            )}

            <button 
              onClick={handleBooking}
              disabled={!isAvailable || !startDate || !endDate || bookingLoading || bookingSuccess}
              className={`w-full py-5 rounded-[2rem] font-extrabold text-lg shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest ${
                bookingSuccess 
                  ? 'bg-green-500 text-white'
                  : !isAvailable || bookingLoading
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                    : 'gradient-bg text-white shadow-indigo-100 hover:scale-[1.02] active:scale-95'
              }`}
            >
              {bookingLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : bookingSuccess ? (
                <>
                  <CheckCircle2 size={24} />
                  Успешно!
                </>
              ) : !isAvailable ? 'ДАТЫ ЗАНЯТЫ' : 'ЗАБРОНИРОВАТЬ'}
            </button>

            <div className="text-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Безопасная оплата • AI Подбор
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Fixed missing icon import issues
function TrendingUp(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
