import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Video, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AppointmentCardProps {
  appointment: any;
  user: any; // The other party (doctor if patient is viewing, patient if doctor is viewing)
  role: 'patient' | 'doctor' | 'admin';
  onAction?: (action: string) => void;
}

export default function AppointmentCard({ appointment, user, role, onAction }: AppointmentCardProps) {
  const statusColors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    accepted: 'bg-blue-50 text-blue-600 border-blue-100',
    completed: 'bg-green-50 text-green-600 border-green-100',
    rejected: 'bg-red-50 text-red-600 border-red-100',
    cancelled: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  const date = new Date(appointment.date);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 hover:shadow-lg hover:shadow-slate-200/30 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex gap-4 items-center">
          <img 
            src={`https://picsum.photos/seed/${user.uid}/100/100`} 
            alt={user.name} 
            className="w-16 h-16 rounded-2xl object-cover"
            referrerPolicy="no-referrer"
          />
          <div>
            <h4 className="text-lg font-bold text-slate-900">{user.name}</h4>
            <p className="text-sm text-slate-500 font-medium">
              {role === 'patient' ? 'Doctor' : 'Patient'} • {user.email}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 flex items-center gap-2 text-sm font-bold text-slate-700">
            <Calendar size={16} className="text-blue-600" />
            {format(date, 'MMM dd, yyyy')}
          </div>
          <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100 flex items-center gap-2 text-sm font-bold text-slate-700">
            <Clock size={16} className="text-blue-600" />
            {format(date, 'hh:mm a')}
          </div>
          <div className={cn("px-4 py-2 rounded-2xl border text-sm font-bold capitalize", statusColors[appointment.status])}>
            {appointment.status}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-slate-50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {appointment.status === 'accepted' && (
            <Link 
              to={`/consultation/${appointment.id}`}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
            >
              <Video size={18} /> Join Meeting
            </Link>
          )}
          {appointment.status === 'completed' && (
            <button className="flex items-center gap-2 bg-slate-100 text-slate-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all">
              <FileText size={18} /> View Prescription
            </button>
          )}
        </div>

        {role === 'doctor' && appointment.status === 'pending' && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => onAction?.('reject')}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-100 transition-all"
            >
              <XCircle size={18} /> Reject
            </button>
            <button 
              onClick={() => onAction?.('accept')}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-md shadow-green-200"
            >
              <CheckCircle size={18} /> Accept
            </button>
          </div>
        )}

        {role === 'patient' && appointment.status === 'pending' && (
          <button 
            onClick={() => onAction?.('cancel')}
            className="text-red-500 font-bold hover:underline text-sm"
          >
            Cancel Appointment
          </button>
        )}
      </div>
    </div>
  );
}

import { cn } from '../lib/utils';
