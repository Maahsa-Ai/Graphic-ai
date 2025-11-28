
import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, UserPlus, User, Users, Send, Sparkles, Trash2, X, ChevronRight, Bot, PenTool, BrainCircuit, Upload, Camera, Edit, MoreVertical } from 'lucide-react';
import { Character, ChatMessage } from '../types';
import { chatWithCharacter } from '../services/geminiService';
import { Button } from './Button';

const DEFAULT_CHARACTERS: Character[] = [
  {
    id: '1',
    name: 'استاد جمشید',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jamshid&backgroundColor=c0aede',
    age: 55,
    job: 'گرافیست پیشکسوت',
    style: 'سنتی و خطاطی',
    tone: 'سنگین، رسمی و پدرانه',
    traits: ['دقیق', 'سنتی‌گرا', 'منتقد'],
    bio: 'طراح لوگوهای ماندگار دهه ۶۰ ایران. معتقد است اصول اولیه مهم‌تر از نرم‌افزار است.'
  },
  {
    id: '2',
    name: 'سارا',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara&backgroundColor=b6e3f4',
    age: 24,
    job: 'طراح UI/UX',
    style: 'مینیمال و فلت',
    tone: 'دوستانه، پرانرژی و مدرن',
    traits: ['خلاق', 'به‌روز', 'سریع'],
    bio: 'عاشق فضای سفید و گرادینت‌های نرم. همیشه دنبال ترندهای جدید دریبل است.'
  }
];

export const CharacterStudio: React.FC = () => {
  // Load characters from local storage or use defaults
  const [characters, setCharacters] = useState<Character[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('saved_characters');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing saved characters", e);
        }
      }
    }
    return DEFAULT_CHARACTERS;
  });

  const [selectedCharId, setSelectedCharId] = useState<string | null>(null);
  
  // Persist Chat History
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('chat_history');
        if (saved) return JSON.parse(saved);
    }
    return {};
  });

  const [inputMessage, setInputMessage] = useState('');
  
  // Mode States
  const [isCreating, setIsCreating] = useState(false); // Controls view (Form vs Chat)
  const [editingId, setEditingId] = useState<string | null>(null); // Controls context (New vs Edit)
  
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Character Form State
  const [newCharName, setNewCharName] = useState('');
  const [newCharJob, setNewCharJob] = useState('');
  const [newCharStyle, setNewCharStyle] = useState('');
  const [newCharTone, setNewCharTone] = useState('رسمی');
  const [newCharBio, setNewCharBio] = useState('');
  
  // Avatar Upload State
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist characters
  useEffect(() => {
    localStorage.setItem('saved_characters', JSON.stringify(characters));
  }, [characters]);

  // Persist chat history
  useEffect(() => {
    localStorage.setItem('chat_history', JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, selectedCharId, isLoading]);

  const selectedCharacter = characters.find(c => c.id === selectedCharId);
  const currentChat = selectedCharId ? (chatHistory[selectedCharId] || []) : [];

  // --- ACTIONS ---

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedCharacter) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputMessage,
      timestamp: Date.now()
    };

    // Update UI immediately
    setChatHistory(prev => ({
      ...prev,
      [selectedCharacter.id]: [...(prev[selectedCharacter.id] || []), userMsg]
    }));
    setInputMessage('');
    setIsLoading(true);

    try {
      const responseText = await chatWithCharacter(
        selectedCharacter,
        currentChat, // Pass previous history context
        userMsg.text
      );

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };

      setChatHistory(prev => ({
        ...prev,
        [selectedCharacter.id]: [...(prev[selectedCharacter.id] || []), botMsg]
      }));

    } catch (error) {
      console.error("Chat error", error);
      const errorMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'model',
        text: "متاسفانه مشکلی در ارتباط پیش آمد.",
        timestamp: Date.now()
      };
      setChatHistory(prev => ({
        ...prev,
        [selectedCharacter.id]: [...(prev[selectedCharacter.id] || []), errorMsg]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
          setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset form to blank state
  const resetForm = () => {
    setNewCharName('');
    setNewCharJob('');
    setNewCharStyle('');
    setNewCharTone('رسمی');
    setNewCharBio('');
    setAvatarPreview(null);
    setEditingId(null);
  };

  const startCreating = () => {
    resetForm();
    setIsCreating(true);
    setSelectedCharId(null);
  };

  const startEditing = (char: Character, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    setNewCharName(char.name);
    setNewCharJob(char.job);
    setNewCharStyle(char.style);
    setNewCharTone(char.tone);
    setNewCharBio(char.bio);
    setAvatarPreview(char.avatar);
    setEditingId(char.id);
    
    setIsCreating(true);
    setSelectedCharId(char.id); // Keep selected to show context if needed, or valid ID
  };

  const handleSaveCharacter = () => {
    if (!newCharName || !newCharJob) {
        alert("لطفا نام و شغل شخصیت را وارد کنید.");
        return;
    }

    const charData: Character = {
      id: editingId || Date.now().toString(),
      name: newCharName,
      job: newCharJob,
      style: newCharStyle || 'عمومی',
      tone: newCharTone,
      bio: newCharBio || 'توضیحات پیش‌فرض',
      traits: [],
      age: 30, // Default age, could add to form
      avatar: avatarPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newCharName}&backgroundColor=ffdfbf`
    };

    if (editingId) {
      // Update existing
      setCharacters(prev => prev.map(c => c.id === editingId ? charData : c));
    } else {
      // Create new
      setCharacters(prev => [...prev, charData]);
    }

    setIsCreating(false);
    setSelectedCharId(charData.id);
    resetForm();
  };

  const handleDeleteCharacter = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('آیا از حذف این شخصیت اطمینان دارید؟ تاریخچه چت نیز حذف خواهد شد.')) {
      setCharacters(prev => prev.filter(c => c.id !== id));
      // Remove chat history
      setChatHistory(prev => {
        const newHistory = { ...prev };
        delete newHistory[id];
        return newHistory;
      });
      
      if (selectedCharId === id) {
        setSelectedCharId(null);
        setIsCreating(false);
      }
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-bgBase">
      
      {/* Sidebar List */}
      <div className={`w-full md:w-80 border-l border-borderLight bg-white flex flex-col transition-all absolute md:relative z-10 h-full ${selectedCharId && !isCreating ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-borderLight flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-textMain flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            شخصیت‌ها
          </h2>
          <Button onClick={startCreating} icon={<UserPlus className="w-4 h-4" />} className="text-xs px-3">
            جدید
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {characters.map(char => (
            <div 
              key={char.id}
              onClick={() => {setSelectedCharId(char.id); setIsCreating(false);}}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border group relative ${selectedCharId === char.id ? 'bg-primary/10 border-primary' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}`}
            >
              <img src={char.avatar} alt={char.name} className="w-12 h-12 rounded-full border border-gray-200 bg-white object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-textMain truncate">{char.name}</h3>
                <p className="text-xs text-textLight truncate">{char.job}</p>
              </div>
              
              {/* Actions (Edit/Delete) */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-1 rounded-lg shadow-sm">
                <button 
                  onClick={(e) => startEditing(char, e)}
                  className="p-1.5 text-textLight hover:text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
                  title="ویرایش"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={(e) => handleDeleteCharacter(e, char.id)}
                  className="p-1.5 text-textLight hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative bg-pattern">
        
        {/* Form Mode (Create / Edit) */}
        {isCreating && (
          <div className="flex-1 overflow-y-auto p-6 md:p-10 animate-fadeIn bg-white">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center gap-2 mb-8">
                 <button onClick={() => setIsCreating(false)} className="md:hidden p-2 text-textLight"><ChevronRight /></button>
                 <h2 className="text-2xl font-bold text-textMain">
                    {editingId ? 'ویرایش شخصیت' : 'طراحی شخصیت جدید'}
                 </h2>
              </div>
              
              <div className="bg-white rounded-2xl border border-borderLight p-6 space-y-6 shadow-sm">
                
                {/* Avatar Selection */}
                <div className="flex flex-col items-center justify-center mb-6">
                   <div 
                     onClick={() => fileInputRef.current?.click()}
                     className="w-28 h-28 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center cursor-pointer overflow-hidden hover:bg-primary/5 transition-all relative group bg-gray-50"
                   >
                     {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                     ) : (
                        newCharName ? (
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${newCharName}&backgroundColor=ffdfbf`} alt="Preview" className="w-full h-full object-cover opacity-70" />
                        ) : (
                            <Camera className="w-8 h-8 text-primary/40" />
                        )
                     )}
                     <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                     </div>
                   </div>
                   <span className="text-xs text-textLight mt-2">انتخاب تصویر پروفایل (اختیاری)</span>
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleAvatarUpload} 
                      accept="image/*" 
                      className="hidden" 
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-textMain mb-2">نام شخصیت</label>
                    <input 
                      value={newCharName}
                      onChange={(e) => setNewCharName(e.target.value)}
                      placeholder="مثال: استاد کمالی"
                      className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-textMain mb-2">شغل / نقش</label>
                    <input 
                      value={newCharJob}
                      onChange={(e) => setNewCharJob(e.target.value)}
                      placeholder="مثال: منتقد هنری"
                      className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-textMain mb-2">سبک مورد علاقه</label>
                  <input 
                    value={newCharStyle}
                    onChange={(e) => setNewCharStyle(e.target.value)}
                    placeholder="مثال: رئالیسم، سایبرپانک، سنتی..."
                    className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none"
                  />
                </div>

                <div>
                   <label className="block text-sm font-bold text-textMain mb-2">لحن صحبت</label>
                   <select 
                     value={newCharTone}
                     onChange={(e) => setNewCharTone(e.target.value)}
                     className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none bg-white"
                   >
                     <option value="رسمی">رسمی و جدی</option>
                     <option value="دوستانه">دوستانه و صمیمی</option>
                     <option value="طنز">با چاشنی طنز</option>
                     <option value="فلسفی">فلسفی و عمیق</option>
                     <option value="تند">تند و منتقدانه</option>
                   </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-textMain mb-2">بیوگرافی کوتاه</label>
                  <textarea 
                    value={newCharBio}
                    onChange={(e) => setNewCharBio(e.target.value)}
                    placeholder="توضیحاتی درباره پیشینه و اخلاقیات..."
                    className="w-full p-3 rounded-xl border border-borderLight focus:border-primary outline-none h-32 resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t border-borderLight">
                  <Button onClick={handleSaveCharacter} className="flex-1">
                    {editingId ? 'ذخیره تغییرات' : 'ساخت شخصیت'}
                  </Button>
                  <Button variant="secondary" onClick={() => setIsCreating(false)} className="flex-1">انصراف</Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Mode */}
        {!isCreating && selectedCharacter ? (
          <>
            {/* Chat Header */}
            <div className="h-16 bg-white border-b border-borderLight flex items-center px-4 justify-between shadow-sm z-20">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedCharId(null)} className="md:hidden p-2 text-textLight hover:bg-gray-100 rounded-lg">
                  <ChevronRight />
                </button>
                <img src={selectedCharacter.avatar} alt="avatar" className="w-10 h-10 rounded-full border border-gray-200 object-cover" />
                <div>
                  <h3 className="font-bold text-textMain text-sm">{selectedCharacter.name}</h3>
                  <p className="text-xs text-textLight flex items-center gap-1">
                    <PenTool className="w-3 h-3" />
                    {selectedCharacter.job}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <div className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full border border-primary/20 hidden sm:block">
                   {selectedCharacter.style}
                 </div>
                 
                 <div className="h-6 w-px bg-gray-200 mx-1"></div>
                 
                 <button 
                   onClick={() => startEditing(selectedCharacter)}
                   className="p-2 text-textLight hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                   title="ویرایش پروفایل"
                 >
                    <Edit className="w-4 h-4" />
                 </button>
                 <button 
                   onClick={(e) => handleDeleteCharacter(e, selectedCharacter.id)}
                   className="p-2 text-textLight hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                   title="حذف شخصیت"
                 >
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
              {currentChat.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-textLight opacity-60">
                  <Bot className="w-16 h-16 mb-4 text-primary opacity-50" />
                  <p className="text-lg font-medium">گفتگو را با {selectedCharacter.name} شروع کنید</p>
                  <p className="text-sm mt-2 max-w-xs text-center">
                    می‌توانید درباره پروژه‌هایتان نظر بخواهید یا در مورد سبک {selectedCharacter.style} سوال کنید.
                  </p>
                </div>
              ) : (
                currentChat.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`
                      max-w-[85%] md:max-w-[70%] p-4 rounded-2xl leading-relaxed shadow-sm text-sm md:text-base
                      ${msg.role === 'user' 
                        ? 'bg-white text-textMain rounded-tr-none border border-borderLight' 
                        : 'bg-primary text-white rounded-tl-none shadow-md shadow-primary/20'}
                    `}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                 <div className="flex justify-end">
                    <div className="bg-primary/80 text-white p-3 rounded-2xl rounded-tl-none animate-pulse flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      در حال نوشتن...
                    </div>
                 </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-borderLight">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-3 relative">
                <input 
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`پیام به ${selectedCharacter.name}...`}
                  className="flex-1 p-4 rounded-2xl border border-borderLight bg-gray-50 focus:bg-white focus:border-primary outline-none shadow-inner transition-all pl-12"
                />
                <button 
                  type="submit" 
                  disabled={!inputMessage.trim() || isLoading}
                  className="absolute left-2 top-2 p-2 bg-primary text-white rounded-xl shadow-md hover:bg-primaryDark disabled:opacity-50 disabled:shadow-none transition-all"
                >
                  <Send className="w-5 h-5 rtl:rotate-180" />
                </button>
              </form>
            </div>
          </>
        ) : !isCreating && (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-textLight">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <BrainCircuit className="w-12 h-12 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-textMain mb-2">اتاق فکر و شخصیت‌ها</h3>
            <p className="max-w-md text-center">یک شخصیت را انتخاب کنید یا یک منتور جدید برای خود بسازید تا در پروژه‌ها به شما کمک کند.</p>
          </div>
        )}

      </div>
    </div>
  );
};
