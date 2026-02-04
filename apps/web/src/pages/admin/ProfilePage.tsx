import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api, usersApi, authApi } from '@/api';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from 'sonner';
import { 
  Camera, 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Save, 
  Eye, 
  EyeOff,
  Shield,
  CheckCircle2
} from 'lucide-react';

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile state
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileFormData>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  
  // Construct avatar URL with API base if needed
  const getFullAvatarUrl = (url: string | undefined | null): string | null => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return `${apiUrl}${url}`;
  };
  
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    getFullAvatarUrl(user?.avatarUrl)
  );
  
  // Password state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: (response) => {
      // Construct full URL with API base
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const uploadedUrl = response.data.url;
      const fullUrl = uploadedUrl.startsWith('http') ? uploadedUrl : `${apiUrl}${uploadedUrl}`;
      
      setAvatarUrl(fullUrl);
      // Update profile with new avatar
      updateProfileMutation.mutate({ avatarUrl: fullUrl });
      toast.success('Foto profil berhasil diupload');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal upload foto');
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<ProfileFormData & { avatarUrl?: string }>) => 
      usersApi.update(user?._id || '', data),
    onSuccess: async (_response, variables) => {
      // Update local state immediately
      if (variables.name) setProfileData(prev => ({ ...prev, name: variables.name! }));
      if (variables.email) setProfileData(prev => ({ ...prev, email: variables.email! }));
      if (variables.phone !== undefined) setProfileData(prev => ({ ...prev, phone: variables.phone || '' }));
      if (variables.avatarUrl) setAvatarUrl(variables.avatarUrl);
      
      // Update auth store with new data
      const updatedUser = {
        ...user,
        ...variables,
      };
      setUser(updatedUser as any);
      
      // Refresh user data from server
      try {
        const meResponse = await authApi.getMe();
        setUser(meResponse.data);
      } catch {
        // Ignore error, we already updated locally
      }
      
      toast.success('Profil berhasil diperbarui');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui profil');
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      api.post('/auth/change-password', data),
    onSuccess: () => {
      toast.success('Password berhasil diubah');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordSection(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengubah password');
    },
  });

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }
      uploadMutation.mutate(file);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileData.name.trim()) {
      toast.error('Nama tidak boleh kosong');
      return;
    }
    
    if (!profileData.email.trim() || !profileData.email.includes('@')) {
      toast.error('Email tidak valid');
      return;
    }
    
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword) {
      toast.error('Password saat ini harus diisi');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password baru minimal 8 karakter');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Konfirmasi password tidak cocok');
      return;
    }
    
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      SUPER_ADMIN: 'bg-red-100 text-red-700 border-red-200',
      COMPANY_ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
      CASHIER: 'bg-blue-100 text-blue-700 border-blue-200',
      CUSTOMER_MEMBER: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      SUPER_ADMIN: 'Super Admin',
      COMPANY_ADMIN: 'Admin',
      CASHIER: 'Kasir',
      CUSTOMER_MEMBER: 'Member',
    };
    return labels[role] || role;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Profil Saya"
        description="Kelola informasi profil dan keamanan akun"
        icon={User}
        iconColor="from-slate-500 to-slate-600"
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Avatar Section */}
        <Card className="md:col-span-1 dark:bg-slate-800 dark:border-slate-700">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div 
                  className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-lg cursor-pointer transition-transform hover:scale-105"
                  onClick={handleAvatarClick}
                >
                  {uploadMutation.isPending ? (
                    <Spinner size="lg" />
                  ) : avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={user?.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-primary">
                      {getInitials(user?.name || 'U')}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                  disabled={uploadMutation.isPending}
                >
                  <Camera className="h-5 w-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              
              <h2 className="mt-4 text-xl font-semibold dark:text-white">{user?.name}</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">{user?.email}</p>
              
              <div className="mt-3 flex items-center gap-2">
                <span className={`text-xs px-3 py-1.5 rounded-full border ${getRoleBadge(user?.role || '')}`}>
                  <Shield className="inline-block w-3 h-3 mr-1" />
                  {getRoleLabel(user?.role || '')}
                </span>
              </div>
              
              {user?.isActive && (
                <div className="mt-3 flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Akun Aktif</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Info Section */}
        <Card className="md:col-span-2 dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl dark:text-white">Informasi Profil</CardTitle>
                <CardDescription className="dark:text-slate-400">Perbarui data diri Anda</CardDescription>
              </div>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)} className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                  Edit Profil
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 dark:text-slate-300">
                  <User className="w-4 h-4 text-gray-400" />
                  Nama Lengkap
                </Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  disabled={!isEditing}
                  className={`${!isEditing ? 'bg-gray-50 dark:bg-slate-900' : ''} dark:border-slate-600 dark:bg-slate-700 dark:text-white`}
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 dark:text-slate-300">
                  <Mail className="w-4 h-4 text-gray-400" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditing}
                  className={`${!isEditing ? 'bg-gray-50 dark:bg-slate-900' : ''} dark:border-slate-600 dark:bg-slate-700 dark:text-white`}
                  placeholder="Masukkan email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 dark:text-slate-300">
                  <Phone className="w-4 h-4 text-gray-400" />
                  Nomor Telepon
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={!isEditing}
                  className={`${!isEditing ? 'bg-gray-50 dark:bg-slate-900' : ''} dark:border-slate-600 dark:bg-slate-700 dark:text-white`}
                  placeholder="Masukkan nomor telepon"
                />
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-2">
                  <Button 
                    type="submit" 
                    disabled={updateProfileMutation.isPending}
                    className="flex-1"
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        name: user?.name || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                      });
                    }}
                  >
                    Batal
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Password Section */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2 dark:text-white">
                <Lock className="w-5 h-5" />
                Keamanan
              </CardTitle>
              <CardDescription className="dark:text-slate-400">Ubah password akun Anda</CardDescription>
            </div>
            {!showPasswordSection && (
              <Button variant="outline" onClick={() => setShowPasswordSection(true)} className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                Ubah Password
              </Button>
            )}
          </div>
        </CardHeader>
        
        {showPasswordSection && (
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="dark:text-slate-300">Password Saat Ini</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Masukkan password saat ini"
                    className="pr-10 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="dark:text-slate-300">Password Baru</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Masukkan password baru"
                    className="pr-10 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400">Minimal 8 karakter</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="dark:text-slate-300">Konfirmasi Password Baru</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Konfirmasi password baru"
                    className="pr-10 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordData.newPassword && passwordData.confirmPassword && (
                  <p className={`text-xs ${passwordData.newPassword === passwordData.confirmPassword ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {passwordData.newPassword === passwordData.confirmPassword 
                      ? '✓ Password cocok' 
                      : '✗ Password tidak cocok'}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  type="submit" 
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Mengubah...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Ubah Password
                    </>
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  onClick={() => {
                    setShowPasswordSection(false);
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Account Info */}
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl dark:text-white">Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
              <span className="text-gray-500 dark:text-slate-400">ID Pengguna</span>
              <span className="font-mono text-xs dark:text-slate-300">{user?._id}</span>
            </div>
            <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
              <span className="text-gray-500 dark:text-slate-400">Status</span>
              <span className={user?.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {user?.isActive ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            {user?.companyId && (
              <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <span className="text-gray-500 dark:text-slate-400">ID Perusahaan</span>
                <span className="font-mono text-xs dark:text-slate-300">{user.companyId}</span>
              </div>
            )}
            {user?.outletIds && user.outletIds.length > 0 && (
              <div className="flex justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                <span className="text-gray-500 dark:text-slate-400">Akses Outlet</span>
                <span className="dark:text-slate-300">{user.outletIds.length} outlet</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
