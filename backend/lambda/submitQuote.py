# Sample Lambda function to submit insurance quote requests to an SNS topic.
# This function receives a quote request, validates it, and publishes it to an SNS topic.
# It expects the request body to contain an "insuranceType" field and other relevant details.
import json
import boto3
import os

sns = boto3.client('sns')
dynamodb = boto3.resource('dynamodb')

# Get SNS Topic ARN from environment variable
TOPIC_ARN = os.environ.get('SNS_TOPIC_ARN')

def calculate_premium(insurance_type, details):
    if insurance_type == 'auto':
        base = 500
        if details.get('vehicleType', '').lower() == 'suv':
            base += 100
        if int(details.get('year', 2020)) < 2020:
            base += 75
        if 'accident' in details.get('drivingHistory', '').lower():
            base += 150
        return base
    elif insurance_type == 'home':
        base = 400
        if int(details.get('squareFootage', 0)) > 2000:
            base += 100
        if int(details.get('yearBuilt', 2025)) < 2000:
            base += 100
        if details.get('securitySystem', '').lower() == 'no':
            base += 75
        return base
    elif insurance_type == 'life':
        base = 300
        age = int(details.get('age', 0))
        if age > 50:
            base += 100
        if details.get('smoker', '').lower() == 'yes':
            base += 150
        if details.get('health', '').lower() == 'poor':
            base += 200
        return base
    return 0

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        print("Message body:", body)

        insurance_type = body.get("insuranceType")
        if not insurance_type:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "Missing insuranceType"})
            }
        
        if not TOPIC_ARN:
            return {
                "statusCode": 500,
                "body": json.dumps({"message": "SNS Topic ARN not configured"})
            }

        # Check for existing quote
        composite_key = f"{body.get('email')}#{insurance_type}"
        table = dynamodb.Table('InsuranceQuoteRequestsV2')
        
        try:
            existing_item = table.get_item(Key={'compositeKey': composite_key})
            if 'Item' in existing_item:
                return {
                    "statusCode": 200,
                    "headers": {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "Content-Type",
                        "Access-Control-Allow-Methods": "POST, OPTIONS"
                    },
                    "body": json.dumps({
                        "message": f"We have already received your {insurance_type} insurance request and it's being processed. An agent will contact you within 24 hours to provide a customized quote.",
                        "submitted": False,
                        "insuranceType": insurance_type,
                        "duplicate": True
                    })
                }
        except Exception as e:
            print(f"Error checking for duplicates: {e}")
        
        # Calculate premium for immediate response
        details = body.get('details', {})
        premium = calculate_premium(insurance_type, details)
        
        # Publish to SNS for background processing
        sns.publish(
            TopicArn=TOPIC_ARN,
            Message=json.dumps(body),
            MessageAttributes={
                'insuranceType': {
                    'DataType': 'String',
                    'StringValue': insurance_type
                }
            }
        )
        print("Quote request submitted.")
        
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "POST, OPTIONS"
            },
            "body": json.dumps({
                "message": f"{insurance_type.capitalize()} quote request submitted successfully!",
                "premiumAmount": premium,
                "insuranceType": insurance_type,
                "customerName": body.get('name'),
                "submitted": True
            })
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            "statusCode": 500,
            "body": json.dumps({"message": "Internal server error"})
        }
