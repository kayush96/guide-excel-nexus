
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from "@/components/FileUpload";
import { RequirementsTable } from "@/components/RequirementsTable";
import { ExportControls } from "@/components/ExportControls";
import { SearchFilter } from "@/components/SearchFilter";
import { FileText, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface Requirement {
  id: string;
  requirementId: string;
  requirementInfo: string;
  cadenceData: { [cadence: string]: string };
  hseService: string;
}

export interface CadenceInfo {
  cadence: string;
  filename: string;
}

const Index = () => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [cadences, setCadences] = useState<CadenceInfo[]>([]);
  const [filteredRequirements, setFilteredRequirements] = useState<Requirement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCadence, setSelectedCadence] = useState('all');
  const { toast } = useToast();

  const handleFilesProcessed = (newRequirements: Requirement[], newCadences: CadenceInfo[]) => {
    console.log('Files processed:', newRequirements, newCadences);
    setRequirements(newRequirements);
    setCadences(newCadences);
    setFilteredRequirements(newRequirements);
    toast({
      title: "Files Processed Successfully",
      description: `Extracted ${newRequirements.length} requirements from ${newCadences.length} PDF files.`,
    });
  };

  const handleSearch = (term: string, cadence: string) => {
    setSearchTerm(term);
    setSelectedCadence(cadence);
    
    let filtered = requirements;
    
    if (term) {
      filtered = filtered.filter(req => 
        req.requirementId.toLowerCase().includes(term.toLowerCase()) ||
        req.requirementInfo.toLowerCase().includes(term.toLowerCase()) ||
        req.hseService.toLowerCase().includes(term.toLowerCase())
      );
    }
    
    if (cadence !== 'all') {
      filtered = filtered.filter(req => req.cadenceData[cadence]);
    }
    
    setFilteredRequirements(filtered);
  };

  const handleRequirementUpdate = (updatedRequirement: Requirement) => {
    const updatedReqs = requirements.map(req => 
      req.id === updatedRequirement.id ? updatedRequirement : req
    );
    setRequirements(updatedReqs);
    
    // Update filtered requirements as well
    const updatedFiltered = filteredRequirements.map(req => 
      req.id === updatedRequirement.id ? updatedRequirement : req
    );
    setFilteredRequirements(updatedFiltered);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 text-white rounded-lg">
              <FileText size={32} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Requirements Parser
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload multiple requirement PDFs to extract GUID requirements and generate comprehensive Excel reports
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload size={16} />
              Upload PDFs
            </TabsTrigger>
            <TabsTrigger value="process" className="flex items-center gap-2">
              <FileText size={16} />
              View Requirements
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download size={16} />
              Export Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Requirement PDFs</CardTitle>
                <CardDescription>
                  Upload multiple PDF files containing requirements with GUID: CYS- identifiers. 
                  The system will automatically extract release cadence information and requirements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload onFilesProcessed={handleFilesProcessed} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="process">
            <div className="space-y-6">
              <SearchFilter 
                onSearch={handleSearch}
                cadences={cadences}
                searchTerm={searchTerm}
                selectedCadence={selectedCadence}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Extracted Requirements</CardTitle>
                  <CardDescription>
                    Review and edit the extracted requirements. You can modify HSE Service values and view all cadence data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RequirementsTable 
                    requirements={filteredRequirements}
                    cadences={cadences}
                    onRequirementUpdate={handleRequirementUpdate}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="export">
            <Card>
              <CardHeader>
                <CardTitle>Export to Excel</CardTitle>
                <CardDescription>
                  Generate and download a comprehensive Excel file with all extracted requirements and cadence data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExportControls 
                  requirements={requirements} 
                  cadences={cadences}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
