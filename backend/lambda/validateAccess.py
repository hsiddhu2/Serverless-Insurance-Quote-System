import json
import boto3
import os
from datetime import datetime, timedelta
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    try:
        body_str = event.get('body', '')
        
        if not body_str:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing request body'})
            }
        
        try:
            body = json.loads(body_str)
        except json.JSONDecodeError:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid JSON'})
            }
        
        access_code = body.get('accessCode', '').strip()
        
        if access_code.startswith('"') and access_code.endswith('"'):
            access_code = access_code[1:-1]
        
        if not access_code:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Access code required'})
            }
        
        secrets_client = boto3.client('secretsmanager')
        secret_name = os.environ.get('ACCESS_CODES_SECRET_NAME')
        
        response = secrets_client.get_secret_value(SecretId=secret_name)
        access_codes_string = response['SecretString']
        
        valid_codes = [code.strip() for code in access_codes_string.split(',')]
        
        if access_code in valid_codes:
            expiry_time = datetime.utcnow() + timedelta(minutes=5)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'valid': True,
                    'expires': expiry_time.isoformat(),
                    'message': 'Access granted'
                })
            }
        else:
            return {
                'statusCode': 401,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'valid': False,
                    'message': 'Invalid access code'
                })
            }
            
    except ClientError:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Access codes not configured'})
        }
    except Exception:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Internal server error'})
        }