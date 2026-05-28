import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Phone, Video, Info, Plus, Smile, Send } from 'lucide-react';

const Chat = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [selectedContactId, setSelectedContactId] = useState('elena');

  // Contact list state
  const [contacts, setContacts] = useState([
    {
      id: 'elena',
      name: 'Dr. Elena Moss',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120&h=120',
      statusText: 'Online Now',
      status: 'online',
      badge: 'ECO-SAGE',
      badgeType: 'orange'
    },
    {
      id: 'leo',
      name: 'Leo Aris',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120&h=120',
      statusText: 'Typing reforestation tips...',
      status: 'typing',
      hasMedal: true
    },
    {
      id: 'amara',
      name: 'Amara Vance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120',
      statusText: 'Ocean cleanup volunteer',
      status: 'online'
    }
  ]);

  // Message history state grouped by contact
  const [messages, setMessages] = useState({
    elena: [
      {
        id: 1,
        sender: {
          name: 'Dr. Elena Moss',
          avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120&h=120',
          badge: 'ECO-SAGE',
          badgeType: 'orange'
        },
        content: 'Exciting news! Our quarterly beach cleanup at Crystal Cove is set for this Saturday. I\'ve prepared a quick guide on reforestation tips for those staying inland too. 🌿',
        time: '10:24 AM',
        isMe: false
      },
      {
        id: 2,
        sender: {
          name: 'Arjun Mehta',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120',
          badge: 'CHAMPION',
          badgeType: 'green'
        },
        content: 'Count me in for Crystal Cove! Should I bring the heavy-duty biodegradable bags or do we have a supplier this time?',
        time: '10:26 AM',
        isMe: true
      },
      {
        id: 'divider-1',
        isDivider: true,
        content: 'TODAY, 10:30 AM'
      },
      {
        id: 3,
        sender: {
          name: 'Leo Aris',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120&h=120',
          hasMedal: true
        },
        content: 'Alex, the supplier is providing bags! Also, for the reforestation tips: remember to focus on mycorrhizal fungi soil inoculants. They increase seedling survival rates by 40%! 🍄',
        time: '10:32 AM',
        isMe: false
      }
    ],
    leo: [
      {
        id: 1,
        sender: {
          name: 'Leo Aris',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120&h=120',
          hasMedal: true
        },
        content: 'Hey Arjun! Did you check out the new reforestation project on the dashboard?',
        time: '09:15 AM',
        isMe: false
      },
      {
        id: 2,
        sender: {
          name: 'Arjun Mehta',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120',
          badge: 'CHAMPION',
          badgeType: 'green'
        },
        content: 'Hey Leo! Yes, the progress looks amazing. We\'ve already hit 60% of our planting goal!',
        time: '09:18 AM',
        isMe: true
      },
      {
        id: 3,
        sender: {
          name: 'Leo Aris',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120&h=120',
          hasMedal: true
        },
        content: 'Awesome! Let me know if you need help with the soil inoculants tips.',
        time: '09:20 AM',
        isMe: false
      }
    ],
    amara: [
      {
        id: 1,
        sender: {
          name: 'Amara Vance',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120'
        },
        content: 'Hi there! Are we still on for the ocean cleanup coordination meeting today?',
        time: '08:30 AM',
        isMe: false
      },
      {
        id: 2,
        sender: {
          name: 'Arjun Mehta',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120',
          badge: 'CHAMPION',
          badgeType: 'green'
        },
        content: 'Yes Amara, I\'ll be online at 2 PM. I\'ve compiled the volunteer sign-up list.',
        time: '08:35 AM',
        isMe: true
      },
      {
        id: 3,
        sender: {
          name: 'Amara Vance',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120'
        },
        content: 'Perfect, see you then! Thanks for organizing. 🌊',
        time: '08:37 AM',
        isMe: false
      }
    ]
  });

  const activeContact = contacts.find(c => c.id === selectedContactId);
  const activeMessages = messages[selectedContactId] || [];

  // Scroll to bottom on load and whenever active messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedContactId, activeMessages.length]);

  // Simulate typing & auto-response
  const triggerAutoResponse = (contactId) => {
    if (contactId === 'leo') {
      // Set status to typing
      setContacts(prev => prev.map(c => c.id === 'leo' ? { ...c, status: 'typing', statusText: 'Typing...' } : c));

      setTimeout(() => {
        const response = {
          id: Date.now() + 1,
          sender: {
            name: 'Leo Aris',
            avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120&h=120',
            hasMedal: true
          },
          content: 'That sounds perfect! Let\'s coordinate our efforts. I will prepare the seedling statistics and send them over. 🌱',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false
        };

        setMessages(prev => ({
          ...prev,
          leo: [...prev.leo, response]
        }));

        setContacts(prev => prev.map(c => c.id === 'leo' ? { ...c, status: 'typing', statusText: 'Typing reforestation tips...' } : c));
      }, 2500);
    } else if (contactId === 'elena') {
      setContacts(prev => prev.map(c => c.id === 'elena' ? { ...c, status: 'typing', statusText: 'Typing...' } : c));

      setTimeout(() => {
        const response = {
          id: Date.now() + 1,
          sender: {
            name: 'Dr. Elena Moss',
            avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=120&h=120',
            badge: 'ECO-SAGE',
            badgeType: 'orange'
          },
          content: 'Thank you for checking in! I will update the volunteer roster and email the details. See you on Saturday! 🌿',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false
        };

        setMessages(prev => ({
          ...prev,
          elena: [...prev.elena, response]
        }));

        setContacts(prev => prev.map(c => c.id === 'elena' ? { ...c, status: 'online', statusText: 'Online Now' } : c));
      }, 2500);
    } else if (contactId === 'amara') {
      setContacts(prev => prev.map(c => c.id === 'amara' ? { ...c, status: 'typing', statusText: 'Typing...' } : c));

      setTimeout(() => {
        const response = {
          id: Date.now() + 1,
          sender: {
            name: 'Amara Vance',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120&h=120'
          },
          content: 'Thanks! I\'ll check the list and print out the route maps. Let\'s do this! 🌊',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isMe: false
        };

        setMessages(prev => ({
          ...prev,
          amara: [...prev.amara, response]
        }));

        setContacts(prev => prev.map(c => c.id === 'amara' ? { ...c, status: 'online', statusText: 'Ocean cleanup volunteer' } : c));
      }, 2500);
    }
  };

  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const currentUserName = user?.username || 'Arjun Mehta';
    const currentUserAvatar = user?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120&h=120';

    const newMessage = {
      id: Date.now(),
      sender: {
        name: currentUserName,
        avatar: currentUserAvatar,
        badge: 'CHAMPION',
        badgeType: 'green'
      },
      content: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };

    setMessages(prev => ({
      ...prev,
      [selectedContactId]: [...prev[selectedContactId], newMessage]
    }));

    const sentTo = selectedContactId;
    setInputValue('');

    // Trigger auto-response after sending
    setTimeout(() => {
      triggerAutoResponse(sentTo);
    }, 1000);
  };

  return (
    <div className="h-full flex bg-[#0f111a] text-slate-100 font-sans" style={{ minHeight: 'calc(100vh - 64px)' }}>
      {/* ─── DIRECT MESSAGES SIDEBAR ─── */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-[#0b0c14] border-r border-white/5">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#58646e]">
            Direct Messages
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {contacts.map((c) => {
            const isActive = c.id === selectedContactId;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedContactId(c.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-left cursor-pointer ${
                  isActive ? 'bg-[#181926] text-white shadow-sm' : 'hover:bg-[#131420] text-slate-400 hover:text-slate-200'
                }`}
              >
                {/* Avatar with Status Indicator */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#0b0c14] ${
                      c.status === 'typing'
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm truncate">{c.name}</span>
                    {c.badge && (
                      <span className="bg-[#2d241e] border border-[#d97706]/20 text-[#f59e0b] text-[8px] font-bold px-1.5 py-0.5 rounded leading-none">
                        {c.badge}
                      </span>
                    )}
                    {c.hasMedal && (
                      <span className="text-xs" role="img" aria-label="medal">🥇</span>
                    )}
                  </div>
                  <p
                    className={`text-xs truncate mt-0.5 ${
                      c.status === 'typing'
                        ? 'text-amber-400 font-medium italic'
                        : 'text-[#58646e]'
                    }`}
                  >
                    {c.statusText}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── CHAT CONVERSATION WINDOW ─── */}
      <div className="flex-1 flex flex-col bg-[#12131e] min-w-0 relative">
        {/* Chat Header */}
        <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center">
            {/* Active Contact Avatar */}
            {activeContact && (
              <>
                <div className="relative mr-3 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10">
                    <img
                      src={activeContact.avatar}
                      alt={activeContact.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#12131e] ${
                      activeContact.status === 'typing'
                        ? 'bg-amber-500 animate-pulse'
                        : 'bg-emerald-500'
                    }`}
                  />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {activeContact.name}
                  </h3>
                  <p
                    className={`text-[11px] mt-0.5 font-medium ${
                      activeContact.status === 'typing'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {activeContact.status === 'typing' ? 'Typing...' : 'Online Now'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-5">
            <button className="text-slate-400 hover:text-white transition duration-200" title="Voice Call">
              <Phone className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-white transition duration-200" title="Video Call">
              <Video className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-white transition duration-200" title="View Info">
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {activeMessages.map((m, idx) => {
            if (m.isDivider) {
              return (
                <div key={m.id || idx} className="flex justify-center my-6">
                  <span className="bg-[#181a28] border border-white/5 text-slate-400 text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-full uppercase">
                    {m.content}
                  </span>
                </div>
              );
            }

            if (m.isMe) {
              return (
                <div key={m.id || idx} className="flex flex-col items-end w-full">
                  {/* Sender Header */}
                  <div className="flex items-center gap-2 mb-1.5 mr-1">
                    <span className="bg-[#132c21] border border-emerald-500/20 text-[#34d399] text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase">
                      {m.sender.badge}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-300">
                      {m.sender.name}
                    </span>
                    {/* Circle green YOU avatar */}
                    <div className="bg-[#1d4333] text-[#4ade80] text-[9px] font-extrabold w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0">
                      YOU
                    </div>
                  </div>

                  {/* Message Bubble */}
                  <div className="bg-[#162d24] border border-emerald-500/10 text-[#4ade80] text-sm px-4 py-3 rounded-2xl rounded-tr-none leading-relaxed shadow-md max-w-[70%]">
                    {m.content}
                  </div>

                  {/* Timestamp */}
                  <span className="text-[9px] text-slate-500 mt-1 pr-1">
                    {m.time}
                  </span>
                </div>
              );
            }

            // Other sender
            return (
              <div key={m.id || idx} className="flex items-start gap-3 w-full max-w-[75%]">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                  <img
                    src={m.sender.avatar}
                    alt={m.sender.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content Area */}
                <div>
                  {/* Sender Header */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[11px] font-semibold text-slate-300">
                      {m.sender.name}
                    </span>
                    {m.sender.badge && (
                      <span className="bg-[#2d241e] border border-[#d97706]/30 text-[#f59e0b] text-[9px] font-bold tracking-wider px-2 py-0.5 rounded-md uppercase leading-none">
                        {m.sender.badge}
                      </span>
                    )}
                    {m.sender.hasMedal && (
                      <span className="text-xs" role="img" aria-label="medal">🥇</span>
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div className="bg-[#1c1e2e] text-slate-200 text-sm px-4 py-3 rounded-2xl rounded-tl-none leading-relaxed border border-white/5 shadow-md">
                    {m.content}
                  </div>

                  {/* Timestamp */}
                  <p className="text-[9px] text-slate-500 mt-1 pl-1">
                    {m.time}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Message Input Bar */}
        <div className="p-4 bg-[#12131e] border-t border-white/5 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-[#1c1e2e] border border-white/5 rounded-full px-4 py-1.5">
            {/* Attachment Button */}
            <button
              type="button"
              className="w-10 h-10 rounded-full bg-[#222436] border border-white/10 flex items-center justify-center text-slate-300 hover:bg-slate-700 hover:text-white transition flex-shrink-0"
              title="Add attachment"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Input */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Share an eco-tip or message..."
              className="flex-1 bg-transparent border-none outline-none text-white px-2 placeholder-slate-500 text-sm py-2.5"
            />

            {/* Emoji Button */}
            <button
              type="button"
              className="text-slate-400 hover:text-white transition flex-shrink-0 p-1"
              title="Insert Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              className="w-10 h-10 rounded-full bg-[#34d399] flex items-center justify-center text-black hover:opacity-90 hover:scale-105 transition flex-shrink-0"
              title="Send message"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
