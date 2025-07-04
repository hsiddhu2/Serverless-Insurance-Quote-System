# Simple script to upload website files to S3 after sam deploy
param(
    [string]$StackName = "serverless-insurance-quote-app"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Uploading Website Files to S3" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host

# Check if AWS CLI is available
try {
    aws --version | Out-Null
} catch {
    Write-Error "AWS CLI is not installed or not in PATH. Please install AWS CLI first."
    exit 1
}

# Get stack outputs
Write-Host "Getting stack outputs..." -ForegroundColor Yellow

$apiEndpoint = aws cloudformation describe-stacks --stack-name serverless-insurance-quote-app --query "Stacks[0].Outputs[?OutputKey=='InsuranceApiUrl'].OutputValue" --output text --region us-west-2
$bucketName = aws cloudformation describe-stacks --stack-name insurance-quote-website --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text --region us-west-2
$websiteUrl = aws cloudformation describe-stacks --stack-name insurance-quote-website --query "Stacks[0].Outputs[?OutputKey=='CloudFrontURL'].OutputValue" --output text --region us-west-2


if (-not $bucketName) {
    Write-Error "Could not retrieve S3 bucket name from stack '$StackName'. Make sure the stack is deployed."
    exit 1
}

Write-Host "S3 Bucket: $bucketName" -ForegroundColor Green
Write-Host

if ($apiEndpoint) {
    Write-Host "API Endpoint: $apiEndpoint" -ForegroundColor Green
} else {
    Write-Host "Warning: Could not retrieve API endpoint from stack outputs." -ForegroundColor Yellow
}

Write-Host

# Upload website files from frontend directory
Write-Host "Uploading website files from frontend directory..." -ForegroundColor Yellow

aws s3 sync frontend/ s3://$bucketName/ `
    --delete

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to upload files to S3"
    exit 1
}

Write-Host
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " UPLOAD SUCCESSFUL!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host
Write-Host "Website files uploaded to: $bucketName" -ForegroundColor Green
if ($websiteUrl) {
    Write-Host "Website URL: $websiteUrl" -ForegroundColor Yellow
}
Write-Host