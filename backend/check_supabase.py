import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_KEY')
print('Connecting to Supabase at:', url)

sb = create_client(url, key)

tables_to_check = [
    'documents', 
    'document_chunks', 
    'tkdl_records', 
    'patents_india', 
    'patents_international', 
    'abs_approvals', 
    'users', 
    'query_log', 
    'reports', 
    'statutory_acts', 
    'official_forms', 
    'jury_presets', 
    'user_products', 
    'ip_vault', 
    'audit_logs'
]

for t in tables_to_check:
    try:
        res = sb.table(t).select('*').limit(1).execute()
        print(f"Table [{t}]: EXISTS (count sample: {len(res.data)})")
    except Exception as e:
        print(f"Table [{t}]: NOT FOUND or ERROR -> {e}")
