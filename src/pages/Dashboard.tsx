import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import AppointmentCard from '../components/AppointmentCard';
import { LayoutDashboard, Calendar, Users, Settings, CreditCard, Activity, CheckCircle2 } from 'lucide-react';
import { Appointment } from '../types';

export default function Dashboard() {
  const { profile } = useAuth();
  const location = useLocation();

  const sidebarLinks = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Appointments', path: '/dashboard/appointments', icon: Calendar },
    { label: 'Profile', path: '/dashboard/profile', icon: Settings },
  ];

  if (profile?.role === 'doctor') {
    sidebarLinks.splice(2, 0, { label: 'Patients', path: '/dashboard/patients', icon: Users });
    sidebarLinks.splice(3, 0, { label: 'Earnings', path: '/dashboard/earnings', icon: CreditCard });
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar */}
      <aside className="lg:w-64 space-y-2">
        {sidebarLinks.map(link => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${
                isActive 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                : 'text-slate-500 hover:bg-white hover:text-blue-600'
              }`}
            >
              <Icon size={20} />
              {link.label}
            </Link>
          );
        })}
      </aside>

      {/* Content */}
      <div className="flex-1 min-h-[600px]">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/profile" element={<ProfileSettings />} />
        </Routes>
      </div>
    </div>
  );
}

function Overview() {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'appointments'), 
      where(profile?.role === 'doctor' ? 'doctorId' : 'patientId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data());
      setStats({
        total: data.length,
        pending: data.filter(a => a.status === 'pending').length,
        completed: data.filter(a => a.status === 'completed').length,
      });
    });

    return () => unsubscribe();
  }, [user, profile]);

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-6">
        <StatCard title="Total Appointments" value={stats.total} icon={<Calendar className="text-blue-600" />} />
        <StatCard title="Pending Requests" value={stats.pending} icon={<Activity className="text-amber-600" />} />
        <StatCard title="Completed" value={stats.completed} icon={<CheckCircle2 className="text-green-600" />} />
      </div>

      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Recent Activity</h3>
        <p className="text-slate-500">Your recent consultations and updates will appear here.</p>
      </div>
    </div>
  );
}

function Appointments() {
  const { profile, user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'appointments'), 
      where(profile?.role === 'doctor' ? 'doctorId' : 'patientId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const appts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      
      // Fetch user details for each appointment
      const userIds = Array.from(new Set(appts.map(a => profile?.role === 'doctor' ? a.patientId : a.doctorId)));
      const usersMap: Record<string, any> = {};
      
      for (const uid of userIds) {
        const uSnap = await getDoc(doc(db, 'users', uid));
        if (uSnap.exists()) usersMap[uid] = uSnap.data();
      }

      setAppointments(appts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setUsers(usersMap);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, profile]);

  const handleAction = async (id: string, action: string) => {
    const statusMap: Record<string, string> = {
      accept: 'accepted',
      reject: 'rejected',
      cancel: 'cancelled',
      complete: 'completed'
    };
    await updateDoc(doc(db, 'appointments', id), { status: statusMap[action] });
  };

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-32 bg-white rounded-3xl" /><div className="h-32 bg-white rounded-3xl" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-slate-900">Your Appointments</h2>
      {appointments.length > 0 ? (
        <div className="space-y-4">
          {appointments.map(appt => (
            <AppointmentCard 
              key={appt.id} 
              appointment={appt} 
              user={users[profile?.role === 'doctor' ? appt.patientId : appt.doctorId] || {}} 
              role={profile?.role || 'patient'}
              onAction={(action) => handleAction(appt.id, action)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[3rem] text-center border border-slate-100">
          <p className="text-slate-500 font-medium">No appointments found.</p>
        </div>
      )}
    </div>
  );
}

function ProfileSettings() {
  const { profile, user } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { name });
      alert('Profile updated!');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm max-w-2xl">
      <h2 className="text-2xl font-bold text-slate-900 mb-8">Profile Settings</h2>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Full Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">Email Address</label>
          <input 
            type="email" 
            disabled
            value={profile?.email}
            className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 cursor-not-allowed"
          />
        </div>
        <button 
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6">
      <div className="bg-slate-50 p-4 rounded-2xl">{icon}</div>
      <div>
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">{title}</p>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
