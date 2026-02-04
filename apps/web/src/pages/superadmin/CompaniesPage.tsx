import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superAdminApi } from '@/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingCard, Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { Building2, Search, Edit, Check, X } from 'lucide-react';
import { ICompany } from '@orixa/shared';

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPlan, setEditingPlan] = useState<{ id: string; plan: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: companies, isLoading } = useQuery({
    queryKey: ['sa-companies'],
    queryFn: () => superAdminApi.getCompanies(),
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, plan }: { id: string; plan: string }) =>
      superAdminApi.updateCompanyPlan(id, plan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-companies'] });
      toast.success('Plan berhasil diupdate');
      setEditingPlan(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal update plan');
    },
  });

  const filteredCompanies = companies?.data?.filter((company: ICompany) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      FREE: 'bg-gray-100 text-gray-700',
      TRIAL: 'bg-blue-100 text-blue-700',
      PRO: 'bg-purple-100 text-purple-700',
      ENTERPRISE: 'bg-yellow-100 text-yellow-700',
    };
    return colors[plan] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Companies</h1>
        <p className="text-gray-600">Kelola semua perusahaan di platform</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari perusahaan..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Total Companies</p>
            <p className="text-2xl font-bold">{companies?.data?.length || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Free</p>
            <p className="text-2xl font-bold">
              {companies?.data?.filter((c: ICompany) => c.plan === 'FREE').length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Pro</p>
            <p className="text-2xl font-bold">
              {companies?.data?.filter((c: ICompany) => c.plan === 'PRO').length || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-600">Enterprise</p>
            <p className="text-2xl font-bold">
              {companies?.data?.filter((c: ICompany) => c.plan === 'ENTERPRISE').length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      {isLoading ? (
        <LoadingCard />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCompanies?.map((company: ICompany) => (
            <Card key={company._id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{company.name}</h3>
                    <p className="text-sm text-gray-500">{company.slug}</p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      {editingPlan?.id === company._id ? (
                        <div className="flex items-center gap-2">
                          <select
                            className="h-8 border rounded px-2 text-sm"
                            value={editingPlan.plan}
                            onChange={(e) => setEditingPlan({ ...editingPlan, plan: e.target.value })}
                          >
                            <option value="FREE">FREE</option>
                            <option value="TRIAL">TRIAL</option>
                            <option value="PRO">PRO</option>
                            <option value="ENTERPRISE">ENTERPRISE</option>
                          </select>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => updatePlanMutation.mutate({ id: company._id, plan: editingPlan.plan })}
                            disabled={updatePlanMutation.isPending}
                          >
                            {updatePlanMutation.isPending ? (
                              <Spinner size="sm" />
                            ) : (
                              <Check className="h-4 w-4 text-green-600" />
                            )}
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => setEditingPlan(null)}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className={`text-xs px-2 py-1 rounded-full ${getPlanBadge(company.plan)}`}>
                            {company.plan}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={() => setEditingPlan({ id: company._id, plan: company.plan })}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        company.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {company.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
