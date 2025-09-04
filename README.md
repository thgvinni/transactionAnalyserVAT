# Transaction Analyzer VAT

A web application for analyzing financial transaction data with focus on VAT number analysis and cash movement patterns.

## Features

- **File Upload**: Drag-and-drop or browse to upload CSV/Excel files
- **VAT Analysis**: Compare transaction counts and values by VAT number
- **Cash Movement Detection**: Automatically identifies cash movement transactions
- **Interactive Visualizations**: Bar charts and pie charts for data visualization
- **Data Export**: Export results to Excel or PDF format
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/thgvinni/transactionAnalyserVAT.git
cd transactionAnalyserVAT
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Upload File**: Click on the upload area or drag and drop your transaction file
2. **View Analysis**: Once uploaded, the app will automatically analyze the data
3. **Review Results**: 
   - Summary cards show key metrics
   - Charts visualize VAT comparisons and cash movements
   - Table displays detailed VAT analysis
4. **Export Data**: Use the Export buttons to download results as Excel or PDF

## File Format

The application expects a CSV or Excel file with the following columns:

- **Document Type**: SIINV (Internal Invoices) or SICRN (Internal Credit Notes)
- **Vat Number**: Customer VAT identifier
- **Transaction Number**: Unique transaction reference
- **Transaction Date**: Date of transaction
- **Transaction Comment 1**: Transaction details
- **Transaction Comment 2**: Additional transaction details
- **Amount in GBP**: Transaction value

### Cash Movement Detection

Transactions are automatically classified as "cash movements" if the comments contain:
- "cash move"
- "c/move"
- Any text containing "move"

## Sample Data

A sample CSV file (`sample_data.csv`) is included in the repository for testing purposes.

## Technology Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Papa Parse** - CSV parsing
- **XLSX** - Excel file handling

## Deployment

### Docker & Cloud Run

The application is containerized and ready for deployment to Google Cloud Run:

```bash
# Test locally
chmod +x local-test.sh
./local-test.sh

# Deploy to Cloud Run
chmod +x deploy.sh
./deploy.sh YOUR_GCP_PROJECT_ID
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Docker Commands

```bash
# Build locally
docker build -t transaction-analyzer-vat .

# Run locally
docker run -p 8080:8080 transaction-analyzer-vat

# Test health endpoint
curl http://localhost:8080/health
```

## Development

### Project Structure

```
src/
├── components/       # React components
│   ├── FileUpload/  # File upload component
│   ├── Charts/      # Chart components
│   ├── DataTable/   # Table components
│   └── Summary/     # Summary card components
├── services/        # Business logic
│   ├── fileParser.ts    # File parsing logic
│   └── dataAnalyzer.ts  # Data analysis functions
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── App.tsx         # Main application component
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## License

MIT