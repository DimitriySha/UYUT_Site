import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { motion } from 'motion/react';

export default function Contacts() {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 space-y-20">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
          Как мы можем вам <span className="gradient-text">помочь</span>?
        </h1>
        <p className="text-xl text-gray-500 font-light leading-relaxed">
          Наша команда доступна 24/7, чтобы помочь вам с бронированием, 
          дать рекомендации или ответить на любые вопросы о наших апартаментах.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: Mail, label: 'Email', value: 'hello@uyut.kz', desc: 'Прямая поддержка' },
              { icon: Phone, label: 'Колл-центр', value: '+7 (7172) 555-0101', desc: 'Доступно 24/7' },
              { icon: Clock, label: 'Часы работы', value: '09:00 - 21:00', desc: 'Ежедневно' },
              { icon: MapPin, label: 'Офис', value: 'ул. Нур-Султан 12', desc: 'Астана, Казахстан' },
            ].map((item, i) => (
              <div key={i} className="group p-8 bg-white rounded-[40px] border border-gray-100 soft-shadow space-y-6 hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 gradient-bg/10 rounded-2xl flex items-center justify-center text-indigo-600">
                  <item.icon size={24} />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                  <p className="text-lg font-bold">{item.value}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="aspect-video bg-gray-100 rounded-[40px] overflow-hidden soft-shadow relative">
             <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium">
               [Интерактивная карта]
             </div>
             {/* Gradient Overlay for modern look */}
             <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent flex items-end p-8">
               <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl max-w-xs">
                 <p className="font-bold text-sm">Центральный офис Астана</p>
                 <p className="text-xs text-gray-500">пр. Кабанбай Батыра 1, Астана 010000</p>
               </div>
             </div>
          </div>
        </div>

        <div className="bg-white p-10 md:p-16 rounded-[48px] soft-shadow border border-gray-50 space-y-12 h-fit lg:sticky lg:top-32">
          <div className="space-y-2">
            <h3 className="text-3xl font-bold font-sans">Отправьте нам сообщение</h3>
            <p className="text-gray-500 font-light">Мы ответим вам в течение 30 минут.</p>
          </div>

          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Ваше имя</label>
                  <input 
                    type="text" 
                    placeholder="Иван Иванов" 
                    className="w-full bg-gray-50 p-5 rounded-[24px] outline-none focus:ring-1 ring-indigo-500/20 placeholder:text-gray-300 font-medium text-sm transition-all"
                  />
              </div>
              <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                  <input 
                    type="email" 
                    placeholder="ivan@example.com" 
                    className="w-full bg-gray-50 p-5 rounded-[24px] outline-none focus:ring-1 ring-indigo-500/20 placeholder:text-gray-300 font-medium text-sm transition-all"
                  />
              </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Тема</label>
                <input 
                  type="text" 
                  placeholder="Вопрос по бронированию" 
                  className="w-full bg-gray-50 p-5 rounded-[24px] outline-none focus:ring-1 ring-indigo-500/20 placeholder:text-gray-300 font-medium text-sm transition-all"
                />
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Сообщение</label>
                <textarea 
                  rows={4}
                  placeholder="Чем мы можем помочь?" 
                  className="w-full bg-gray-50 p-5 rounded-[24px] outline-none focus:ring-1 ring-indigo-500/20 placeholder:text-gray-300 font-medium text-sm transition-all resize-none"
                />
            </div>
            <button className="w-full gradient-bg text-white py-5 rounded-[24px] font-bold text-lg shadow-xl shadow-indigo-100/10 hover:opacity-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest">
              <Send size={20} />
              Отправить сообщение
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
