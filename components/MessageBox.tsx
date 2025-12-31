
import React, { useState } from 'react';
import { MOCK_EMPLOYEES, MOCK_LETTER_TEMPLATES, MOCK_CANDIDATES } from '../constants';
import { Message, EmailIntegration, Role } from '../types';
import { Inbox, Send, Edit, FileText, Search, Plus, CheckCircle, Mail, AlertCircle, Bot, Sparkles, Loader2, Trash2, Printer, Star, Reply } from 'lucide-react';
import { draftProfessionalEmail } from '../services/geminiService';
import { useToast } from '../context/ToastContext';

interface MessageBoxProps {
  role: Role;
  messages: Message[];
  onSendMessage: (msg: Message) => void;
  onMarkAsRead: (id: string) => void;
}

const MessageBox: React.FC<MessageBoxProps> = ({ role, messages, onSendMessage, onMarkAsRead }) => {
  const { showToast } = useToast();
  const isAdmin = role === Role.COMPANY_ADMIN || role === Role.HR_ADMIN;
  // Mock logged in user ID. If Admin, 'admin'. If Employee, 'e1' (Jane Doe)
  const currentUserId = isAdmin ? 'admin' : 'e1'; 
  const currentUserName = isAdmin ? 'HR Admin' : 'Jane Doe';

  const [activeView, setActiveView] = useState<'inbox' | 'sent' | 'drafts' | 'templates'>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  // Integration State
  const [integrations, setIntegrations] = useState<EmailIntegration[]>([
    { provider: 'SMTP', email: 'hr@talentflow.ai', status: 'Connected', lastSync: 'Just now' }
  ]);
  const [showIntegrations, setShowIntegrations] = useState(false);

  // Compose State
  const [recipientType, setRecipientType] = useState<'employee' | 'candidate' | 'admin'>('employee');
  const [recipientId, setRecipientId] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  
  // AI Drafting State
  const [showAiDraft, setShowAiDraft] = useState(false);
  const [aiTopic, setAiTopic] = useState('');
  const [aiTone, setAiTone] = useState('Professional');
  const [aiPoints, setAiPoints] = useState('');
  const [isDrafting, setIsDrafting] = useState(false);

  // Filter messages based on current user
  const inboxMessages = messages.filter(m => m.recipientId === currentUserId).sort((a,b) => b.date.localeCompare(a.date));
  const sentMessages = messages.filter(m => m.senderId === currentUserId).sort((a,b) => b.date.localeCompare(a.date));

  const handleConnectProvider = (provider: 'Gmail' | 'Outlook') => {
    // Simulation
    const newInt: EmailIntegration = {
      provider,
      email: provider === 'Gmail' ? 'hr.admin@gmail.com' : 'hr@company.outlook.com',
      status: 'Connected',
      lastSync: 'Syncing...'
    };
    setIntegrations([...integrations, newInt]);
    setTimeout(() => {
      setIntegrations(prev => prev.map(i => i.provider === provider ? { ...i, lastSync: 'Just now' } : i));
      showToast(`${provider} connected successfully`, 'success');
    }, 2000);
  };

  const handleStartCompose = () => {
    setIsComposing(true); 
    setSelectedMessage(null);
    setSubject('');
    setBody('');
    setRecipientId('');
    if (!isAdmin) {
      // If employee, auto-select Admin as recipient
      setRecipientType('admin');
      setRecipientId('admin');
    }
  };

  const handleReply = () => {
    if (!selectedMessage) return;
    setIsComposing(true);
    
    // Determine Recipient
    if (isAdmin) {
        // If Admin is replying, check if sender was employee or candidate
        if (selectedMessage.senderId.startsWith('c')) {
            setRecipientType('candidate');
        } else {
            setRecipientType('employee');
        }
        setRecipientId(selectedMessage.senderId);
    } else {
        // If Employee is replying, it's usually to Admin
        setRecipientType('admin');
        setRecipientId('admin');
    }

    setSubject(`RE: ${selectedMessage.subject}`);
    setBody(`\n\n-------------------\nFrom: ${selectedMessage.senderName}\nSent: ${selectedMessage.date}\n\n${selectedMessage.body}`);
    setSelectedMessage(null);
  };

  const handleSelectMessage = (msg: Message) => {
      setSelectedMessage(msg);
      setIsComposing(false);
      if (!msg.isRead) {
          onMarkAsRead(msg.id);
      }
  };

  const handleAiDraft = async () => {
    if (!aiTopic) return;
    setIsDrafting(true);
    
    // Find recipient name
    let recipientName = 'Recipient';
    if (recipientId === 'admin') {
      recipientName = 'HR Department';
    } else if (recipientId) {
       recipientName = recipientType === 'employee' 
          ? MOCK_EMPLOYEES.find(e => e.id === recipientId)?.name || 'Employee'
          : MOCK_CANDIDATES.find(c => c.id === recipientId)?.name || 'Candidate';
    }

    try {
       const result = await draftProfessionalEmail(recipientName, aiTopic, aiTone, aiPoints);
       setSubject(result.subject);
       setBody(result.body);
       setShowAiDraft(false);
       showToast('Draft generated successfully', 'success');
    } catch (e) {
       showToast("Failed to draft email. Please try again.", 'error');
    } finally {
       setIsDrafting(false);
    }
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = MOCK_LETTER_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    let targetUser: any = null;
    
    if (recipientId === 'admin') {
       // Using current user data for placeholders if sending to admin (e.g. employee requesting a letter)
       targetUser = MOCK_EMPLOYEES.find(e => e.id === currentUserId);
    } else {
       targetUser = recipientType === 'employee' 
        ? MOCK_EMPLOYEES.find(e => e.id === recipientId)
        : MOCK_CANDIDATES.find(c => c.id === recipientId);
    }

    if (!targetUser) {
      // Fallback
      targetUser = { name: '[Name]', role: '[Role]', salary: 0, currency: 'USD', joinDate: '[Date]' };
    }

    const name = targetUser.name;
    const role = targetUser.role;
    const salary = targetUser.salary || 0; 
    const currency = targetUser.currency || 'USD';
    const joinDate = targetUser.joinDate || 'TBD';

    const newSubject = template.subject.replace('{{name}}', name).replace('{{role}}', role);
    const newBody = template.bodyTemplate
      .replace('{{name}}', name)
      .replace('{{role}}', role)
      .replace('{{joinDate}}', joinDate)
      .replace('{{salary}}', salary.toLocaleString())
      .replace('{{currency}}', currency);

    setSubject(newSubject);
    setBody(newBody);
    showToast('Template applied', 'info');
  };

  const handleSend = () => {
    if (!recipientId || !subject || !body) return;

    let recipientName = 'Unknown';
    if (recipientId === 'admin') {
      recipientName = 'HR Admin';
    } else {
       recipientName = recipientType === 'employee' 
         ? MOCK_EMPLOYEES.find(e => e.id === recipientId)?.name || 'Unknown'
         : MOCK_CANDIDATES.find(c => c.id === recipientId)?.name || 'Unknown';
    }

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUserId,
      senderName: currentUserName,
      recipientId,
      recipientName,
      subject,
      body,
      date: new Date().toISOString().split('T')[0],
      isRead: false,
      type: isAdmin ? 'Letter' : 'General'
    };

    onSendMessage(newMessage);
    setIsComposing(false);
    setRecipientId('');
    setSubject('');
    setBody('');
    setActiveView('sent');
    showToast('Message sent successfully', 'success');
  };

  const menuItems = [
    { id: 'inbox', label: 'Inbox', icon: <Inbox size={18} />, count: inboxMessages.filter(m => !m.isRead).length },
    { id: 'sent', label: 'Sent', icon: <Send size={18} /> },
    { id: 'drafts', label: 'Drafts', icon: <FileText size={18} /> },
  ];

  if (isAdmin) {
    menuItems.push({ id: 'templates', label: 'Templates', icon: <Sparkles size={18} /> });
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* 1. Sidebar Navigation */}
      <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col">
         <div className="p-4">
            <button 
              onClick={handleStartCompose}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Edit size={18} /> {isAdmin ? 'New Email' : 'Contact HR'}
            </button>
         </div>

         <nav className="flex-1 px-3 space-y-1">
            {menuItems.map(item => (
               <button 
                 key={item.id}
                 onClick={() => { setActiveView(item.id as any); setIsComposing(false); setSelectedMessage(null); }}
                 className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeView === item.id ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-600 hover:bg-slate-200/50'
                 }`}
               >
                  <div className="flex items-center gap-3">
                     {item.icon} {item.label}
                  </div>
                  {item.count ? (
                     <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{item.count}</span>
                  ) : null}
               </button>
            ))}
         </nav>

         {isAdmin && (
           <div className="p-4 border-t border-slate-200">
              <div className="flex justify-between items-center mb-3">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Integrations</h3>
                 <button onClick={() => setShowIntegrations(!showIntegrations)} className="text-indigo-600 hover:text-indigo-800">
                    <Plus size={14} />
                 </button>
              </div>
              
              <div className="space-y-2">
                 {integrations.map((int, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-700 bg-white p-2 rounded border border-slate-200">
                       <div className={`w-2 h-2 rounded-full ${int.status === 'Connected' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                       <span className="truncate flex-1">{int.provider}</span>
                       <span className="text-[10px] text-slate-400">{int.lastSync}</span>
                    </div>
                 ))}
                 {showIntegrations && (
                    <div className="mt-2 space-y-2 animate-in slide-in-from-bottom-2">
                       <button onClick={() => handleConnectProvider('Gmail')} className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded text-xs font-medium hover:bg-slate-50">
                          <Mail className="text-red-500" size={14} /> Connect Gmail
                       </button>
                       <button onClick={() => handleConnectProvider('Outlook')} className="w-full flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded text-xs font-medium hover:bg-slate-50">
                          <Mail className="text-blue-500" size={14} /> Connect Outlook
                       </button>
                    </div>
                 )}
              </div>
           </div>
         )}
      </div>

      {/* 2. Message List */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-white">
         <div className="p-4 border-b border-slate-100">
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input 
                 type="text" 
                 placeholder="Search mail..."
                 className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
               />
            </div>
         </div>
         <div className="flex-1 overflow-y-auto">
            {(activeView === 'inbox' ? inboxMessages : sentMessages).map(msg => (
               <div 
                 key={msg.id}
                 onClick={() => handleSelectMessage(msg)}
                 className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors ${selectedMessage?.id === msg.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}
               >
                  <div className="flex justify-between items-start mb-1">
                     <h4 className={`text-sm truncate max-w-[140px] ${!msg.isRead && activeView === 'inbox' ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {activeView === 'inbox' ? msg.senderName : msg.recipientName}
                     </h4>
                     <span className="text-xs text-slate-400 whitespace-nowrap">{msg.date}</span>
                  </div>
                  <p className={`text-sm truncate mb-1 ${!msg.isRead && activeView === 'inbox' ? 'font-semibold text-slate-800' : 'text-slate-600'}`}>
                     {msg.subject}
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-2">{msg.body}</p>
               </div>
            ))}
            {(activeView === 'inbox' ? inboxMessages : sentMessages).length === 0 && (
               <div className="p-8 text-center text-slate-400 text-sm">
                  <Inbox size={32} className="mx-auto mb-2 opacity-50" />
                  No messages found
               </div>
            )}
         </div>
      </div>

      {/* 3. Reading / Compose Pane */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
         {isComposing ? (
            <div className="flex-1 flex flex-col overflow-hidden">
               {/* Compose Header */}
               <div className="px-6 py-4 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                     {isAdmin ? 'New Message' : 'Contact HR'}
                     {showAiDraft && <span className="text-xs font-normal text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full flex items-center gap-1"><Bot size={12} /> AI Drafting Active</span>}
                  </h2>
                  <div className="flex gap-2">
                     <button onClick={() => setIsComposing(false)} className="text-slate-500 hover:text-slate-700 px-3 py-1.5 text-sm">Discard</button>
                     <button 
                       onClick={handleSend}
                       disabled={!recipientId || !subject || !body}
                       className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50"
                     >
                        <Send size={16} /> Send
                     </button>
                  </div>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-4xl mx-auto space-y-4 bg-white p-8 rounded-xl shadow-sm border border-slate-200">
                     
                     {/* AI Toolbar */}
                     {showAiDraft ? (
                        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6 animate-in slide-in-from-top-2">
                           <div className="flex justify-between items-center mb-3">
                              <h3 className="text-sm font-bold text-indigo-900 flex items-center gap-2"><Sparkles size={16} /> AI Email Drafter</h3>
                              <button onClick={() => setShowAiDraft(false)} className="text-indigo-400 hover:text-indigo-600"><AlertCircle size={16} className="rotate-45" /></button>
                           </div>
                           <div className="grid grid-cols-2 gap-4 mb-3">
                              <input 
                                 placeholder="Topic (e.g. Leave Request)" 
                                 value={aiTopic}
                                 onChange={(e) => setAiTopic(e.target.value)}
                                 className="px-3 py-2 rounded border border-indigo-200 text-sm focus:ring-2 focus:ring-indigo-500"
                              />
                              <select 
                                 value={aiTone}
                                 onChange={(e) => setAiTone(e.target.value)}
                                 className="px-3 py-2 rounded border border-indigo-200 text-sm focus:ring-2 focus:ring-indigo-500"
                              >
                                 <option>Professional</option>
                                 <option>Enthusiastic</option>
                                 <option>Formal</option>
                                 <option>Empathetic</option>
                                 <option>Stern</option>
                              </select>
                           </div>
                           <textarea 
                              placeholder="Key points to include..."
                              value={aiPoints}
                              onChange={(e) => setAiPoints(e.target.value)}
                              className="w-full px-3 py-2 rounded border border-indigo-200 text-sm mb-3 h-20 resize-none focus:ring-2 focus:ring-indigo-500"
                           />
                           <button 
                              onClick={handleAiDraft}
                              disabled={isDrafting || !aiTopic}
                              className="w-full bg-indigo-600 text-white py-2 rounded font-medium text-sm hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2"
                           >
                              {isDrafting ? <Loader2 className="animate-spin" size={16} /> : <Bot size={16} />} 
                              Generate Draft
                           </button>
                        </div>
                     ) : (
                        <div className="flex gap-2 mb-4">
                           <button onClick={() => setShowAiDraft(true)} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors">
                              <Bot size={14} /> Draft with AI
                           </button>
                           
                           {/* Only Admin or employees sending formal requests need templates */}
                           <div className="relative group">
                              <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors border border-slate-200">
                                 <FileText size={14} /> Use Template
                              </button>
                              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg hidden group-hover:block z-20">
                                 {MOCK_LETTER_TEMPLATES.map(t => (
                                    <button 
                                       key={t.id}
                                       onClick={() => handleApplyTemplate(t.id)}
                                       className="block w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 truncate"
                                    >
                                       {t.title}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </div>
                     )}

                     {/* Recipients */}
                     <div className="flex gap-4">
                        {isAdmin ? (
                           <>
                              <div className="w-1/3">
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                                 <select 
                                    value={recipientType}
                                    onChange={(e) => setRecipientType(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50"
                                 >
                                    <option value="employee">Employee</option>
                                    <option value="candidate">Candidate</option>
                                 </select>
                              </div>
                              <div className="flex-1">
                                 <label className="block text-xs font-bold text-slate-500 uppercase mb-1">To</label>
                                 <select 
                                    value={recipientId}
                                    onChange={(e) => setRecipientId(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                                 >
                                    <option value="">Select Recipient...</option>
                                    {recipientType === 'employee' 
                                       ? MOCK_EMPLOYEES.map(e => <option key={e.id} value={e.id}>{e.name} - {e.role}</option>)
                                       : MOCK_CANDIDATES.map(c => <option key={c.id} value={c.id}>{c.name} - {c.role}</option>)
                                    }
                                 </select>
                              </div>
                           </>
                        ) : (
                           <div className="flex-1">
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">To</label>
                              <div className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-slate-100 text-slate-700 font-medium flex items-center gap-2">
                                 <CheckCircle size={14} className="text-emerald-500" /> HR Administration
                              </div>
                           </div>
                        )}
                     </div>

                     {/* Subject */}
                     <div>
                        <input 
                           placeholder="Subject"
                           value={subject}
                           onChange={(e) => setSubject(e.target.value)}
                           className="w-full px-0 py-2 border-b border-slate-200 text-lg font-bold text-slate-800 focus:outline-none focus:border-indigo-500 placeholder:font-normal placeholder:text-slate-300"
                        />
                     </div>

                     {/* Editor */}
                     <textarea 
                        placeholder="Write your message here..."
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="w-full h-96 resize-none focus:outline-none text-slate-700 leading-relaxed text-sm font-sans"
                     />
                  </div>
               </div>
            </div>
         ) : selectedMessage ? (
            /* Reading Pane */
            <div className="flex-1 flex flex-col h-full bg-white">
               {/* Header Toolbar */}
               <div className="px-6 py-3 border-b border-slate-200 flex justify-between items-center bg-white sticky top-0 z-10">
                  <div className="flex gap-3">
                     <button onClick={handleReply} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full" title="Reply">
                        <Reply size={18} />
                     </button>
                     <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full" title="Print">
                        <Printer size={18} />
                     </button>
                     <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full" title="Delete">
                        <Trash2 size={18} />
                     </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                     <span>{selectedMessage.date}</span>
                     <Star size={16} className="text-slate-300 hover:text-yellow-400 cursor-pointer" />
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  <div className="max-w-3xl mx-auto">
                     {/* Subject & Metadata */}
                     <h1 className="text-2xl font-bold text-slate-900 mb-6">{selectedMessage.subject}</h1>
                     
                     <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                              {selectedMessage.senderName.charAt(0)}
                           </div>
                           <div>
                              <div className="font-bold text-slate-900">{selectedMessage.senderName}</div>
                              <div className="text-xs text-slate-500">From: {selectedMessage.senderId === 'admin' ? 'hr@talentflow.ai' : 'user@example.com'}</div>
                              <div className="text-xs text-slate-500">To: {selectedMessage.recipientName}</div>
                           </div>
                        </div>
                        {selectedMessage.type === 'Letter' && (
                           <div className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-bold flex items-center gap-1">
                              <FileText size={12} /> Official Letter
                           </div>
                        )}
                     </div>

                     {/* Content */}
                     <div className={`prose prose-slate max-w-none text-sm leading-relaxed ${selectedMessage.type === 'Letter' ? 'font-serif text-slate-800' : 'font-sans text-slate-600'}`}>
                        {selectedMessage.type === 'Letter' && (
                           <div className="mb-8 text-center border-b-2 border-slate-800 pb-4">
                              <h2 className="text-xl font-bold uppercase tracking-widest text-slate-900 m-0">TalentFlow AI</h2>
                              <p className="text-xs text-slate-500 m-0 mt-1">Human Resources Department • New York, NY</p>
                           </div>
                        )}
                        
                        <div className="whitespace-pre-wrap">
                           {selectedMessage.body}
                        </div>

                        {selectedMessage.type === 'Letter' && (
                           <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-end">
                              <div>
                                 {/* Signature Placeholder */}
                                 <div className="h-12 w-32 mb-2 font-script text-2xl text-slate-400 italic">Signed</div>
                                 <p className="font-bold text-slate-900">HR Administration</p>
                                 <p className="text-xs text-slate-500">TalentFlow AI Inc.</p>
                              </div>
                              <div className="w-24 h-24 border-4 border-slate-200 rounded-full flex items-center justify-center opacity-20 rotate-12">
                                 <span className="text-xs font-bold uppercase text-center">Official<br/>Seal</span>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
               <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <Mail size={32} className="text-indigo-200" />
               </div>
               <h3 className="text-lg font-semibold text-slate-600">Official Mail Portal</h3>
               <p className="max-w-xs text-center text-sm mt-2">
                 {isAdmin ? 'Select a conversation to read or compose a new official letter.' : 'View your official correspondence and contact HR directly.'}
               </p>
            </div>
         )}
      </div>
    </div>
  );
};

export default MessageBox;