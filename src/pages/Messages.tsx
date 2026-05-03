import { MessageSquare, Search, Send, User } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

const MOCK_CHATS = [
  { id: 1, name: 'Администратор: Байтерек Лофт', lastMsg: 'Добрый день! Ключи будут в сейфе.', time: '14:20', unread: true },
  { id: 2, name: 'Служба поддержки', lastMsg: 'Ваш запрос №452 был обработан.', time: 'Вчера', unread: false },
  { id: 3, name: 'Менеджер EXPO Residence', lastMsg: 'Спасибо за бронирование!', time: '2 дня назад', unread: false },
];

export default function Messages() {
  const [activeChat, setActiveChat] = useState(MOCK_CHATS[0]);

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 h-[calc(100vh-120px)]">
      <div className="bg-white rounded-[3rem] shadow-xl shadow-indigo-100/50 border border-indigo-50 h-full overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-gray-100 flex flex-col">
          <div className="p-8 space-y-6">
            <h1 className="text-2xl font-bold">Сообщения</h1>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Поиск диалогов..."
                className="w-full bg-gray-50 py-3 pl-12 pr-4 rounded-2xl text-sm outline-none focus:ring-2 ring-indigo-500/10 transition-all font-medium"
              />
            </div>
          </div>
          <div className="flex-grow overflow-y-auto px-4 space-y-2 pb-8">
            {MOCK_CHATS.map((chat) => (
              <button 
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`w-full text-left p-4 rounded-[2rem] transition-all flex gap-4 items-center ${activeChat.id === chat.id ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}
              >
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-indigo-100 text-indigo-600 shrink-0 font-bold">
                  {chat.name[0]}
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-sm text-brand-dark truncate">{chat.name}</p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{chat.time}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate font-medium">{chat.lastMsg}</p>
                </div>
                {chat.unread && (
                  <div className="w-2 h-2 bg-indigo-600 rounded-full shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Content */}
        <div className="flex-grow flex flex-col bg-[#fcfdfe]">
          {activeChat ? (
            <>
              <div className="p-6 border-b border-gray-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                    {activeChat.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-brand-dark">{activeChat.name}</h3>
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">В сети</p>
                  </div>
                </div>
              </div>

              <div className="flex-grow p-8 overflow-y-auto space-y-6">
                <div className="flex justify-center">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-gray-300">Сегодня, 14:20</span>
                </div>
                
                <div className="flex gap-4 max-w-[70%]">
                  <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 shrink-0 font-bold text-xs">
                    B
                  </div>
                  <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-indigo-50 shadow-sm">
                    <p className="text-sm text-brand-dark leading-relaxed">
                      Добрый день! Благодарим за выбор наших апартаментов. Ключи будут ждать вас в сейф-боксе у двери. Код: 1592.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 max-w-[70%] ml-auto flex-row-reverse">
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 shrink-0 font-bold text-xs">
                    Я
                  </div>
                  <div className="gradient-bg text-white p-4 rounded-2xl rounded-tr-none shadow-md">
                    <p className="text-sm leading-relaxed">
                      Отлично, спасибо! Во сколько возможен ранний заезд?
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white border-t border-gray-100">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Напишите сообщение..."
                    className="w-full bg-gray-50 py-5 pl-8 pr-20 rounded-[2rem] outline-none focus:ring-2 ring-indigo-500/10 transition-all font-medium text-sm"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 gradient-bg text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-all">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-300 space-y-4">
              <MessageSquare size={80} strokeWidth={1} />
              <p className="font-bold uppercase tracking-widest text-sm">Выберите чат для начала общения</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
