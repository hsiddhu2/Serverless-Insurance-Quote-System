# Security Implementation

## 🔐 Access Control System

This application implements a multi-layered security approach with session-based access control and AWS Secrets Manager for sensitive data.

### Access Control Features

✅ **Session-based Access Control** - Access dialog on page refresh/new browser
✅ **Server-side Validation** - Access codes validated via AWS Lambda
✅ **JWT Authentication** - Secure user authentication with AWS Cognito
✅ **No Client-side Secrets** - All sensitive data stored in AWS Secrets Manager
✅ **Granular IAM Permissions** - Lambda functions have minimal required permissions

### Access Flow

1. **Anonymous Users**: Must enter access code on page load/refresh
2. **Logged-in Users**: Skip access dialog, seamless experience
3. **Session Management**: Access persists during browsing, resets on refresh
4. **Server Validation**: Access codes validated against AWS Secrets Manager

### Secrets Management

#### Access Codes Secret
- **Name:** `serverless-insurance-quote-app-access-codes`
- **Format:** Comma-separated values
- **Example:** `CODE1,CODE2,CODE3`
- **Storage:** AWS Secrets Manager
- **Validation:** Case-sensitive, exact match required

### Configuration Security

#### Public Configuration (Safe to expose)
- **API Gateway URL** - Public endpoint for browser calls
- **Cognito User Pool ID** - Public identifier for authentication
- **Cognito Client ID** - Public identifier for OAuth flow
- **AWS Account ID** - Not sensitive, visible in ARNs

#### Private Configuration (AWS Secrets Manager)
- **Access Codes** - Stored securely, never exposed to client

### Updating Access Codes

```bash
# Update access codes in AWS Secrets Manager
aws secretsmanager update-secret \
    --secret-id "serverless-insurance-quote-app-access-codes" \
    --secret-string "NEWCODE1,NEWCODE2,NEWCODE3" \
    --region us-west-2
```

### Security Best Practices Implemented

✅ **No Debug Logging** - No sensitive data in CloudWatch logs

✅ **Case-sensitive Validation** - Exact match required for access codes

✅ **Session Storage** - Access state resets on browser refresh

✅ **HTTPS Only** - All communication encrypted in transit

✅ **CORS Protection** - API Gateway configured with proper CORS

✅ **Rate Limiting** - API Gateway throttling (5 req/sec)

✅ **JWT Validation** - Secure token-based authentication
