
import React, { useState, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X } from "lucide-react";
import { parsePDFFiles } from "@/utils/pdfParser";
import { useToast } from "@/hooks/use-toast";
import type { Requirement, CadenceInfo } from "@/pages/Index";

interface FileUploadProps {
  onFilesProcessed: (requirements: Requirement[], cadences: CadenceInfo[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesProcessed }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const pdfFiles = Array.from(files).filter(file => 
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      );
      
      if (pdfFiles.length === 0) {
        toast({
          title: "Invalid Files",
          description: "Please select only PDF files.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFiles(pdfFiles);
      console.log('Selected files:', pdfFiles.map(f => f.name));
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files) {
      const pdfFiles = Array.from(files).filter(file => 
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      );
      
      if (pdfFiles.length === 0) {
        toast({
          title: "Invalid Files",
          description: "Please select only PDF files.",
          variant: "destructive",
        });
        return;
      }
      
      setSelectedFiles(pdfFiles);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(files => files.filter((_, i) => i !== index));
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
    
    try {
      console.log('Starting to process files:', selectedFiles.map(f => f.name));
      const { requirements, cadences } = await parsePDFFiles(selectedFiles);
      
      console.log('Processing complete:', {
        requirements: requirements.length,
        cadences: cadences.length
      });
      
      onFilesProcessed(requirements, cadences);
      
      toast({
        title: "Processing Complete",
        description: `Successfully processed ${selectedFiles.length} PDF files and extracted ${requirements.length} requirements.`,
      });
      
      // Clear selected files after successful processing
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        title: "Processing Error",
        description: "There was an error processing the PDF files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card
        className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 px-4">
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Upload PDF Files
          </h3>
          <p className="text-gray-500 text-center mb-4">
            Drag and drop your requirement PDFs here, or click to browse
          </p>
          <Button 
            variant="outline" 
            onClick={handleBrowseClick}
            type="button"
          >
            Browse Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {selectedFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">Selected Files ({selectedFiles.length})</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              onClick={processFiles}
              disabled={isProcessing}
              className="w-full mt-4"
            >
              {isProcessing ? 'Processing...' : `Process ${selectedFiles.length} Files`}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
