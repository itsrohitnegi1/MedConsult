import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import { Star, ShieldCheck, Clock, Award, MessageSquare, Calendar, ArrowLeft, CheckCircle2, Video } from 'lucide-react';

export default function DoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const docSnap = await getDoc(doc(db, 'doctors', id));
        const userSnap = await getDoc(doc(db, 'users', id));
        
        if (docSnap.exists()) setDoctor(docSnap.data());
        if (userSnap.exists()) setUser(userSnap.data());
      } catch (error) {
        console.error("Error fetching doctor profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <div className="animate-pulse space-y-8">
    <div className="h-64 bg-white rounded-[3rem]" />
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-2 h-96 bg-white rounded-[3rem]" />
      <div className="h-96 bg-white rounded-[3rem]" />
    </div>
  </div>;

  if (!doctor || !user) return <div className="text-center py-20">Doctor not found.</div>;

  return (
    <div className="space-y-8 pb-20">
      <Link to="/doctors" className="inline-flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors">
        <ArrowLeft size={20} /> Back to Doctors
      </Link>

      {/* Header Card */}
      <div className="bg-white p-8 lg:p-12 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-12 items-center md:items-start">
        <div className="relative">
          <img 
            src={`https://picsum.photos/seed/${doctor.uid}/400/400`} 
            alt={user.name} 
            className="w-48 h-48 lg:w-64 lg:h-64 rounded-[2.5rem] object-cover shadow-lg"
            referrerPolicy="no-referrer"
          />
          {doctor.isVerified && (
            <div className="absolute -top-4 -right-4 bg-blue-600 text-white p-3 rounded-full border-4 border-white shadow-lg">
              <ShieldCheck size={28} />
            </div>
          )}
        </div>
        
        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="space-y-2">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900">{user.name}</h1>
              <div className="flex items-center justify-center md:justify-start gap-2 bg-amber-50 text-amber-600 px-4 py-1 rounded-full font-bold text-sm border border-amber-100">
                <Star size={16} fill="currentColor" />
                <span>{doctor.rating || 'New'} Rating</span>
              </div>
            </div>
            <p className="text-xl text-blue-600 font-bold">{doctor.specialization}</p>
          </div>

          <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
            {doctor.bio || `Dr. ${user.name} is a highly experienced ${doctor.specialization} with over ${doctor.experience} years of clinical practice. Dedicated to providing compassionate and evidence-based care.`}
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-8 pt-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                <Award size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Experience</p>
                <p className="text-lg font-bold text-slate-900">{doctor.experience} Years</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-green-50 p-3 rounded-2xl text-green-600">
                <MessageSquare size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Languages</p>
                <p className="text-lg font-bold text-slate-900">English, Hindi</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 lg:p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <CheckCircle2 className="text-blue-600" /> Services & Expertise
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "General Consultation",
                "Follow-up Sessions",
                "Prescription Renewal",
                "Medical Advice",
                "Diagnostic Review",
                "Specialized Care"
              ].map((service, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="font-medium text-slate-700">{service}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Booking Widget */}
        <div className="space-y-8">
          <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-xl sticky top-24">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold">Book Now</h3>
              <div className="bg-blue-600 px-4 py-1 rounded-full text-sm font-bold">₹{doctor.fees}</div>
            </div>
            
            <div className="space-y-6 mb-10">
              <div className="flex items-center gap-4 text-slate-400">
                <Clock size={20} />
                <span>Available Today: 10:00 AM - 04:00 PM</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400">
                <Video size={20} />
                <span>Video Consultation Included</span>
              </div>
            </div>

            <Link 
              to={`/booking/${doctor.uid}`}
              className="block w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-center text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20"
            >
              Confirm Appointment
            </Link>
            <p className="text-center text-slate-500 text-sm mt-6">Secure payment via Stripe/Razorpay</p>
          </div>
        </div>
      </div>
    </div>
  );
}
