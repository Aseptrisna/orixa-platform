import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { toast } from 'sonner';

export default function TrackOrderPage() {
  const [orderCode, setOrderCode] = useState('');
  const navigate = useNavigate();

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderCode.trim()) {
      toast.error('Masukkan kode order');
      return;
    }
    navigate(`/t/code/${orderCode.trim().toUpperCase()}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Lacak Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTrack} className="space-y-4">
            <Input
              placeholder="Masukkan kode order (contoh: ABC123)"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value.toUpperCase())}
              className="text-center text-lg font-mono tracking-wider"
            />
            <Button type="submit" className="w-full" size="lg">
              <Search className="mr-2 h-5 w-5" />
              Lacak Pesanan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
