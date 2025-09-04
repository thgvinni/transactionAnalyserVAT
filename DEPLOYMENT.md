# Deployment Guide - Google Cloud Run

This guide explains how to deploy the Transaction Analyzer VAT application to Google Cloud Run.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **gcloud CLI** installed and configured
3. **Docker** installed on your machine
4. **Enable required APIs** in your GCP project:
   - Cloud Run API
   - Cloud Build API
   - Container Registry API

## Quick Deployment

### Option 1: Using the Deployment Script (Recommended)

1. Make the deployment script executable:
```bash
chmod +x deploy.sh
```

2. Run the deployment:
```bash
./deploy.sh YOUR_GCP_PROJECT_ID
```

### Option 2: Manual Deployment

1. **Set up gcloud**:
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud auth configure-docker
```

2. **Build and push the image**:
```bash
docker build -t gcr.io/YOUR_PROJECT_ID/transaction-analyzer-vat .
docker push gcr.io/YOUR_PROJECT_ID/transaction-analyzer-vat
```

3. **Deploy to Cloud Run**:
```bash
gcloud run deploy transaction-analyzer-vat \
    --image=gcr.io/YOUR_PROJECT_ID/transaction-analyzer-vat \
    --platform=managed \
    --region=europe-west1 \
    --allow-unauthenticated \
    --port=8080 \
    --memory=512Mi \
    --cpu=1 \
    --max-instances=10
```

## Local Testing

Before deploying to Cloud Run, test the Docker container locally:

```bash
chmod +x local-test.sh
./local-test.sh
```

This will:
- Build the Docker image
- Run it locally on port 8080
- Test the health endpoint
- Show container logs

Access the application at `http://localhost:8080`

## Continuous Deployment with Cloud Build

### Setup Cloud Build Trigger

1. Connect your repository to Cloud Build
2. Create a trigger that uses `cloudbuild.yaml`
3. Set trigger to run on commits to main branch

### Manual Cloud Build

```bash
gcloud builds submit --config cloudbuild.yaml
```

## Configuration Options

### Environment Variables

You can set environment variables in Cloud Run:

```bash
gcloud run services update transaction-analyzer-vat \
    --set-env-vars="NODE_ENV=production" \
    --region=europe-west1
```

### Resource Limits

Adjust CPU and memory as needed:

```bash
gcloud run services update transaction-analyzer-vat \
    --memory=1Gi \
    --cpu=2 \
    --region=europe-west1
```

### Traffic Splitting

For blue-green deployments:

```bash
gcloud run services update-traffic transaction-analyzer-vat \
    --to-revisions=REVISION-NAME=50 \
    --region=europe-west1
```

## Monitoring and Logs

### View logs:
```bash
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=transaction-analyzer-vat" --limit 50
```

### Monitor metrics:
Visit the Cloud Console:
`https://console.cloud.google.com/run/detail/REGION/SERVICE_NAME/metrics`

## Security Considerations

1. **Authentication**: The service is deployed with `--allow-unauthenticated` for public access
2. **HTTPS**: Cloud Run automatically provides HTTPS
3. **Custom Domain**: You can map a custom domain:
```bash
gcloud run domain-mappings create --service=transaction-analyzer-vat --domain=your-domain.com
```

## Cost Optimization

1. **Minimum instances**: Set to 0 for cost savings
2. **Maximum instances**: Limit to control costs
3. **CPU allocation**: Only during requests
4. **Memory**: Start with 512Mi, adjust based on usage

## Troubleshooting

### Common Issues

1. **Build failures**: Check Dockerfile and ensure all dependencies are correctly specified
2. **Port issues**: Cloud Run expects the app to listen on port 8080
3. **Memory issues**: Increase memory allocation if the app crashes
4. **Timeout issues**: Increase request timeout for large file uploads

### Debug commands:
```bash
# View service details
gcloud run services describe transaction-analyzer-vat --region=europe-west1

# View revisions
gcloud run revisions list --service=transaction-analyzer-vat --region=europe-west1

# Stream logs
gcloud logs tail "resource.type=cloud_run_revision AND resource.labels.service_name=transaction-analyzer-vat"
```

## Cleanup

To delete the service:
```bash
gcloud run services delete transaction-analyzer-vat --region=europe-west1
```

To delete the container images:
```bash
gcloud container images list --repository=gcr.io/YOUR_PROJECT_ID
gcloud container images delete gcr.io/YOUR_PROJECT_ID/transaction-analyzer-vat
```