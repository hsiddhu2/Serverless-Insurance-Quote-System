# Sample Lambda function to process home insurance quote requests from SQS and store them in DynamoDB.
# This function calculates the premium based on user details and stores the quote in a DynamoDB table
import json
import boto3
import uuid
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('InsuranceQuoteRequestsV2')

def calculate_home_premium(details):
    base = 400
    if int(details.get('squareFootage', 0)) > 2000:
        base += 100
    if int(details.get('yearBuilt', 2025)) < 2000:
        base += 100
    if details.get('securitySystem', '').lower() == 'no':
        base += 75
    return base

def flatten_details(details):
    if all(isinstance(v, str) for v in details.values()):
        return details
    return {k: v.get('S', '') for k, v in details.items()}

def lambda_handler(event, context):
    for record in event['Records']:
        try:
            sns_envelope = json.loads(record['body'])
            body = json.loads(sns_envelope['Message'])

            raw_details = body.get('details', {})
            if isinstance(raw_details, str):
                raw_details = json.loads(raw_details)

            details = flatten_details(raw_details)
            premium = calculate_home_premium(details)

            # Create composite key to prevent duplicates
            composite_key = f"{body.get('email', 'unknown')}#{body.get('insuranceType', 'home')}"
            
            item = {
                'compositeKey': composite_key,
                'quoteId': str(uuid.uuid4()),
                'insuranceType': 'home',
                'name': body.get('name'),
                'email': body.get('email'),
                'details': details,
                'premiumAmount': premium,
                'createdAt': datetime.utcnow().isoformat()
            }

            # This will automatically prevent duplicates since compositeKey is primary key
            table.put_item(Item=item)
            print(f"✅ Stored home quote: {item}")

        except Exception as e:
            if 'ConditionalCheckFailedException' in str(e) or 'already exists' in str(e):
                print(f"⚠️ Duplicate home quote ignored: {body.get('email')}")
            else:
                print(f"❌ Error processing home quote: {e}")
            continue

    return {
        'statusCode': 200,
        'body': json.dumps('Home quote(s) processed successfully')
    }
