
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import type { Requirement, CadenceInfo } from "@/pages/Index";

interface RequirementsTableProps {
  requirements: Requirement[];
  cadences: CadenceInfo[];
  onRequirementUpdate: (requirement: Requirement) => void;
}

type SortField = 'requirementId' | 'requirementInfo' | 'hseService';
type SortDirection = 'asc' | 'desc';

export const RequirementsTable: React.FC<RequirementsTableProps> = ({
  requirements,
  cadences,
  onRequirementUpdate
}) => {
  const [sortField, setSortField] = useState<SortField>('requirementId');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingHSE, setEditingHSE] = useState<string | null>(null);
  const [tempHSEValue, setTempHSEValue] = useState('');
  const [showDifferences, setShowDifferences] = useState(false);

  const sortedRequirements = [...requirements].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const startEditingHSE = (requirementId: string, currentValue: string) => {
    setEditingHSE(requirementId);
    setTempHSEValue(currentValue);
  };

  const saveHSEEdit = (requirement: Requirement) => {
    const updatedRequirement = {
      ...requirement,
      hseService: tempHSEValue
    };
    onRequirementUpdate(updatedRequirement);
    setEditingHSE(null);
    setTempHSEValue('');
  };

  const cancelHSEEdit = () => {
    setEditingHSE(null);
    setTempHSEValue('');
  };

  // Function to check if cadence data differs from the first cadence
  const getCadenceStatus = (requirement: Requirement, cadence: string) => {
    if (cadences.length <= 1) return 'same';
    
    const firstCadence = cadences[0].cadence;
    const firstContent = requirement.cadenceData[firstCadence] || '';
    const currentContent = requirement.cadenceData[cadence] || '';
    
    if (!firstContent && !currentContent) return 'empty';
    if (!currentContent) return 'missing';
    if (firstContent === currentContent) return 'same';
    return 'different';
  };

  // Function to get styling based on cadence status
  const getCadenceStyles = (status: string) => {
    if (!showDifferences) return '';
    
    switch (status) {
      case 'different':
        return 'bg-yellow-50 border-l-4 border-yellow-400';
      case 'missing':
        return 'bg-red-50 border-l-4 border-red-400';
      case 'empty':
        return 'bg-gray-50 border-l-4 border-gray-300';
      case 'same':
        return 'bg-green-50 border-l-4 border-green-400';
      default:
        return '';
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
        )}
      </div>
    </TableHead>
  );

  if (requirements.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">No requirements found. Please upload and process PDF files first.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {requirements.length} requirement{requirements.length !== 1 ? 's' : ''} 
          across {cadences.length} cadence{cadences.length !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center gap-4">
          {cadences.length > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDifferences(!showDifferences)}
              className="flex items-center gap-2"
            >
              {showDifferences ? <EyeOff size={16} /> : <Eye size={16} />}
              {showDifferences ? 'Hide Differences' : 'Show Differences'}
            </Button>
          )}
          <div className="flex gap-2">
            {cadences.map((cadence) => (
              <Badge key={cadence.cadence} variant="secondary">
                Cadence {cadence.cadence}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {showDifferences && cadences.length > 1 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4 pb-2">
            <div className="text-sm text-blue-800">
              <div className="font-medium mb-2">Difference Legend:</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-400 rounded"></div>
                  <span>Same as first cadence</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded"></div>
                  <span>Different content</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-400 rounded"></div>
                  <span>Missing content</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-400 rounded"></div>
                  <span>Empty in all</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <SortableHeader field="requirementId">Requirement ID</SortableHeader>
                <SortableHeader field="requirementInfo">Requirement/Information</SortableHeader>
                {cadences.map((cadence) => (
                  <TableHead key={cadence.cadence}>
                    Cadence {cadence.cadence}
                  </TableHead>
                ))}
                <SortableHeader field="hseService">HSE Service</SortableHeader>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRequirements.map((requirement) => (
                <TableRow key={requirement.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">
                    {requirement.requirementId}
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="text-sm">
                      {requirement.requirementInfo}
                    </div>
                  </TableCell>
                  {cadences.map((cadence) => {
                    const status = getCadenceStatus(requirement, cadence.cadence);
                    const content = requirement.cadenceData[cadence.cadence] || '-';
                    
                    return (
                      <TableCell key={cadence.cadence} className={getCadenceStyles(status)}>
                        <div className="text-sm">
                          {content}
                        </div>
                        {showDifferences && status !== 'same' && cadences.length > 1 && (
                          <div className="mt-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                status === 'different' ? 'text-yellow-700 border-yellow-400' :
                                status === 'missing' ? 'text-red-700 border-red-400' :
                                'text-gray-700 border-gray-400'
                              }`}
                            >
                              {status === 'different' ? 'Modified' : 
                               status === 'missing' ? 'Missing' : 'Empty'}
                            </Badge>
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    {editingHSE === requirement.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={tempHSEValue}
                          onChange={(e) => setTempHSEValue(e.target.value)}
                          className="h-8 w-32"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => saveHSEEdit(requirement)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelHSEEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer hover:bg-gray-100 p-2 rounded min-h-[2rem] flex items-center"
                        onClick={() => startEditingHSE(requirement.id, requirement.hseService)}
                      >
                        {requirement.hseService || 'Click to edit'}
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
