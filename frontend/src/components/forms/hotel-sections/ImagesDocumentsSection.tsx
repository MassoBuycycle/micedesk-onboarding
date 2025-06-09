import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Paperclip } from "lucide-react";
import FileUpload, { UploadedFile } from "../FileUpload";

interface ImagesDocumentsSectionProps {
  uploadedFiles: UploadedFile[];
  setUploadedFiles: (files: UploadedFile[]) => void;
}

const ImagesDocumentsSection = ({ uploadedFiles, setUploadedFiles }: ImagesDocumentsSectionProps) => {
  return (
    <Card className="shadow-[0_4px_15px_rgba(0,0,0,0.06)] border-0">
      <CardHeader className="px-4 py-2">
        <div className="flex items-center space-x-3">
          <Paperclip className="h-5 w-5 text-primary" />
          <div>
            <CardTitle className="text-base">Hotel Images & Documents</CardTitle>
            <CardDescription className="text-xs">Upload images and documents related to this hotel</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="bg-muted/40 rounded-lg p-3">
          <FileUpload 
            files={uploadedFiles} 
            onFilesChange={setUploadedFiles} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ImagesDocumentsSection;
