import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { authApi } from '@/api';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Role } from '@orixa/shared';
import { Mail, Lock, AlertCircle, ArrowRight, Building2, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResendActivation, setShowResendActivation] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuthStore();

  const from = (location.state as any)?.from?.pathname || '/admin';

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === Role.SUPER_ADMIN) {
        navigate('/sa', { replace: true });
      } else if (user.role === Role.COMPANY_ADMIN) {
        navigate('/admin', { replace: true });
      } else if (user.role === Role.CASHIER) {
        navigate('/pos', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, from]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setShowResendActivation(false);
    try {
      const response = await authApi.login(data.email, data.password);
      login(response.data.accessToken, response.data.user);
      toast.success('Login berhasil!');

      // Redirect based on role
      const user = response.data.user;
      if (user.role === Role.SUPER_ADMIN) {
        navigate('/sa');
      } else if (user.role === Role.COMPANY_ADMIN) {
        navigate('/admin');
      } else if (user.role === Role.CASHIER) {
        navigate('/pos');
      } else {
        navigate(from);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login gagal';
      toast.error(message);
      
      // Check if it's an email verification error
      if (message.toLowerCase().includes('verifikasi email')) {
        setShowResendActivation(true);
        setResendEmail(data.email);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendActivation = async () => {
    setResending(true);
    try {
      await authApi.resendActivation(resendEmail);
      toast.success('Email aktivasi telah dikirim ulang. Cek inbox atau folder spam.');
      setShowResendActivation(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengirim email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <Link to="/" className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              ORIXA
            </span>
          </Link>
          <CardTitle className="text-2xl">Selamat Datang</CardTitle>
          <CardDescription>Masuk ke akun Anda untuk melanjutkan</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          {showResendActivation && (
            <Alert className="mb-4 border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <p className="mb-2">Email Anda belum diverifikasi.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResendActivation}
                  disabled={resending}
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
                >
                  {resending ? <Spinner size="sm" className="mr-2" /> : <Mail className="mr-2 h-4 w-4" />}
                  Kirim Ulang Email Aktivasi
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                className="h-11"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-400" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Lupa password?
              </Link>
            </div>

            <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
              {loading ? (
                <Spinner size="sm" />
              ) : (
                <>
                  Masuk
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-slate-600">
              Belum punya akun?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Daftar perusahaan
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
