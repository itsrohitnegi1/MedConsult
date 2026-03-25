import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { Stethoscope, User, LogOut, Menu } from 'lucide-react';

export default function Navbar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-xl">
          <Stethoscope size={28} />
          <span>MedConsult</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
          <Link to="/doctors" className="hover:text-blue-600 transition-colors">Find Doctors</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                <span className="text-sm text-slate-500">Hi, {profile?.name || 'User'}</span>
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-all"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="hover:text-blue-600 transition-colors">Login</Link>
              <Link to="/register" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-sm">
                Join Now
              </Link>
            </div>
          )}
        </div>

        <button className="md:hidden p-2 text-slate-600">
          <Menu size={24} />
        </button>
      </div>
    </nav>
  );
}
