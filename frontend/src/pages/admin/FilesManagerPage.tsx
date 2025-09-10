import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileTypeManager from '@/components/files/FileTypeManager';
import FileUploadDemo from '@/components/files/FileUploadDemo';
import { useTranslation } from 'react-i18next';

export default function FilesManagerPage() {
  const { t } = useTranslation();
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">{t('admin.files.manager.title')}</h1>
      
      <Tabs defaultValue="types">
        <TabsList className="mb-8">
          <TabsTrigger value="types">{t('admin.files.manager.tabs.types')}</TabsTrigger>
          <TabsTrigger value="upload">{t('admin.files.manager.tabs.upload')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="types">
          <FileTypeManager />
        </TabsContent>
        
        <TabsContent value="upload">
          <FileUploadDemo />
        </TabsContent>
      </Tabs>
    </div>
  );
} 