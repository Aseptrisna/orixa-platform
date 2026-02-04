import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, outletsApi, api } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingCard, Spinner } from '@/components/ui/spinner';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from 'sonner';
import { 
  Plus, Edit, Trash2, User, Users, Mail, Shield, 
  Building2, Phone, CheckCircle2, XCircle, Camera
} from 'lucide-react';
import { IUser, IOutlet, Role } from '@orixa/shared';

export default function UsersPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  });

  const { data: outlets } = useQuery({
    queryKey: ['outlets'],
    queryFn: () => outletsApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User berhasil dibuat');
      setShowForm(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal membuat user');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => usersApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User berhasil diupdate');
      setEditingUser(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal update user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User berhasil dihapus');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal hapus user');
    },
  });

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAvatarUrl(response.data.url);
      toast.success('Foto berhasil diupload');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal upload foto');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }
      handleImageUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const outletIds = formData.getAll('outletIds') as string[];
    
    const data = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      role: formData.get('role') as Role,
      phone: formData.get('phone') as string || undefined,
      outletIds: outletIds.length > 0 ? outletIds : undefined,
      avatarUrl: avatarUrl || undefined,
      ...(editingUser ? {} : { password: formData.get('password') as string }),
    };

    if (editingUser) {
      updateMutation.mutate({ id: editingUser._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEditUser = (user: IUser) => {
    setEditingUser(user);
    setAvatarUrl((user as any).avatarUrl || '');
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setAvatarUrl('');
  };

  const getRoleBadge = (role: Role) => {
    const colors: Record<string, string> = {
      [Role.COMPANY_ADMIN]: 'bg-purple-100 text-purple-700 border-purple-200',
      [Role.CASHIER]: 'bg-blue-100 text-blue-700 border-blue-200',
      [Role.CUSTOMER_MEMBER]: 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola User"
        description="Atur staff dan akses pengguna"
        icon={Users}
        iconColor="from-indigo-500 to-indigo-600"
      >
        <Button onClick={() => { setShowForm(true); setAvatarUrl(''); }} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" />
          Tambah User
        </Button>
      </PageHeader>

      {/* Form */}
      {(showForm || editingUser) && (
        <Card className="shadow-lg border-slate-200 dark:border-slate-700 dark:bg-slate-800">
          <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50 dark:border-slate-700">
            <CardTitle className="text-xl dark:text-white">
              {editingUser ? 'Edit User' : 'Tambah User Baru'}
            </CardTitle>
            <CardDescription className="dark:text-slate-400">
              {editingUser ? 'Perbarui informasi user' : 'Buat akun staff baru'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div 
                    className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-lg cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? (
                      <Spinner size="lg" />
                    ) : avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-slate-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
                    disabled={uploading}
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-700 dark:text-slate-300">Foto Profil</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">JPG, PNG, GIF atau WEBP (Max 5MB)</p>
                  {avatarUrl && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                      onClick={() => setAvatarUrl('')}
                    >
                      Hapus Foto
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 dark:text-slate-300">
                    <User className="h-4 w-4 text-slate-400" />
                    Nama Lengkap
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingUser?.name || ''}
                    placeholder="Masukkan nama"
                    required
                    className="h-11 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 dark:text-slate-300">
                    <Mail className="h-4 w-4 text-slate-400" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={editingUser?.email || ''}
                    placeholder="email@example.com"
                    required
                    className="h-11 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2 dark:text-slate-300">
                    <Phone className="h-4 w-4 text-slate-400" />
                    No. Telepon (Opsional)
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={editingUser?.phone || ''}
                    placeholder="08xxxxxxxxxx"
                    className="h-11 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="flex items-center gap-2 dark:text-slate-300">
                    <Shield className="h-4 w-4 text-slate-400" />
                    Role
                  </Label>
                  <select
                    id="role"
                    name="role"
                    className="w-full h-11 border rounded-md px-3 bg-white dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    defaultValue={editingUser?.role || Role.CASHIER}
                    required
                  >
                    <option value={Role.COMPANY_ADMIN}>Admin Perusahaan</option>
                    <option value={Role.CASHIER}>Kasir</option>
                  </select>
                </div>
              </div>

              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="dark:text-slate-300">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="Minimal 8 karakter"
                    className="h-11 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Harus mengandung huruf besar, huruf kecil, dan angka</p>
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-2 dark:text-slate-300">
                  <Building2 className="h-4 w-4 text-slate-400" />
                  Akses Outlet
                </Label>
                <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
                  {(outlets?.data?.data || outlets?.data || []).map((outlet: IOutlet) => (
                    <label key={outlet._id} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        name="outletIds"
                        value={outlet._id}
                        defaultChecked={editingUser?.outletIds?.includes(outlet._id)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary"
                      />
                      <span className="text-sm dark:text-slate-300">{outlet.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Kosongkan untuk akses semua outlet</p>
              </div>

              <div className="flex gap-3 pt-4 border-t dark:border-slate-700">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="min-w-[120px]">
                  {(createMutation.isPending || updateMutation.isPending) && <Spinner size="sm" className="mr-2" />}
                  {editingUser ? 'Perbarui' : 'Simpan'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                  onClick={handleCancelForm}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {isLoading ? (
        <LoadingCard />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(users?.data?.data || []).map((user: IUser) => (
            <Card key={user._id} className="hover:shadow-md transition-shadow border-slate-200 dark:border-slate-700 dark:bg-slate-800">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center flex-shrink-0">
                    {(user as any).avatarUrl ? (
                      <img src={(user as any).avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-slate-400">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 dark:text-white truncate">{user.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    {user.phone && (
                      <p className="text-xs text-slate-400 mt-0.5">{user.phone}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getRoleBadge(user.role)}`}>
                        {user.role === Role.COMPANY_ADMIN ? 'Admin' : 'Kasir'}
                      </span>
                      {user.isActive ? (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Aktif
                        </span>
                      ) : (
                        <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Nonaktif
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit className="mr-1 h-3 w-3" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                    onClick={() => {
                      if (confirm('Hapus user ini?')) {
                        deleteMutation.mutate(user._id);
                      }
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
