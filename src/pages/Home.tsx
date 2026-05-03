import { Search as SearchIcon, MapPin, Calendar, Users, Star, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { apartmentService } from '../services/api';
import { Apartment } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { ImageCarousel } from '../components/ImageCarousel';

export default function Home() {
  const navigate = useNavigate();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apartmentService.getAll()
      .then(setApartments)
      .catch(err => {
        console.error('Failed to fetch apartments:', err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleGoToCatalog = () => {
    navigate('/listings');
  };

  const filteredApartments = apartments;

  if (isLoading && apartments.length === 0) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium">Загрузка уютных апартаментов...</p>
      </div>
    );
  }

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex flex-col items-center justify-center px-6 overflow-hidden bg-brand-dark">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=2000" 
            alt="Luxury Interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        
        <div className="text-center mb-8 max-w-4xl relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter leading-tight uppercase"
          >
            Найдите свой <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-100">уют</span> в Астане
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-200 text-xl font-medium mb-12 max-w-2xl mx-auto"
          >
            Премиальные апартаменты в лучших локациях столицы. Забронируйте свое идеальное жилье уже сегодня.
          </motion.p>
          
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={handleGoToCatalog}
            className="group px-12 py-5 gradient-bg text-white font-bold rounded-[2rem] hover:scale-105 active:scale-95 transition-all text-lg uppercase tracking-widest flex items-center gap-3 mx-auto shadow-2xl shadow-indigo-900/20"
          >
            Перейти к поиску
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </section>

      {/* Featured Apartments */}
      <section className="max-w-7xl mx-auto px-12 py-8 bg-[#f8fafc]">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-brand-dark">
              Рекомендуемое жилье
            </h2>
            <p className="text-gray-400 text-sm">
              Отобранные апартаменты в лучших районах столицы.
            </p>
          </div>
          <Link to="/listings" className="text-sm font-bold text-indigo-600 flex items-center gap-1 group">
            Смотреть все <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-flow-col auto-cols-max gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {filteredApartments.map((apt) => (
            <motion.div
              layout
              key={apt.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2.5rem] p-4 border border-gray-100 shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-50 min-w-[300px] max-w-[300px]"
            >
              <Link to={`/apartment/${apt.id}`} className="block relative">
                <ImageCarousel images={apt.images} title={apt.title} />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[11px] font-bold text-indigo-600 uppercase tracking-wider">{apt.type}</div>
                <div className="absolute bottom-6 left-6 text-white font-bold text-lg tracking-tight z-10">{apt.title}</div>
              </Link>
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
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">
                    <MapPin size={12} className="text-indigo-500" />
                    <span>{apt.location}</span>
                  </div>
                  <p className="text-[10px] text-indigo-400 uppercase tracking-wider font-extrabold flex items-center gap-2">
                    {apt.type} <span className="w-1 h-1 bg-gray-200 rounded-full" /> {apt.beds} Комн.
                  </p>
                </div>
              </motion.div>
          ))}
        </div>
      </section>

      {/* Advantages Section */}
      <section className="bg-gray-50 py-24 px-6 border-y border-gray-100 text-center">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
          {[
            { 
              title: 'Лучшие локации', 
              desc: 'Все апартаменты расположены в самых престижных и удобных районах Астаны.',
              icon: MapPin 
            },
            { 
              title: 'Современные удобства', 
              desc: 'Высокоскоростной Wi-Fi, полностью оборудованные кухни и премиальные аксессуары.',
              icon: ShieldCheck 
            },
            { 
              title: 'Легкое бронирование', 
              desc: 'Простой процесс бронирования с мгновенным подтверждением и поддержкой 24/7.',
              icon: Calendar 
            }
          ].map((adv, i) => (
            <div key={i} className="space-y-4 flex flex-col items-center">
              <div className="w-16 h-16 gradient-bg/10 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-50">
                <adv.icon size={32} />
              </div>
              <h3 className="text-xl font-bold text-brand-dark">{adv.title}</h3>
              <p className="text-gray-500 leading-relaxed max-w-xs">{adv.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
