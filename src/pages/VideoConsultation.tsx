import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, onSnapshot, collection, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Video, Mic, MicOff, VideoOff, PhoneOff, Send, User, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function VideoConsultation() {
  const { appointmentId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!appointmentId) return;

    const unsubscribeAppt = onSnapshot(doc(db, 'appointments', appointmentId), async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setAppointment({ id: snapshot.id, ...data });
        
        // Fetch the other user
        const otherId = profile?.role === 'doctor' ? data.patientId : data.doctorId;
        const uSnap = await getDoc(doc(db, 'users', otherId));
        if (uSnap.exists()) setOtherUser(uSnap.data());
        
        if (data.status === 'completed') {
          alert('Consultation has ended.');
          navigate('/dashboard');
        }
      }
      setLoading(false);
    });

    const q = query(
      collection(db, 'appointments', appointmentId, 'messages'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => doc.data()));
    });

    return () => {
      unsubscribeAppt();
      unsubscribeMessages();
    };
  }, [appointmentId, profile, navigate]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !appointmentId) return;
    
    await addDoc(collection(db, 'appointments', appointmentId, 'messages'), {
      text: newMessage,
      senderId: user.uid,
      senderName: profile?.name,
      createdAt: new Date().toISOString(),
    });
    setNewMessage('');
  };

  const handleEndCall = async () => {
    if (!appointmentId) return;
    if (profile?.role === 'doctor') {
      if (window.confirm('Are you sure you want to end this consultation and mark it as completed?')) {
        await updateDoc(doc(db, 'appointments', appointmentId), { status: 'completed' });
        navigate('/dashboard');
      }
    } else {
      navigate('/dashboard');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading Consultation...</div>;
  if (!appointment || !otherUser) return <div className="text-center py-20">Consultation not found.</div>;

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col lg:flex-row gap-8">
      {/* Video Area */}
      <div className="flex-1 bg-slate-900 rounded-[3rem] overflow-hidden relative shadow-2xl">
        {/* Main Video (Remote) */}
        <div className="w-full h-full flex items-center justify-center bg-slate-800 relative">
          {isVideoOn ? (
            <img 
              src={`https://picsum.photos/seed/${otherUser.uid}/1280/720`} 
              alt="Remote Stream" 
              className="w-full h-full object-cover opacity-80"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="text-center space-y-4">
              <div className="w-32 h-32 bg-slate-700 rounded-full flex items-center justify-center mx-auto text-slate-500">
                <User size={64} />
              </div>
              <p className="text-slate-400 font-bold">{otherUser.name}'s video is off</p>
            </div>
          )}
          
          <div className="absolute top-8 left-8 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl text-white font-bold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Live: {otherUser.name}
          </div>
        </div>

        {/* Self Video (Local) */}
        <div className="absolute bottom-24 right-8 w-48 h-32 bg-slate-700 rounded-2xl border-2 border-slate-600 overflow-hidden shadow-xl">
          <img 
            src={`https://picsum.photos/seed/${user?.uid}/400/300`} 
            alt="My Stream" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-0.5 rounded text-[10px] text-white font-bold">You</div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-xl p-4 rounded-[2rem] border border-white/10">
          <button 
            onClick={() => setIsMicOn(!isMicOn)}
            className={`p-4 rounded-2xl transition-all ${isMicOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white'}`}
          >
            {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
          <button 
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`p-4 rounded-2xl transition-all ${isVideoOn ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-red-500 text-white'}`}
          >
            {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
          </button>
          <button 
            onClick={handleEndCall}
            className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-2xl transition-all shadow-lg shadow-red-900/40"
          >
            <PhoneOff size={24} />
          </button>
          {profile?.role === 'doctor' && (
            <button 
              onClick={handleEndCall}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-2xl font-bold transition-all flex items-center gap-2"
            >
              <CheckCircle2 size={20} /> End & Complete
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-full lg:w-96 bg-white rounded-[3rem] border border-slate-100 shadow-xl flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
            <MessageSquare size={20} />
          </div>
          <h3 className="font-bold text-slate-900">Consultation Chat</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {messages.length > 0 ? messages.map((msg, i) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${
                  isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-700 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 font-bold uppercase">
                  {isMe ? 'You' : msg.senderName} • {format(new Date(msg.createdAt), 'hh:mm a')}
                </span>
              </div>
            );
          }) : (
            <div className="text-center py-10 space-y-4">
              <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <MessageSquare size={20} />
              </div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Start the conversation</p>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-6 bg-slate-50 border-t border-slate-100 flex gap-2">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
          <button className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
