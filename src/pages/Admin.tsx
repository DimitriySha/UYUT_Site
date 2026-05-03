import { Plus, Star, MoreHorizontal, X, Camera, MapPin, Tag, TrendingUp, Users, CreditCard, LayoutDashboard, Building2, ShieldCheck, Trash2, Wind, Database as DbIcon, Calendar as CalendarIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { apartmentService, bookingService } from '../services/api';
import { Apartment, Booking } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'objects' | 'bookings' | 'database'>('dashboard');
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [adminBookings, setAdminBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<{
    totalRevenue: number;
    totalBookings: number;
    totalApartments: number;
    uniqueGuests: number;
    monthlyRevenue: { month: string; total: number }[];
    typeDistribution: { type: string; count: number }[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Database explorer state
  const [dbTables, setDbTables] = useState<{name: string}[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'database') {
      fetch('/api/debug/db/tables')
        .then(res => res.json())
        .then(setDbTables)
        .catch(console.error);
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedTable) {
      fetch(`/api/debug/db/tables/${selectedTable}`)
        .then(res => res.json())
        .then(setTableData)
        .catch(console.error);
    }
  }, [selectedTable]);

  const fetchApartments = async () => {
    try {
      setIsLoading(true);
      const data = await apartmentService.getAll(true);
      setApartments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminBookings = async () => {
    try {
      const data = await bookingService.getAllForAdmin();
      setAdminBookings(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await bookingService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Fetch stats failed:', error);
      // Don't crash, just keep stats as null or empty
      setStats({
        totalRevenue: 0,
        totalBookings: 0,
        totalApartments: 0,
        uniqueGuests: 0,
        monthlyRevenue: [],
        typeDistribution: []
      });
    }
  };

  useEffect(() => {
    fetchApartments();
    fetchAdminBookings();
    fetchStats();
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newApt, setNewApt] = useState({
    title: '',
    location: '',
    price: '',
    description: '',
    type: 'Luxury',
    beds: '1',
    rating: '5.0',
    sqm: '45',
    maxGuests: '2',
    baths: '1',
    images: '',
    amenities: 'Wi-Fi, Кухня, Кондиционер'
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const addedApt = {
        ...newApt,
        price: parseInt(newApt.price),
        beds: parseInt(newApt.beds),
        rating: parseFloat(newApt.rating),
        sqm: parseInt(newApt.sqm),
        maxGuests: parseInt(newApt.maxGuests),
        baths: parseInt(newApt.baths),
        images: newApt.images ? newApt.images.split(',').map(s => s.trim()) : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800'],
        amenities: newApt.amenities.split(',').map(s => s.trim()),
      };
      await apartmentService.create(addedApt as any);
      await fetchApartments();
      setIsModalOpen(false);
      setNewApt({
        title: '',
        location: '',
        price: '',
        description: '',
        type: 'Luxury',
        beds: '1',
        rating: '5.0',
        sqm: '45',
        maxGuests: '2',
        baths: '1',
        images: '',
        amenities: 'Wi-Fi, Кухня, Кондиционер'
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    setErrorMessage(null);
    try {
      await apartmentService.delete(id);
      await fetchApartments();
    } catch (error: any) {
      console.error('Delete error:', error);
      setErrorMessage('Не удалось удалить объект. Возможно, у него есть активные бронирования.');
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string | undefined) => {
    const nextStatus = currentStatus === 'active' || !currentStatus ? 'inactive' : 'active';
    try {
      await apartmentService.updateStatus(id, nextStatus);
      await fetchApartments();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 space-y-12">
      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] bg-red-500 text-white px-6 py-3 rounded-2xl shadow-xl font-bold flex items-center gap-3"
          >
            <ShieldCheck size={20} />
            {errorMessage}
            <button onClick={() => setErrorMessage(null)} className="ml-2 hover:bg-white/20 p-1 rounded-full">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-brand-dark text-white rounded-2xl shadow-lg">
               <ShieldCheck size={24} />
             </div>
             <h1 className="text-4xl font-extrabold tracking-tight">Панель управления</h1>
          </div>
          <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <LayoutDashboard size={16} /> Дашборд
            </button>
            <button 
              onClick={() => setActiveTab('objects')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'objects' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Building2 size={16} /> Объекты
            </button>
            <button 
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'bookings' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <CalendarIcon size={16} /> Бронирования
            </button>
            <button 
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'database' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <DbIcon size={16} /> База данных
            </button>
          </div>
        </div>
        
        {activeTab === 'objects' && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 gradient-bg text-white px-8 py-4 rounded-[28px] font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-100"
          >
            <Plus size={20} />
            Добавить объект
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-10"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Общая выручка', val: `${stats?.totalRevenue?.toLocaleString() || 0} ₸`, trend: '+12.5%', icon: CreditCard, color: 'text-green-500' },
                { label: 'Бронирований всего', val: stats?.totalBookings?.toString() || '0', trend: '+8.2%', icon: TrendingUp, color: 'text-indigo-500' },
                { label: 'Активных объектов', val: stats?.totalApartments?.toString() || '0', trend: '+4.1%', icon: Building2, color: 'text-orange-500' },
                { label: 'Всего гостей', val: stats?.uniqueGuests?.toString() || '0', trend: '+15.0%', icon: Users, color: 'text-blue-500' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm space-y-4">
                  <div className={`p-3 bg-gray-50 w-fit rounded-xl ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <div>
                    <div className="flex justify-between items-end">
                      <p className="text-3xl font-extrabold text-brand-dark">{stat.val}</p>
                      <span className="text-[10px] font-bold text-green-500 mb-1">{stat.trend}</span>
                    </div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mt-1">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Выручка по месяцам</h3>
                  <select className="bg-gray-50 border-none outline-none text-[10px] font-bold uppercase tracking-widest rounded-lg px-3 py-1">
                    <option>Последние 6 мес</option>
                  </select>
                </div>
                <div className="h-80 w-full font-sans text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.monthlyRevenue || []}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `${val/1000}k`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                      />
                      <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] border border-gray-50 shadow-sm space-y-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold">Типы апартаментов</h3>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Количество</span>
                  </div>
                </div>
                <div className="h-80 w-full font-sans text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.typeDistribution || []}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="type" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip cursor={{fill: '#f8fafc'}} />
                      <Bar dataKey="count" fill="#4f46e5" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        ) : activeTab === 'objects' ? (
          <motion.div 
            key="objects"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[3rem] soft-shadow border border-gray-50 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/30">
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Объект</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Статус</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Цена</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Рейтинг</th>
                    <th className="px-8 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {apartments.map((apt) => (
                    <tr key={apt.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-6">
                           <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-gray-100">
                             <img src={apt.images[0]} alt={apt.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                           </div>
                           <div>
                             <p className="font-bold text-lg text-brand-dark mb-1">{apt.title}</p>
                             <p className="text-xs text-gray-400 flex items-center gap-1">
                               <MapPin size={12} />
                               {apt.location}
                             </p>
                           </div>
                        </div>
                      </td>
                      <td className="px-8 py-8 text-center">
                        {apt.status === 'deleted' ? (
                          <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-red-100">
                             Удаление
                          </span>
                        ) : apt.status === 'inactive' ? (
                          <span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-orange-100 italic">
                            Неактивен
                          </span>
                        ) : (
                          <span className="bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-100 italic">
                            Активен
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex flex-col">
                          <p className="text-base font-bold text-brand-dark">{apt.price.toLocaleString()} ₸</p>
                          <span className="text-[10px] text-gray-400 font-medium">за ночь</span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-1.5 font-bold text-sm text-indigo-600 bg-indigo-50/50 w-fit px-3 py-1 rounded-lg">
                          <Star size={14} className="fill-indigo-600" />
                          {apt.rating}
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleUpdateStatus(apt.id, apt.status)}
                            className={`text-[10px] font-extrabold uppercase tracking-widest px-4 py-2 rounded-2xl border transition-all shadow-sm flex items-center gap-2
                              ${apt.status === 'inactive' 
                                ? 'bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100' 
                                : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                            title={apt.status === 'active' ? 'Сделать неактивным' : 'Сделать активным'}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${apt.status === 'inactive' ? 'bg-orange-500' : 'bg-green-500'}`} />
                            {apt.status === 'active' ? 'Активен' : 'Пауза'}
                          </button>
                          
                          {apt.bookingsCount && apt.bookingsCount > 0 ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-widest opacity-60 cursor-not-allowed">
                               <ShieldCheck size={16} className="text-indigo-400" />
                               Занято ({apt.bookingsCount})
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleDelete(apt.id)}
                              className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-100 shadow-sm hover:shadow-red-100/20"
                              title="Удалить навсегда"
                            >
                              <Trash2 size={20} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : activeTab === 'bookings' ? (
          <motion.div 
            key="bookings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-[3rem] soft-shadow border border-gray-50 overflow-hidden"
          >
             <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/30">
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Клиент</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Апартаменты</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Даты</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Сумма</th>
                    <th className="px-8 py-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Статус</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {adminBookings.map((booking) => (
                    <tr key={booking.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-8">
                        <div>
                          <p className="font-bold text-brand-dark">{booking.user_name}</p>
                          <p className="text-xs text-gray-400">{booking.user_email}</p>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <p className="font-medium text-gray-600">{booking.apt_title}</p>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600">
                          <span>{booking.startDate}</span>
                          <span className="text-gray-300">→</span>
                          <span>{booking.endDate}</span>
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <p className="font-bold text-brand-dark">{booking.totalPrice?.toLocaleString()} ₸</p>
                      </td>
                      <td className="px-8 py-8">
                        <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                          Подтверждено
                        </span>
                      </td>
                    </tr>
                  ))}
                  {adminBookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium italic">
                        Бронирований пока нет
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="database"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
              {dbTables.map(table => (
                <button
                  key={table.name}
                  onClick={() => setSelectedTable(table.name)}
                  className={`px-6 py-3 rounded-full text-xs font-bold transition-all whitespace-nowrap ${selectedTable === table.name ? 'gradient-bg text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-100 hover:border-indigo-200'}`}
                >
                  {table.name}
                </button>
              ))}
            </div>

            {selectedTable ? (
              <div className="bg-white rounded-[3rem] soft-shadow border border-gray-50 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-gray-50/50 border-b border-gray-50">
                        {tableData.length > 0 && Object.keys(tableData[0]).map(key => (
                          <th key={key} className="px-6 py-4 font-bold text-gray-400 tracking-wider uppercase">{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {tableData.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                          {Object.values(row).map((val: any, j) => (
                            <td key={j} className="px-6 py-4 text-gray-600 truncate max-w-[200px]">
                              {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white p-20 rounded-[3rem] border border-dashed border-gray-200 text-center">
                <DbIcon className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-400 font-medium">Выберите таблицу для просмотра данных</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 mt-0">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-6xl bg-[#f8fafc] rounded-[48px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
            >
              {/* Header */}
              <div className="px-10 py-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white">
                    <Building2 size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-brand-dark">Конструктор объекта</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAdd} className="overflow-y-auto custom-scrollbar flex-grow">
                <main className="p-10 space-y-12">
                  {/* Hero Image Section */}
                  <div className="relative aspect-[21/9] rounded-[3rem] overflow-hidden bg-gray-200 shadow-inner group">
                    {newApt.images ? (
                      <img src={newApt.images.split(',')[0]} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                        <Camera size={48} strokeWidth={1} />
                        <p className="font-medium text-sm">Предпросмотр главного фото</p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8">
                       <label className="text-[10px] font-bold text-white/70 uppercase tracking-widest ml-1 mb-2 block">Ссылки на фото (через запятую)</label>
                       <textarea 
                        rows={1}
                        placeholder="https://images.unsplash.com/..." 
                        className="w-full bg-white/20 backdrop-blur-md border border-white/30 p-4 rounded-2xl text-white placeholder:text-white/50 text-sm outline-none focus:bg-white/30 transition-all font-mono"
                        value={newApt.images}
                        onChange={(e) => setNewApt({...newApt, images: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content Column */}
                    <div className="lg:col-span-2 space-y-10">
                      {/* Title & Location Area */}
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1">Название Апартаментов</label>
                          <input 
                            required
                            type="text" 
                            placeholder="Название объекта..." 
                            className="w-full bg-transparent text-4xl font-extrabold text-brand-dark outline-none border-b-2 border-transparent focus:border-indigo-100 pb-2 transition-all"
                            value={newApt.title}
                            onChange={(e) => setNewApt({...newApt, title: e.target.value})}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <MapPin size={18} className="text-indigo-500" />
                          <input 
                            required
                            type="text" 
                            placeholder="Локация (напр. г. Алматы, пр. Аль-Фараби)" 
                            className="bg-transparent font-medium outline-none border-b border-transparent focus:border-gray-200 w-full"
                            value={newApt.location}
                            onChange={(e) => setNewApt({...newApt, location: e.target.value})}
                          />
                        </div>
                      </div>

                      {/* Info Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { icon: TrendingUp, label: 'Площадь', key: 'sqm', suffix: ' м²' },
                          { icon: Users, label: 'Гостей', key: 'maxGuests', suffix: '' },
                          { icon: Wind, label: 'Тип', key: 'type', isSelect: true },
                          { icon: Tag, label: 'Комнат', key: 'beds', suffix: '' },
                        ].map((item, i) => (
                          <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col items-center text-center space-y-2">
                            <item.icon size={20} className="text-indigo-500" />
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                            {item.isSelect ? (
                              <select 
                                className="font-bold text-brand-dark bg-transparent outline-none appearance-none text-center"
                                value={newApt.type}
                                onChange={(e) => setNewApt({...newApt, type: e.target.value})}
                              >
                                <option value="Luxury">Luxury</option>
                                <option value="Studio">Studio</option>
                                <option value="Apartment">Apartment</option>
                                <option value="Family">Family</option>
                              </select>
                            ) : (
                              <div className="flex items-center">
                                <input 
                                  type="number" 
                                  className="w-12 font-bold text-brand-dark bg-transparent outline-none text-center"
                                  value={(newApt as any)[item.key]}
                                  onChange={(e) => setNewApt({...newApt, [item.key]: e.target.value})}
                                />
                                <span className="font-bold text-brand-dark">{item.suffix}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Description */}
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-brand-dark">О жилье</h3>
                        <textarea 
                          required
                          rows={6}
                          placeholder="Опишите ваши апартаменты, укажите особенности и преимущества..." 
                          className="w-full bg-white p-8 rounded-[2.5rem] border border-gray-100 outline-none focus:border-indigo-200 text-gray-600 leading-relaxed font-medium transition-all resize-none shadow-sm"
                          value={newApt.description}
                          onChange={(e) => setNewApt({...newApt, description: e.target.value})}
                        />
                      </div>

                      {/* Amenities */}
                      <div className="space-y-4">
                         <h3 className="text-xl font-bold text-brand-dark">Удобства</h3>
                         <input 
                            type="text"
                            placeholder="Wi-Fi, Кондиционер, Кухня, Парковка (через запятую)..." 
                            className="w-full bg-white p-6 rounded-3xl border border-gray-100 outline-none focus:border-indigo-200 font-medium text-gray-600 transition-all shadow-sm"
                            value={newApt.amenities}
                            onChange={(e) => setNewApt({...newApt, amenities: e.target.value})}
                          />
                      </div>
                    </div>

                    {/* Sidebar Area */}
                    <div className="space-y-6">
                      <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-indigo-100/30 border border-indigo-50 space-y-8 sticky top-24">
                        <div className="space-y-2">
                           <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-1">Стоимость за ночь</p>
                           <div className="flex items-baseline gap-2">
                              <input 
                                required
                                type="number" 
                                className="text-4xl font-extrabold text-brand-dark bg-transparent outline-none w-full border-b-2 border-indigo-50 focus:border-indigo-200 transition-all pb-1"
                                placeholder="85000"
                                value={newApt.price}
                                onChange={(e) => setNewApt({...newApt, price: e.target.value})}
                              />
                              <span className="text-xl font-bold text-gray-400">₸</span>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-400 font-medium">Рейтинг (0-5)</span>
                              <input 
                                type="number" 
                                step="0.1"
                                max="5"
                                className="w-16 bg-gray-50 p-2 rounded-lg text-right font-bold text-brand-dark"
                                value={newApt.rating}
                                onChange={(e) => setNewApt({...newApt, rating: e.target.value})}
                              />
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-gray-400 font-medium">Санузлов</span>
                              <input 
                                type="number" 
                                className="w-16 bg-gray-50 p-2 rounded-lg text-right font-bold text-brand-dark"
                                value={newApt.baths}
                                onChange={(e) => setNewApt({...newApt, baths: e.target.value})}
                              />
                           </div>
                        </div>

                        <button 
                          type="submit"
                          className="w-full gradient-bg text-white py-5 rounded-[2rem] font-bold text-lg shadow-xl shadow-indigo-200/50 hover:scale-[1.03] active:scale-95 transition-all uppercase tracking-widest"
                        >
                          Опубликовать
                        </button>

                        <button 
                          type="button"
                          onClick={() => setIsModalOpen(false)}
                          className="w-full py-4 text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:text-gray-600 transition-colors"
                        >
                          Отменить создание
                        </button>
                      </div>
                    </div>
                  </div>
                </main>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
