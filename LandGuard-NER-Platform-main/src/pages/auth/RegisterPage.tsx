import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff, AlertCircle, Users, Shield } from 'lucide-react';
import { supabase, type UserRole } from '@/lib/supabase';
import AuthLayout from './AuthLayout';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('community');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone, role } },
      });
      if (authError) throw authError;

      if (data.user) {
        // Update profile with role + phone
        await supabase
          .from('profiles')
          .update({ role, phone, name })
          .eq('id', data.user.id);

        if (role === 'authority') {
          navigate('/authority/overview');
        } else {
          navigate('/community/home');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Join the LandGuard NER monitoring network</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Role selector */}
      <div className="mb-5">
        <label className="mb-2 block text-sm font-medium text-slate-700">I am a...</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('community')}
            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
              role === 'community'
                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                : 'border-slate-300 bg-white hover:border-slate-400'
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${role === 'community' ? 'bg-emerald-500' : 'bg-slate-200'}`}>
              <Users className={`h-5 w-5 ${role === 'community' ? 'text-white' : 'text-slate-500'}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Community / Traveler</p>
              <p className="text-xs text-slate-500">Report & monitor</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setRole('authority')}
            className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
              role === 'authority'
                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                : 'border-slate-300 bg-white hover:border-slate-400'
            }`}
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${role === 'authority' ? 'bg-emerald-500' : 'bg-slate-200'}`}>
              <Shield className={`h-5 w-5 ${role === 'authority' ? 'text-white' : 'text-slate-500'}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">Authority</p>
              <p className="text-xs text-slate-500">Manage & respond</p>
            </div>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your full name"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-10 text-sm outline-none transition-colors focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
