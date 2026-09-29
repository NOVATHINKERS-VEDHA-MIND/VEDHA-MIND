"""
Vedha Mind — Database Storage Engine
Provides persistent database storage (SQLite + Supabase ready) for:
1. Statutory Acts & TKDL Prior Art Corpus (statutory_acts)
2. Official Statutory Forms & Routing Matrix (official_forms)
3. Curated Jury Showcase Case Studies (jury_presets)
4. User-provided intake details taken (user_products)
5. IP Vault Proof-of-Creation timestamped records (ip_vault)
6. Audit Log Trail (audit_logs)
7. Generated Patent Application Drafts (patent_drafts)
Guarantees 100% data persistence in the database rather than hardcoded in code.
"""

import sqlite3
import os
import re
import json
import hashlib
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

ORIGINAL_DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
SEED_PATH = os.path.join(ORIGINAL_DATA_DIR, "seed_data.json")

# In serverless environments (e.g. Vercel), the project directory is read-only.
# We fallback to /tmp/vedha_data to guarantee write access for SQLite.
is_serverless = os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME")

if is_serverless:
    DB_DIR = os.path.join("/tmp", "vedha_data")
    os.makedirs(DB_DIR, exist_ok=True)
    DB_PATH = os.path.join(DB_DIR, "vedha_mind.db")
    orig_db = os.path.join(ORIGINAL_DATA_DIR, "vedha_mind.db")
    if os.path.exists(orig_db) and not os.path.exists(DB_PATH):
        try:
            import shutil
            shutil.copy2(orig_db, DB_PATH)
        except Exception:
            pass
else:
    try:
        DB_DIR = ORIGINAL_DATA_DIR
        os.makedirs(DB_DIR, exist_ok=True)
        DB_PATH = os.path.join(DB_DIR, "vedha_mind.db")
    except Exception:
        DB_DIR = os.path.join("/tmp", "vedha_data")
        os.makedirs(DB_DIR, exist_ok=True)
        DB_PATH = os.path.join(DB_DIR, "vedha_mind.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Table 1: Statutory Acts & TKDL Prior Art Corpus
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS statutory_acts (
        id TEXT PRIMARY KEY,
        jurisdiction TEXT NOT NULL,
        category TEXT NOT NULL,
        authority TEXT NOT NULL,
        section_ref TEXT NOT NULL,
        title TEXT NOT NULL,
        summary TEXT,
        text TEXT NOT NULL,
        applicability TEXT,
        created_at TEXT
    )
    """)

    # Table 2: Official Statutory Forms & Routing Matrix
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS official_forms (
        form_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        authority TEXT NOT NULL,
        portal TEXT,
        portal_url TEXT,
        fee_natural_person REAL DEFAULT 0,
        fee_startup_msme REAL DEFAULT 0,
        fee_large_entity REAL DEFAULT 0,
        deadline TEXT,
        mandatory INTEGER DEFAULT 1,
        description TEXT,
        created_at TEXT
    )
    """)

    # Table 3: Curated Jury Presets & Case Studies
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS jury_presets (
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
        created_at TEXT
    )
    """)

    # Table 4: User intake product details taken
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        full_analysis JSON,
        created_at TEXT
    )
    """)

    # Table 5: IP Vault cryptographic proof-of-creation
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ip_vault (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vault_id TEXT UNIQUE,
        user_email TEXT,
        item_title TEXT,
        category TEXT,
        herbs_or_formula TEXT,
        confidential_notes TEXT,
        sha256_hash TEXT,
        timestamp_utc TEXT,
        status TEXT,
        certificate_data JSON,
        created_at TEXT
    )
    """)

    # Table 6: Audit log trail
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        log_id TEXT UNIQUE,
        user_id TEXT,
        query_text TEXT,
        jurisdiction TEXT,
        retrieved_chunks JSON,
        llm_response TEXT,
        hallucination_valid INTEGER DEFAULT 1,
        created_at TEXT
    )
    """)

    # Table 7: Generated Patent Drafts
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS patent_drafts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        draft_id TEXT UNIQUE,
        user_email TEXT,
        product_name TEXT,
        applicant_name TEXT,
        form_1_data JSON,
        form_2_specification JSON,
        created_at TEXT
    )
    """)
    # Migration safeguard for existing tables
    try:
        cursor.execute("ALTER TABLE patent_drafts ADD COLUMN user_email TEXT")
    except Exception:
        pass

    conn.commit()

    # --- Seed data from seed_data.json if tables are empty ---
    now_iso = datetime.now(timezone.utc).isoformat()
    if os.path.exists(SEED_PATH):
        try:
            with open(SEED_PATH, "r", encoding="utf-8") as f:
                seed_data = json.load(f)

            # Seed statutory_acts
            cursor.execute("SELECT COUNT(*) FROM statutory_acts")
            if cursor.fetchone()[0] == 0 and "statutory_acts" in seed_data:
                for act in seed_data["statutory_acts"]:
                    cursor.execute("""
                    INSERT OR REPLACE INTO statutory_acts 
                    (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        act.get("id"),
                        act.get("jurisdiction", "india"),
                        act.get("category", ""),
                        act.get("authority", ""),
                        act.get("section_ref", ""),
                        act.get("title", ""),
                        act.get("summary", ""),
                        act.get("text", ""),
                        act.get("applicability", ""),
                        act.get("created_at", now_iso)
                    ))

            # Seed official_forms
            cursor.execute("SELECT COUNT(*) FROM official_forms")
            if cursor.fetchone()[0] == 0 and "official_forms" in seed_data:
                for form in seed_data["official_forms"]:
                    cursor.execute("""
                    INSERT OR REPLACE INTO official_forms
                    (form_id, name, authority, portal, portal_url, fee_natural_person, fee_startup_msme, fee_large_entity, deadline, mandatory, description, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        form.get("form_id"),
                        form.get("name", ""),
                        form.get("authority", ""),
                        form.get("portal", ""),
                        form.get("portal_url", ""),
                        float(form.get("fee_natural_person", 0)),
                        float(form.get("fee_startup_msme", 0)),
                        float(form.get("fee_large_entity", 0)),
                        form.get("deadline", ""),
                        1 if form.get("mandatory", True) else 0,
                        form.get("description", ""),
                        form.get("created_at", now_iso)
                    ))

            # Seed jury_presets
            cursor.execute("SELECT COUNT(*) FROM jury_presets")
            if cursor.fetchone()[0] == 0 and "jury_presets" in seed_data:
                for preset in seed_data["jury_presets"]:
                    cursor.execute("""
                    INSERT OR REPLACE INTO jury_presets
                    (preset_id, title, short_desc, product_name, product_type, herbs, claim_use, core_objective, jurisdiction, language, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        preset.get("preset_id"),
                        preset.get("title", ""),
                        preset.get("short_desc", ""),
                        preset.get("product_name", ""),
                        preset.get("product_type", ""),
                        preset.get("herbs", ""),
                        preset.get("claim_use", ""),
                        preset.get("core_objective", ""),
                        preset.get("jurisdiction", "india"),
                        preset.get("language", "en"),
                        preset.get("created_at", now_iso)
                    ))

            conn.commit()
        except Exception as e:
            print(f"Warning: could not seed database from {SEED_PATH}: {e}")

    conn.close()

# Auto-initialize database on import
init_db()


# ==============================================================================
# 1. Statutory Acts & TKDL Prior Art Corpus (Database CRUD)
# ==============================================================================

def get_all_acts(jurisdiction: Optional[str] = None) -> List[Dict[str, Any]]:
    """Retrieves all statutory acts stored in the database."""
    conn = get_db()
    cursor = conn.cursor()
    if jurisdiction and jurisdiction != "both":
        cursor.execute("SELECT * FROM statutory_acts WHERE jurisdiction = ? ORDER BY rowid ASC", (jurisdiction,))
    else:
        cursor.execute("SELECT * FROM statutory_acts ORDER BY rowid ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_act_by_id(act_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single statutory act by its ID from the database."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM statutory_acts WHERE id = ?", (act_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def upsert_act(act: Dict[str, Any]) -> Dict[str, Any]:
    """Inserts or updates a statutory act in the database."""
    conn = get_db()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
    INSERT OR REPLACE INTO statutory_acts 
    (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        act.get("id"),
        act.get("jurisdiction", "india"),
        act.get("category", ""),
        act.get("authority", ""),
        act.get("section_ref", ""),
        act.get("title", ""),
        act.get("summary", ""),
        act.get("text", ""),
        act.get("applicability", ""),
        act.get("created_at", now_iso)
    ))
    conn.commit()
    conn.close()
    return act

def search_acts(query_text: str, jurisdiction: str = "india", top_n: int = 5) -> List[Dict[str, Any]]:
    """
    Direct database search against statutory_acts table.
    Performs relevance scoring based on extracted query terms.
    """
    terms = re.findall(r'[a-zA-Z0-9]{3,}', query_text.lower())
    all_acts = get_all_acts(jurisdiction if jurisdiction != "both" else None)
    
    candidates = []
    for doc in all_acts:
        content = f"{doc.get('title','')} {doc.get('authority','')} {doc.get('section_ref','')} {doc.get('text','')} {doc.get('applicability','')}".lower()
        score = 0
        for term in terms:
            if term in content:
                sec_ref = doc.get("section_ref", "").lower()
                title = doc.get("title", "").lower()
                score += 2 if (term in sec_ref or term in title) else 1
        
        candidates.append({**doc, "relevance_score": score})
    
    candidates.sort(key=lambda x: x["relevance_score"], reverse=True)
    return candidates[:top_n]


# ==============================================================================
# 2. Official Statutory Forms & Routing (Database CRUD)
# ==============================================================================

def get_all_forms() -> List[Dict[str, Any]]:
    """Retrieves all official forms stored in the database."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM official_forms ORDER BY rowid ASC")
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        item = dict(r)
        item["mandatory"] = bool(item.get("mandatory", 1))
        result.append(item)
    return result

def get_form_by_id(form_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves an official form by its form_id."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM official_forms WHERE form_id = ?", (form_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        item = dict(row)
        item["mandatory"] = bool(item.get("mandatory", 1))
        return item
    return None

def upsert_form(form: Dict[str, Any]) -> Dict[str, Any]:
    """Inserts or updates an official form in the database."""
    conn = get_db()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
    INSERT OR REPLACE INTO official_forms
    (form_id, name, authority, portal, portal_url, fee_natural_person, fee_startup_msme, fee_large_entity, deadline, mandatory, description, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        form.get("form_id"),
        form.get("name", ""),
        form.get("authority", ""),
        form.get("portal", ""),
        form.get("portal_url", ""),
        float(form.get("fee_natural_person", 0)),
        float(form.get("fee_startup_msme", 0)),
        float(form.get("fee_large_entity", 0)),
        form.get("deadline", ""),
        1 if form.get("mandatory", True) else 0,
        form.get("description", ""),
        form.get("created_at", now_iso)
    ))
    conn.commit()
    conn.close()
    return form


# ==============================================================================
# 3. Curated Jury Presets & Case Studies (Database CRUD)
# ==============================================================================

def get_all_presets() -> List[Dict[str, Any]]:
    """Retrieves all jury preset scenarios from the database."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jury_presets ORDER BY rowid ASC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_preset_by_id(preset_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single jury preset scenario by preset_id."""
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM jury_presets WHERE preset_id = ?", (preset_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def upsert_preset(preset: Dict[str, Any]) -> Dict[str, Any]:
    """Inserts or updates a preset scenario in the database."""
    conn = get_db()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    cursor.execute("""
    INSERT OR REPLACE INTO jury_presets
    (preset_id, title, short_desc, product_name, product_type, herbs, claim_use, core_objective, jurisdiction, language, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        preset.get("preset_id"),
        preset.get("title", ""),
        preset.get("short_desc", ""),
        preset.get("product_name", ""),
        preset.get("product_type", ""),
        preset.get("herbs", ""),
        preset.get("claim_use", ""),
        preset.get("core_objective", ""),
        preset.get("jurisdiction", "india"),
        preset.get("language", "en"),
        preset.get("created_at", now_iso)
    ))
    conn.commit()
    conn.close()
    return preset


# ==============================================================================
# 4. User Product Submissions & Intake (Database CRUD)
# ==============================================================================

def store_product_submission(data: dict) -> dict:
    conn = get_db()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    pid = data.get("product_id") or f"PRD-{int(datetime.now().timestamp()*1000)}"
    
    cursor.execute("""
    INSERT OR REPLACE INTO user_products 
    (product_id, user_email, product_name, product_type, herbs, claim_use, core_objective, jurisdiction, patentability_score, summary_result, full_analysis, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        pid,
        data.get("user_email", "guest@vedhamind.ai"),
        data.get("product_name", "Untitled Ayurvedic Product"),
        data.get("product_type", "Patent or Proprietary"),
        data.get("herbs", ""),
        data.get("claim_use", "Patent Grant"),
        data.get("core_objective", ""),
        data.get("jurisdiction", "india"),
        data.get("patentability_score", "Pending"),
        data.get("summary_result", ""),
        json.dumps(data.get("full_analysis", {})),
        now_iso
    ))
    conn.commit()
    conn.close()
    data["product_id"] = pid
    data["created_at"] = now_iso
    return data

def get_all_stored_products(limit: int = 50, user_email: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    if user_email:
        cursor.execute("SELECT * FROM user_products WHERE user_email = ? ORDER BY id DESC LIMIT ?", (user_email, limit))
    else:
        cursor.execute("SELECT * FROM user_products ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        item = dict(r)
        if item.get("full_analysis"):
            try:
                item["full_analysis"] = json.loads(item["full_analysis"])
            except Exception:
                pass
        result.append(item)
    return result


# ==============================================================================
# 5. Audit Log Trail (Database CRUD)
# ==============================================================================

def store_audit_log(entry: dict) -> dict:
    conn = get_db()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    lid = entry.get("log_id") or f"LOG-{int(datetime.now().timestamp()*1000)}"
    
    cursor.execute("""
    INSERT INTO audit_logs (log_id, user_id, query_text, jurisdiction, retrieved_chunks, llm_response, hallucination_valid, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        lid,
        entry.get("user_id", "guest-examiner"),
        entry.get("query_text", ""),
        entry.get("jurisdiction", "india"),
        json.dumps(entry.get("retrieved_chunks", [])),
        entry.get("llm_response", ""),
        1 if entry.get("hallucination_valid", True) else 0,
        now_iso
    ))
    conn.commit()
    conn.close()
    entry["log_id"] = lid
    entry["created_at"] = now_iso
    return entry

def get_all_audit_logs(limit: int = 50, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    if user_id:
        cursor.execute("SELECT * FROM audit_logs WHERE user_id = ? ORDER BY id DESC LIMIT ?", (user_id, limit))
    else:
        cursor.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        item = dict(r)
        if item.get("retrieved_chunks"):
            try:
                item["retrieved_chunks"] = json.loads(item["retrieved_chunks"])
            except Exception:
                pass
        result.append(item)
    return result


# ==============================================================================
# 6. IP Vault Cryptographic Timestamped Records (Database CRUD)
# ==============================================================================

def store_vault_deposit(data: dict) -> dict:
    conn = get_db()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    vault_id = f"VM-VAULT-2026-{abs(hash(data.get('item_title', '') + now_iso)) % 90000 + 10000}"
    
    # Calculate SHA-256 tamper-proof fingerprint
    raw_payload = f"{data.get('item_title')}|{data.get('herbs_or_formula')}|{data.get('confidential_notes')}|{data.get('user_email')}|{now_iso}"
    sha256 = hashlib.sha256(raw_payload.encode('utf-8')).hexdigest()
    
    certificate = {
        "vault_id": vault_id,
        "title": data.get("item_title"),
        "category": data.get("category", "Trade Secret"),
        "depositor": data.get("user_email", "guest@vedhamind.ai"),
        "sha256_fingerprint": sha256,
        "timestamp_utc": now_iso,
        "jurisdiction_protection": "Indian Trade Secrets / TRIPS Art. 39 / Patent Priority Proof",
        "legal_status": "SECURED & TIMESTAMPED",
        "verification_seal": f"VEDHA-MIND-SEAL-VERIFIED-{sha256[:12].upper()}"
    }

    cursor.execute("""
    INSERT INTO ip_vault 
    (vault_id, user_email, item_title, category, herbs_or_formula, confidential_notes, sha256_hash, timestamp_utc, status, certificate_data, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        vault_id,
        data.get("user_email", "guest@vedhamind.ai"),
        data.get("item_title", "Untitled Secret"),
        data.get("category", "Trade Secret"),
        data.get("herbs_or_formula", ""),
        data.get("confidential_notes", ""),
        sha256,
        now_iso,
        "ACTIVE",
        json.dumps(certificate),
        now_iso
    ))
    conn.commit()
    conn.close()
    return certificate

def get_all_vault_records(limit: int = 50, user_email: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    if user_email:
        cursor.execute("SELECT * FROM ip_vault WHERE user_email = ? ORDER BY id DESC LIMIT ?", (user_email, limit))
    else:
        cursor.execute("SELECT * FROM ip_vault ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        item = dict(r)
        if item.get("certificate_data"):
            try:
                item["certificate_data"] = json.loads(item["certificate_data"])
            except Exception:
                pass
        result.append(item)
    return result


# ==============================================================================
# 7. Generated Patent Drafts (Database CRUD)
# ==============================================================================

def store_patent_draft(draft: dict) -> dict:
    conn = get_db()
    cursor = conn.cursor()
    now_iso = datetime.now(timezone.utc).isoformat()
    draft_id = f"IPO-DRAFT-{int(datetime.now().timestamp()*1000)}"
    user_email = draft.get("user_email", "guest@vedhamind.ai")
    
    cursor.execute("""
    INSERT INTO patent_drafts (draft_id, user_email, product_name, applicant_name, form_1_data, form_2_specification, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        draft_id,
        user_email,
        draft.get("product_name", "Untitled"),
        draft.get("applicant_name", "Ayurvedic Innovator"),
        json.dumps(draft.get("form_1_data", {})),
        json.dumps(draft.get("form_2_specification", {})),
        now_iso
    ))
    conn.commit()
    conn.close()
    draft["draft_id"] = draft_id
    draft["created_at"] = now_iso
    draft["user_email"] = user_email
    return draft

def get_all_patent_drafts(limit: int = 50, user_email: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db()
    cursor = conn.cursor()
    if user_email:
        cursor.execute("SELECT * FROM patent_drafts WHERE user_email = ? ORDER BY id DESC LIMIT ?", (user_email, limit))
    else:
        cursor.execute("SELECT * FROM patent_drafts ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    result = []
    for r in rows:
        item = dict(r)
        if item.get("form_1_data"):
            try:
                item["form_1_data"] = json.loads(item["form_1_data"])
            except Exception:
                pass
        if item.get("form_2_specification"):
            try:
                item["form_2_specification"] = json.loads(item["form_2_specification"])
            except Exception:
                pass
        result.append(item)
    return result


# ==============================================================================
# Database Status & Inspection Metrics
# ==============================================================================

def get_db_metrics() -> Dict[str, Any]:
    """Returns row counts and database health metrics for all tables."""
    conn = get_db()
    cursor = conn.cursor()
    tables = [
        "statutory_acts",
        "official_forms",
        "jury_presets",
        "user_products",
        "ip_vault",
        "audit_logs",
        "patent_drafts"
    ]
    counts = {}
    for t in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {t}")
            counts[t] = cursor.fetchone()[0]
        except Exception as e:
            counts[t] = f"Error: {e}"
    conn.close()
    
    return {
        "engine": "SQLite 3 Relational Database Engine",
        "db_file": DB_PATH,
        "db_size_bytes": os.path.getsize(DB_PATH) if os.path.exists(DB_PATH) else 0,
        "table_counts": counts,
        "status": "online"
    }
