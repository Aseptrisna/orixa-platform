import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { superAdminApi } from '@/api';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingCard } from '@/components/ui/spinner';
import { Search, FileText } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AuditLog {
  _id: string;
  actorUserId: string;
  actorUser?: { name: string; email: string };
  companyId?: string;
  company?: { name: string };
  action: string;
  entityType: string;
  entityId: string;
  detail: any;
  createdAt: string;
}

export default function AuditPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: logs, isLoading } = useQuery({
    queryKey: ['sa-audit'],
    queryFn: () => superAdminApi.getAuditLogs(),
  });

  const filteredLogs = logs?.data?.filter((log: AuditLog) =>
    log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.entityType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.actorUser?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getActionBadge = (action: string) => {
    if (action.includes('CREATE')) return 'bg-green-100 text-green-700';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-700';
    if (action.includes('DELETE')) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-gray-600">Riwayat aktivitas di platform</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Cari action, entity, atau user..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Logs */}
      {isLoading ? (
        <LoadingCard />
      ) : (
        <div className="space-y-3">
          {filteredLogs?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>Tidak ada log</p>
              </CardContent>
            </Card>
          ) : (
            filteredLogs?.map((log: AuditLog) => (
              <Card key={log._id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getActionBadge(log.action)}`}>
                          {log.action}
                        </span>
                        <span className="text-sm font-medium">{log.entityType}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        By: {log.actorUser?.name || log.actorUser?.email || 'Unknown'}
                        {log.company && ` | Company: ${log.company.name}`}
                      </p>
                      {log.detail && (
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-2 overflow-auto max-h-20">
                          {JSON.stringify(log.detail, null, 2)}
                        </pre>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatDate(log.createdAt, 'full')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
