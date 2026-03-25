import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, ShieldCheck } from 'lucide-react';

interface DoctorCardProps {
  doctor: any;
  user: any;
}

export default function DoctorCard({ doctor, user }: DoctorCardProps) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
      <div className="flex gap-6">
        <div className="relative">
          <img 
            src={`https://picsum.photos/seed/${doctor.uid}/200/200`} 
            alt={user.name} 
            className="w-24 h-24 rounded-2xl object-cover"
            referrerPolicy="no-referrer"
          />
          {doctor.isVerified && (
            <div className="absolute -top-2 -right-2 bg-blue-600 text-white p-1 rounded-full border-2 border-white">
              <ShieldCheck size={14} />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{user.name}</h3>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star size={16} fill="currentColor" />
              <span>{doctor.rating || 'New'}</span>
            </div>
          </div>
          <p className="text-blue-600 font-semibold text-sm mb-3">{doctor.specialization}</p>
          <div className="flex flex-wrap gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{doctor.experience} Years Exp.</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Consultation Fee</p>
          <p className="text-xl font-bold text-slate-900">₹{doctor.fees}</p>
        </div>
        <Link 
          to={`/doctor/${doctor.uid}`}
          className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-md"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
