import json
import os
from knowledge_base import STORED_ACTS_CORPUS, OFFICIAL_FORMS_ROUTING, JURY_PRESET_SCENARIOS

def escape_sql(val):
    if val is None:
        return "NULL"
    if isinstance(val, bool):
        return "TRUE" if val else "FALSE"
    if isinstance(val, (int, float)):
        return str(val)
    if isinstance(val, (dict, list)):
        s = json.dumps(val).replace("'", "''")
        return f"'{s}'"
    s = str(val).replace("'", "''")
    return f"'{s}'"

sql_lines = []
sql_lines.append("-- ============================================================================")
sql_lines.append("-- Vedha Mind — Supabase Statutory Acts & Operational Data Migration")
sql_lines.append("-- Run this entire script in Supabase Dashboard -> SQL Editor")
sql_lines.append("-- Project URL: https://nlswagzlyntwnmvnpvuv.supabase.co")
sql_lines.append("-- ============================================================================\n")

sql_lines.append("CREATE EXTENSION IF NOT EXISTS pgcrypto;\n")

# 1. statutory_acts table
sql_lines.append("-- 1. Statutory Acts & TKDL Prior Art Corpus Table")
sql_lines.append("""CREATE TABLE IF NOT EXISTS statutory_acts (
    id TEXT PRIMARY KEY,
    jurisdiction TEXT NOT NULL,
    category TEXT NOT NULL,
    authority TEXT NOT NULL,
    section_ref TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    text TEXT NOT NULL,
    applicability TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE statutory_acts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read statutory_acts" ON statutory_acts;
CREATE POLICY "Allow anon read statutory_acts" ON statutory_acts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert statutory_acts" ON statutory_acts;
CREATE POLICY "Allow anon insert statutory_acts" ON statutory_acts FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update statutory_acts" ON statutory_acts;
CREATE POLICY "Allow anon update statutory_acts" ON statutory_acts FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete statutory_acts" ON statutory_acts;
CREATE POLICY "Allow anon delete statutory_acts" ON statutory_acts FOR DELETE USING (true);
""")

# 2. official_forms table
sql_lines.append("-- 2. Official Statutory Forms & Routing Table")
sql_lines.append("""CREATE TABLE IF NOT EXISTS official_forms (
    form_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    authority TEXT NOT NULL,
    portal TEXT,
    portal_url TEXT,
    fee_natural_person NUMERIC DEFAULT 0,
    fee_startup_msme NUMERIC DEFAULT 0,
    fee_large_entity NUMERIC DEFAULT 0,
    deadline TEXT,
    mandatory BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE official_forms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read official_forms" ON official_forms;
CREATE POLICY "Allow anon read official_forms" ON official_forms FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert official_forms" ON official_forms;
CREATE POLICY "Allow anon insert official_forms" ON official_forms FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update official_forms" ON official_forms;
CREATE POLICY "Allow anon update official_forms" ON official_forms FOR UPDATE USING (true);
""")

# 3. jury_presets table
sql_lines.append("-- 3. Curated Jury Presets & Case Studies Table")
sql_lines.append("""CREATE TABLE IF NOT EXISTS jury_presets (
    preset_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    short_desc TEXT,
    product_name TEXT NOT NULL,
    product_type TEXT NOT NULL,
    herbs TEXT,
    claim_use TEXT,
    core_objective TEXT,
    jurisdiction TEXT DEFAULT 'india',
    language TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE jury_presets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read jury_presets" ON jury_presets;
CREATE POLICY "Allow anon read jury_presets" ON jury_presets FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert jury_presets" ON jury_presets;
CREATE POLICY "Allow anon insert jury_presets" ON jury_presets FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update jury_presets" ON jury_presets;
CREATE POLICY "Allow anon update jury_presets" ON jury_presets FOR UPDATE USING (true);
""")

# 4. user_products table
sql_lines.append("-- 4. User Product Submissions & Intake Table")
sql_lines.append("""CREATE TABLE IF NOT EXISTS user_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT UNIQUE,
    user_email TEXT,
    product_name TEXT,
    product_type TEXT,
    herbs TEXT,
    claim_use TEXT,
    core_objective TEXT,
    jurisdiction TEXT,
    patentability_score TEXT,
    summary_result TEXT,
    full_analysis JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read user_products" ON user_products;
CREATE POLICY "Allow anon read user_products" ON user_products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert user_products" ON user_products;
CREATE POLICY "Allow anon insert user_products" ON user_products FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update user_products" ON user_products;
CREATE POLICY "Allow anon update user_products" ON user_products FOR UPDATE USING (true);
""")

# 5. ip_vault table
sql_lines.append("-- 5. IP Vault Proof-of-Creation Table (SHA-256)")
sql_lines.append("""CREATE TABLE IF NOT EXISTS ip_vault (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vault_id TEXT UNIQUE,
    user_email TEXT,
    item_title TEXT,
    category TEXT,
    herbs_or_formula TEXT,
    confidential_notes TEXT,
    sha256_hash TEXT,
    timestamp_utc TEXT,
    status TEXT,
    certificate_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ip_vault ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read ip_vault" ON ip_vault;
CREATE POLICY "Allow anon read ip_vault" ON ip_vault FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert ip_vault" ON ip_vault;
CREATE POLICY "Allow anon insert ip_vault" ON ip_vault FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update ip_vault" ON ip_vault;
CREATE POLICY "Allow anon update ip_vault" ON ip_vault FOR UPDATE USING (true);
""")

# 6. audit_logs table
sql_lines.append("-- 6. Audit Logs Table (DPDP Act 2023 Aligned)")
sql_lines.append("""CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id TEXT UNIQUE,
    user_id TEXT,
    query_text TEXT,
    jurisdiction TEXT,
    retrieved_chunks JSONB,
    llm_response TEXT,
    hallucination_valid BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read audit_logs" ON audit_logs;
CREATE POLICY "Allow anon read audit_logs" ON audit_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert audit_logs" ON audit_logs;
CREATE POLICY "Allow anon insert audit_logs" ON audit_logs FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update audit_logs" ON audit_logs;
CREATE POLICY "Allow anon update audit_logs" ON audit_logs FOR UPDATE USING (true);
""")

# Also add policies to documents, tkdl_records, patents_india
sql_lines.append("""-- 7. Ensure existing documents, tkdl_records, and patents tables have public read/write access
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'documents') THEN
        ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow anon read documents" ON documents;
        CREATE POLICY "Allow anon read documents" ON documents FOR SELECT USING (true);
        DROP POLICY IF EXISTS "Allow anon insert documents" ON documents;
        CREATE POLICY "Allow anon insert documents" ON documents FOR INSERT WITH CHECK (true);
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'document_chunks') THEN
        ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow anon read document_chunks" ON document_chunks;
        CREATE POLICY "Allow anon read document_chunks" ON document_chunks FOR SELECT USING (true);
        DROP POLICY IF EXISTS "Allow anon insert document_chunks" ON document_chunks;
        CREATE POLICY "Allow anon insert document_chunks" ON document_chunks FOR INSERT WITH CHECK (true);
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tkdl_records') THEN
        ALTER TABLE tkdl_records ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Allow anon read tkdl_records" ON tkdl_records;
        CREATE POLICY "Allow anon read tkdl_records" ON tkdl_records FOR SELECT USING (true);
        DROP POLICY IF EXISTS "Allow anon insert tkdl_records" ON tkdl_records;
        CREATE POLICY "Allow anon insert tkdl_records" ON tkdl_records FOR INSERT WITH CHECK (true);
    END IF;
END $$;
""")

# Seed statutory_acts
sql_lines.append("-- 8. SEED DATA: Statutory Acts & TKDL Prior Art Corpus (17 Records)")
for act in STORED_ACTS_CORPUS:
    sql_lines.append(f"""INSERT INTO statutory_acts (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability)
VALUES ({escape_sql(act['id'])}, {escape_sql(act['jurisdiction'])}, {escape_sql(act['category'])}, {escape_sql(act['authority'])}, {escape_sql(act['section_ref'])}, {escape_sql(act['title'])}, {escape_sql(act['summary'])}, {escape_sql(act['text'])}, {escape_sql(act['applicability'])})
ON CONFLICT (id) DO UPDATE SET
    jurisdiction = EXCLUDED.jurisdiction,
    category = EXCLUDED.category,
    authority = EXCLUDED.authority,
    section_ref = EXCLUDED.section_ref,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    text = EXCLUDED.text,
    applicability = EXCLUDED.applicability;""")

# Seed official_forms
sql_lines.append("\n-- 9. SEED DATA: Official Statutory Forms Routing (8 Records)")
portal_urls = {
    "Form 1": "https://ipindiaonline.gov.in/epatentfiling/goForLogin/doLogin",
    "Form 2": "https://ipindiaonline.gov.in/epatentfiling/goForLogin/doLogin",
    "Form 3": "https://ipindiaonline.gov.in/epatentfiling/goForLogin/doLogin",
    "Form 5": "https://ipindiaonline.gov.in/epatentfiling/goForLogin/doLogin",
    "Form 9": "https://ipindiaonline.gov.in/epatentfiling/goForLogin/doLogin",
    "Form 18A": "https://ipindiaonline.gov.in/epatentfiling/goForLogin/doLogin",
    "NBA Form I": "http://nbaindia.org/",
    "AYUSH Form 25D": "https://e-ayush.gov.in/"
}
for form in OFFICIAL_FORMS_ROUTING:
    p_url = portal_urls.get(form['form_id'], "https://ipindiaonline.gov.in")
    mandatory = form['form_id'] not in ["Form 9", "Form 18A"]
    sql_lines.append(f"""INSERT INTO official_forms (form_id, name, authority, portal, portal_url, fee_natural_person, fee_startup_msme, fee_large_entity, deadline, mandatory, description)
VALUES ({escape_sql(form['form_id'])}, {escape_sql(form['name'])}, {escape_sql(form['authority'])}, {escape_sql(form['portal'])}, {escape_sql(p_url)}, {form['fee_natural_person']}, {form['fee_startup_msme']}, {form['fee_large_entity']}, {escape_sql(form['deadline'])}, {escape_sql(mandatory)}, {escape_sql(form['description'])})
ON CONFLICT (form_id) DO UPDATE SET
    name = EXCLUDED.name,
    authority = EXCLUDED.authority,
    portal = EXCLUDED.portal,
    portal_url = EXCLUDED.portal_url,
    fee_natural_person = EXCLUDED.fee_natural_person,
    fee_startup_msme = EXCLUDED.fee_startup_msme,
    fee_large_entity = EXCLUDED.fee_large_entity,
    deadline = EXCLUDED.deadline,
    mandatory = EXCLUDED.mandatory,
    description = EXCLUDED.description;""")

# Seed jury_presets
sql_lines.append("\n-- 10. SEED DATA: Curated Jury Showcase Case Studies (4 Records)")
for p in JURY_PRESET_SCENARIOS:
    sql_lines.append(f"""INSERT INTO jury_presets (preset_id, title, short_desc, product_name, product_type, herbs, claim_use, core_objective, jurisdiction, language)
VALUES ({escape_sql(p['preset_id'])}, {escape_sql(p['title'])}, {escape_sql(p['short_desc'])}, {escape_sql(p['product_name'])}, {escape_sql(p['product_type'])}, {escape_sql(p['herbs'])}, {escape_sql(p['claim_use'])}, {escape_sql(p['core_objective'])}, {escape_sql(p['jurisdiction'])}, {escape_sql(p.get('language', 'en'))})
ON CONFLICT (preset_id) DO UPDATE SET
    title = EXCLUDED.title,
    short_desc = EXCLUDED.short_desc,
    product_name = EXCLUDED.product_name,
    product_type = EXCLUDED.product_type,
    herbs = EXCLUDED.herbs,
    claim_use = EXCLUDED.claim_use,
    core_objective = EXCLUDED.core_objective,
    jurisdiction = EXCLUDED.jurisdiction,
    language = EXCLUDED.language;""")

output_path = os.path.join(os.path.dirname(__file__), "supabase_acts_and_data.sql")
with open(output_path, "w", encoding="utf-8") as f:
    f.write("\n".join(sql_lines))

print(f"Generated {output_path} successfully ({len(sql_lines)} lines).")
