import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Transaction, FileUploadResult } from '@/types/transaction';
import { parseISO, isValid } from 'date-fns';

export const detectCashMovement = (comment1: string, comment2: string): boolean => {
  const combinedComments = `${comment1} ${comment2}`.toLowerCase();
  const patterns = ['cash move', 'c/move', 'move'];
  
  return patterns.some(pattern => combinedComments.includes(pattern));
};

const parseDate = (dateString: string): Date => {
  if (!dateString) return new Date();
  
  const parsedDate = parseISO(dateString);
  if (isValid(parsedDate)) {
    return parsedDate;
  }
  
  const date = new Date(dateString);
  return isValid(date) ? date : new Date();
};

const validateTransaction = (row: any): Transaction | null => {
  try {
    const documentType = row['Document Type']?.trim().toUpperCase();
    if (documentType !== 'SIINV' && documentType !== 'SICRN') {
      return null;
    }

    const transaction: Transaction = {
      documentType: documentType as 'SIINV' | 'SICRN',
      vatNumber: row['Vat Number']?.toString().trim() || '',
      transactionNumber: row['Transaction Number']?.toString().trim() || '',
      transactionDate: parseDate(row['Transaction Date']),
      transactionComment1: row['Transaction Comment 1']?.toString().trim() || '',
      transactionComment2: row['Transaction Comment 2']?.toString().trim() || '',
      amountGBP: parseFloat(row['Amount in GBP']) || 0,
    };

    transaction.isCashMovement = detectCashMovement(
      transaction.transactionComment1,
      transaction.transactionComment2
    );

    return transaction;
  } catch (error) {
    console.error('Error validating transaction:', error);
    return null;
  }
};

export const parseCSVFile = (file: File): Promise<FileUploadResult> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const transactions: Transaction[] = [];
        const errors: string[] = [];

        results.data.forEach((row: any, index: number) => {
          const transaction = validateTransaction(row);
          if (transaction) {
            transactions.push(transaction);
          } else if (row && Object.keys(row).length > 0) {
            errors.push(`Row ${index + 2}: Invalid data format`);
          }
        });

        if (transactions.length === 0) {
          resolve({
            success: false,
            error: 'No valid transactions found in the file',
          });
        } else {
          resolve({
            success: true,
            data: transactions,
            error: errors.length > 0 ? `Processed with ${errors.length} warnings` : undefined,
          });
        }
      },
      error: (error) => {
        resolve({
          success: false,
          error: `Failed to parse CSV: ${error.message}`,
        });
      },
    });
  });
};

export const parseExcelFile = (file: File): Promise<FileUploadResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);

        const transactions: Transaction[] = [];
        const errors: string[] = [];

        jsonData.forEach((row: any, index: number) => {
          const transaction = validateTransaction(row);
          if (transaction) {
            transactions.push(transaction);
          } else if (row && Object.keys(row).length > 0) {
            errors.push(`Row ${index + 2}: Invalid data format`);
          }
        });

        if (transactions.length === 0) {
          resolve({
            success: false,
            error: 'No valid transactions found in the file',
          });
        } else {
          resolve({
            success: true,
            data: transactions,
            error: errors.length > 0 ? `Processed with ${errors.length} warnings` : undefined,
          });
        }
      } catch (error) {
        resolve({
          success: false,
          error: `Failed to parse Excel file: ${(error as Error).message}`,
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to read file',
      });
    };

    reader.readAsBinaryString(file);
  });
};

export const parseFile = async (file: File): Promise<FileUploadResult> => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (fileExtension === 'csv') {
    return parseCSVFile(file);
  } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    return parseExcelFile(file);
  } else {
    return {
      success: false,
      error: 'Unsupported file format. Please upload a CSV or Excel file.',
    };
  }
};