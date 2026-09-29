"""
Vedha Mind — Statutory Knowledge Base & Corpus (Database-Backed)

All operational data is persisted in the database (SQLite / Supabase) rather than hardcoded in code:
1. Traditional Knowledge Digital Library (TKDL) formulations (statutory_acts table)
2. Indian Acts (Patents Act 1970, Biological Diversity Act 2002/2023, Drugs & Cosmetics Act)
3. International Treaties (TRIPS, Nagoya Protocol/CBD, PCT, USPTO, EPO)
4. Form Routing & Fee Schedules (official_forms table)
5. Curated Jury Showcase Case Studies (jury_presets table)

This module provides dynamic database-backed accessors, ensuring zero hardcoded business data in code.
"""

from typing import List, Dict, Any, Optional
import local_store

def get_stored_acts(jurisdiction: Optional[str] = None) -> List[Dict[str, Any]]:
    """Loads all statutory acts dynamically from the database."""
    return local_store.get_all_acts(jurisdiction)

def get_official_forms() -> List[Dict[str, Any]]:
    """Loads official forms routing dynamically from the database."""
    return local_store.get_all_forms()

def get_jury_presets() -> List[Dict[str, Any]]:
    """Loads jury showcase presets dynamically from the database."""
    return local_store.get_all_presets()

def search_corpus_db(query_text: str, jurisdiction: str = "india", top_n: int = 5) -> List[Dict[str, Any]]:
    """Searches the statutory corpus directly inside the database."""
    return local_store.search_acts(query_text, jurisdiction, top_n)

# Dynamic database properties for backward compatibility
class _DatabaseCorpusProxy(list):
    def __init__(self, fetcher):
        super().__init__()
        self._fetcher = fetcher

    def _refresh(self):
        return self._fetcher()

    def __iter__(self):
        return iter(self._refresh())

    def __len__(self):
        return len(self._refresh())

    def __getitem__(self, index):
        return self._refresh()[index]

    def __repr__(self):
        return repr(self._refresh())

# Dynamic database proxies that query the database at runtime
STORED_ACTS_CORPUS = _DatabaseCorpusProxy(local_store.get_all_acts)
OFFICIAL_FORMS_ROUTING = _DatabaseCorpusProxy(local_store.get_all_forms)
JURY_PRESET_SCENARIOS = _DatabaseCorpusProxy(local_store.get_all_presets)
