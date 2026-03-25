import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, Calendar, Video, ShieldCheck, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center gap-12 pt-12">
        <div className="flex-1 space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-7xl font-bold text-slate-900 leading-[1.1]"
          >
            Your Health, <span className="text-blue-600">Our Priority.</span> Anytime, Anywhere.
          </motion.h1>
          <p className="text-xl text-slate-600 max-w-xl leading-relaxed">
            Connect with certified doctors for online consultations, prescriptions, and follow-ups. 
            Experience healthcare that fits your lifestyle.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/doctors" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center gap-2">
              Book Appointment <ArrowRight size={20} />
            </Link>
            <Link to="/register" className="bg-white border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-bold text-lg hover:border-blue-600 hover:text-blue-600 transition-all">
              Are you a Doctor?
            </Link>
          </div>
          <div className="flex items-center gap-8 pt-4">
            <div className="flex -space-x-3">
              {[1,2,3,4].map(i => (
                <img 
                  key={i}
                  src={`https://picsum.photos/seed/doc${i}/100/100`} 
                  className="w-12 h-12 rounded-full border-4 border-white object-cover"
                  alt="Doctor"
                  referrerPolicy="no-referrer"
                />
              ))}
            </div>
            <p className="text-slate-500 font-medium">
              <span className="text-slate-900 font-bold">500+</span> Specialized Doctors
            </p>
          </div>
        </div>
        <div className="flex-1 relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 rounded-3xl overflow-hidden shadow-2xl"
          >
            <img 
              src="https://picsum.photos/seed/telemed/800/600" 
              alt="Telemedicine" 
              className="w-full h-auto"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl z-20 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full text-green-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Verified Doctors</p>
              <p className="text-lg font-bold text-slate-900">100% Secure</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8">
        <FeatureCard 
          icon={<Search className="text-blue-600" />}
          title="Find Specialists"
          description="Search through hundreds of verified doctors across 20+ specializations."
        />
        <FeatureCard 
          icon={<Calendar className="text-blue-600" />}
          title="Easy Booking"
          description="Schedule your consultation at a time that works best for you in just a few clicks."
        />
        <FeatureCard 
          icon={<Video className="text-blue-600" />}
          title="Video Consult"
          description="High-quality video calls with doctors from the comfort of your home."
        />
      </section>

      {/* Stats */}
      <section className="bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-white flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="space-y-4">
          <h2 className="text-4xl font-bold">Trusted by thousands of patients worldwide.</h2>
          <p className="text-slate-400 text-lg">We provide the best medical services with the help of modern technology.</p>
        </div>
        <div className="grid grid-cols-2 gap-12">
          <StatItem value="10k+" label="Happy Patients" />
          <StatItem value="500+" label="Expert Doctors" />
          <StatItem value="20+" label="Specializations" />
          <StatItem value="4.9/5" label="User Rating" />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
      <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div className="text-center lg:text-left">
      <p className="text-4xl font-bold text-blue-400 mb-1">{value}</p>
      <p className="text-slate-400 font-medium">{label}</p>
    </div>
  );
}
