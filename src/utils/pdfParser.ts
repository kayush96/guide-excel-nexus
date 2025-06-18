import type { Requirement, CadenceInfo } from "@/pages/Index";

// Mock PDF parsing function - in a real implementation, you would use pdf-parse or similar
export const parsePDFFiles = async (files: File[]): Promise<{
  requirements: Requirement[];
  cadences: CadenceInfo[];
}> => {
  const requirements: Requirement[] = [];
  const cadences: CadenceInfo[] = [];

  console.log('Starting to parse PDF files:', files.map(f => f.name));

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`Processing file ${i + 1}/${files.length}: ${file.name}`);

    try {
      // Read file as text (simplified for demo)
      const text = await readFileAsText(file);
      console.log(`File ${file.name} content length:`, text.length);
      
      // Extract cadence from filename or content
      const cadence = extractCadenceInfo(file.name, text);
      if (cadence) {
        cadences.push(cadence);
        console.log('Extracted cadence:', cadence);
      }

      // Extract requirements from text
      const fileRequirements = extractRequirements(text, cadence?.cadence || `${i + 1}`);
      console.log(`Extracted ${fileRequirements.length} requirements from ${file.name}`);
      
      requirements.push(...fileRequirements);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
    }
  }

  // Merge requirements by ID and combine cadence data
  const mergedRequirements = mergeRequirements(requirements, cadences);
  console.log(`Final merged requirements: ${mergedRequirements.length}`);

  return {
    requirements: mergedRequirements,
    cadences
  };
};

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // For demo purposes, we'll generate mock content based on the PDF structure shown
      const mockContent = generateMockPDFContent(file.name);
      resolve(mockContent);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const generateMockPDFContent = (filename: string): string => {
  // Generate realistic mock PDF content for demonstration based on the uploaded image
  const cadenceVersions = ['26.26.165', '27.15.123', '25.14.089', '28.01.245', '26.30.178'];
  const cadenceNumber = cadenceVersions[Math.floor(Math.random() * cadenceVersions.length)];
  
  // Add release cadence info at the beginning (first page)
  let content = `Release Cadence: ${cadenceNumber}\n\n`;
  
  // Add some header content that should be ignored
  content += `CYS2407_2022_04_06_APS_Regional_Key_Provisioning_Specification.pdf\n\n`;
  
  // Add section headers (these should be ignored as they're followed by other GUIDs)
  content += `1 Introduction - GUID: CYS-APSRKP16cT00_1\n`;
  content += `GUID: CYS-APSRKP16cT00_2 / CR 3165241 (information only)\n\n`;
  
  // Add actual requirements with details (these should be extracted)
  const validRequirements = [
    {
      guid: 'CYS-APSRKP16cT00_3',
      isInfoOnly: false,
      details: 'ECU Requirements (including bootloader and HSM requirements) to support APSRKP and APSRKP-enabled security features. This requirement defines the specific security protocols and authentication mechanisms that must be implemented in the Electronic Control Unit (ECU) to ensure secure communication and data integrity within the vehicle network architecture.'
    },
    {
      guid: 'CYS-APSRKP16cT00_4',
      isInfoOnly: true,
      details: 'Process requirements for GM suppliers to securely access and manage the ECU IDs, Secret Keys (i.e., Master Key and Unlock Key), KP UIDs, and KP Keys required to be provisioned into microcontrollers during the ECU manufacturing process.'
    },
    {
      guid: 'CYS-SECURITY23_001',
      isInfoOnly: false,
      details: 'ECUs that support APSRKP are required to be provisioned with a default ECU_ID, one or more default Secret Keys, ECU-specific KP UID, and KP Keys during the ECU manufacturing process. The provisioning process must ensure cryptographic integrity and prevent unauthorized access to sensitive key material.'
    }
  ];

  validRequirements.forEach(req => {
    const infoOnlyText = req.isInfoOnly ? ' (information only)' : '';
    content += `GUID: ${req.guid}${infoOnlyText}\n`;
    content += `${req.details}\n\n`;
  });
  
  // Add some footer content that should be ignored
  content += `© 2022 GM                    GM Confidential                    5 of 86\n`;
  
  return content;
};

const extractCadenceInfo = (filename: string, content: string): CadenceInfo | null => {
  // Try to extract from content first - looking for the full version format like 26.26.165
  const cadencePatterns = [
    /Release Cadence[:\s]+(\d+\.\d+\.\d+)/i,
    /Cadence[:\s]+(\d+\.\d+\.\d+)/i,
    /Version[:\s]+(\d+\.\d+\.\d+)/i
  ];
  
  for (const pattern of cadencePatterns) {
    const cadenceMatch = content.match(pattern);
    if (cadenceMatch) {
      console.log(`Found cadence version: ${cadenceMatch[1]} in content`);
      return {
        cadence: cadenceMatch[1],
        filename: filename
      };
    }
  }
  
  // Fallback to filename analysis - look for version patterns
  const filenamePatterns = [
    /(\d+\.\d+\.\d+)/,  // Look for version format in filename
    /cadence[_\s-]*(\d+)/i,
    /(\d+)/
  ];
  
  for (const pattern of filenamePatterns) {
    const filenameMatch = filename.match(pattern);
    if (filenameMatch) {
      console.log(`Found cadence from filename: ${filenameMatch[1]}`);
      return {
        cadence: filenameMatch[1],
        filename: filename
      };
    }
  }
  
  return null;
};

const extractRequirements = (text: string, cadence: string): Requirement[] => {
  const requirements: Requirement[] = [];
  
  // Split text into lines for better processing
  const lines = text.split('\n');
  
  // Find all GUID patterns and check if they have actual requirement details
  const guidPattern = /GUID:\s*(CYS-[A-Z0-9-_]+)/gi;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const guidMatch = guidPattern.exec(line);
    
    if (guidMatch) {
      const guidId = guidMatch[1];
      
      // Check if this line contains header/footer indicators that should be ignored
      if (isHeaderFooterOrTable(line, lines, i)) {
        console.log(`Skipping GUID ${guidId} as it appears to be header/footer/table content`);
        continue;
      }
      
      // Check if it's information only
      const isInfoOnly = /\(information only\)/i.test(line);
      
      // Look for the next few lines to get requirement details
      const requirementDetails = extractRequirementDetails(lines, i);
      
      // Only add if we found actual requirement content (not just a heading)
      if (requirementDetails && requirementDetails.trim().length > 0 && !isJustHeading(requirementDetails)) {
        const requirement: Requirement = {
          id: `${guidId}-${cadence}`,
          requirementId: guidId,
          requirementInfo: isInfoOnly ? 'Information' : 'Requirement',
          cadenceData: { [cadence]: requirementDetails },
          hseService: ''
        };
        
        requirements.push(requirement);
        console.log(`Added requirement: ${guidId} with details: ${requirementDetails.substring(0, 100)}...`);
      } else {
        console.log(`Skipped GUID ${guidId} - appears to be heading or has no details`);
      }
    }
  }
  
  // Reset regex lastIndex
  guidPattern.lastIndex = 0;
  
  return requirements;
};

const isHeaderFooterOrTable = (currentLine: string, allLines: string[], currentIndex: number): boolean => {
  // Check for common header/footer patterns
  const headerFooterPatterns = [
    /©\s*\d{4}\s*GM/i, // Copyright GM
    /GM\s*Confidential/i,
    /\d+\s*of\s*\d+$/i, // Page numbers like "5 of 86"
    /\.pdf$/i, // PDF filename
    /^\d+\s+[A-Z][a-z]+/i // Section headers like "1 Introduction"
  ];
  
  // Check current line
  for (const pattern of headerFooterPatterns) {
    if (pattern.test(currentLine)) {
      return true;
    }
  }
  
  // Check if next line is another GUID (indicating this is just a section header)
  if (currentIndex + 1 < allLines.length) {
    const nextLine = allLines[currentIndex + 1];
    if (/GUID:\s*CYS-[A-Z0-9-_]+/i.test(nextLine)) {
      return true;
    }
  }
  
  return false;
};

const extractRequirementDetails = (lines: string[], guidLineIndex: number): string => {
  let details = '';
  let nextLineIndex = guidLineIndex + 1;
  
  // Skip empty lines after GUID
  while (nextLineIndex < lines.length && lines[nextLineIndex].trim() === '') {
    nextLineIndex++;
  }
  
  // Collect requirement details until we hit another GUID, header/footer, or empty section
  while (nextLineIndex < lines.length) {
    const line = lines[nextLineIndex];
    
    // Stop if we hit another GUID
    if (/GUID:\s*CYS-[A-Z0-9-_]+/i.test(line)) {
      break;
    }
    
    // Stop if we hit header/footer content
    if (isHeaderFooterOrTable(line, lines, nextLineIndex)) {
      break;
    }
    
    // Stop if we hit a section number (like "1.1 Feature Overview")
    if (/^\d+(\.\d+)*\s+[A-Z][a-z]+/i.test(line)) {
      break;
    }
    
    // Add line to details if it has content
    if (line.trim()) {
      details += line.trim() + ' ';
    }
    
    nextLineIndex++;
  }
  
  return details.trim();
};

const isJustHeading = (text: string): boolean => {
  // Check if the text is just a heading/section title
  const headingPatterns = [
    /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*\s*-\s*GUID/i,
    /^\d+(\.\d+)*\s+[A-Z][a-z]+/i,
    /^(Introduction|Overview|Feature|Process|Requirements?)$/i
  ];
  
  return headingPatterns.some(pattern => pattern.test(text.trim()));
};

const mergeRequirements = (requirements: Requirement[], cadences: CadenceInfo[]): Requirement[] => {
  const merged = new Map<string, Requirement>();
  
  requirements.forEach(req => {
    const existingReq = merged.get(req.requirementId);
    
    if (existingReq) {
      // Merge cadence data
      existingReq.cadenceData = {
        ...existingReq.cadenceData,
        ...req.cadenceData
      };
    } else {
      // Initialize with empty cadence data for all cadences
      const emptyCadenceData: { [key: string]: string } = {};
      cadences.forEach(cadence => {
        emptyCadenceData[cadence.cadence] = '';
      });
      
      merged.set(req.requirementId, {
        ...req,
        id: req.requirementId, // Use requirement ID as unique identifier
        cadenceData: {
          ...emptyCadenceData,
          ...req.cadenceData
        }
      });
    }
  });
  
  return Array.from(merged.values());
};
