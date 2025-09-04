export type DocumentType = 'SIINV' | 'SICRN';

export interface Transaction {
  documentType: DocumentType;
  vatNumber: string;
  transactionNumber: string;
  transactionDate: Date;
  transactionComment1: string;
  transactionComment2: string;
  amountGBP: number;
  isCashMovement?: boolean;
}

export interface VATAnalysis {
  vatNumber: string;
  invoiceCount: number;
  creditNoteCount: number;
  totalTransactions: number;
  totalValue: number;
  cashMovementCount: number;
  nonCashMovementCount: number;
  cashMovementValue: number;
  nonCashMovementValue: number;
}

export interface FileUploadResult {
  success: boolean;
  data?: Transaction[];
  error?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}