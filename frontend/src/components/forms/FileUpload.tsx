
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Paperclip, 
  X, 
  FileImage, 
  File, 
  Image, 
  Download
} from "lucide-react";
import { toast } from "sonner";

export type UploadedFile = {
  id: string;
  file: File;
  fileType: string;
  preview?: string;
};

interface FileUploadProps {
  onFilesChange: (files: UploadedFile[]) => void;
  files: UploadedFile[];
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesChange, files }) => {
  const [selectedFileType, setSelectedFileType] = useState("image");

  const fileTypeOptions = [
    { value: "image", label: "Image" },
    { value: "floorPlan", label: "Floor Plan" },
    { value: "menu", label: "Menu" },
    { value: "contract", label: "Contract" },
    { value: "brochure", label: "Brochure" },
    { value: "other", label: "Other Document" },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    const newFiles: UploadedFile[] = Array.from(selectedFiles).map((file) => {
      let preview = undefined;
      if (file.type.startsWith("image/")) {
        preview = URL.createObjectURL(file);
      }

      return {
        id: crypto.randomUUID(), // Generate unique ID
        file,
        fileType: selectedFileType,
        preview,
      };
    });

    onFilesChange([...files, ...newFiles]);
    toast.success(`${newFiles.length} file(s) added`, {
      description: `Added as ${fileTypeOptions.find(ft => ft.value === selectedFileType)?.label}`,
    });
    
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  const removeFile = (id: string) => {
    const updatedFiles = files.filter((file) => file.id !== id);
    onFilesChange(updatedFiles);
    toast.info("File removed");
  };

  const getFileIcon = (file: UploadedFile) => {
    if (file.file.type.startsWith("image/")) {
      return file.fileType === "floorPlan" ? <FileImage size={20} /> : <Image size={20} />;
    } else if (file.file.type === "application/pdf") {
      return <File size={20} />;
    } else {
      return <Paperclip size={20} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="w-full sm:w-1/3">
          <Label htmlFor="fileType">Document Type</Label>
          <Select
            value={selectedFileType}
            onValueChange={setSelectedFileType}
          >
            <SelectTrigger id="fileType" className="w-full">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {fileTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex-1">
          <Input
            type="file"
            id="fileUpload"
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          />
          <Button
            type="button"
            onClick={() => document.getElementById("fileUpload")?.click()}
            className="w-full"
          >
            <Paperclip className="mr-2 h-4 w-4" />
            Attach Files
          </Button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {files.map((file) => (
            <Card key={file.id} className="overflow-hidden">
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {getFileIcon(file)}
                    <div className="truncate">
                      <p className="font-medium text-sm truncate">{file.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.file.size / 1024).toFixed(0)} KB • 
                        {fileTypeOptions.find(ft => ft.value === file.fileType)?.label}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    {file.preview && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => window.open(file.preview, '_blank')}
                      >
                        <Download size={16} />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive h-8 w-8"
                      onClick={() => removeFile(file.id)}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
