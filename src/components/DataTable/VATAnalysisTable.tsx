import React, { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { VATAnalysis } from '@/types/transaction';

interface VATAnalysisTableProps {
  data: VATAnalysis[];
  title?: string;
}

type SortKey = keyof VATAnalysis;
type SortDirection = 'asc' | 'desc';

export const VATAnalysisTable: React.FC<VATAnalysisTableProps> = ({ data, title }) => {
  const [sortKey, setSortKey] = useState<SortKey>('totalTransactions');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    return sortDirection === 'asc'
      ? (aValue as number) - (bValue as number)
      : (bValue as number) - (aValue as number);
  });

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      )}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th className="px-6 py-3">
                <button
                  onClick={() => handleSort('vatNumber')}
                  className="flex items-center space-x-1 hover:text-blue-600"
                >
                  <span>VAT Number</span>
                  <SortIcon column="vatNumber" />
                </button>
              </th>
              <th className="px-6 py-3">
                <button
                  onClick={() => handleSort('totalTransactions')}
                  className="flex items-center space-x-1 hover:text-blue-600"
                >
                  <span>Total Transactions</span>
                  <SortIcon column="totalTransactions" />
                </button>
              </th>
              <th className="px-6 py-3">
                <button
                  onClick={() => handleSort('invoiceCount')}
                  className="flex items-center space-x-1 hover:text-blue-600"
                >
                  <span>Invoices</span>
                  <SortIcon column="invoiceCount" />
                </button>
              </th>
              <th className="px-6 py-3">
                <button
                  onClick={() => handleSort('creditNoteCount')}
                  className="flex items-center space-x-1 hover:text-blue-600"
                >
                  <span>Credit Notes</span>
                  <SortIcon column="creditNoteCount" />
                </button>
              </th>
              <th className="px-6 py-3">
                <button
                  onClick={() => handleSort('totalValue')}
                  className="flex items-center space-x-1 hover:text-blue-600"
                >
                  <span>Total Value</span>
                  <SortIcon column="totalValue" />
                </button>
              </th>
              <th className="px-6 py-3">
                <button
                  onClick={() => handleSort('cashMovementCount')}
                  className="flex items-center space-x-1 hover:text-blue-600"
                >
                  <span>Cash Movements</span>
                  <SortIcon column="cashMovementCount" />
                </button>
              </th>
              <th className="px-6 py-3">
                <button
                  onClick={() => handleSort('nonCashMovementCount')}
                  className="flex items-center space-x-1 hover:text-blue-600"
                >
                  <span>Non-Cash</span>
                  <SortIcon column="nonCashMovementCount" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.slice(0, 20).map((row, index) => (
              <tr key={row.vatNumber} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {row.vatNumber}
                </td>
                <td className="px-6 py-4">{row.totalTransactions.toLocaleString()}</td>
                <td className="px-6 py-4">{row.invoiceCount.toLocaleString()}</td>
                <td className="px-6 py-4">{row.creditNoteCount.toLocaleString()}</td>
                <td className="px-6 py-4 font-medium">{formatCurrency(row.totalValue)}</td>
                <td className="px-6 py-4">{row.cashMovementCount.toLocaleString()}</td>
                <td className="px-6 py-4">{row.nonCashMovementCount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};