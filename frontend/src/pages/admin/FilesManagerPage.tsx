import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FileTypeManager from '@/components/files/FileTypeManager';
import FileUploadDemo from '@/components/files/FileUploadDemo';

export default function FilesManagerPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">File Management</h1>
      
      <Tabs defaultValue="types">
        <TabsList className="mb-8">
          <TabsTrigger value="types">File Types</TabsTrigger>
          <TabsTrigger value="upload">File Upload Demo</TabsTrigger>
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