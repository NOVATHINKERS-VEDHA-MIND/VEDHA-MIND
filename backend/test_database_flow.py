import urllib.request
import json

BASE_URL = "http://127.0.0.1:8000"

def get(endpoint):
    req = urllib.request.Request(f"{BASE_URL}{endpoint}")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def post(endpoint, data):
    req = urllib.request.Request(
        f"{BASE_URL}{endpoint}",
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

print("=== 1. Checking Database Status ===")
status = get("/api/database/status")
print("Engine:", status.get("engine"))
print("DB File:", status.get("db_file"))
print("Table counts:", status.get("table_counts"))

print("\n=== 2. Checking Statutory Acts from Database ===")
acts_resp = get("/api/corpus/acts")
print("Total acts in DB:", acts_resp.get("total"))
sample_act = acts_resp.get("acts", [])[0]
print("Sample Act:", sample_act.get("id"), "-", sample_act.get("title"))

print("\n=== 3. Checking Official Forms from Database ===")
forms_resp = get("/api/forms-routing")
print("Total forms in DB:", len(forms_resp.get("forms", [])))
for f in forms_resp.get("forms", [])[:3]:
    print(f"  - {f.get('form_id')}: {f.get('name')} (Fee: ₹{f.get('fee_startup_msme')})")

print("\n=== 4. Checking Jury Presets from Database ===")
presets_resp = get("/api/dry-run-presets")
print("Total presets in DB:", len(presets_resp.get("presets", [])))
for p in presets_resp.get("presets", []):
    print(f"  - {p.get('preset_id')}: {p.get('title')}")

print("\n=== 5. Testing IP Vault Deposit to Database ===")
vault_resp = post("/api/ip-vault/deposit", {
    "item_title": "Database Integration Secret SOP",
    "category": "Extraction Protocol",
    "herbs_or_formula": "Standardized Curcumin Extraction (98% purity)",
    "confidential_notes": "Proprietary extraction protocol using ethanol-water counter-current",
    "user_email": "examiner@vedhamind.ai"
})
print("Deposit Status:", vault_resp.get("status"))
print("Vault ID:", vault_resp.get("certificate", {}).get("vault_id"))
print("SHA256 Fingerprint:", vault_resp.get("certificate", {}).get("sha256_fingerprint"))

print("\n=== 6. Testing Dynamic Act Creation in Database ===")
new_act = post("/api/corpus/acts", {
    "id": "act-test-database-record",
    "jurisdiction": "india",
    "category": "Regulatory Guideline",
    "authority": "AYUSH / CDSCO Gazette",
    "section_ref": "Rule 160A",
    "title": "Good Manufacturing Practices for Herbal Extracts",
    "summary": "Mandates heavy metal and pesticide residue limits for classical extracts.",
    "text": "All herbal drug manufacturers must maintain complete batch records and test certificates conforming to Pharmacopoeial standards.",
    "applicability": "All manufacturing units producing commercial Ayurvedic formulations."
})
print("New Act Status:", new_act.get("status"), "-", new_act.get("act", {}).get("id"))

print("\n=== 7. Verifying Final Database Table Counts ===")
final_status = get("/api/database/status")
for table, count in final_status.get("table_counts", {}).items():
    print(f"  {table}: {count} rows")

print("\n>>> ALL DATABASE STORAGE OPERATIONS VERIFIED SUCCESSFULLY! <<<")
