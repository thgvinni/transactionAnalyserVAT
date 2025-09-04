from flask import Flask, render_template, request, jsonify
import pandas as pd
import io
import json
from datetime import datetime

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Please upload a CSV file'}), 400
    
    try:
        # Read CSV data
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        df = pd.read_csv(stream)
        
        # Clean column names
        df.columns = df.columns.str.strip().str.replace('"', '')
        
        # Expected columns based on your React app
        expected_columns = ['Document Type', 'VAT Number', 'Transaction Number', 
                          'Transaction Date', 'Comment 1', 'Comment 2', 'Amount (GBP)']
        
        # Rename columns to match expected format
        if len(df.columns) >= 7:
            df.columns = expected_columns[:len(df.columns)]
        
        # Clean and process data
        df = df.dropna(subset=['VAT Number', 'Document Type'])
        df['Amount (GBP)'] = pd.to_numeric(df['Amount (GBP)'], errors='coerce').fillna(0)
        
        # Perform analysis
        analysis = perform_analysis(df)
        
        return jsonify({
            'success': True,
            'data': analysis,
            'total_records': len(df)
        })
        
    except Exception as e:
        return jsonify({'error': f'Error processing file: {str(e)}'}), 400

def is_cash_movement(comment1, comment2):
    """Detect if transaction is a cash movement based on comments"""
    if pd.isna(comment1):
        comment1 = ""
    if pd.isna(comment2):
        comment2 = ""
    
    combined_comments = f"{comment1} {comment2}".lower()
    cash_movement_keywords = ['cash move', 'c/move', 'move']
    
    return any(keyword in combined_comments for keyword in cash_movement_keywords)

def perform_analysis(df):
    """Perform enhanced VAT transaction analysis"""
    
    # Add cash movement detection
    df['Is_Cash_Movement'] = df.apply(lambda row: is_cash_movement(row['Comment 1'], row['Comment 2']), axis=1)
    
    # Group by VAT Number with enhanced analysis
    vat_groups = df.groupby('VAT Number').agg({
        'Amount (GBP)': ['sum', 'count', 'mean'],
        'Is_Cash_Movement': 'sum'
    }).round(2)
    
    vat_groups.columns = ['Total_Amount', 'Transaction_Count', 'Average_Amount', 'Cash_Movement_Count']
    vat_groups['Non_Cash_Movement_Count'] = vat_groups['Transaction_Count'] - vat_groups['Cash_Movement_Count']
    vat_groups = vat_groups.reset_index()
    
    # Group by Document Type
    doc_type_groups = df.groupby('Document Type').agg({
        'Amount (GBP)': 'sum',
        'VAT Number': 'count'
    }).round(2)
    
    doc_type_groups.columns = ['Total_Amount', 'Count']
    doc_type_groups = doc_type_groups.reset_index()
    
    # Invoice type breakdown per VAT Number
    invoice_type_analysis = df.groupby(['VAT Number', 'Document Type']).agg({
        'Amount (GBP)': ['sum', 'count']
    }).round(2)
    
    invoice_type_analysis.columns = ['Amount', 'Count']
    invoice_type_analysis = invoice_type_analysis.reset_index()
    
    # Top 10 VAT numbers by transaction volume (count)
    top_10_by_volume = vat_groups.nlargest(10, 'Transaction_Count')
    
    # Cash movement analysis for top 10 by volume
    cash_movement_analysis = []
    for _, vat_row in top_10_by_volume.iterrows():
        vat_number = vat_row['VAT Number']
        cash_movement_analysis.append({
            'VAT_Number': vat_number,
            'Total_Transactions': int(vat_row['Transaction_Count']),
            'Cash_Movement': int(vat_row['Cash_Movement_Count']),
            'Non_Cash_Movement': int(vat_row['Non_Cash_Movement_Count']),
            'Cash_Movement_Percentage': round((vat_row['Cash_Movement_Count'] / vat_row['Transaction_Count'] * 100), 1) if vat_row['Transaction_Count'] > 0 else 0
        })
    
    # Calculate totals
    total_amount = df['Amount (GBP)'].sum()
    total_transactions = len(df)
    unique_vat_numbers = df['VAT Number'].nunique()
    total_cash_movements = df['Is_Cash_Movement'].sum()
    
    # Prepare chart data
    vat_chart_data = vat_groups.head(10).to_dict('records')
    doc_type_chart_data = doc_type_groups.to_dict('records')
    
    return {
        'summary': {
            'total_amount': round(total_amount, 2),
            'total_transactions': total_transactions,
            'unique_vat_numbers': unique_vat_numbers,
            'total_cash_movements': int(total_cash_movements),
            'cash_movement_percentage': round((total_cash_movements / total_transactions * 100), 1) if total_transactions > 0 else 0,
            'average_transaction': round(total_amount / total_transactions if total_transactions > 0 else 0, 2)
        },
        'vat_analysis': vat_chart_data,
        'document_type_analysis': doc_type_chart_data,
        'invoice_type_analysis': invoice_type_analysis.to_dict('records'),
        'top_vat_by_volume': top_10_by_volume.to_dict('records'),
        'cash_movement_analysis': cash_movement_analysis,
        'top_vat_numbers': vat_groups.nlargest(5, 'Total_Amount').to_dict('records')
    }

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)