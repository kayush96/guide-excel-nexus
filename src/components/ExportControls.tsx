
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Download, FileSpreadsheet } from "lucide-react";
import { exportToExcel } from "@/utils/excelExporter";
import { useToast } from "@/hooks/use-toast";
import type { Requirement, CadenceInfo } from "@/pages/Index";

interface ExportControlsProps {
  requirements: Requirement[];
  cadences: CadenceInfo[];
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  requirements,
  cadences
}) => {
  const [selectedCadences, setSelectedCadences] = useState<string[]>(
    cadences.map(c => c.cadence)
  );
  const [includeHSE, setIncludeHSE] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleCadenceToggle = (cadence: string, checked: boolean) => {
    if (checked) {
      setSelectedCadences(prev => [...prev, cadence]);
    } else {
      setSelectedCadences(prev => prev.filter(c => c !== cadence));
    }
  };

  const handleSelectAll = () => {
    setSelectedCadences(cadences.map(c => c.cadence));
  };

  const handleSelectNone = () => {
    setSelectedCadences([]);
  };

  const handleExport = async () => {
    if (requirements.length === 0) {
      toast({
        title: "No Data to Export",
        description: "Please process some PDF files first.",
        variant: "destructive",
      });
      return;
    }

    if (selectedCadences.length === 0) {
      toast({
        title: "No Cadences Selected",
        description: "Please select at least one cadence to export.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      await exportToExcel(requirements, cadences, selectedCadences, includeHSE);
      
      toast({
        title: "Export Successful",
        description: "Your Excel file has been downloaded successfully.",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export Excel file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Export Preview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{requirements.length}</div>
            <div className="text-sm text-gray-600">Total Requirements</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-green-600">{selectedCadences.length}</div>
            <div className="text-sm text-gray-600">Selected Cadences</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {3 + selectedCadences.length + (includeHSE ? 1 : 0)}
            </div>
            <div className="text-sm text-gray-600">Total Columns</div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-medium text-gray-900 mb-4">Export Options</h3>
          
          {/* Cadence Selection */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Select Cadences to Include
              </label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSelectAll}>
                  Select All
                </Button>
                <Button variant="outline" size="sm" onClick={handleSelectNone}>
                  Select None
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {cadences.map((cadence) => (
                <div key={cadence.cadence} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <Checkbox
                    id={`cadence-${cadence.cadence}`}
                    checked={selectedCadences.includes(cadence.cadence)}
                    onCheckedChange={(checked) => 
                      handleCadenceToggle(cadence.cadence, checked as boolean)
                    }
                  />
                  <label 
                    htmlFor={`cadence-${cadence.cadence}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    <div>Cadence {cadence.cadence}</div>
                    <div className="text-xs text-gray-500 truncate" title={cadence.filename}>
                      {cadence.filename}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Additional Columns
            </label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-hse"
                checked={includeHSE}
                onCheckedChange={(checked) => setIncludeHSE(checked as boolean)}
              />
              <label htmlFor="include-hse" className="text-sm leading-none cursor-pointer">
                Include HSE Service column
              </label>
            </div>
          </div>

          {/* Column Preview */}
          <div className="mb-6">
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Column Preview
            </label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Requirement ID</Badge>
              <Badge variant="secondary">Requirement/Information</Badge>
              {selectedCadences.map(cadence => (
                <Badge key={cadence} variant="outline">
                  Cadence {cadence}
                </Badge>
              ))}
              {includeHSE && <Badge variant="secondary">HSE Service</Badge>}
            </div>
          </div>

          {/* Export Button */}
          <Button 
            onClick={handleExport} 
            disabled={isExporting || requirements.length === 0}
            className="w-full"
            size="lg"
          >
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            {isExporting ? 'Generating Excel File...' : 'Download Excel File'}
          </Button>
        </CardContent>
      </Card>

      {/* File Info */}
      {requirements.length > 0 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Download className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-900 mb-1">Export Information</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Excel file will include all selected cadence columns</li>
                  <li>• Requirements with "(information only)" will be clearly marked</li>
                  <li>• HSE Service values will be preserved as entered</li>
                  <li>• File will be saved as "Requirements_Export_[timestamp].xlsx"</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
