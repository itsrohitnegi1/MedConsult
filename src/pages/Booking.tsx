import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Calendar as CalendarIcon, Clock, CreditCard, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

export default function Booking() {
  const { doctorId } = useParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<any>(null);
  const [doctorUser, setDoctorUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(startOfToday(), 1));
  const [selectedTime, setSelectedTime] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', 
    '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (!doctorId) return;
      try {
        const docSnap = await getDoc(doc(db, 'doctors', doctorId));
        const userSnap = await getDoc(doc(db, 'users', doctorId));
        if (docSnap.exists()) setDoctor(docSnap.data());
        if (userSnap.exists()) setDoctorUser(userSnap.data());
      } catch (error) {
        console.error("Error fetching doctor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [doctorId]);

  const handleBooking = async () => {
    if (!selectedTime || !user || !doctorId) return;
    setBookingLoading(true);
    try {
      const appointmentDate = new Date(selectedDate);
      const [time, period] = selectedTime.split(' ');
      const [hours, minutes] = time.split(':');
      let h = parseInt(hours);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      appointmentDate.setHours(h, parseInt(minutes), 0, 0);

      const appointmentData = {
        patientId: user.uid,
        doctorId: doctorId,
        date: appointmentDate.toISOString(),
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, 'appointments'), appointmentData);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      console.error("Booking error:", error);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse h-96 bg-white rounded-[3rem]" />;
  if (!doctor || !doctorUser) return <div>Doctor not found.</div>;

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-6">
        <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto text-green-600">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-3xl font-bold text-slate-900">Booking Successful!</h1>
        <p className="text-slate-600">Your appointment request has been sent to Dr. {doctorUser.name}. Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row gap-8 items-center">
        <img 
          src={`https://picsum.photos/seed/${doctor.uid}/200/200`} 
          alt={doctorUser.name} 
          className="w-32 h-32 rounded-3xl object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-slate-900">Book Appointment</h1>
          <p className="text-blue-600 font-bold text-lg">Dr. {doctorUser.name}</p>
          <p className="text-slate-500 font-medium">{doctor.specialization} • ₹{doctor.fees}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Date Selection */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="text-blue-600" /> Select Date
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => {
              const date = addDays(startOfToday(), i);
              const isSelected = format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={`p-4 rounded-2xl border-2 transition-all text-center ${
                    isSelected 
                    ? 'border-blue-600 bg-blue-50 text-blue-600' 
                    : 'border-slate-50 bg-slate-50 text-slate-600 hover:border-slate-200'
                  }`}
                >
                  <p className="text-xs font-bold uppercase">{format(date, 'EEE')}</p>
                  <p className="text-xl font-bold">{format(date, 'dd')}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Selection */}
        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="text-blue-600" /> Select Time
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {timeSlots.map(slot => (
              <button
                key={slot}
                onClick={() => setSelectedTime(slot)}
                className={`p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                  selectedTime === slot 
                  ? 'border-blue-600 bg-blue-50 text-blue-600' 
                  : 'border-slate-50 bg-slate-50 text-slate-600 hover:border-slate-200'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-8 rounded-[3rem] shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="bg-blue-600 p-4 rounded-2xl">
            <CreditCard size={32} />
          </div>
          <div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total Amount</p>
            <p className="text-4xl font-bold">₹{doctor.fees}</p>
          </div>
        </div>
        
        <button
          disabled={!selectedTime || bookingLoading}
          onClick={handleBooking}
          className="w-full md:w-auto bg-blue-600 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {bookingLoading ? 'Processing...' : 'Pay & Confirm'}
        </button>
      </div>
    </div>
  );
}
