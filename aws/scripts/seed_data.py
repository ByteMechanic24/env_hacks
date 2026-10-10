import boto3
from decimal import Decimal

dynamodb = boto3.resource('dynamodb', region_name='ap-south-1')
table = dynamodb.Table('resident_data')

residents = [
    # --- REAL NUMBERS ---
    {
        "PK": "DISTRICT#Bihar-Khagaria",
        "SK": "PIN#841301#RES#+918650040322",
        "name": "Akshit Singh",
        "phone": "+918650040322",
        "village": "Mansi",
        "district": "Khagaria",
        "state": "Bihar",
        "lat": Decimal("25.4921"),
        "lng": Decimal("86.6714"),
        "dwelling_type": "kutcha",
        "language": "hindi",
        "last_called_at": 0,
        "call_status": "NONE"
    },
    {
        "PK": "DISTRICT#Bihar-Khagaria",
        "SK": "PIN#841301#RES#+919310082225",
        "name": "Arjav Jain",
        "phone": "+919310082225",
        "village": "Chautham",
        "district": "Khagaria",
        "state": "Bihar",
        "lat": Decimal("25.5012"),
        "lng": Decimal("86.6801"),
        "dwelling_type": "kutcha",
        "language": "hindi",
        "last_called_at": 0,
        "call_status": "NONE"
    },
    {
        "PK": "DISTRICT#Bihar-Khagaria",
        "SK": "PIN#841301#RES#+919560730326",
        "name": "Prince Singh",
        "phone": "+919560730326",
        "village": "Gogri",
        "district": "Khagaria",
        "state": "Bihar",
        "lat": Decimal("25.5103"),
        "lng": Decimal("86.6892"),
        "dwelling_type": "kutcha",
        "language": "hindi",
        "last_called_at": 0,
        "call_status": "NONE"
    },
    {
        "PK": "DISTRICT#Bihar-Khagaria",
        "SK": "PIN#841302#RES#+919412336524",
        "name": "Bhagesh Singh",
        "phone": "+919412336524",
        "village": "Alauli",
        "district": "Khagaria",
        "state": "Bihar",
        "lat": Decimal("25.4756"),
        "lng": Decimal("86.5931"),
        "dwelling_type": "kutcha",
        "language": "hindi",
        "last_called_at": 0,
        "call_status": "NONE"
    },
    {
        "PK": "DISTRICT#Bihar-Khagaria",
        "SK": "PIN#841302#RES#+919412140322",
        "name": "Kripal Singh",
        "phone": "+919412140322",
        "village": "Manigachhi",
        "district": "Khagaria",
        "state": "Bihar",
        "lat": Decimal("25.4857"),
        "lng": Decimal("86.6028"),
        "dwelling_type": "kutcha",
        "language": "hindi",
        "last_called_at": 0,
        "call_status": "NONE"
    },
    # --- BOGUS FILLER ---
    {
        "PK": "DISTRICT#Bihar-Khagaria",
        "SK": "PIN#841301#RES#+919800000001",
        "name": "Ramesh Kumar",
        "phone": "+919800000001",
        "village": "Mansi",
        "district": "Khagaria",
        "state": "Bihar",
        "lat": Decimal("25.4935"),
        "lng": Decimal("86.6728"),
        "dwelling_type": "pucca",
        "language": "hindi",
        "last_called_at": 0,
        "call_status": "NONE"
    },
    {
        "PK": "DISTRICT#Bihar-Khagaria",
        "SK": "PIN#841301#RES#+919800000002",
        "name": "Sunita Devi",
        "phone": "+919800000002",
        "village": "Chautham",
        "district": "Khagaria",
        "state": "Bihar",
        "lat": Decimal("25.5028"),
        "lng": Decimal("86.6815"),
        "dwelling_type": "kutcha",
        "language": "hindi",
        "last_called_at": 0,
        "call_status": "NONE"
    },
    {
        "PK": "DISTRICT#Bihar-Khagaria",
        "SK": "PIN#841301#RES#+919800000003",
        "name": "Mohan Prasad",
        "phone": "+919800000003",
        "village": "Gogri",
        "district": "Khagaria",
        "state": "Bihar",
        "lat": Decimal("25.5118"),
        "lng": Decimal("86.6907"),
        "dwelling_type": "pucca",
        "language": "hindi",
        "last_called_at": 0,
        "call_status": "NONE"
    },
    {
        "PK": "DISTRICT#Bihar-Khagaria",
        "SK": "PIN#841302#RES#+919800000004",
        "name": "Geeta Yadav",
        "phone": "+919800000004",
        "village": "Alauli",
        "district": "Khagaria",
        "state": "Bihar",
        "lat": Decimal("25.4772"),
        "lng": Decimal("86.5948"),
        "dwelling_type": "kutcha",
        "language": "hindi",
        "last_called_at": 0,
        "call_status": "NONE"
    },
    {
        "PK": "DISTRICT#Bihar-Khagaria",
        "SK": "PIN#841302#RES#+919800000005",
        "name": "Vijay Gupta",
        "phone": "+919800000005",
        "village": "Manigachhi",
        "district": "Khagaria",
        "state": "Bihar",
        "lat": Decimal("25.4841"),
        "lng": Decimal("86.6012"),
        "dwelling_type": "pucca",
        "language": "hindi",
        "last_called_at": 0,
        "call_status": "NONE"
    },
]

with table.batch_writer() as batch:
    for resident in residents:
        batch.put_item(Item=resident)
        print(f"Seeded: {resident['name']} — {resident['SK']}")

print(f"\nSeeded {len(residents)} residents successfully.")