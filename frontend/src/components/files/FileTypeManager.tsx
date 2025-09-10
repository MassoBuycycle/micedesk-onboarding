import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { createFileType, deleteFileType, FileType } from '@/apiClient/filesApi';
import { useFileTypes } from '@/hooks/useFileTypes';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from 'react-i18next';

// Helper functions
const mbToBytes = (mb: number) => mb * 1024 * 1024;
const bytesToMB = (bytes: number) => bytes / (1024 * 1024);

export default function FileTypeManager() {
  const { t } = useTranslation();
  const { data: fileTypes = [], isLoading: loading, error, refetch } = useFileTypes();
  const [categories, setCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [fileTypeToDelete, setFileTypeToDelete] = useState<FileType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Form data for creating new file types
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: '',
    allowed_extensions: '',
    max_size: 5, // Default max size in MB
  });
  
  // Form validation
  const [formErrors, setFormErrors] = useState({
    name: '',
    code: '',
    category: '',
    allowed_extensions: '',
  });

  const fetchFileTypes = async () => {
    // Deprecated: now using React Query via useFileTypes. Keep function name to minimize diff in usages.
    const data = fileTypes;
    const uniqueCategories = Array.from(
      new Set(data.map((type: FileType) => type.category))
    );
    setCategories(uniqueCategories as string[]);
    if (uniqueCategories.length > 0 && activeTab === 'all') {
      setActiveTab(uniqueCategories[0] as string);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    let isValid = true;
    const errors = {
      name: '',
      code: '',
      category: '',
      allowed_extensions: '',
    };
    
    if (!formData.name.trim()) {
      errors.name = t('forms.validation.nameRequired');
      isValid = false;
    }
    
    if (!formData.code.trim()) {
      errors.code = t('forms.validation.required');
      isValid = false;
    } else if (!/^[a-z0-9_]+$/.test(formData.code)) {
      errors.code = t('admin.files.manager.validation.codeFormat');
      isValid = false;
    }
    
    if (!formData.category.trim()) {
      errors.category = t('forms.validation.requiredField');
      isValid = false;
    }
    
    if (!formData.allowed_extensions.trim()) {
      errors.allowed_extensions = t('admin.files.manager.validation.extensionsRequired');
      isValid = false;
    }
    
    setFormErrors(errors);
    
    if (!isValid) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const allowedExtensions = formData.allowed_extensions
        .split(',')
        .map(ext => ext.trim().replace(/^\./, '')) // Remove leading dots
        .filter(Boolean); // Remove empty strings
      
      await createFileType({
        name: formData.name,
        code: formData.code,
        category: formData.category,
        allowed_extensions: allowedExtensions,
        max_size: mbToBytes(formData.max_size),
      });
      
      toast.success(t('admin.files.manager.messages.created'));
      setIsModalOpen(false);
      
      // Reset form
      setFormData({
        name: '',
        code: '',
        category: '',
        allowed_extensions: '',
        max_size: 5,
      });
      
      // Refresh data
      refetch();
    } catch (error: any) {
      toast.error(error.message || t('admin.files.manager.messages.createFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteFileType = async () => {
    if (!fileTypeToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteFileType(fileTypeToDelete.id);
      
      toast.success(t('admin.files.manager.messages.deleted'));
      setFileTypeToDelete(null);
      
      // Refresh data
      refetch();
    } catch (error: any) {
      
      if (error.message && error.message.includes('409')) {
        toast.error(t('admin.files.manager.messages.deleteInUse'));
      } else {
        toast.error(error.message || t('admin.files.manager.messages.deleteFailed'));
      }
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchFileTypes();
  }, [fileTypes.length]);

  const filteredFileTypes = activeTab === 'all'
    ? fileTypes
    : fileTypes.filter(type => type.category === activeTab);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('admin.files.manager.header')}</CardTitle>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t('admin.files.manager.addFileType')}
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              {categories.map(category => (
                <TabsTrigger key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </TabsTrigger>
              ))}
              {categories.length > 1 && (
                <TabsTrigger value="all">{t('common.all')}</TabsTrigger>
              )}
            </TabsList>
            
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-destructive">{String(error)}</p>
              </div>
            ) : filteredFileTypes.length === 0 ? (
              <div className="flex h-32 items-center justify-center flex-col">
                <FolderOpen className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">{t('admin.files.manager.empty')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('common.name')}</TableHead>
                    <TableHead>{t('admin.files.manager.code')}</TableHead>
                    <TableHead>{t('admin.files.manager.category')}</TableHead>
                    <TableHead>{t('admin.files.manager.extensions')}</TableHead>
                    <TableHead>{t('admin.files.manager.maxSize')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFileTypes.map((fileType) => (
                    <TableRow key={fileType.id}>
                      <TableCell>{fileType.name}</TableCell>
                      <TableCell>{fileType.code}</TableCell>
                      <TableCell>{fileType.category}</TableCell>
                      <TableCell>
                        {fileType.allowed_extensions.join(', ')}
                      </TableCell>
                      <TableCell>
                        {bytesToMB(fileType.max_size).toFixed(1)} MB
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setFileTypeToDelete(fileType)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{t('admin.files.manager.deleteTitle')}</DialogTitle>
                              <DialogDescription>
                                {t('admin.files.manager.deleteDescription', { name: fileTypeToDelete?.name ?? '' })}
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setFileTypeToDelete(null)}
                              >
                                {t('common.cancel')}
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleDeleteFileType}
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('common.deleting', 'Deleting...')}
                                  </>
                                ) : (
                                  t('common.delete')
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Tabs>
        </CardContent>
      </Card>

      {/* Add File Type Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('admin.files.manager.addFileType')}</DialogTitle>
            <DialogDescription>
              {t('admin.files.manager.addDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t('common.name')}</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={t('admin.files.manager.placeholders.names') as string}
                />
                {formErrors.name && (
                  <p className="text-xs text-destructive">{formErrors.name}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="code">{t('admin.files.manager.code')}</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder={t('admin.files.manager.placeholders.code') as string}
                />
                <p className="text-xs text-muted-foreground">
                  {t('admin.files.manager.codeHelper')}
                </p>
                {formErrors.code && (
                  <p className="text-xs text-destructive">{formErrors.code}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">{t('admin.files.manager.category')}</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val)=>setFormData(prev=>({...prev,category:val}))}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder={t('admin.files.manager.placeholders.category') as string} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hotel">{t('hotels.title')}</SelectItem>
                    <SelectItem value="room">{t('rooms.title')}</SelectItem>
                    <SelectItem value="room-category-images">{t('forms.roomCategories') ?? 'Room Category Images'}</SelectItem>
                    <SelectItem value="event">{t('events.title')}</SelectItem>
                    <SelectItem value="fb">{t('foodBeverage.title', 'Food & Beverage')}</SelectItem>
                    <SelectItem value="policy">{t('policies.title')}</SelectItem>
                    <SelectItem value="contract">{t('contract.title')}</SelectItem>
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <p className="text-xs text-destructive">{formErrors.category}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="allowed_extensions">{t('admin.files.manager.allowedExtensions')}</Label>
                <Input
                  id="allowed_extensions"
                  name="allowed_extensions"
                  value={formData.allowed_extensions}
                  onChange={handleInputChange}
                  placeholder={t('admin.files.manager.placeholders.extensions') as string}
                />
                <p className="text-xs text-muted-foreground">
                  {t('admin.files.manager.extensionsHelper')}
                </p>
                {formErrors.allowed_extensions && (
                  <p className="text-xs text-destructive">{formErrors.allowed_extensions}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="max_size">{t('admin.files.manager.maxSize')} (MB)</Label>
                <Input
                  id="max_size"
                  name="max_size"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.max_size}
                  onChange={(e)=>setFormData(prev=>({...prev,max_size:Number(e.target.value)}))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.saving', 'Saving...')}
                  </>
                ) : (
                  t('common.save')
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 