import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHotelSecureData, addHotelSecureData, getSecureDataEntry, SecureDataEntry } from '@/apiClient/secureDataApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useTranslation } from 'react-i18next';

interface Props {
  hotelId: number;
  hotelName: string;
}

const HotelSecureData: React.FC<Props> = ({ hotelId, hotelName }) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({});
  const [adding, setAdding] = useState(false);
  const [formState, setFormState] = useState({ name: '', username: '', password: '' });

  const { data: secureData = [], isLoading } = useQuery<SecureDataEntry[]>({
    queryKey: ['secureData', hotelId],
    queryFn: () => getHotelSecureData(hotelId)
  });

  const addMutation = useMutation({
    mutationFn: (payload: { name: string; username?: string; password: string }) => addHotelSecureData(hotelId, payload),
    onSuccess: () => {
      toast({ title: t('secure.messages.added') });
      queryClient.invalidateQueries({ queryKey: ['secureData', hotelId] });
      setAdding(false);
      setFormState({ name: '', username: '', password: '' });
    },
    onError: (err: any) => {
      toast({ title: t('secure.messages.failedToAdd'), description: err.message, variant: 'destructive' });
    }
  });

  const handleShowPassword = async (entryId: number) => {
    try {
      if (!showPasswords[entryId]) {
        const data = await getSecureDataEntry(entryId);
        setShowPasswords((prev) => ({ ...prev, [entryId]: true }));
        // Replace masked password in cache with real one
        queryClient.setQueryData<SecureDataEntry[]>(['secureData', hotelId], (old) => {
          if (!old) return old;
          return old.map((d) => (d.id === entryId ? { ...d, passwordMasked: data.password } : d));
        });
      } else {
        // hide again
        setShowPasswords((prev) => ({ ...prev, [entryId]: false }));
        queryClient.invalidateQueries({ queryKey: ['secureData', hotelId] });
      }
    } catch (error: any) {
      toast({ title: t('common.error'), description: error.message, variant: 'destructive' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formState);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('secure.sectionTitle')}</CardTitle>
        <CardDescription>{t('secure.sectionDescription', { hotelName })}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end">
          <Button onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4 mr-2" /> {t('secure.addEntry')}
          </Button>
        </div>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.name')}</TableHead>
                <TableHead>{t('auth.username')}</TableHead>
                <TableHead>{t('auth.password')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {secureData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    {t('secure.table.noEntries')}
                  </TableCell>
                </TableRow>
              ) : (
                secureData.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.name}</TableCell>
                    <TableCell>{entry.username || '-'}</TableCell>
                    <TableCell>
                      {showPasswords[entry.id] ? entry.passwordMasked : '••••••••••'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="icon" onClick={() => handleShowPassword(entry.id)}>
                        {showPasswords[entry.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Add entry dialog */}
      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{t('secure.dialog.addTitle')}</DialogTitle>
              <DialogDescription>{t('secure.dialog.description')}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>{t('common.name')}</Label>
                <Input value={formState.name} required onChange={(e) => setFormState({ ...formState, name: e.target.value })} />
              </div>
              <div>
                <Label>{t('auth.username')}</Label>
                <Input value={formState.username} onChange={(e) => setFormState({ ...formState, username: e.target.value })} />
              </div>
              <div>
                <Label>{t('auth.password')}</Label>
                <Input type="password" required value={formState.password} onChange={(e) => setFormState({ ...formState, password: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={addMutation.isPending}>{t('common.save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default HotelSecureData; 