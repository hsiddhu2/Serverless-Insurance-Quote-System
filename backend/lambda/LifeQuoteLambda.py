# Sample Lambda function to process life insurance quote requests from SQS and store them in DynamoDB.
# This function calculates the premium based on user details and stores the quote in a DynamoDB table
import json
import boto3
import uuid
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('InsuranceQuoteRequestsV2')

def calculate_life_premium(details):
    base = 300
    age = int(details.get('age', 0))

    if age > 50:
        base += 100
    if details.get('smoker', '').lower() == 'yes':
        base += 150
    if details.get('health', '').lower() == 'poor':
        base += 200

    return base

def flatten_details(details):
    # If already flat JSON, return as-is
    if all(isinstance(v, str) for v in details.values()):
        return details

    # Else, flatten DynamoDB-style dict
    return {k: v.get('S', '') for k, v in details.items()}

def lambda_handler(event, context):
    for record in event['Records']:
        try:
            # Parse outer SQS (SNS-wrapped)
            sns_envelope = json.loads(record['body'])
            body = json.loads(sns_envelope['Message'])

            # Extract and normalize details
            raw_details = body.get('details', {})
            if isinstance(raw_details, str):
                raw_details = json.loads(raw_details)

            details = flatten_details(raw_details)

            # Calculate premium
            premium = calculate_life_premium(details)

            # Build and store item
            # Create composite key to prevent duplicates
            composite_key = f"{body.get('email', 'unknown')}#{body.get('insuranceType', 'life')}"
            
            item = {
                'compositeKey': composite_key,
                'quoteId': str(uuid.uuid4()),
                'insuranceType': 'life',
                'name': body.get('name'),
                'email': body.get('email'),
                'details': details,
                'premiumAmount': premium,
                'createdAt': datetime.utcnow().isoformat()
            }

            # This will automatically prevent duplicates since compositeKey is primary key
            table.put_item(Item=item)
            print(f"✅ Stored life quote: {item}")

        except Exception as e:
            if 'ConditionalCheckFailedException' in str(e) or 'already exists' in str(e):
                print(f"⚠️ Duplicate life quote ignored: {body.get('email')}")
            else:
                print(f"❌ Error processing record: {e}")
            continue

    return {
        'statusCode': 200,
        'body': json.dumps('Life quote(s) processed successfully')
    }
