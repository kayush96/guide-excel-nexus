
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import type { CadenceInfo } from "@/pages/Index";

interface SearchFilterProps {
  onSearch: (searchTerm: string, cadence: string) => void;
  cadences: CadenceInfo[];
  searchTerm: string;
  selectedCadence: string;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  cadences,
  searchTerm,
  selectedCadence
}) => {
  const handleSearchChange = (value: string) => {
    onSearch(value, selectedCadence);
  };

  const handleCadenceChange = (value: string) => {
    onSearch(searchTerm, value);
  };

  const clearFilters = () => {
    onSearch('', 'all');
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white border rounded-lg shadow-sm">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search requirements, information, or HSE service..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={selectedCadence} onValueChange={handleCadenceChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Filter by cadence" />
        </SelectTrigger>
        <SelectContent className="bg-white border shadow-lg z-50">
          <SelectItem value="all">All Cadences</SelectItem>
          {cadences.map((cadence) => (
            <SelectItem key={cadence.cadence} value={cadence.cadence}>
              Cadence {cadence.cadence}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button 
        variant="outline" 
        onClick={clearFilters}
        disabled={searchTerm === '' && selectedCadence === 'all'}
      >
        Clear Filters
      </Button>
    </div>
  );
};
