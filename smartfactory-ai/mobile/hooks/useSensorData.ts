import { useState } from 'react';
import Papa from 'papaparse';

export const useSensorData = () => {
  const [isParsing, setIsParsing] = useState(false);

  const parseCsvFile = async (fileUri: string): Promise<any[]> => {
    setIsParsing(true);
    return new Promise((resolve, reject) => {
      fetch(fileUri)
        .then(response => response.text())
        .then(csvText => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              setIsParsing(false);
              resolve(results.data);
            },
            error: (error: any) => {
              setIsParsing(false);
              reject(error);
            }
          });
        })
        .catch(err => {
          setIsParsing(false);
          reject(err);
        });
    });
  };

  const validateAI4IColumns = (headers: string[]) => {
    const requiredCols = [
      'UDI', 'Product ID', 'Type', 'Air temperature [K]', 
      'Process temperature [K]', 'Rotational speed [rpm]', 
      'Torque [Nm]', 'Tool wear [min]', 'Target'
    ];
    const missing = requiredCols.filter(col => !headers.includes(col));
    const found = headers;
    return {
      valid: missing.length === 0,
      missing,
      found
    };
  };

  const getPreviewRows = (data: any[], n = 3) => {
    return data.slice(0, n);
  };

  return {
    isParsing,
    parseCsvFile,
    validateAI4IColumns,
    getPreviewRows
  };
};
