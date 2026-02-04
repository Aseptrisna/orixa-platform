import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { CheckCircle, Mail, Building2, User, Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Role } from '@orixa/shared';

const registerSchema = z.object({
  companyName: z.string().min(2, 'Nama perusahaan minimal 2 karakter'),
  adminName: z.string().min(2, 'Nama admin minimal 2 karakter'),
  adminEmail: z.string().email('Email tidak valid'),
  adminPassword: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Password harus mengandung huruf besar')
    .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
    .regex(/[0-9]/, 'Password harus mengandung angka'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

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
        navigate('/admin', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await authApi.registerCompany(data);
      toast.success('Registrasi berhasil!');
      setRegisteredEmail(data.adminEmail);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  // Show activation instructions after successful registration
  if (registeredEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              Registrasi Berhasil!
            </h1>
            
            <p className="text-slate-600 mb-6">
              Kami telah mengirimkan email aktivasi ke:
            </p>
            
            <div className="bg-slate-100 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 text-slate-800">
                <Mail className="h-5 w-5 text-primary" />
                <span className="font-semibold">{registeredEmail}</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Langkah Selanjutnya:
              </h3>
              <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
                <li>Buka email Anda (cek juga folder spam)</li>
                <li>Klik link aktivasi di dalam email</li>
                <li>Setelah aktivasi berhasil, Anda dapat login</li>
              </ol>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/login')}
                className="w-full"
              >
                Ke Halaman Login
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => setRegisteredEmail(null)}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Daftar Ulang
              </Button>
            </div>

            <p className="text-xs text-slate-500 mt-6">
              Tidak menerima email? Pastikan email yang dimasukkan benar atau hubungi support.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <Link to="/" className="text-3xl font-bold text-primary mb-4 block">
            ORIXA
          </Link>
          <CardTitle className="text-2xl">Daftar Perusahaan</CardTitle>
          <CardDescription>Buat akun perusahaan baru dan mulai kelola bisnis Anda</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName" className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-slate-400" />
                Nama Perusahaan
              </Label>
              <Input
                id="companyName"
                placeholder="PT Contoh Sukses"
                className="h-11"
                {...register('companyName')}
              />
              {errors.companyName && (
                <p className="text-sm text-red-500">{errors.companyName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminName" className="flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" />
                Nama Admin
              </Label>
              <Input
                id="adminName"
                placeholder="John Doe"
                className="h-11"
                {...register('adminName')}
              />
              {errors.adminName && (
                <p className="text-sm text-red-500">{errors.adminName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                Email Admin
              </Label>
              <Input
                id="adminEmail"
                type="email"
                placeholder="admin@perusahaan.com"
                className="h-11"
                {...register('adminEmail')}
              />
              {errors.adminEmail && (
                <p className="text-sm text-red-500">{errors.adminEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="adminPassword" className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-slate-400" />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="adminPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                  {...register('adminPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.adminPassword && (
                <p className="text-sm text-red-500">{errors.adminPassword.message}</p>
              )}
              <p className="text-xs text-slate-500">
                Min 8 karakter, huruf besar, huruf kecil, dan angka
              </p>
            </div>

            <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
              {loading ? <Spinner size="sm" /> : 'Daftar Sekarang'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-slate-600">
              Sudah punya akun?{' '}
              <Link to="/login" className="text-primary font-semibold hover:underline">
                Login di sini
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
