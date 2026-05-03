import { MessageSquare, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { messageService } from '../services/api';

export default function Messages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');

  useEffect(() => {
    if (user) {
      const fetchMessages = () => {
        messageService.getByUserId(user.id)
          .then(setMessages)
          .catch(console.error);
      };
      
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleSend = async () => {
    if (!user || !content.trim()) return;
    
    // Admin ID hardcoded in seed: 'admin123'
    const adminId = 'admin123';
    
    try {
      const newMessage = await messageService.send(user.id, adminId, content);
      setMessages([...messages, newMessage]);
      setContent('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-20 h-[calc(100vh-120px)]">
      <div className="bg-white rounded-[3rem] shadow-xl shadow-indigo-100/50 border border-indigo-50 h-full overflow-hidden flex">
        <div className="flex-grow flex flex-col bg-[#fcfdfe]">
          <div className="p-6 border-b border-gray-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                A
              </div>
              <div>
                <h3 className="font-bold text-brand-dark">Администратор</h3>
                <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">В сети</p>
              </div>
            </div>
          </div>

          <div className="flex-grow p-8 overflow-y-auto space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-4 max-w-[70%] ${msg.sender_id === user?.id ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${msg.sender_id === user?.id ? 'bg-gray-100 text-gray-600' : 'bg-indigo-50 text-indigo-600'}`}>
                  {msg.sender_id === user?.id ? 'Я' : 'A'}
                </div>
                <div className={`p-4 rounded-2xl border ${msg.sender_id === user?.id ? 'gradient-bg text-white rounded-tr-none shadow-md' : 'bg-white rounded-tl-none border-indigo-50 shadow-sm'}`}>
                  <p className="text-sm leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-8 bg-white border-t border-gray-100">
            <div className="relative">
              <input 
                type="text" 
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Напишите сообщение..."
                className="w-full bg-gray-50 py-5 pl-8 pr-20 rounded-[2rem] outline-none focus:ring-2 ring-indigo-500/10 transition-all font-medium text-sm"
              />
              <button onClick={handleSend} className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 gradient-bg text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-all">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
