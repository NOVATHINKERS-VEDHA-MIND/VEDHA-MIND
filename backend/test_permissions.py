import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
url = os.environ.get('SUPABASE_URL')
key = os.environ.get('SUPABASE_KEY')

sb = create_client(url, key)

print("--- Testing Insert / Select Permissions ---")

# Test 1: documents
try:
    doc_res = sb.table('documents').insert({
        'jurisdiction': 'india',
        'doc_type': 'statute',
        'title': 'Test Document Insertion',
        'authority': 'The Patents Act 1970'
    }).execute()
    print("documents INSERT: SUCCESS ->", doc_res.data)
    # clean up test row
    if doc_res.data:
        doc_id = doc_res.data[0]['id']
        sb.table('documents').delete().eq('id', doc_id).execute()
        print("documents DELETE: SUCCESS")
except Exception as e:
    print("documents INSERT: FAILED ->", e)

# Test 2: tkdl_records
try:
    tkdl_res = sb.table('tkdl_records').insert({
        'tkdl_id': 'TEST-001',
        'formulation_name': 'Test Formulation',
        'classical_text_source': 'Charaka Samhita'
    }).execute()
    print("tkdl_records INSERT: SUCCESS ->", tkdl_res.data)
    if tkdl_res.data:
        sb.table('tkdl_records').delete().eq('tkdl_id', 'TEST-001').execute()
        print("tkdl_records DELETE: SUCCESS")
except Exception as e:
    print("tkdl_records INSERT: FAILED ->", e)

# Test 3: abs_approvals
try:
    abs_res = sb.table('abs_approvals').insert({
        'applicant': 'Test Applicant',
        'biological_resource': 'Withania somnifera',
        'status': 'Approved'
    }).execute()
    print("abs_approvals INSERT: SUCCESS ->", abs_res.data)
    if abs_res.data:
        sb.table('abs_approvals').delete().eq('applicant', 'Test Applicant').execute()
        print("abs_approvals DELETE: SUCCESS")
except Exception as e:
    print("abs_approvals INSERT: FAILED ->", e)

# Test 4: query_log
try:
    q_res = sb.table('query_log').insert({
        'query_text': 'Test query',
        'jurisdiction_selected': 'india'
    }).execute()
    print("query_log INSERT: SUCCESS ->", q_res.data)
except Exception as e:
    print("query_log INSERT: FAILED ->", e)
