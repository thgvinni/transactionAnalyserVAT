import React, { useState } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { SummaryCard } from '@/components/Summary';
import { BarChart, PieChart } from '@/components/Charts';
import { VATAnalysisTable } from '@/components/DataTable';
import { Transaction, VATAnalysis } from '@/types/transaction';
import {
  analyzeTransactionsByVAT,
  getTopVATNumbersByVolume,
  calculateSummaryStatistics,
} from '@/services/dataAnalyzer';
import {
  FileText,
  TrendingUp,
  Users,
  CreditCard,
  Receipt,
  ArrowUpDown,
  Download,
} from 'lucide-react';
import { exportToExcel, exportToPDF } from '@/utils/exportHelpers';

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [vatAnalysis, setVatAnalysis] = useState<VATAnalysis[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const handleFileUpload = (result: any) => {
    if (result.success && result.data) {
      setTransactions(result.data);
      const analysis = analyzeTransactionsByVAT(result.data);
      setVatAnalysis(analysis);
      setIsDataLoaded(true);
    }
  };

  const stats = isDataLoaded ? calculateSummaryStatistics(transactions) : null;
  const topVatNumbers = isDataLoaded ? getTopVATNumbersByVolume(vatAnalysis, 10) : [];

  const prepareBarChartData = () => {
    return topVatNumbers.map(vat => ({
      name: vat.vatNumber,
      Invoices: vat.invoiceCount,
      'Credit Notes': vat.creditNoteCount,
    }));
  };

  const prepareCashMovementBarChartData = () => {
    return topVatNumbers.map(vat => ({
      name: vat.vatNumber,
      'Cash Movement': vat.cashMovementCount,
      'Non-Cash Movement': vat.nonCashMovementCount,
    }));
  };

  const preparePieChartData = () => {
    if (!stats) return [];
    return [
      { name: 'Cash Movement', value: stats.cashMovementTransactions },
      { name: 'Non-Cash Movement', value: stats.nonCashMovementTransactions },
    ];
  };

  const handleExportExcel = () => {
    if (vatAnalysis.length > 0) {
      exportToExcel(vatAnalysis, transactions);
    }
  };

  const handleExportPDF = () => {
    if (vatAnalysis.length > 0 && stats) {
      exportToPDF(vatAnalysis, stats);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Transaction Analyzer - VAT Analysis
          </h1>
          <p className="text-gray-600 mt-2">
            Upload your transaction file to analyze VAT numbers and cash movements
          </p>
        </header>

        {!isDataLoaded ? (
          <FileUpload onFileUpload={handleFileUpload} />
        ) : (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <button
                onClick={() => {
                  setIsDataLoaded(false);
                  setTransactions([]);
                  setVatAnalysis([]);
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Upload New File
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
              </div>
            </div>

            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                  title="Total Transactions"
                  value={stats.totalTransactions}
                  icon={<FileText className="w-6 h-6" />}
                  color="blue"
                />
                <SummaryCard
                  title="Total Value"
                  value={`£${stats.totalValue.toFixed(2)}`}
                  icon={<TrendingUp className="w-6 h-6" />}
                  color="green"
                />
                <SummaryCard
                  title="Unique VAT Numbers"
                  value={stats.uniqueVATNumbers}
                  icon={<Users className="w-6 h-6" />}
                  color="purple"
                />
                <SummaryCard
                  title="Cash Movement %"
                  value={`${stats.cashMovementPercentage.toFixed(1)}%`}
                  icon={<ArrowUpDown className="w-6 h-6" />}
                  color="yellow"
                  subtitle={`${stats.cashMovementTransactions} of ${stats.totalTransactions}`}
                />
                <SummaryCard
                  title="Total Invoices"
                  value={stats.invoiceCount}
                  icon={<Receipt className="w-6 h-6" />}
                  color="blue"
                  subtitle={`£${stats.invoiceValue.toFixed(2)}`}
                />
                <SummaryCard
                  title="Total Credit Notes"
                  value={stats.creditNoteCount}
                  icon={<CreditCard className="w-6 h-6" />}
                  color="red"
                  subtitle={`£${stats.creditNoteValue.toFixed(2)}`}
                />
                <SummaryCard
                  title="Avg Transaction"
                  value={`£${stats.averageTransactionValue.toFixed(2)}`}
                  icon={<TrendingUp className="w-6 h-6" />}
                  color="green"
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <BarChart
                  title="Top 10 VAT Numbers - Invoice vs Credit Note"
                  data={prepareBarChartData()}
                  dataKeys={['Invoices', 'Credit Notes']}
                  colors={['#3B82F6', '#EF4444']}
                />
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <BarChart
                  title="Top 10 VAT Numbers - Cash vs Non-Cash Movement"
                  data={prepareCashMovementBarChartData()}
                  dataKeys={['Cash Movement', 'Non-Cash Movement']}
                  colors={['#10B981', '#F59E0B']}
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <PieChart
                title="Overall Transaction Type Distribution"
                data={preparePieChartData()}
                colors={['#10B981', '#F59E0B']}
              />
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <VATAnalysisTable
                data={vatAnalysis}
                title="VAT Number Analysis - Full Details"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;