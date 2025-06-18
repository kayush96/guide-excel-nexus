
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
      // For demo purposes, we'll generate mock content
      // In real implementation, you would use PDF parsing library
      const mockContent = generateMockPDFContent(file.name);
      resolve(mockContent);
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const generateMockPDFContent = (filename: string): string => {
  // Generate realistic mock PDF content for demonstration
  const cadenceNumber = Math.floor(Math.random() * 5) + 1;
  const requirements = [];
  
  // Add release cadence info
  let content = `Release Cadence: ${cadenceNumber}\n\n`;
  
  // Generate mock requirements
  for (let i = 1; i <= Math.floor(Math.random() * 8) + 3; i++) {
    const guidId = `CYS-${Math.floor(Math.random() * 9000) + 1000}`;
    const isInfoOnly = Math.random() > 0.7;
    const reqText = isInfoOnly 
      ? `Sample requirement text for ${guidId} (information only)`
      : `Sample requirement text for ${guidId}`;
    
    requirements.push(`GUID: ${guidId}\n${reqText}\nAdditional details and specifications for this requirement.\n`);
  }
  
  content += requirements.join('\n');
  return content;
};

const extractCadenceInfo = (filename: string, content: string): CadenceInfo | null => {
  // Try to extract from content first
  const cadenceMatch = content.match(/Release Cadence[:\s]+(\d+)/i);
  if (cadenceMatch) {
    return {
      cadence: cadenceMatch[1],
      filename: filename
    };
  }
  
  // Fallback to filename analysis
  const filenameMatch = filename.match(/cadence[_\s-]*(\d+)/i) || 
                       filename.match(/(\d+)/);
  
  if (filenameMatch) {
    return {
      cadence: filenameMatch[1],
      filename: filename
    };
  }
  
  return null;
};

const extractRequirements = (text: string, cadence: string): Requirement[] => {
  const requirements: Requirement[] = [];
  
  // Find all GUID patterns
  const guidPattern = /GUID:\s*(CYS-[A-Z0-9-]+)/gi;
  const matches = [...text.matchAll(guidPattern)];
  
  console.log(`Found ${matches.length} GUID matches in cadence ${cadence}`);
  
  matches.forEach((match, index) => {
    const guidId = match[1];
    
    // Extract text around the GUID
    const startIndex = match.index || 0;
    const endIndex = Math.min(startIndex + 500, text.length);
    const context = text.substring(startIndex, endIndex);
    
    // Check if it's information only
    const isInfoOnly = /\(information only\)/i.test(context);
    
    // Extract requirement text (simplified)
    const lines = context.split('\n').slice(1, 4);
    const requirementText = lines.join(' ').trim();
    
    const requirement: Requirement = {
      id: `${guidId}-${cadence}`,
      requirementId: guidId,
      requirementInfo: isInfoOnly ? 'Information' : 'Requirement',
      cadenceData: { [cadence]: requirementText || 'Requirement details extracted from PDF' },
      hseService: ''
    };
    
    requirements.push(requirement);
  });
  
  return requirements;
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
