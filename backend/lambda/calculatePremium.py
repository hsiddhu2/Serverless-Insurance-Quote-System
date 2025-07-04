import json

def calculate_auto_premium(details):
    base = 500
    if details.get('vehicleType', '').lower() == 'suv':
        base += 100
    if int(details.get('year', 2020)) < 2020:
        base += 75
    if 'accident' in details.get('drivingHistory', '').lower():
        base += 150
    return base

def calculate_home_premium(details):
    base = 400
    if int(details.get('squareFootage', 0)) > 2000:
        base += 100
    if int(details.get('yearBuilt', 2025)) < 2000:
        base += 100
    if details.get('securitySystem', '').lower() == 'no':
        base += 75
    return base

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

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        insurance_type = body.get('insuranceType')
        details = body.get('details', {})
        
        if insurance_type == 'auto':
            premium = calculate_auto_premium(details)
        elif insurance_type == 'home':
            premium = calculate_home_premium(details)
        elif insurance_type == 'life':
            premium = calculate_life_premium(details)
        else:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid insurance type'})
            }
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'insuranceType': insurance_type,
                'premiumAmount': premium,
                'message': f'Your estimated {insurance_type} insurance premium is ${premium}'
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }