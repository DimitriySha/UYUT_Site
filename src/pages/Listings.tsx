import { useState, useEffect } from 'react';
import { Filter, Star, Search as SearchIcon, X, Calendar, Users, Ban, CheckCircle2, Map as MapIcon, Grid } from 'lucide-react';
import { apartmentService } from '../services/api';
import { Apartment } from '../types';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Listings() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    apartmentService.getAll()
      .then(setApartments)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Local state for search fields (synced with URL params)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [guests, setGuests] = useState(() => {
    const val = parseInt(searchParams.get('guests') || '1');
    return isNaN(val) ? 1 : val;
  });
  const [startDate, setStartDate] = useState(searchParams.get('start') || '');
  const [endDate, setEndDate] = useState(searchParams.get('end') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');

  // Derived values from search params for filtering
  const guestsParam = (() => {
    const val = parseInt(searchParams.get('guests') || '1');
    return isNaN(val) ? 1 : val;
  })();
  const minPriceParam = (() => {
    const val = parseInt(searchParams.get('minPrice') || '0');
    return isNaN(val) ? 0 : val;
  })();
  const maxPriceParam = (() => {
    const val = parseInt(searchParams.get('maxPrice') || '9999999');
    return isNaN(val) ? 9999999 : val;
  })();
  const startParam = searchParams.get('start') || '';
  const endParam = searchParams.get('end') || '';
  const qParam = searchParams.get('q') || '';
  
  const [filter, setFilter] = useState('Все');
  
  const categories = ['Все', 'Studio', '1-Bedroom', '2-Bedroom', 'Luxury'];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('q', searchQuery);
    if (guests > 1) params.append('guests', guests.toString());
    if (startDate) params.append('start', startDate);
    if (endDate) params.append('end', endDate);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    setSearchParams(params);
  };

  const getDatesInRange = (startDate: string, endDate: string) => {
    const dates = [];
    let current = new Date(startDate);
    const last = new Date(endDate);
    while (current <= last) {
      dates.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const isAvailable = (apt: any) => {
    if (!startParam || !endParam) return true;
    const requestedDates = getDatesInRange(startParam, endParam);
    return !requestedDates.some(date => apt.bookedDates.includes(date));
  };

  const filteredApts = apartments.filter(a => {
    const matchesFilter = filter === 'Все' || a.type === filter;
    const matchesSearch = !qParam || 
                          a.title.toLowerCase().includes(qParam.toLowerCase()) || 
                          a.location.toLowerCase().includes(qParam.toLowerCase());
    const matchesGuests = a.maxGuests >= guestsParam;
    const matchesMinPrice = a.price >= minPriceParam;
    const matchesMaxPrice = a.price <= maxPriceParam;
    
    return matchesFilter && matchesSearch && matchesGuests && matchesMinPrice && matchesMaxPrice;
  });

  // Sort: available ones first
  const sortedApts = [...filteredApts].sort((a, b) => {
    const aAvail = isAvailable(a);
    const bAvail = isAvailable(b);
    if (aAvail === bAvail) return 0;
    return aAvail ? -1 : 1;
  });

  const clearSearch = () => {
    setSearchQuery('');
    setGuests(1);
    setStartDate('');
    setEndDate('');
    setMinPrice('');
    setMaxPrice('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 space-y-12">
      {/* Search Engine Area */}
      <div className="w-full bg-white p-6 rounded-[2.5rem] shadow-xl shadow-indigo-100/30 border border-indigo-50 flex flex-col lg:flex-row items-center gap-6">
        <div className="flex-[1.5] w-full px-2">
          <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Местоположение</label>
          <div className="flex items-center gap-2">
            <SearchIcon size={14} className="text-indigo-400" />
            <input 
              type="text" 
              placeholder="Где в Астане?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm font-semibold outline-none text-brand-dark bg-transparent"
            />
          </div>
        </div>

        <div className="flex-1 lg:border-l border-gray-100 w-full px-4">
          <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Даты</label>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              className="text-xs font-semibold text-brand-dark outline-none bg-transparent cursor-pointer"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-gray-300">—</span>
            <input 
              type="date" 
              className="text-xs font-semibold text-brand-dark outline-none bg-transparent cursor-pointer"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 lg:border-l border-gray-100 w-full px-4">
          <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Гости</label>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-indigo-400" />
            <input 
              type="number" 
              min="1"
              max="10"
              className="w-12 text-sm font-semibold text-brand-dark outline-none bg-transparent"
              value={guests}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setGuests(isNaN(val) ? 1 : val);
              }}
            />
            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">чел.</span>
          </div>
        </div>

        <div className="flex-1 lg:border-l border-gray-100 w-full px-4">
          <label className="block text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Цена (₸)</label>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              placeholder="От"
              className="w-full text-sm font-semibold text-brand-dark outline-none bg-transparent"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <span className="text-gray-300">—</span>
            <input 
              type="number" 
              placeholder="До"
              className="w-full text-sm font-semibold text-brand-dark outline-none bg-transparent"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        <button 
          onClick={handleSearch}
          className="h-14 px-10 gradient-bg text-white font-bold rounded-2xl shadow-lg hover:opacity-90 transition-all w-full lg:w-auto uppercase tracking-widest text-xs"
        >
          Применить
        </button>
      </div>

      {/* Header & Filter */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pt-4">
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-extrabold text-brand-dark tracking-tight">Каталог жилья</h1>
            <div className="flex flex-wrap gap-3 mt-2">
              <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Найдено: {sortedApts.length}</p>
              {qParam && (
                <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Поиск: {qParam}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* View Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-gray-400'}`}
              title="Сетка"
            >
              <Grid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-indigo-600 font-bold' : 'text-gray-400'}`}
              title="Карта"
            >
              <MapIcon size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap max-w-[300px] sm:max-w-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  filter === cat 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-gray-400 hover:text-indigo-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-40 space-y-4"
          >
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-gray-400 font-medium">Поиск лучших вариантов...</p>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div 
            key="grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          >
            {sortedApts.length > 0 ? (
              sortedApts.map((apt) => {
            const available = isAvailable(apt);
            return (
              <Link 
                key={apt.id} 
                to={`/apartment/${apt.id}${window.location.search}`} 
                className={`bg-white rounded-[2.5rem] p-4 border border-gray-100 shadow-sm transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-50 relative overflow-hidden ${!available ? 'opacity-75 grayscale-[0.3]' : ''}`}
              >
                {!available && (
                  <div className="absolute top-6 left-6 z-10 bg-red-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                    <Ban size={12} /> Занято на эти даты
                  </div>
                )}
                {available && startParam && (
                  <div className="absolute top-6 left-6 z-10 bg-green-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                    <CheckCircle2 size={12} /> Свободно
                  </div>
                )}
                
                <div className="h-64 w-full rounded-[1.8rem] mb-6 overflow-hidden relative shadow-inner">
                  <img src={apt.images[0]} alt={apt.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                    {apt.type}
                  </div>
                  <div className="absolute bottom-6 left-6 text-white font-bold text-lg tracking-tight">{apt.title}</div>
                </div>
                
                <div className="px-3 pb-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-brand-dark">
                      {apt.price.toLocaleString()}₸<span className="text-xs text-gray-400 font-normal ml-1">/ночь</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-bold text-gray-700">{apt.rating}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      <MapIcon size={12} className="text-indigo-500" />
                      <span>{apt.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-extrabold flex items-center gap-2">
                        <span>{apt.beds} Прод.</span>
                        <span className="w-1 h-1 bg-gray-200 rounded-full" />
                        <span>{apt.maxGuests} Гостей</span>
                        <span className="w-1 h-1 bg-gray-200 rounded-full" />
                        <span>{apt.sqm} м²</span>
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center space-y-4">
            <div className="text-gray-200 flex justify-center">
              <SearchIcon size={80} strokeWidth={1.5} />
            </div>
            <p className="text-gray-500 font-medium text-lg">Ничего не найдено</p>
            <button 
              onClick={clearSearch}
              className="text-indigo-600 font-bold uppercase tracking-widest text-sm"
            >
              Сбросить поиск
            </button>
          </div>
        )}
          </motion.div>
        ) : (
          <motion.div 
            key="map"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="w-full h-[650px] bg-gray-50 rounded-[3rem] border border-gray-100 relative overflow-hidden flex items-center justify-center p-6 shadow-inner"
          >
            {/* Visual simulation of a map */}
            <div className="absolute inset-0 opacity-40">
              <div className="w-full h-full bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]" />
            </div>
            
            <div className="relative z-10 text-center space-y-8 bg-white/60 backdrop-blur-xl p-10 rounded-[3rem] border border-white shadow-2xl max-w-lg">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-2xl text-indigo-600">
                <MapIcon size={40} className="animate-pulse" />
              </div>
              <div className="space-y-4">
                <h3 className="font-extrabold text-brand-dark text-3xl tracking-tight">Карта Астаны</h3>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                  Интерактивный поиск на карте находится в разработке. Скоро вы сможете выбирать жилье по районам: Есильский, Алматы, Байконур и Сарыарка.
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
              </div>
            </div>

            {/* Simulated price tags on map */}
            {sortedApts.slice(0, 6).map((apt, i) => (
              <motion.div 
                key={apt.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="absolute shadow-2xl transition-all hover:scale-110 cursor-pointer z-20"
                style={{ 
                  top: `${20 + (i % 3) * 25}%`, 
                  left: `${15 + Math.floor(i / 2) * 25}%`,
                }}
              >
                <div className="bg-white px-5 py-2.5 rounded-2xl border border-indigo-50 font-extrabold text-xs text-indigo-600 whitespace-nowrap shadow-xl flex items-center gap-2 group">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full group-hover:scale-125 transition-transform" />
                  {(apt.price / 1000).toFixed(0)}k ₸
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
