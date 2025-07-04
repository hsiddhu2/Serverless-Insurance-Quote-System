import json
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('InsuranceQuoteRequestsV2')

# Helper function to convert Decimal to int/float
def decimal_to_number(obj):
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    elif isinstance(obj, dict):
        return {k: decimal_to_number(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [decimal_to_number(v) for v in obj]
    return obj

def lambda_handler(event, context):
    try:
        print(f"Event: {json.dumps(event)}")
        
        # Get user email from JWT token
        authorizer = event.get('requestContext', {}).get('authorizer', {})
        jwt_claims = authorizer.get('jwt', {}).get('claims', {})
        user_email = jwt_claims.get('email')
        
        print(f"User email from JWT: {user_email}")
        
        if not user_email:
            return {
                'statusCode': 401,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                    'Access-Control-Allow-Methods': 'GET,OPTIONS'
                },
                'body': json.dumps({'error': 'Unauthorized - no email in token'})
            }
        
        # Query all quotes for this user
        response = table.scan(
            FilterExpression=Key('compositeKey').begins_with(user_email)
        )
        
        print(f"DynamoDB response: {response}")
        
        quotes = []
        for item in response['Items']:
            quote = {
                'insuranceType': item.get('insuranceType'),
                'premiumAmount': item.get('premiumAmount'),
                'createdAt': item.get('createdAt'),
                'details': item.get('details', {})
            }
            # Convert Decimal objects to numbers
            quotes.append(decimal_to_number(quote))
        
        print(f"Found {len(quotes)} quotes for user {user_email}")
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            },
            'body': json.dumps({
                'quotes': quotes,
                'userEmail': user_email
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            },
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }