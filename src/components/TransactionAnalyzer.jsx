import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Upload, FileText, TrendingUp, DollarSign, Activity } from 'lucide-react';

const TransactionAnalyzer = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setError('');

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const parsedData = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          return {
            documentType: values[0] || '',
            vatNumber: values[1] || '',
            transactionNumber: values[2] || '',
            transactionDate: values[3] || '',
            comment1: values[4] || '',
            comment2: values[5] || '',
            amountGBP: parseFloat(values[6]) || 0
          };
        })
        .filter(row => row.vatNumber && row.documentType);

      setData(parsedData);
    } catch (err) {
      setError('Error parsing file. Please ensure it\'s a valid CSV format.');
    } finally {
      setIsLoading(false);
    }
  };

  const analysis = useMemo(() => {
    if (!data.length) return null;

    // Group by VAT Number
    const vatGroups = data.reduce((acc, transaction) => {
      const vatNumber = transaction.vatNumber;
      if (!acc[vatNumber]) {
        acc[vatNumber] = {
          vatNumber,
          invoiceCount: 0,
          creditNoteCount: 0,
          totalValue: 0,
          invoiceValue: 0,
          creditNoteValue: 0,
          cashMovementCount: 0,
          nonCashMovementCount: 0,
          cashMovementValue: 0,
          nonCashMovementValue: 0,
          totalCount: 0
        };
      }

      const group = acc[vatNumber];
      const amount = transaction.amountGBP;
      const isCashMovement = (transaction.comment1 + ' ' + transaction.comment2)
        .toLowerCase().includes('move');

      // Count transaction types
      if (transaction.documentType === 'SIINV') {
        group.invoiceCount++;
        group.invoiceValue += amount;
      } else if (transaction.documentType === 'SICRN') {
        group.creditNoteCount++;
        group.creditNoteValue += amount;
      }

      // Count cash movements
      if (isCashMovement) {
        group.cashMovementCount++;
        group.cashMovementValue += amount;
      } else {
        group.nonCashMovementCount++;
        group.nonCashMovementValue += amount;
      }

      group.totalValue += amount;
      group.totalCount++;

      return acc;
    }, {});

    const vatAnalysis = Object.values(vatGroups)
      .sort((a, b) => b.totalCount - a.totalCount);

    // Top 10 by volume for cash movement analysis
    const top10ByVolume = vatAnalysis.slice(0, 10);

    return {
      vatAnalysis,
      top10ByVolume,
      totalTransactions: data.length,
      totalValue: data.reduce((sum, t) => sum + t.amountGBP, 0)
    };
  }, [data]);

  const chartData = analysis?.top10ByVolume.map(vat => ({
    vatNumber: vat.vatNumber.substring(0, 8) + '...',
    fullVatNumber: vat.vatNumber,
    'Cash Movement': vat.cashMovementCount,
    'Non-Cash Movement': vat.nonCashMovementCount,
    'Cash Movement Value': vat.cashMovementValue,
    'Non-Cash Movement Value': vat.nonCashMovementValue
  })) || [];

  const pieData = analysis ? [
    { name: 'Cash Movement', value: analysis.vatAnalysis.reduce((sum, vat) => sum + vat.cashMovementCount, 0) },
    { name: 'Non-Cash Movement', value: analysis.vatAnalysis.reduce((sum, vat) => sum + vat.nonCashMovementCount, 0) }
  ] : [];

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <FileText className="text-blue-600" />
          Transaction Analysis Dashboard
        </h1>

        {/* File Upload */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Transaction CSV File
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Choose CSV File
            </label>
            <p className="mt-2 text-sm text-gray-500">
              Upload your transaction data CSV file
            </p>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Processing file...</p>
          </div>
        )}

        {analysis && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Total Transactions</p>
                    <p className="text-2xl font-bold text-blue-900">{analysis.totalTransactions.toLocaleString()}</p>
                  </div>
                  <Activity className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Total Value</p>
                    <p className="text-2xl font-bold text-green-900">£{analysis.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Unique VAT Numbers</p>
                    <p className="text-2xl font-bold text-purple-900">{analysis.vatAnalysis.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Cash Movements</p>
                    <p className="text-2xl font-bold text-orange-900">
                      {analysis.vatAnalysis.reduce((sum, vat) => sum + vat.cashMovementCount, 0).toLocaleString()}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* VAT Number Analysis Table */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">VAT Number Analysis (Top 20)</h2>
                <p className="text-sm text-gray-600">Sorted by total transaction volume</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VAT Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Count</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoices</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Credit Notes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cash Movements</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Non-Cash</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {analysis.vatAnalysis.slice(0, 20).map((vat, index) => (
                      <tr key={vat.vatNumber} className={index < 10 ? 'bg-blue-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{vat.vatNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">{vat.totalCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vat.invoiceCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vat.creditNoteCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          £{vat.totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vat.cashMovementCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vat.nonCashMovementCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Transaction Volume Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Cash vs Non-Cash Movements (Top 10 VAT Numbers)</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="vatNumber" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(label) => {
                        const item = chartData.find(d => d.vatNumber === label);
                        return item ? item.fullVatNumber : label;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Cash Movement" fill="#8884d8" />
                    <Bar dataKey="Non-Cash Movement" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Cash Movement Pie Chart */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Overall Cash Movement Distribution</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value.toLocaleString(), 'Transactions']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Value Analysis Chart */}
            <div className="bg-white p-6 rounded-lg shadow mt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Transaction Values: Cash vs Non-Cash (Top 10 VAT Numbers)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="vatNumber" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                  <Tooltip 
                    labelFormatter={(label) => {
                      const item = chartData.find(d => d.vatNumber === label);
                      return item ? item.fullVatNumber : label;
                    }}
                    formatter={(value) => [`£${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, '']}
                  />
                  <Legend />
                  <Bar dataKey="Cash Movement Value" fill="#ff7c7c" />
                  <Bar dataKey="Non-Cash Movement Value" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionAnalyzer;