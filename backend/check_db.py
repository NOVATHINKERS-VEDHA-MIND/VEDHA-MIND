import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), "data", "vedha_mind.db")
print("Database path:", db_path, "Exists:", os.path.exists(db_path))
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cur.fetchall()
    print("Tables in sqlite db:", tables)
    for (t,) in tables:
        cur.execute(f"SELECT count(*) FROM {t}")
        cnt = cur.fetchone()[0]
        print(f"  - Table {t}: {cnt} rows")
    conn.close()
