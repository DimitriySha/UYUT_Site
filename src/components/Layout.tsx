import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Search, Calendar, MessageSquare, User, Phone, ShieldCheck, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: Home, label: 'Главная', path: '/' },
  { icon: Search, label: 'Каталог', path: '/listings' },
  { icon: Calendar, label: 'Бронирования', path: '/bookings' },
  { icon: Heart, label: 'Избранное', path: '/favorites' },
  { icon: MessageSquare, label: 'Сообщения', path: '/messages' },
  { icon: User, label: 'Профиль', path: '/profile' },
  { icon: ShieldCheck, label: 'Админ', path: '/admin' },
];

export default function Layout() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Navigation */}
      <header className="sticky top-0 z-50 px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center justify-between bg-glass px-6 py-3 rounded-full soft-shadow">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-brand-dark uppercase">Уют</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 text-sm font-semibold transition-colors uppercase tracking-wider ${
                  location.pathname === item.path ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/profile" className="flex items-center gap-3 bg-white px-5 py-2 rounded-full border border-gray-100 hover:border-indigo-200 transition-all font-bold text-sm text-brand-dark shadow-sm">
                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-[10px]">
                  {user?.name.charAt(0)}
                </div>
                {user?.name}
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm font-bold text-gray-700 bg-gray-50 px-5 py-2 rounded-full border border-gray-100 hover:bg-white transition-colors">
                  Войти
                </Link>
                <Link to="/register" className="gradient-bg text-white px-5 py-2 rounded-full text-sm font-bold shadow-md hover:shadow-indigo-100 transition-all">
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="h-16 px-12 flex items-center justify-between bg-white border-t border-gray-100 text-[11px] text-gray-400 font-medium mt-auto uppercase tracking-[0.2em]">
        <div className="flex gap-6">
          <span>&copy; 2024 АГЕНТСТВО УЮТ</span>
          <Link to="/terms" className="hover:text-indigo-600 transition-colors uppercase tracking-wider">Политика конфиденциальности</Link>
        </div>
        <div className="flex gap-4 items-center">
          <span className="w-2 h-2 bg-green-400 rounded-full"></span>
          <span>Система активна: Центр Астаны</span>
        </div>
      </footer>
    </div>
  );
}
