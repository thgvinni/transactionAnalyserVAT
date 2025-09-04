import { Transaction, VATAnalysis } from '@/types/transaction';

export const analyzeTransactionsByVAT = (transactions: Transaction[]): VATAnalysis[] => {
  const vatMap = new Map<string, VATAnalysis>();

  transactions.forEach((transaction) => {
    const existing = vatMap.get(transaction.vatNumber) || {
      vatNumber: transaction.vatNumber,
      invoiceCount: 0,
      creditNoteCount: 0,
      totalTransactions: 0,
      totalValue: 0,
      cashMovementCount: 0,
      nonCashMovementCount: 0,
      cashMovementValue: 0,
      nonCashMovementValue: 0,
    };

    existing.totalTransactions++;
    existing.totalValue += Math.abs(transaction.amountGBP);

    if (transaction.documentType === 'SIINV') {
      existing.invoiceCount++;
    } else if (transaction.documentType === 'SICRN') {
      existing.creditNoteCount++;
    }

    if (transaction.isCashMovement) {
      existing.cashMovementCount++;
      existing.cashMovementValue += Math.abs(transaction.amountGBP);
    } else {
      existing.nonCashMovementCount++;
      existing.nonCashMovementValue += Math.abs(transaction.amountGBP);
    }

    vatMap.set(transaction.vatNumber, existing);
  });

  return Array.from(vatMap.values());
};

export const getTopVATNumbersByVolume = (
  vatAnalysis: VATAnalysis[],
  limit: number = 10
): VATAnalysis[] => {
  return [...vatAnalysis]
    .sort((a, b) => b.totalTransactions - a.totalTransactions)
    .slice(0, limit);
};

export const getTopVATNumbersByValue = (
  vatAnalysis: VATAnalysis[],
  limit: number = 10
): VATAnalysis[] => {
  return [...vatAnalysis]
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, limit);
};

export const calculateSummaryStatistics = (transactions: Transaction[]) => {
  const totalTransactions = transactions.length;
  const totalValue = transactions.reduce((sum, t) => sum + Math.abs(t.amountGBP), 0);
  const cashMovementTransactions = transactions.filter(t => t.isCashMovement).length;
  const nonCashMovementTransactions = totalTransactions - cashMovementTransactions;
  const uniqueVATNumbers = new Set(transactions.map(t => t.vatNumber)).size;
  
  const invoices = transactions.filter(t => t.documentType === 'SIINV');
  const creditNotes = transactions.filter(t => t.documentType === 'SICRN');
  
  const invoiceValue = invoices.reduce((sum, t) => sum + Math.abs(t.amountGBP), 0);
  const creditNoteValue = creditNotes.reduce((sum, t) => sum + Math.abs(t.amountGBP), 0);

  return {
    totalTransactions,
    totalValue,
    cashMovementTransactions,
    nonCashMovementTransactions,
    cashMovementPercentage: (cashMovementTransactions / totalTransactions) * 100,
    uniqueVATNumbers,
    invoiceCount: invoices.length,
    creditNoteCount: creditNotes.length,
    invoiceValue,
    creditNoteValue,
    averageTransactionValue: totalValue / totalTransactions,
  };
};

export const prepareChartDataForVATComparison = (vatAnalysis: VATAnalysis[]) => {
  const topByVolume = getTopVATNumbersByVolume(vatAnalysis, 10);
  
  return {
    labels: topByVolume.map(v => v.vatNumber),
    datasets: [
      {
        label: 'Invoices',
        data: topByVolume.map(v => v.invoiceCount),
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Credit Notes',
        data: topByVolume.map(v => v.creditNoteCount),
        backgroundColor: 'rgba(255, 99, 132, 0.8)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
      },
    ],
  };
};

export const prepareChartDataForCashMovement = (vatAnalysis: VATAnalysis[]) => {
  const topByVolume = getTopVATNumbersByVolume(vatAnalysis, 10);
  
  return {
    labels: topByVolume.map(v => v.vatNumber),
    datasets: [
      {
        label: 'Cash Movement',
        data: topByVolume.map(v => v.cashMovementCount),
        backgroundColor: 'rgba(75, 192, 192, 0.8)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Non-Cash Movement',
        data: topByVolume.map(v => v.nonCashMovementCount),
        backgroundColor: 'rgba(255, 206, 86, 0.8)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1,
      },
    ],
  };
};

export const preparePieChartDataForTransactionTypes = (transactions: Transaction[]) => {
  const cashMovement = transactions.filter(t => t.isCashMovement).length;
  const nonCashMovement = transactions.filter(t => !t.isCashMovement).length;
  
  return {
    labels: ['Cash Movement', 'Non-Cash Movement'],
    datasets: [
      {
        data: [cashMovement, nonCashMovement],
        backgroundColor: [
          'rgba(75, 192, 192, 0.8)',
          'rgba(255, 206, 86, 0.8)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
};