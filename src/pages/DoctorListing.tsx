import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import DoctorCard from '../components/DoctorCard';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';

export default function DoctorListing() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [users, setUsers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsSnap = await getDocs(collection(db, 'doctors'));
        const doctorsData = doctorsSnap.docs.map(doc => doc.data());
        
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersMap: Record<string, any> = {};
        usersSnap.docs.forEach(doc => {
          usersMap[doc.id] = doc.data();
        });

        setDoctors(doctorsData);
        setUsers(usersMap);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filteredDoctors = doctors.filter(doc => {
    const user = users[doc.uid];
    if (!user) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(searchLower) ||
      doc.specialization.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Find Your Doctor</h1>
          <p className="text-slate-500 mt-2">Book an appointment with our specialized doctors.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-2 no-scrollbar">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold whitespace-nowrap">All Specializations</button>
        <button className="bg-white border border-slate-200 text-slate-600 px-6 py-2 rounded-full font-bold hover:border-blue-600 hover:text-blue-600 transition-all whitespace-nowrap">Cardiology</button>
        <button className="bg-white border border-slate-200 text-slate-600 px-6 py-2 rounded-full font-bold hover:border-blue-600 hover:text-blue-600 transition-all whitespace-nowrap">Dermatology</button>
        <button className="bg-white border border-slate-200 text-slate-600 px-6 py-2 rounded-full font-bold hover:border-blue-600 hover:text-blue-600 transition-all whitespace-nowrap">Neurology</button>
        <button className="bg-white border border-slate-200 text-slate-600 px-6 py-2 rounded-full font-bold hover:border-blue-600 hover:text-blue-600 transition-all whitespace-nowrap">Pediatrics</button>
        <button className="bg-white border border-slate-200 text-slate-600 px-6 py-2 rounded-full font-bold hover:border-blue-600 hover:text-blue-600 transition-all whitespace-nowrap">Psychiatry</button>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white h-64 rounded-3xl animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : filteredDoctors.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map(doctor => (
            <DoctorCard 
              key={doctor.uid} 
              doctor={doctor} 
              user={users[doctor.uid]} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-[3rem] border border-slate-100">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <Search size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">No Doctors Found</h3>
          <p className="text-slate-500 mt-2">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
