import React, { useState, useRef, useEffect } from "react";
import { useDatabase } from "../context/DatabaseContext";
import { useAuth } from "../App";
import { Search, Send, MoreVertical, Phone, Video, GraduationCap, UserRound, CheckCircle2 } from "lucide-react";

export function Chat() {
  const { messages, addMessage, teachers, students } = useDatabase();
  const { profile } = useAuth();
  
  const isStudent = profile?.role === "student";
  const isTeacher = profile?.role === "teacher";
  const isAdmin = profile?.role === "admin";
  
  const meAsTeacher = teachers.find(t => t.email === profile?.email || t.name === profile?.displayName);
  const meAsStudent = students.find(s => s.email === profile?.email || s.name === profile?.displayName);
  const myId = meAsTeacher?.id || meAsStudent?.id || profile?.uid || (isStudent ? "S001" : "T001"); 
  const myName = profile?.displayName || "Me";
  
  // Logic: 
  // Student -> sees ONLY Teachers.
  // Teacher -> sees Teachers AND Students.
  // Admin -> sees Teachers AND Students.
  // (Note: Admins are deliberately NOT in `teachers` nor `students` arrays, 
  // preventing Students/Teachers from direct-messaging them. But Admins CAN see & message them).
  let availableContacts: any[] = [];
  if (isStudent) {
    availableContacts = teachers.filter(c => c.id !== myId);
  } else if (isTeacher || isAdmin) {
    availableContacts = [...teachers, ...students].filter(c => c.id !== myId);
  }
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-select first contact if none selected
  useEffect(() => {
    if (!activeContactId && availableContacts.length > 0) {
      setActiveContactId(availableContacts[0].id);
    }
  }, [availableContacts, activeContactId]);

  if (searchQuery.trim() !== "") {
    availableContacts = availableContacts.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ("department" in c ? c.department : c.course)?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeContactId]);

  const activeContact = availableContacts.find(c => c.id === activeContactId);
  
  // Filter messages for current conversation
  const myConversation = messages.filter(
    m => (m.senderId === myId && m.receiverId === activeContactId) || 
         (m.senderId === activeContactId && m.receiverId === myId)
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeContactId) return;

    try {
      await addMessage({
        id: "M" + Date.now(),
        senderId: myId,
        senderName: myName, // Ensure my real profile name gets injected
        receiverId: activeContactId,
        text: inputText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      });
      setInputText("");
    } catch(err) {
      console.error("Firestore message failure", err);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden h-[calc(100vh-8rem)] flex shadow-xl">
      {/* Sidebar: Contact List */}
      <div className="w-80 border-r border-zinc-800 flex flex-col bg-zinc-950/50">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold text-zinc-100 mb-4">Messages</h2>
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..." 
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto w-full">
          {availableContacts.length === 0 ? (
            <div className="p-6 text-center text-sm text-zinc-500">No contacts available.</div>
          ) : availableContacts.map((contact) => {
            const isContactTeacher = "department" in contact;
            return (
              <button 
                key={contact.id}
                onClick={() => setActiveContactId(contact.id)}
                className={`w-full p-4 flex items-center gap-3 transition-colors border-b border-zinc-800/50 ${
                  activeContactId === contact.id ? 'bg-zinc-800/80' : 'hover:bg-zinc-900'
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 text-emerald-500">
                    {isContactTeacher ? <GraduationCap className="w-6 h-6" /> : <UserRound className="w-6 h-6" />}
                  </div>
                  {contact.status === 'Active' && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-zinc-900 rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-sm font-semibold text-zinc-100 truncate">{contact.name}</h3>
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{isContactTeacher ? (contact as any).department : (contact as any).course}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeContact ? (
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-900">
          {/* Header */}
          <div className="py-4 px-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 text-emerald-500">
                {"department" in activeContact ? <GraduationCap className="w-5 h-5" /> : <UserRound className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-semibold text-zinc-100">{activeContact.name}</h3>
                <p className="text-xs text-emerald-500 font-medium">Active Now</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {myConversation.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex flex-col items-center justify-center">
                  <Send className="w-6 h-6 rotate-45 text-zinc-600" />
                </div>
                <p>Say hello to start the conversation!</p>
              </div>
            ) : myConversation.map((msg) => {
              const isMine = msg.senderId === myId;
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                    isMine 
                      ? 'bg-emerald-500 text-zinc-950 rounded-tr-none' 
                      : 'bg-zinc-800 text-zinc-100 rounded-tl-none border border-zinc-700/50'
                  }`}>
                    {!isMine && <div className="text-xs text-emerald-400 font-medium mb-1">{msg.senderName}</div>}
                    <p className={`text-sm ${isMine ? 'font-medium' : ''}`}>{msg.text}</p>
                    <div className={`text-[10px] mt-2 flex items-center gap-1 ${isMine ? 'text-zinc-800 justify-end' : 'text-zinc-500 justify-start'}`}>
                      {msg.time}
                      {isMine && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-zinc-950/50 border-t border-zinc-800">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message..." 
                className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-zinc-950 p-3 rounded-xl transition-colors flex items-center justify-center"
              >
                <Send className="w-5 h-5 ml-1" />
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-900 items-center justify-center">
          <p className="text-zinc-500">Select a contact to start messaging.</p>
        </div>
      )}
    </div>
  );
}
