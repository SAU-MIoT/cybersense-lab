import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Kullanıcı adı ve şifre gerekli.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Giriş başarılı. Yönlendiriliyorsunuz...');
      navigate('/admin');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Giriş başarısız.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50/50 py-12 px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <img
            src="/logos/sargem.svg"
            alt="SARGEM CyberSense Laboratuvarı"
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="text-navy font-bold text-sm">CyberSense Laboratuvarı</span>
        </Link>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 p-8">
          <div className="text-center mb-6">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1">Yönetim Girişi</p>
            <h1 className="text-xl font-bold text-navy">Güvenli Admin Oturumu</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Kullanıcı Adı</label>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                           focus:border-cyan focus:ring-2 focus:ring-cyan/20 outline-none transition-all"
                placeholder="E-posta adresiniz"
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Şifre</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                           focus:border-cyan focus:ring-2 focus:ring-cyan/20 outline-none transition-all"
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-cyber w-full justify-center"
            >
              {loading ? (
                <><i className="fa fa-circle-notch fa-spin" /> Kontrol ediliyor</>
              ) : (
                <><i className="fa fa-right-to-bracket" /> Giriş</>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link to="/" className="hover:text-cyan transition-colors">
            <i className="fa fa-arrow-left mr-1" /> Ana sayfaya dön
          </Link>
        </p>
      </div>
    </div>
  );
}
