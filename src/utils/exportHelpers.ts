import * as XLSX from 'xlsx';
import { VATAnalysis, Transaction } from '@/types/transaction';

export const exportToExcel = (vatAnalysis: VATAnalysis[], transactions: Transaction[]) => {
  const wb = XLSX.utils.book_new();

  const summaryData = vatAnalysis.map(vat => ({
    'VAT Number': vat.vatNumber,
    'Total Transactions': vat.totalTransactions,
    'Invoices': vat.invoiceCount,
    'Credit Notes': vat.creditNoteCount,
    'Total Value (GBP)': vat.totalValue.toFixed(2),
    'Cash Movements': vat.cashMovementCount,
    'Non-Cash Movements': vat.nonCashMovementCount,
    'Cash Movement Value (GBP)': vat.cashMovementValue.toFixed(2),
    'Non-Cash Movement Value (GBP)': vat.nonCashMovementValue.toFixed(2),
  }));

  const ws1 = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws1, 'VAT Analysis Summary');

  const transactionData = transactions.map(t => ({
    'Document Type': t.documentType,
    'VAT Number': t.vatNumber,
    'Transaction Number': t.transactionNumber,
    'Transaction Date': t.transactionDate.toISOString().split('T')[0],
    'Transaction Comment 1': t.transactionComment1,
    'Transaction Comment 2': t.transactionComment2,
    'Amount in GBP': t.amountGBP.toFixed(2),
    'Is Cash Movement': t.isCashMovement ? 'Yes' : 'No',
  }));

  const ws2 = XLSX.utils.json_to_sheet(transactionData);
  XLSX.utils.book_append_sheet(wb, ws2, 'All Transactions');

  const fileName = `VAT_Analysis_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportToPDF = (vatAnalysis: VATAnalysis[], stats: any) => {
  const content = `
VAT TRANSACTION ANALYSIS REPORT
Generated: ${new Date().toLocaleString()}

SUMMARY STATISTICS
==================
Total Transactions: ${stats.totalTransactions.toLocaleString()}
Total Value: £${stats.totalValue.toFixed(2)}
Unique VAT Numbers: ${stats.uniqueVATNumbers}
Cash Movement Percentage: ${stats.cashMovementPercentage.toFixed(1)}%
Total Invoices: ${stats.invoiceCount.toLocaleString()} (£${stats.invoiceValue.toFixed(2)})
Total Credit Notes: ${stats.creditNoteCount.toLocaleString()} (£${stats.creditNoteValue.toFixed(2)})
Average Transaction Value: £${stats.averageTransactionValue.toFixed(2)}

TOP 10 VAT NUMBERS BY VOLUME
=============================
${vatAnalysis
  .sort((a, b) => b.totalTransactions - a.totalTransactions)
  .slice(0, 10)
  .map((vat, index) => 
    `${index + 1}. ${vat.vatNumber}: ${vat.totalTransactions} transactions (£${vat.totalValue.toFixed(2)})`
  )
  .join('\n')}

TOP 10 VAT NUMBERS BY VALUE
============================
${vatAnalysis
  .sort((a, b) => b.totalValue - a.totalValue)
  .slice(0, 10)
  .map((vat, index) => 
    `${index + 1}. ${vat.vatNumber}: £${vat.totalValue.toFixed(2)} (${vat.totalTransactions} transactions)`
  )
  .join('\n')}

CASH MOVEMENT ANALYSIS
======================
Total Cash Movement Transactions: ${stats.cashMovementTransactions}
Total Non-Cash Movement Transactions: ${stats.nonCashMovementTransactions}
Cash Movement Percentage: ${stats.cashMovementPercentage.toFixed(1)}%
`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `VAT_Analysis_Report_${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};