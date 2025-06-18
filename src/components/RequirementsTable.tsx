
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
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
        <div className="flex gap-2">
          {cadences.map((cadence) => (
            <Badge key={cadence.cadence} variant="secondary">
              Cadence {cadence.cadence}
            </Badge>
          ))}
        </div>
      </div>

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
                  {cadences.map((cadence) => (
                    <TableCell key={cadence.cadence}>
                      <div className="text-sm">
                        {requirement.cadenceData[cadence.cadence] || '-'}
                      </div>
                    </TableCell>
                  ))}
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
