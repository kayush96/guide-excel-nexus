
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parsePDFFiles } from "@/utils/pdfParser";
import type { Requirement, CadenceInfo } from "@/pages/Index";

interface FileUploadProps {
  onFilesProcessed: (requirements: Requirement[], cadences: CadenceInfo[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesProcessed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(
      file => file.type === 'application/pdf'
    );
    
    if (files.length === 0) {
      toast({
        title: "Invalid File Type",
        description: "Please upload only PDF files.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(
      file => file.type === 'application/pdf'
    );
    
    if (files.length === 0) {
      toast({
        title: "Invalid File Type",
        description: "Please upload only PDF files.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFiles(files);
  };

  const processFiles = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please select PDF files to process.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      console.log('Starting to process files:', selectedFiles.map(f => f.name));
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 500);

      const { requirements, cadences } = await parsePDFFiles(selectedFiles);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      console.log('Parsed requirements:', requirements);
      console.log('Parsed cadences:', cadences);
      
      onFilesProcessed(requirements, cadences);
      
      setTimeout(() => {
        setIsProcessing(false);
        setUploadProgress(0);
        setSelectedFiles([]);
      }, 1000);
      
    } catch (error) {
      console.error('Error processing files:', error);
      setIsProcessing(false);
      setUploadProgress(0);
      
      toast({
        title: "Processing Error",
        description: "Failed to process PDF files. Please try again.",
        variant: "destructive",
      });
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Drag and Drop Area */}
      <Card
        className={`border-2 border-dashed transition-colors duration-200 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className={`h-12 w-12 mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drop PDF files here or click to browse
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supports multiple PDF files with requirement GUIDs
          </p>
          <input
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button variant="outline" className="cursor-pointer">
              Browse Files
            </Button>
          </label>
        </CardContent>
      </Card>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-medium text-gray-900 mb-4">Selected Files ({selectedFiles.length})</h3>
            <div className="space-y-2 mb-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    disabled={isProcessing}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            
            {isProcessing && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Processing files...</span>
                  <span className="text-sm text-gray-600">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
            
            <Button 
              onClick={processFiles} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Processing...' : 'Process PDF Files'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Processing Information</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Files must contain requirements starting with "GUID: CYS-"</li>
                <li>• Release Cadence information will be extracted from the first page</li>
                <li>• Requirements with "(information only)" subscript will be marked accordingly</li>
                <li>• HSE Service column can be edited after processing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
