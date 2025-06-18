
import * as XLSX from 'xlsx';
import type { Requirement, CadenceInfo } from "@/pages/Index";

export const exportToExcel = async (
  requirements: Requirement[],
  cadences: CadenceInfo[],
  selectedCadences: string[],
  includeHSE: boolean
): Promise<void> => {
  console.log('Starting Excel export with:', {
    requirements: requirements.length,
    cadences: cadences.length,
    selectedCadences,
    includeHSE
  });

  // Create workbook
  const workbook = XLSX.utils.book_new();
  
  // Prepare headers
  const headers = ['Requirement ID', 'Requirement/Information'];
  
  // Add selected cadence columns
  selectedCadences.forEach(cadence => {
    headers.push(`Cadence ${cadence}`);
  });
  
  // Add HSE Service column if selected
  if (includeHSE) {
    headers.push('HSE Service');
  }
  
  // Prepare data rows
  const rows = requirements.map(req => {
    const row: (string | number)[] = [
      req.requirementId,
      req.requirementInfo
    ];
    
    // Add cadence data
    selectedCadences.forEach(cadence => {
      row.push(req.cadenceData[cadence] || '');
    });
    
    // Add HSE Service if selected
    if (includeHSE) {
      row.push(req.hseService || '');
    }
    
    return row;
  });
  
  // Combine headers and data
  const worksheetData = [headers, ...rows];
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Set column widths
  const columnWidths = [
    { wch: 20 }, // Requirement ID
    { wch: 30 }, // Requirement/Information
    ...selectedCadences.map(() => ({ wch: 25 })), // Cadence columns
    ...(includeHSE ? [{ wch: 20 }] : []) // HSE Service
  ];
  
  worksheet['!cols'] = columnWidths;
  
  // Style the header row
  const headerRange = XLSX.utils.encode_range({
    s: { r: 0, c: 0 },
    e: { r: 0, c: headers.length - 1 }
  });
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Requirements');
  
  // Generate filename with timestamp
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  const filename = `Requirements_Export_${timestamp}.xlsx`;
  
  // Save file
  XLSX.writeFile(workbook, filename);
  
  console.log('Excel file exported successfully:', filename);
};
