export type UserRole = 'patient' | 'doctor' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface DoctorProfile {
  uid: string;
  specialization: string;
  experience: number;
  fees: number;
  availability?: Record<string, any>;
  isVerified: boolean;
  rating: number;
  bio: string;
}

export type AppointmentStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  status: AppointmentStatus;
  paymentStatus: 'pending' | 'paid';
  meetingUrl?: string;
  createdAt: string;
}

export interface Prescription {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  medicines: string[];
  notes: string;
  date: string;
}

export interface ChatMessage {
  text: string;
  senderId: string;
  senderName: string;
  createdAt: string;
}
