import React, { useState } from 'react';
import { Mail, Eye, EyeOff, User, Lock, ArrowLeft, Code } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

interface AuthScreenProps {
  onLogin: (userData: any) => void;
  onAdminLogin?: () => void;
}

type AuthMode = 'welcome' | 'login' | 'register';

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onAdminLogin }) => {
  const { login, loginWithGoogle, register, loading: authLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDevLogin, setShowDevLogin] = useState(false);
  const [devUsername, setDevUsername] = useState('');
  const [devPassword, setDevPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [error, setError] = useState('');

  const loading = authLoading || localLoading;

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    setLocalLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Giriş başarısız');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username || !email || !password) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı');
      return;
    }

    setLocalLoading(true);
    setError('');

    try {
      await register(username, email, password);
    } catch (err: any) {
      setError(err.message || 'Kayıt başarısız');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setLocalLoading(true);
    setError('');
    try {
      if (credentialResponse.credential) {
        await loginWithGoogle(credentialResponse.credential);
        // State update gecikirse diye manuel yenileme (Güvenli Liman)
        window.location.reload();
      }
    } catch (err: any) {
      console.error("Google Login Error", err);
      setError('Google ile giriş başarısız oldu.');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('https://picsum.photos/1920/1080?grayscale&blur=2')] bg-cover bg-center opacity-20" />

      <div className="relative z-10 w-full max-w-md p-8 bg-slate-900/90 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-md">
        {mode === 'welcome' ? (
          // WELCOME SCREEN
          <>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-yellow-500 mb-2" style={{ fontFamily: 'serif' }}>KADİM SAVAŞLAR</h1>
              <p className="text-slate-400">Efsaneni yazmaya başla.</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setMode('login')}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-900 rounded-lg font-bold hover:from-yellow-400 hover:to-amber-500 transition-all shadow-lg"
              >
                <Mail size={20} />
                Giriş Yap
              </button>

              <button
                onClick={() => setMode('register')}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-800 text-white rounded-lg font-bold border border-slate-600 hover:bg-slate-700 transition-all"
              >
                <User size={20} />
                Yeni Hesap Oluştur
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900 text-slate-500">veya</span>
                </div>
              </div>

              <div className="w-full flex justify-center mt-4">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    console.log('Login Failed');
                    setError('Google bağlantısı başarısız oldu.');
                  }}
                  theme="filled_black"
                  shape="pill"
                  width="300px"
                  text="continue_with"
                  locale="tr"
                />
              </div>

              {onAdminLogin && !showDevLogin && (
                <div className="mt-8 space-y-3">
                  <button
                    onClick={() => setShowDevLogin(true)}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-red-900/30 text-red-400 border border-red-800/50 rounded-lg font-bold hover:bg-red-900/50 transition-all opacity-50 hover:opacity-100"
                  >
                    <Code size={16} />
                    <span className="text-sm">Geliştirici Girişi</span>
                  </button>

                  <button
                    onClick={onAdminLogin}
                    className="w-full py-2 bg-slate-800 text-slate-400 text-xs rounded border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    Test Modu (Sunucusuz Giriş)
                  </button>
                </div>
              )}

              {showDevLogin && (
                <div className="mt-4 p-4 bg-red-900/20 border border-red-800/50 rounded-lg space-y-3">
                  <input
                    type="text"
                    placeholder="Kullanıcı Adı"
                    value={devUsername}
                    onChange={(e) => setDevUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500"
                  />
                  <input
                    type="password"
                    placeholder="Şifre"
                    value={devPassword}
                    onChange={(e) => setDevPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500"
                  />
                  <button
                    onClick={() => {
                      if (devUsername === 'yunusemregokdag' && devPassword === 'cmhmshp2gyegg') {
                        onAdminLogin?.();
                      } else {
                        alert('Geliştirici bilgileri yanlış!');
                      }
                    }}
                    className="w-full py-2 bg-red-600 text-white rounded font-bold hover:bg-red-500"
                  >
                    Giriş
                  </button>
                  <button
                    onClick={() => setShowDevLogin(false)}
                    className="w-full py-2 text-slate-400 text-sm hover:text-white"
                  >
                    İptal
                  </button>
                </div>
              )}
            </div>

            <div className="mt-8 text-center text-xs text-slate-500">
              Giriş yaparak Kullanıcı Sözleşmesi'ni kabul etmiş olursunuz.
              <br />
              <span className="text-yellow-500 font-bold">v1.2.4 - TEST MODE ACTIVE</span>
            </div>
          </>
        ) : (
          // LOGIN OR REGISTER SCREEN
          <>
            <button
              onClick={() => { setMode('welcome'); setError(''); }}
              className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={20} />
              Geri
            </button>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">
                {mode === 'login' ? 'Giriş Yap' : 'Hesap Oluştur'}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {mode === 'login' ? 'Hesabınıza giriş yapın' : 'Yeni bir macera başlat'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Kullanıcı Adı</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Savaşçı adınız"
                      className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">E-posta</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                onClick={mode === 'login' ? handleLogin : handleRegister}
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-slate-900 rounded-lg font-bold hover:from-yellow-400 hover:to-amber-500 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Yükleniyor...' : (mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol')}
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-900 text-slate-500">veya</span>
                </div>
              </div>

              <div className="w-full flex justify-center mt-4">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => {
                    console.log('Login Failed');
                    setError('Google bağlantısı başarısız oldu.');
                  }}
                  theme="filled_black"
                  shape="pill"
                  width="300px"
                  text="continue_with"
                  locale="tr"
                />
              </div>

              <div className="text-center text-sm text-slate-400">
                {mode === 'login' ? (
                  <>
                    Hesabın yok mu?{' '}
                    <button onClick={() => { setMode('register'); setError(''); }} className="text-yellow-500 hover:underline">
                      Kayıt Ol
                    </button>
                  </>
                ) : (
                  <>
                    Zaten hesabın var mı?{' '}
                    <button onClick={() => { setMode('login'); setError(''); }} className="text-yellow-500 hover:underline">
                      Giriş Yap
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;