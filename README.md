# Serverless Insurance Quote System

A complete serverless insurance quote application built with AWS services, demonstrating modern cloud architecture patterns including event-driven processing, secure authentication, and scalable infrastructure.

## 🎆 Application Features

### 📝 **Quote Management**
- **Multi-Insurance Support**: Auto, Life, and Home insurance quotes
- **Instant Calculations**: Real-time premium estimates based on user inputs
- **Form Validation**: Comprehensive client-side validation ensuring data quality
- **Quote History**: Authenticated users can view all their past quotes
- **Duplicate Prevention**: One quote per user per insurance type using composite keys

### 🔐 **Authentication & Security**
- **AWS Cognito Integration**: Secure user registration and login
- **Hosted UI**: Professional login/signup experience
- **JWT Token Management**: Secure API access with automatic token handling
- **Protected Routes**: Quote history accessible only to authenticated users

### 🏗️ **Architecture Highlights**
- **Event-Driven Processing**: SNS/SQS for decoupled quote processing
- **Message Filtering**: Automatic routing to insurance-specific processors
- **Serverless Compute**: AWS Lambda for cost-effective scaling
- **NoSQL Database**: DynamoDB with optimized data modeling
- **CDN Distribution**: CloudFront for global content delivery
- **Infrastructure as Code**: Complete AWS SAM deployment

## 📚 **What I Learned Building This**

### **AWS Services Integration**
- **SNS/SQS Message Filtering**: Learned how to route messages based on attributes
- **DynamoDB Composite Keys**: Implemented `email#insuranceType` pattern for duplicate prevention
- **Cognito Hosted UI**: Integrated OAuth2 flow with custom callback handling
- **CloudFront OAC**: Implemented secure S3 access using Origin Access Control
- **API Gateway CORS**: Configured proper cross-origin resource sharing

### **Serverless Patterns**
- **Event-Driven Architecture**: Decoupled processing using pub/sub pattern
- **Lambda Function Organization**: Separate functions for different insurance types
- **Environment Variables**: Centralized configuration management
- **IAM Least Privilege**: Granular permissions for each Lambda function

### **Frontend Integration**
- **JWT Token Handling**: Client-side token storage and validation
- **API Error Handling**: Graceful error responses and user feedback
- **Form State Management**: Dynamic form fields based on insurance type
- **Responsive Design**: Mobile-friendly interface without frameworks

### **DevOps & Deployment**
- **SAM Templates**: Infrastructure as Code with separate stacks
- **CloudFormation Dependencies**: Managing resource creation order
- **Deployment Automation**: PowerShell scripts for file uploads
- **Stack Management**: Separate backend and frontend deployments

## 🚀 Deployment Guide

### **Prerequisites**
- AWS CLI configured with appropriate permissions
- SAM CLI installed
- Python for local development server (optional)

### **Step 1: Deploy Backend Infrastructure**

```bash
# Clone and navigate to project
git clone <repository-url>
cd Serverless-Insurance-Quote-System

# Build and deploy backend
sam build
sam deploy --guided
```

**What gets deployed:**
- ✅ Lambda functions (6 functions: quote processing + access validation)
- ✅ DynamoDB table with composite key design
- ✅ SNS topic with SQS queues and message filtering
- ✅ API Gateway with CORS configuration
- ✅ Cognito User Pool with Hosted UI
- ✅ IAM roles and policies

### **Step 2: Configure Frontend**

Update `config.js` with your deployment outputs:
```javascript
// Get these values from: aws cloudformation describe-stacks --stack-name serverless-insurance-quote-app
window.API_ENDPOINT = "https://your-api-id.execute-api.region.amazonaws.com/Prod";
window.COGNITO_CONFIG = {
    userPoolId: 'region_xxxxxxxxx',
    clientId: 'your-client-id',
    region: 'us-west-2',
    accountId: 'your-account-id'
};
```

### **Step 3: Create Access Codes Secret (Manual)**
Create a secret in AWS Secrets Manager for access codes:

```bash
# Create the secret with your access codes
aws secretsmanager create-secret \
    --name "serverless-insurance-quote-app-access-codes" \
    --description "Access codes for insurance quote system" \
    --secret-string "DEMO2024,SECURE2024,PORTFOLIO2024" \
    --region us-west-2
```

**Note:** Access codes are stored as comma-separated values. Add/remove codes as needed:
```bash
# Update access codes
aws secretsmanager update-secret \
    --secret-id "serverless-insurance-quote-app-access-codes" \
    --secret-string "DEMO2024,NEWCODE2024,PORTFOLIO2024" \
    --region us-west-2
```

### **Step 4A: Local Development (Recommended for Testing)**

```bash
# Option 1: VS Code Live Server
# Install Live Server extension, right-click index.html -> "Open with Live Server"

# Option 2: Python HTTP Server
python -m http.server 5500
```

**Access locally at:** `http://localhost:5500`

### **Step 4B: AWS Deployment with CloudFront**

```bash
# Deploy website hosting infrastructure
sam deploy --template-file website-hosting.yaml --stack-name insurance-quote-website --capabilities CAPABILITY_IAM

# Upload website files
.\upload-website.ps1 -StackName insurance-quote-website

# Get your production URL
aws cloudformation describe-stacks --stack-name insurance-quote-website --query "Stacks[0].Outputs[?OutputKey=='CloudFrontURL'].OutputValue" --output text
```

**Manual Step:** Add CloudFront URL to Cognito User Pool Client callback URLs in AWS Console.





## 🛠️ Technology Stack

### Frontend
- **HTML5/CSS3**: Responsive design with modern styling
- **Vanilla JavaScript**: No frameworks, lightweight and fast
- **Session-based Access Control**: Secure access management

### Backend
- **AWS Lambda**: Serverless compute (Python 3.10)
- **AWS API Gateway**: HTTP API with CORS support
- **AWS DynamoDB**: NoSQL database with composite keys
- **AWS SNS/SQS**: Message queuing and filtering
- **AWS Cognito**: User management and authentication

### Infrastructure
- **AWS SAM**: Infrastructure as Code
- **CloudFormation**: Resource provisioning and management
- **S3 + CloudFront**: Optional static hosting with CDN

## 📁 Project Structure

```
├── index.html              # Home page with quote options
├── login.html              # Branded authentication page
├── quote.html              # Dynamic quote request form
├── quotes.html             # User quotes dashboard
├── style.css               # Responsive styling
├── script.js               # Quote form logic and validation
├── cognito-hosted.js       # Authentication handling
├── config.js               # Configuration (update after deployment)
├── template.yaml           # SAM template (backend infrastructure)
├── website-hosting.yaml    # S3 hosting template (optional)
├── upload-website.ps1      # File upload automation
└── backend/
    └── lambda/            # Lambda function code
        ├── submitQuote.py
        ├── calculatePremium.py
        ├── getUserQuotes.py
        ├── autoQuoteLambda.py
        ├── homeQuoteLambda.py
        ├── LifeQuoteLambda.py
        └── validateAccess.py
```

## 🔄 Event Flow

1. **Quote Submission** → API Gateway → SubmitQuote Lambda
2. **SNS Publishing** → Insurance-Quote-Requests Topic with message attributes
3. **Message Filtering** → Routed to appropriate SQS queue (auto/life/home)
4. **Processing** → Type-specific Lambda processes and validates quote
5. **Storage** → Quote saved to DynamoDB with composite key
6. **Retrieval** → Authenticated users can fetch their quote history

## 🔐 Authentication Flow

1. User clicks "Login / Sign Up" → Redirects to `login.html`
2. Branded login page → Redirects to Cognito Hosted UI
3. User authenticates → Cognito returns authorization code
4. Frontend exchanges code for JWT tokens
5. Tokens stored in localStorage for API calls
6. Protected APIs validate JWT tokens

## 📊 API Endpoints

### Public Endpoints
- `POST /submitQuote` - Submit insurance quote request
- `POST /calculatePremium` - Get instant premium calculation
- `POST /validate-access` - Validate access codes

### Protected Endpoints (Requires Authentication)
- `GET /user/quotes` - Retrieve user's quote history

## 🗄️ Database Schema

### InsuranceQuoteRequestsV2 Table
- **Primary Key**: `compositeKey` (email#insuranceType)
- **Attributes**: 
  - `quoteId` - Unique identifier
  - `name` - User's full name
  - `email` - User's email address
  - `insuranceType` - Type of insurance (auto/life/home)
  - `details` - Insurance-specific details (JSON)
  - `premiumAmount` - Calculated premium
  - `createdAt` - Timestamp
- **Purpose**: Prevents duplicate quotes while enabling efficient queries

## 🧪 Testing

### Local Testing
1. Start local development server
2. Test quote calculation with various inputs
3. Test form validation and error handling
4. Test authentication flow
5. Verify quote submission and retrieval

### Production Testing
1. Deploy to S3/CloudFront
2. Test HTTPS functionality
3. Verify Cognito integration
4. Test mobile responsiveness
5. Performance testing with CloudFront

## 🗑️ Cleanup

### Remove Backend Only
```bash
aws cloudformation delete-stack --stack-name serverless-insurance-quote-app
```

### Remove Website Hosting Only
```bash
# Empty S3 bucket first
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name insurance-quote-website --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text)
aws s3 rm s3://$BUCKET_NAME/ --recursive

# Delete website hosting stack
aws cloudformation delete-stack --stack-name insurance-quote-website
```

### Remove Everything
```bash
# Empty S3 bucket if website hosting is deployed
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name insurance-quote-website --query "Stacks[0].Outputs[?OutputKey=='BucketName'].OutputValue" --output text 2>/dev/null)
if [ ! -z "$BUCKET_NAME" ]; then
    aws s3 rm s3://$BUCKET_NAME/ --recursive
fi

# Delete both stacks
aws cloudformation delete-stack --stack-name insurance-quote-website
aws cloudformation delete-stack --stack-name serverless-insurance-quote-app
```

## 💰 Cost Estimation

### Backend (Always Running)
- **Lambda**: ~$0.20/month (1M requests)
- **DynamoDB**: ~$1.25/month (25 GB storage)
- **API Gateway**: ~$3.50/month (1M requests)
- **SNS/SQS**: ~$0.50/month (1M messages)
- **Cognito**: Free tier covers most usage

### Frontend Hosting (Optional)
- **S3**: ~$0.50/month (5 GB storage)
- **CloudFront**: ~$1.00/month (10 GB transfer)

**Total estimated cost**: $5-10/month for moderate usage

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Make changes and test thoroughly
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔐 Security

This application implements secure configuration management:
- **AWS Secrets Manager** stores all sensitive data
- **No hardcoded secrets** in client-side code
- **Server-side validation** of access codes
- **Granular IAM permissions** for Lambda functions

See [SECURITY.md](SECURITY.md) for detailed security implementation.

## 🆘 Support

For issues and questions:
1. Check AWS CloudFormation events for deployment issues
2. Review AWS CloudWatch logs for runtime errors
3. Verify AWS CLI configuration and permissions
4. Update secrets in AWS Secrets Manager as needed

## 🎯 Next Steps & Enhancements

Potential improvements for learning:
- **Custom Domain**: Set up Route 53 with custom domain
- **Email Notifications**: SES integration for quote confirmations
- **Quote Comparison**: Side-by-side quote comparison features
- **Admin Dashboard**: Management interface for quotes
- **Analytics Integration**: CloudWatch dashboards and metrics
- **Multi-Language Support**: Internationalization
- **Mobile App**: React Native or Flutter integration
- **Payment Integration**: Stripe or AWS Payment Cryptography
- **Document Generation**: PDF quote generation with Lambda
- **Machine Learning**: Personalized quote recommendations