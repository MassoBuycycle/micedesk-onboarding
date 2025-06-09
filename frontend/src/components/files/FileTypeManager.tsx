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
import { getAllFileTypes, createFileType, deleteFileType, FileType } from '@/apiClient/filesApi';
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

// Helper functions
const mbToBytes = (mb: number) => mb * 1024 * 1024;
const bytesToMB = (bytes: number) => bytes / (1024 * 1024);

export default function FileTypeManager() {
  const [fileTypes, setFileTypes] = useState<FileType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
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
    setLoading(true);
    try {
      const data = await getAllFileTypes();
      setFileTypes(data);
      setError(null);
      
      // Extract categories
      const uniqueCategories = Array.from(
        new Set(data.map((type: FileType) => type.category))
      );
      setCategories(uniqueCategories as string[]);
      
      if (uniqueCategories.length > 0 && activeTab === 'all') {
        setActiveTab(uniqueCategories[0] as string);
      }
    } catch (error) {
      console.error('Error fetching file types:', error);
      setError('Failed to load file types');
    } finally {
      setLoading(false);
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
      errors.name = 'Name is required';
      isValid = false;
    }
    
    if (!formData.code.trim()) {
      errors.code = 'Code is required';
      isValid = false;
    } else if (!/^[a-z0-9_]+$/.test(formData.code)) {
      errors.code = 'Code must contain only lowercase letters, numbers, and underscores';
      isValid = false;
    }
    
    if (!formData.category.trim()) {
      errors.category = 'Category is required';
      isValid = false;
    }
    
    if (!formData.allowed_extensions.trim()) {
      errors.allowed_extensions = 'At least one extension is required';
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
      
      toast.success('File type created successfully');
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
      fetchFileTypes();
    } catch (error: any) {
      console.error('Error creating file type:', error);
      toast.error(error.message || 'Failed to create file type');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteFileType = async () => {
    if (!fileTypeToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteFileType(fileTypeToDelete.id);
      
      toast.success('File type deleted successfully');
      setFileTypeToDelete(null);
      
      // Refresh data
      fetchFileTypes();
    } catch (error: any) {
      console.error('Error deleting file type:', error);
      
      if (error.message && error.message.includes('409')) {
        toast.error('Cannot delete file type that is being used by files');
      } else {
        toast.error(error.message || 'Failed to delete file type');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchFileTypes();
  }, []);

  const filteredFileTypes = activeTab === 'all'
    ? fileTypes
    : fileTypes.filter(type => type.category === activeTab);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>File Type Management</CardTitle>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add File Type
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
                <TabsTrigger value="all">All</TabsTrigger>
              )}
            </TabsList>
            
            {loading ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="flex h-32 items-center justify-center">
                <p className="text-destructive">{error}</p>
              </div>
            ) : filteredFileTypes.length === 0 ? (
              <div className="flex h-32 items-center justify-center flex-col">
                <FolderOpen className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No file types found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Extensions</TableHead>
                    <TableHead>Max Size</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                              <DialogTitle>Delete File Type</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to delete the file type "{fileTypeToDelete?.name}"? This action cannot be undone.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setFileTypeToDelete(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleDeleteFileType}
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deleting...
                                  </>
                                ) : (
                                  'Delete'
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
            <DialogTitle>Add File Type</DialogTitle>
            <DialogDescription>
              Create a new file type for document management.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Images, Documents"
                />
                {formErrors.name && (
                  <p className="text-xs text-destructive">{formErrors.name}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., images, documents"
                />
                <p className="text-xs text-muted-foreground">
                  Use lowercase letters, numbers, and underscores only
                </p>
                {formErrors.code && (
                  <p className="text-xs text-destructive">{formErrors.code}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(val)=>setFormData(prev=>({...prev,category:val}))}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {['hotel','room','event','fb'].map(cat=>(
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase()+cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.category && (
                  <p className="text-xs text-destructive">{formErrors.category}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="allowed_extensions">Allowed Extensions</Label>
                <Input
                  id="allowed_extensions"
                  name="allowed_extensions"
                  value={formData.allowed_extensions}
                  onChange={handleInputChange}
                  placeholder="e.g., jpg, jpeg, png"
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated list of extensions without dots
                </p>
                {formErrors.allowed_extensions && (
                  <p className="text-xs text-destructive">{formErrors.allowed_extensions}</p>
                )}
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="max_size">Max Size (MB)</Label>
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
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 