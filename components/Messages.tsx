
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Bot, User, Loader2, Sparkles, Mic, Image as ImageIcon, X, Users, Search, MoreVertical, MessageSquare, ShieldCheck, Clock, ChevronLeft, ArrowLeft } from 'lucide-react';
import { useStore } from '../store';
import { getFitnessAdvice } from '../services/gemini';
import { Message, MessageType, ChatChannel } from '../types';

const Messages: React.FC = () => {
  const { 
    language, messages, addMessage, broadcastMessage, 
    resetUnreadCount, profile, managedTrainees, 
    selectedChatTraineeId, setSelectedChatTraineeId,
    markChatAsRead
  } = useStore();

  const [activeChannel, setActiveChannel] = useState<ChatChannel>('direct');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaPreview, setMediaPreview] = useState<{ type: MessageType; data: string } | null>(null);
  const [traineeSearch, setTraineeSearch] = useState('');
  const [showTraineeListOnMobile, setShowTraineeListOnMobile] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const isTrainer = profile?.role === 'trainer';
  const t = (fa: string, en: string) => language === 'fa' ? fa : en;

  // Sorting managed trainees by unread count first, then by last_message_at
  const sortedTrainees = useMemo(() => {
    return [...managedTrainees]
      .filter(trainee => trainee.full_name.toLowerCase().includes(traineeSearch.toLowerCase()))
      .sort((a, b) => {
        if ((a.unread_count || 0) > (b.unread_count || 0)) return -1;
        if ((a.unread_count || 0) < (b.unread_count || 0)) return 1;
        
        const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return timeB - timeA;
      });
  }, [managedTrainees, traineeSearch]);

  useEffect(() => {
    if (!isTrainer) {
      resetUnreadCount();
    }
  }, [isTrainer, resetUnreadCount]);

  useEffect(() => {
    if (isTrainer && selectedChatTraineeId !== 'broadcast') {
      markChatAsRead(selectedChatTraineeId);
    }
  }, [selectedChatTraineeId, isTrainer, markChatAsRead]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedChatTraineeId, activeChannel, isLoading, mediaPreview]);

  const activeMessages = messages.filter(msg => {
    const targetTraineeId = isTrainer ? selectedChatTraineeId : profile?.id;
    return msg.trainee_id === targetTraineeId && msg.chat_type === activeChannel;
  });

  const handleSend = async () => {
    if ((!input.trim() && !mediaPreview) || isLoading) return;

    const msgType = mediaPreview?.type || 'text';
    const msgData = mediaPreview?.data;
    const text = input.trim();

    const traineeId = isTrainer 
      ? (selectedChatTraineeId === 'broadcast' ? 'all' : selectedChatTraineeId) 
      : (profile?.id || 'unknown');

    const newMsg: Message = {
      id: Date.now().toString(),
      type: msgType,
      chat_type: activeChannel,
      text: text,
      media_data: msgData,
      sender: isTrainer ? 'trainer' : 'user',
      timestamp: new Date(),
      trainee_id: traineeId === 'all' ? '' : (traineeId as string),
    };

    if (isTrainer && selectedChatTraineeId === 'broadcast') {
      broadcastMessage({
        type: msgType,
        chat_type: activeChannel,
        text: text,
        media_data: msgData,
        sender: 'trainer',
        timestamp: new Date()
      });
    } else {
      addMessage(newMsg);
    }

    setInput('');
    setMediaPreview(null);

    if (!isTrainer && activeChannel === 'ai') {
      setIsLoading(true);
      const aiResponse = await getFitnessAdvice(text);
      addMessage({
        id: (Date.now() + 1).toString(),
        type: 'text',
        chat_type: 'ai',
        text: aiResponse || t('متاسفم، مشکلی پیش آمد.', 'Sorry, something went wrong.'),
        sender: 'ai',
        timestamp: new Date(),
        trainee_id: traineeId as string
      });
      setIsLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview({ type: 'image', data: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setMediaPreview({ type: 'audio', data: reader.result as string });
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } catch (err) {
      alert(t('دسترسی به میکروفون امکان‌پذیر نیست', 'Microphone access denied'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const renderMessageContent = (msg: Message) => {
    switch (msg.type) {
      case 'image':
        return (
          <div className="space-y-2">
            <img src={msg.media_data} alt="Sent image" className="rounded-xl max-w-full h-auto shadow-md" />
            {msg.text && <p>{msg.text}</p>}
          </div>
        );
      case 'audio':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3 bg-white/10 p-2 rounded-xl">
              <Mic size={14} className="text-white" />
              <audio controls src={msg.media_data} className="h-8 max-w-[180px] filter invert opacity-80" />
            </div>
            {msg.text && <p>{msg.text}</p>}
          </div>
        );
      default:
        return <p>{msg.text}</p>;
    }
  };

  const currentTrainee = managedTrainees.find(t => t.id === selectedChatTraineeId);

  const selectTrainee = (id: string) => {
    setSelectedChatTraineeId(id);
    setShowTraineeListOnMobile(false);
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] lg:h-[calc(100vh-4rem)] gap-4 overflow-hidden animate-in fade-in duration-500">
      {/* Sidebar for Trainer: Chat List */}
      {isTrainer && (
        <aside className={`${showTraineeListOnMobile ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-80 bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl z-20`}>
          <header className="p-8 border-b border-slate-800 bg-slate-800/20">
            <h2 className="font-black text-2xl text-white italic">{t('مرکز گفتگوها', 'Messages Hub')}</h2>
            <div className="relative mt-6 group">
               <Search className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-amber-500 transition-colors" size={16} />
               <input 
                type="text" 
                value={traineeSearch}
                onChange={(e) => setTraineeSearch(e.target.value)}
                placeholder={t('جستجو در شاگردان...', 'Search trainees...')}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 px-12 text-sm focus:ring-1 focus:ring-amber-500 transition-all font-medium text-white"
               />
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
            <button 
              onClick={() => selectTrainee('broadcast')}
              className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all relative group ${
                selectedChatTraineeId === 'broadcast' ? 'bg-amber-600 text-white shadow-xl scale-[1.02]' : 'hover:bg-slate-800/50 text-slate-400'
              }`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedChatTraineeId === 'broadcast' ? 'bg-white/20' : 'bg-slate-800 text-amber-500'}`}>
                <Users size={24} />
              </div>
              <div className="text-left">
                <p className="font-black text-sm uppercase tracking-widest">{t('ارسال همگانی', 'Broadcast')}</p>
                <p className={`text-[10px] font-bold ${selectedChatTraineeId === 'broadcast' ? 'text-white/70' : 'text-slate-600'}`}>{t('ارسال پیام به تمام شاگردان', 'Message everyone')}</p>
              </div>
            </button>

            <div className="flex items-center gap-3 py-4">
               <div className="h-px bg-slate-800 flex-1" />
               <span className="text-[9px] font-black uppercase text-slate-700 tracking-[0.3em]">{t('لیست شاگردان', 'ATHLETES')}</span>
               <div className="h-px bg-slate-800 flex-1" />
            </div>

            {sortedTrainees.map(trainee => {
              const isActive = selectedChatTraineeId === trainee.id;
              const hasUnread = (trainee.unread_count || 0) > 0;
              const lastMsgDate = trainee.last_message_at ? new Date(trainee.last_message_at) : null;
              
              return (
                <button 
                  key={trainee.id}
                  onClick={() => selectTrainee(trainee.id)}
                  className={`w-full p-4 rounded-3xl flex items-center gap-4 transition-all relative group ${
                    isActive ? 'bg-indigo-600 text-white shadow-xl scale-[1.02]' : 'hover:bg-slate-800/50 text-slate-400'
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-800 flex items-center justify-center font-black relative shadow-inner">
                    {trainee.avatar_data ? (
                      <img src={trainee.avatar_data} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span className="text-lg">{trainee.full_name[0]}</span>
                    )}
                    {hasUnread && !isActive && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 flex items-center justify-center text-[8px] font-black text-white">{trainee.unread_count}</span>
                      </span>
                    )}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className={`font-black text-sm truncate ${isActive ? 'text-white' : hasUnread ? 'text-slate-200' : 'text-slate-400'}`}>{trainee.full_name}</p>
                      {lastMsgDate && (
                        <span className={`text-[9px] font-bold ${isActive ? 'text-white/60' : 'text-slate-600'}`}>
                          {lastMsgDate.toLocaleTimeString(language === 'fa' ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] font-bold mt-0.5 truncate ${isActive ? 'text-white/70' : 'text-slate-600'}`}>
                       {trainee.active_program_name || t('بدون برنامه فعال', 'No Active Program')}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      )}

      {/* Main Conversation Container */}
      <div className={`flex-1 flex flex-col bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl relative ${isTrainer && showTraineeListOnMobile ? 'hidden lg:flex' : 'flex'}`}>
        <header className="p-6 lg:p-8 bg-slate-900/80 border-b border-slate-800 flex flex-col gap-4">
           <div className="flex justify-between items-center">
             <div className="flex items-center gap-4">
                {isTrainer && (
                  <button 
                    onClick={() => setShowTraineeListOnMobile(true)}
                    className="lg:hidden p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl"
                  >
                    <ArrowLeft className={language === 'fa' ? 'rotate-0' : 'rotate-180'} />
                  </button>
                )}
                <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${
                  activeChannel === 'ai' ? 'bg-emerald-600' : isTrainer ? 'bg-amber-600' : 'bg-indigo-600'
                }`}>
                  {activeChannel === 'ai' ? <Sparkles size={24} /> : isTrainer && selectedChatTraineeId === 'broadcast' ? <Users size={24} /> : <User size={24} />}
                </div>
                <div>
                   <h1 className="text-xl lg:text-2xl font-black text-white italic truncate max-w-[150px] lg:max-w-none">
                     {isTrainer ? (selectedChatTraineeId === 'broadcast' ? t('ارسال همگانی', 'Broadcast Channel') : currentTrainee?.full_name || 'Select Athlete') : t('پیام‌رسان اختصاصی', 'Coaching Hub')}
                   </h1>
                   <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">
                        {activeChannel === 'ai' ? t('دستیار هوشمند', 'AI ACTIVE') : t('امن و مستقیم', 'SECURE')}
                      </p>
                   </div>
                </div>
             </div>
             
             {/* Sub-channel Toggle (Tabs) */}
             <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 shadow-inner">
                <button 
                  onClick={() => setActiveChannel('direct')}
                  className={`px-3 lg:px-6 py-2 rounded-xl text-[10px] lg:text-xs font-black transition-all flex items-center gap-2 ${
                    activeChannel === 'direct' ? (isTrainer ? 'bg-amber-600' : 'bg-indigo-600') + ' text-white shadow-lg scale-105' : 'text-slate-500'
                  }`}
                >
                  <MessageSquare size={14} />
                  <span className="hidden sm:inline">{isTrainer ? t('ارسال مستقیم', 'Direct') : t('مربی', 'Coach')}</span>
                </button>
                <button 
                  onClick={() => setActiveChannel('ai')}
                  className={`px-3 lg:px-6 py-2 rounded-xl text-[10px] lg:text-xs font-black transition-all flex items-center gap-2 ${
                    activeChannel === 'ai' ? 'bg-emerald-600 text-white shadow-lg scale-105' : 'text-slate-500'
                  }`}
                >
                  <Sparkles size={14} />
                  <span className="hidden sm:inline">{isTrainer ? t('مانیتورینگ AI', 'Monitor AI') : t('oko AI', 'oko AI')}</span>
                </button>
             </div>
           </div>
        </header>

        {/* Chat Bubbles */}
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-8 no-scrollbar scroll-smooth" ref={scrollRef}>
          {activeMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-6 opacity-40">
               <div className="w-20 h-20 bg-slate-800 rounded-[2rem] flex items-center justify-center shadow-inner">
                  {activeChannel === 'ai' ? <Sparkles size={40} /> : <MessageSquare size={40} />}
               </div>
               <div className="text-center space-y-1">
                 <p className="font-black text-base italic uppercase tracking-widest">{t('شروع گفتگو', 'Start a Pro Chat')}</p>
                 <p className="text-[10px] font-bold">{t('تمامی پیام‌ها بصورت کاملاً ایمن ذخیره می‌شوند.', 'Encrypted and secure.')}</p>
               </div>
            </div>
          ) : activeMessages.map((msg) => {
            const isMe = msg.sender === (isTrainer ? 'trainer' : 'user');
            const isIntervention = activeChannel === 'ai' && msg.sender === 'trainer';
            
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`flex gap-3 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xl ${
                    msg.sender === 'ai' ? 'bg-emerald-600' : 
                    msg.sender === 'trainer' ? 'bg-amber-600' : 'bg-indigo-600'
                  }`}>
                    {msg.sender === 'ai' ? <Sparkles size={16} /> : <User size={16} />}
                  </div>
                  <div className={`p-4 rounded-[1.8rem] text-sm leading-relaxed shadow-xl border relative ${
                    isMe 
                      ? isIntervention ? 'bg-amber-950/40 border-amber-500/50 text-amber-50 rounded-tr-none' : 'bg-slate-800 border-slate-700 text-white rounded-tr-none' 
                      : 'bg-slate-950/50 text-indigo-100 border-slate-800 rounded-tl-none'
                  }`}>
                    {isIntervention && (
                      <div className="flex items-center gap-1.5 mb-2 border-b border-amber-500/10 pb-2">
                        <ShieldCheck size={12} className="text-amber-500" />
                        <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest">{t('اصلاح مربی', 'Coach Edit')}</span>
                      </div>
                    )}
                    <div className="font-medium text-xs lg:text-sm">
                      {renderMessageContent(msg)}
                    </div>
                    <div className="flex items-center justify-end mt-2 pt-1 border-t border-white/5 opacity-30">
                      <span className="text-[9px] font-bold flex items-center gap-1">
                        {new Date(msg.timestamp).toLocaleTimeString(language === 'fa' ? 'fa-IR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-emerald-600/5 border border-emerald-500/20 p-4 rounded-[1.5rem] rounded-tl-none flex items-center gap-3 animate-pulse">
                <Loader2 className="animate-spin text-emerald-500" size={16} />
                <span className="text-xs text-emerald-500 font-black uppercase tracking-widest">{t('درحال آنالیز...', 'oko AI Thinking...') }</span>
              </div>
            </div>
          )}
        </div>

        {/* Media Preview Bar */}
        {mediaPreview && (
          <div className="px-6 py-3 bg-slate-800 border-t border-slate-700 flex items-center justify-between animate-in slide-in-from-bottom-full">
             <div className="flex items-center gap-4">
                <div className="relative">
                  {mediaPreview.type === 'image' ? <img src={mediaPreview.data} className="w-12 h-12 rounded-xl object-cover shadow-xl border border-indigo-500" /> : <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-50"><Mic size={24} /></div>}
                  <button onClick={() => setMediaPreview(null)} className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white p-1 rounded-full shadow-lg"><X size={10} /></button>
                </div>
                <p className="text-xs font-black text-white italic">{t('آماده ارسال', 'Ready to Send')}</p>
             </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-6 lg:p-8 bg-slate-900 border-t border-slate-800">
          <div className="max-w-4xl mx-auto flex items-end gap-3">
            <div className="flex-1 relative">
              {isRecording ? (
                <div className="w-full bg-rose-600/10 border-2 border-rose-500/30 rounded-[2rem] px-6 py-4 flex justify-between items-center animate-pulse">
                   <div className="flex items-center gap-3">
                     <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                     <span className="font-black text-rose-500 tracking-widest">{new Date(recordingTime * 1000).toISOString().substr(14, 5)}</span>
                   </div>
                   <button onClick={stopRecording} className="bg-rose-600 text-white px-6 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-xl">{t('توقف', 'Stop')}</button>
                </div>
              ) : (
                <div className="relative group">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={activeChannel === 'ai' ? t('پرسش از هوش مصنوعی...', 'Consult AI...') : t('پیام...', 'Message...')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-[1.8rem] px-14 py-5 text-white focus:ring-2 focus:ring-indigo-600 outline-none shadow-inner text-base font-medium transition-all group-focus-within:border-indigo-500"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex gap-1">
                     <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"><ImageIcon size={18} /></button>
                     <button onClick={startRecording} className="p-2.5 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"><Mic size={18} /></button>
                  </div>
                  <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageSelect} />
                  <button 
                    onClick={handleSend}
                    disabled={isLoading || (!input.trim() && !mediaPreview)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-3.5 rounded-2xl text-white shadow-2xl transition-all active:scale-90 ${
                      activeChannel === 'ai' ? 'bg-emerald-600' : isTrainer ? 'bg-amber-600' : 'bg-indigo-600'
                    } disabled:opacity-20`}
                  >
                    <Send size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
