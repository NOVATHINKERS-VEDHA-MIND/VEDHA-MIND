-- ============================================================================
-- Vedha Mind — Supabase Statutory Acts & Operational Data Migration
-- Run this entire script in Supabase Dashboard -> SQL Editor
-- Project URL: https://nlswagzlyntwnmvnpvuv.supabase.co
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Statutory Acts & TKDL Prior Art Corpus Table
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

-- 2. Official Statutory Forms & Routing Table
CREATE TABLE IF NOT EXISTS official_forms (
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

-- 3. Curated Jury Presets & Case Studies Table
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
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE jury_presets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon read jury_presets" ON jury_presets;
CREATE POLICY "Allow anon read jury_presets" ON jury_presets FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert jury_presets" ON jury_presets;
CREATE POLICY "Allow anon insert jury_presets" ON jury_presets FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update jury_presets" ON jury_presets;
CREATE POLICY "Allow anon update jury_presets" ON jury_presets FOR UPDATE USING (true);

-- 4. User Product Submissions & Intake Table
CREATE TABLE IF NOT EXISTS user_products (
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

-- 5. IP Vault Proof-of-Creation Table (SHA-256)
CREATE TABLE IF NOT EXISTS ip_vault (
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

-- 6. Audit Logs Table (DPDP Act 2023 Aligned)
CREATE TABLE IF NOT EXISTS audit_logs (
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

-- 7. Ensure existing documents, tkdl_records, and patents tables have public read/write access
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

-- 8. SEED DATA: Statutory Acts & TKDL Prior Art Corpus (17 Records)
INSERT INTO statutory_acts (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability)
VALUES ('act-in-patents-3p', 'india', 'Patent Law', 'The Patents Act 1970', 'Section 3(p)', 'Traditional Knowledge Exclusion Bar', 'Inventions that are essentially traditional knowledge or an aggregation of known properties of traditionally known components are non-patentable.', 'An invention which in effect is traditional knowledge or which is an aggregation or duplication of known properties of traditionally known component or components is not an invention within the meaning of this Act. Classical Ayurvedic formulations sourced from recognized texts in the First Schedule to the Drugs and Cosmetics Act fall directly under this statutory bar unless substantial synergistic or non-obvious technical effect is proven.', 'Applies to all Ayurvedic, Siddha, and Unani formulations and natural herbal extracts.')
ON CONFLICT (id) DO UPDATE SET
    jurisdiction = EXCLUDED.jurisdiction,
    category = EXCLUDED.category,
    authority = EXCLUDED.authority,
    section_ref = EXCLUDED.section_ref,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    text = EXCLUDED.text,
    applicability = EXCLUDED.applicability;
INSERT INTO statutory_acts (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability)
VALUES ('act-in-patents-3d', 'india', 'Patent Law', 'The Patents Act 1970', 'Section 3(d)', 'Efficacy Enhancement Requirement', 'New forms of known substances or mere combinations must demonstrate significantly enhanced therapeutic efficacy.', 'The mere discovery of a new form of a known substance which does not result in the enhancement of the known efficacy of that substance or the mere discovery of any new property or new use for a known substance or of the mere use of a known process, machine or apparatus unless such known process results in a new product or employs at least one new reactant is not patentable. For herbal formulations, comparative pharmacological or clinical trial data proving unexpected synergy is mandatory to overcome Section 3(d).', 'Combinations, extracts, salts, esters, or polymorphs of known phytochemical compounds.')
ON CONFLICT (id) DO UPDATE SET
    jurisdiction = EXCLUDED.jurisdiction,
    category = EXCLUDED.category,
    authority = EXCLUDED.authority,
    section_ref = EXCLUDED.section_ref,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    text = EXCLUDED.text,
    applicability = EXCLUDED.applicability;
INSERT INTO statutory_acts (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability)
VALUES ('act-in-patents-3e', 'india', 'Patent Law', 'The Patents Act 1970', 'Section 3(e)', 'Mere Admixture Bar', 'A substance obtained by mere mixing of components resulting only in aggregation of properties is non-patentable.', 'A substance obtained by a mere admixture resulting only in the aggregation of the properties of the components thereof or a process for producing such substance is not patentable. An applicant must demonstrate synergy where Combination Effect > Sum of Individual Effects (e.g., Combination Index < 1.0 or significant bioavailability enhancement).', 'Polyherbal mixtures, decoctions, and dietary supplements.')
ON CONFLICT (id) DO UPDATE SET
    jurisdiction = EXCLUDED.jurisdiction,
    category = EXCLUDED.category,
    authority = EXCLUDED.authority,
    section_ref = EXCLUDED.section_ref,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    text = EXCLUDED.text,
    applicability = EXCLUDED.applicability;
INSERT INTO statutory_acts (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability)
VALUES ('act-in-patents-10-4', 'india', 'Patent Law', 'The Patents Act 1970', 'Section 10(4)(ii)(D)', 'Mandatory Biological Resource Disclosure', 'Applicants must declare the source and geographical origin of any biological resource used in the specification.', 'Every complete specification must disclose the source and geographical origin of the biological material in the specification when used in an invention. Failure to disclose or wrongful disclosure is a specific ground for pre-grant opposition under Section 25(1)(j), post-grant opposition under Section 25(2)(j), and revocation under Section 64(1)(p).', 'Any patent specification utilizing herbs, plants, seeds, or microbial material from India.')
ON CONFLICT (id) DO UPDATE SET
    jurisdiction = EXCLUDED.jurisdiction,
    category = EXCLUDED.category,
    authority = EXCLUDED.authority,
    section_ref = EXCLUDED.section_ref,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    text = EXCLUDED.text,
    applicability = EXCLUDED.applicability;
INSERT INTO statutory_acts (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability)
VALUES ('act-in-patents-53', 'india', 'Patent Law', 'The Patents Act 1970', 'Section 53', 'Term of Patent & Maintenance', 'Term is 20 years from international/provisional filing date; subject to renewal fee payment.', 'The term of every patent granted, after the commencement of the Patents (Amendment) Act 2002, and the term of every patent which has not expired and has not ceased to have effect, shall be twenty years from the date of filing of the application for the patent. Renewal fees must be paid annually from the 3rd year onwards to prevent lapse.', 'All granted patents in India.')
ON CONFLICT (id) DO UPDATE SET
    jurisdiction = EXCLUDED.jurisdiction,
    category = EXCLUDED.category,
    authority = EXCLUDED.authority,
    section_ref = EXCLUDED.section_ref,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    text = EXCLUDED.text,
    applicability = EXCLUDED.applicability;
INSERT INTO statutory_acts (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability)
VALUES ('act-in-bda-3', 'india', 'Biodiversity & ABS', 'Biological Diversity Act 2002 (2023 Amendment)', 'Section 3', 'Access to Biological Resources by Non-Indian Entities', 'Non-Indian persons, foreign entities, or Indian companies with foreign shareholding require prior NBA approval for biological resources.', 'No person who is not a citizen of India, or an entity incorporated or registered in India having any non-Indian participation in its share capital or management, shall without prior approval of the National Biodiversity Authority obtain any biological resource occurring in India or knowledge associated thereto for research or commercial utilization or bio-survey and bio-utilization.', 'Foreign collaborations, export of Ayurvedic plants, and MNC pharmaceutical firms.')
ON CONFLICT (id) DO UPDATE SET
    jurisdiction = EXCLUDED.jurisdiction,
    category = EXCLUDED.category,
    authority = EXCLUDED.authority,
    section_ref = EXCLUDED.section_ref,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    text = EXCLUDED.text,
    applicability = EXCLUDED.applicability;
INSERT INTO statutory_acts (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability)
VALUES ('act-in-bda-6', 'india', 'Biodiversity & ABS', 'Biological Diversity Act 2002 (2023 Amendment)', 'Section 6', 'NBA Approval Prior to Patent Grant (Form I)', 'Approval of NBA is mandatory prior to grant of patent inside or outside India based on Indian biological resources.', 'Under Section 6, as amended in 2023, prior approval of the National Biodiversity Authority must be obtained before the grant of the patent (rather than before filing), by filing NBA Form I. Benefit sharing typically entails 0.1% to 0.5% of annual gross ex-factory sales or 5% of licensing royalty. Registered AYUSH practitioners and codified traditional knowledge manufacturers have codified exemptions for domestic manufacture.', 'All patent applications based on Indian medicinal flora (e.g. Ashwagandha, Turmeric, Neem, Brahmi).')
ON CONFLICT (id) DO UPDATE SET
    jurisdiction = EXCLUDED.jurisdiction,
    category = EXCLUDED.category,
    authority = EXCLUDED.authority,
    section_ref = EXCLUDED.section_ref,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    text = EXCLUDED.text,
    applicability = EXCLUDED.applicability;
INSERT INTO statutory_acts (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability)
VALUES ('act-in-dca-schedule1', 'india', 'AYUSH Regulatory', 'Drugs & Cosmetics Rules 1945', 'Schedule I & Rule 158B', 'Ayurvedic Drug Regulatory Categories', 'Classifies Ayurvedic products into Classical (Generic), Patent & Proprietary (P&P), and Phytopharmaceuticals.', 'Under the Drugs and Cosmetics Act, Ayurvedic drugs are categorized into: 1. Classical / Generic formulations: manufactured strictly in accordance with recognized ancient classical texts listed in the First Schedule (Form 25D license, no trial needed); 2. Patent or Proprietary (P&P) Ayurvedic medicines: containing First Schedule ingredients formulated into modern dosage forms (requires Rule 158B safety and published efficacy data); 3. Phytopharmaceuticals: purified bioactive fractions requiring CDSCO New Drug clinical trials (Phases I-IV).', 'Determines manufacturing licenses, clinical trial burden, and marketing authorization.')
ON CONFLICT (id) DO UPDATE SET
    jurisdiction = EXCLUDED.jurisdiction,
    category = EXCLUDED.category,
    authority = EXCLUDED.authority,
    section_ref = EXCLUDED.section_ref,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    text = EXCLUDED.text,
    applicability = EXCLUDED.applicability;
INSERT INTO statutory_acts (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability)
VALUES ('act-in-ayush-aahar', 'india', 'AYUSH Regulatory', 'FSSAI & Ministry of AYUSH', 'Ayurveda Aahar Regulations 2022', 'Ayurveda Aahar (Nutraceuticals) Regulatory Framework', 'Food products prepared in accordance with Ayurvedic texts for dietary health without disease cure claims.', 'Regulations governing foods prepared using processes and recipes described in recognized Ayurvedic texts. Such products carry the dedicated ''Ayurveda Aahar'' logo. They may promote general health, digestion, and vitality, but are legally prohibited from claiming treatment, mitigation, or cure of specific human diseases.', 'Herbal teas, rasayanas, energy mixes, dietary supplements, and botanical nutritionals.')
ON CONFLICT (id) DO UPDATE SET
    jurisdiction = EXCLUDED.jurisdiction,
    category = EXCLUDED.category,
    authority = EXCLUDED.authority,
    section_ref = EXCLUDED.section_ref,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    text = EXCLUDED.text,
    applicability = EXCLUDED.applicability;
INSERT INTO statutory_acts (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability)
VALUES ('tkdl-record-ay-0417', 'india', 'TKDL Prior Art', 'TKDL Database (CSIR)', 'TKDL-AY-0417', 'Withania somnifera (Ashwagandha) Churna Formulation', 'Classical Rasayana formulation for balya (strength), debility, and stress reduction recorded from Charaka Samhita.', 'TKDL Record AY-0417 cites Charaka Samhita, Chikitsasthanam Chapter 1: Ashwagandha root powder mixed with ghrita (clarified butter) and ksheera (cow milk) indicated for Daurbalya (General Debility) and Karshya (Emaciation). Cited successfully against 14 foreign patent attempts claiming Ashwagandha extracts for stress or muscle strength.', 'Direct prior art conflict under Section 3(p) for generic Ashwagandha formulations.')
ON CONFLICT (id) DO UPDATE SET
    jurisdiction = EXCLUDED.jurisdiction,
    category = EXCLUDED.category,
    authority = EXCLUDED.authority,
    section_ref = EXCLUDED.section_ref,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    text = EXCLUDED.text,
    applicability = EXCLUDED.applicability;
INSERT INTO statutory_acts (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability)
VALUES ('tkdl-record-ay-0922', 'india', 'TKDL Prior Art', 'TKDL Database (CSIR)', 'TKDL-AY-0922', 'Curcuma longa (Haridra) Khanda & Piper nigrum Synergy', 'Classical combination of turmeric with black pepper (Maricha) and long pepper (Pippali) for anti-inflammatory & respiratory use.', 'TKDL Record AY-0922 cites Bhaishajya Ratnavali, Udardapratishedha Adhyaya: Haridra Khanda comprising Curcuma longa processed with Trikatu (Piper nigrum, Piper longum, Zingiber officinale) for Kandu (pruritus), Sheetapitta (urticaria), and Shwasa (bronchial inflammation). Known prior art for piperine-curcumin bio-enhancement; patenting requires proving non-obvious synergistic ratio or novel nanocarrier.', 'Overcoming Section 3(p) requires proving unexpected bioavailability ratio (e.g. 50:1 to 100:1) with clinical pharmacokinetic profile.')
ON CONFLICT (id) DO UPDATE SET
    jurisdiction = EXCLUDED.jurisdiction,
    category = EXCLUDED.category,
    authority = EXCLUDED.authority,
    section_ref = EXCLUDED.section_ref,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    text = EXCLUDED.text,
    applicability = EXCLUDED.applicability;
INSERT INTO statutory_acts (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability)
VALUES ('tkdl-record-ay-1289', 'india', 'TKDL Prior Art', 'TKDL Database (CSIR)', 'TKDL-AY-1289', 'Triphala Formulation (Amalaki, Haritaki, Bibhitaki)', 'Classical Chakshushya (ophthalmic health) and rasayana formulation cited from Sushruta Samhita.', 'TKDL Record AY-1289 records equal proportion mixture of Emblica officinalis, Terminalia chebula, and Terminalia bellirica as Triphala Kwatha for ocular cleansing, digestion, and oxidative balance. Prior art defeats broad claims for general antioxidant eye drops; novel supercritical fluid or micro-emulsion delivery claims remain eligible.', 'Prevents patenting of standard Triphala extracts; requires novel drug delivery system (NDDS).')
ON CONFLICT (id) DO UPDATE SET
    jurisdiction = EXCLUDED.jurisdiction,
    category = EXCLUDED.category,
    authority = EXCLUDED.authority,
    section_ref = EXCLUDED.section_ref,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    text = EXCLUDED.text,
    applicability = EXCLUDED.applicability;
INSERT INTO statutory_acts (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability)
VALUES ('treaty-trips-27-3b', 'international', 'International Treaty', 'WTO TRIPS Agreement', 'Article 27.3(b)', 'Patentable Subject Matter & Plant Exclusions', 'Members may exclude plants, animals, and biological processes, but must provide plant variety protection.', 'TRIPS Article 27.3(b) allows WTO member states to exclude from patentability plants and animals other than micro-organisms, and essentially biological processes for the production of plants or animals. Members must provide for the protection of plant varieties either by patents or by an effective sui generis system (in India, PPV&FR Act 2001).', 'Determines international patent scope for botanical extracts versus cultivated varieties.')
ON CONFLICT (id) DO UPDATE SET
    jurisdiction = EXCLUDED.jurisdiction,
    category = EXCLUDED.category,
    authority = EXCLUDED.authority,
    section_ref = EXCLUDED.section_ref,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    text = EXCLUDED.text,
    applicability = EXCLUDED.applicability;
INSERT INTO statutory_acts (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability)
VALUES ('treaty-cbd-nagoya-5-6', 'international', 'International Treaty', 'CBD & Nagoya Protocol', 'Articles 5 & 6', 'Prior Informed Consent & Fair Access Benefit Sharing', 'Access to genetic resources and associated traditional knowledge requires PIC and mutually agreed terms.', 'Parties must ensure that benefits arising from the utilization of genetic resources as well as subsequent applications and commercialization are shared in a fair and equitable manner with the provider country upon Mutually Agreed Terms (MAT). Access requires Prior Informed Consent (PIC). Crucial for Indian exporters filing patents in US, Europe, or Japan.', 'International filings involving Ayurvedic biological resources sourced from India.')
ON CONFLICT (id) DO UPDATE SET
    jurisdiction = EXCLUDED.jurisdiction,
    category = EXCLUDED.category,
    authority = EXCLUDED.authority,
    section_ref = EXCLUDED.section_ref,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    text = EXCLUDED.text,
    applicability = EXCLUDED.applicability;
INSERT INTO statutory_acts (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability)
VALUES ('treaty-pct-22-39', 'international', 'International Patent Treaty', 'WIPO Patent Cooperation Treaty (PCT)', 'Articles 22 & 39', 'PCT International Filing & National Phase Deadline', 'Single international filing gives 30/31 months from priority date to enter national phases worldwide.', 'A PCT application allows an Indian applicant to preserve worldwide priority filing rights across 157 contracting states. The applicant has 30 or 31 months from the initial Indian priority date to enter national phase examination in designated target offices (e.g. USPTO, EPO, JPO, CNIPA). Indian applicants filing abroad must obtain Section 39 foreign filing permission if filed outside India first.', 'Global expansion for Ayurvedic pharmaceutical and biotech innovations.')
ON CONFLICT (id) DO UPDATE SET
    jurisdiction = EXCLUDED.jurisdiction,
    category = EXCLUDED.category,
    authority = EXCLUDED.authority,
    section_ref = EXCLUDED.section_ref,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    text = EXCLUDED.text,
    applicability = EXCLUDED.applicability;
INSERT INTO statutory_acts (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability)
VALUES ('uspto-35-usc-101', 'international', 'US Patent Law', 'USPTO', '35 U.S.C. §§ 101, 102 & Alice/Mayo', 'US Subject Matter Eligibility & Products of Nature Bar', 'Naturally occurring botanicals are ineligible under Section 101 unless markedly different characteristics are proven.', 'Under the US Supreme Court Mayo/Myriad precedents and 35 U.S.C. §101, natural plant extracts are unpatentable as ''products of nature'' unless the inventor demonstrates that the extract possesses ''markedly different characteristics'' (e.g. synthetic structural modification, specific non-natural synergistic ratio, or specialized nanoparticle formulation).', 'Filing Ayurvedic patents in the United States.')
ON CONFLICT (id) DO UPDATE SET
    jurisdiction = EXCLUDED.jurisdiction,
    category = EXCLUDED.category,
    authority = EXCLUDED.authority,
    section_ref = EXCLUDED.section_ref,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    text = EXCLUDED.text,
    applicability = EXCLUDED.applicability;
INSERT INTO statutory_acts (id, jurisdiction, category, authority, section_ref, title, summary, text, applicability)
VALUES ('epo-art-52-54', 'international', 'European Patent Law', 'European Patent Office (EPO)', 'EPC Articles 52, 54 & 56', 'Novelty & Inventive Step (Problem-Solution Approach)', 'Claims must demonstrate non-obvious technical effect over TKDL prior art citing Charaka or Sushruta Samhita.', 'Under the European Patent Convention, inventions must be novel and involve an inventive step evaluated via the Problem-Solution Approach. The EPO has a formal cooperation agreement with CSIR-TKDL; examiners routinely search TKDL records. To satisfy Article 56, the applicant must demonstrate surprising technical effect not foreshadowed in Ayurvedic classical texts.', 'Filing Ayurvedic inventions across 39 European member states.')
ON CONFLICT (id) DO UPDATE SET
    jurisdiction = EXCLUDED.jurisdiction,
    category = EXCLUDED.category,
    authority = EXCLUDED.authority,
    section_ref = EXCLUDED.section_ref,
    title = EXCLUDED.title,
    summary = EXCLUDED.summary,
    text = EXCLUDED.text,
    applicability = EXCLUDED.applicability;

-- 9. SEED DATA: Official Statutory Forms Routing (8 Records)
INSERT INTO official_forms (form_id, name, authority, portal, portal_url, fee_natural_person, fee_startup_msme, fee_large_entity, deadline, mandatory, description)
VALUES ('Form 1', 'Application for Grant of Patent', 'Indian Patent Office (IPO)', 'ipindiaonline.gov.in', 'https://ipindiaonline.gov.in/epatentfiling/goForLogin/doLogin', 1600.0, 1600.0, 8000.0, 'At initial filing', TRUE, 'Statutory application identifying applicant, inventors, title, provisional/complete specification, and declaration of biological material source.')
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
    description = EXCLUDED.description;
INSERT INTO official_forms (form_id, name, authority, portal, portal_url, fee_natural_person, fee_startup_msme, fee_large_entity, deadline, mandatory, description)
VALUES ('Form 2', 'Provisional or Complete Specification', 'Indian Patent Office (IPO)', 'ipindiaonline.gov.in', 'https://ipindiaonline.gov.in/epatentfiling/goForLogin/doLogin', 0.0, 0.0, 0.0, '12 months to file Complete if Provisional filed', TRUE, 'Full technical disclosure including Title, Field, Prior Art background, Summary, Working Examples, Synergistic Efficacy Data, Claims 1-10, and Abstract.')
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
    description = EXCLUDED.description;
INSERT INTO official_forms (form_id, name, authority, portal, portal_url, fee_natural_person, fee_startup_msme, fee_large_entity, deadline, mandatory, description)
VALUES ('Form 3', 'Statement and Undertaking regarding Foreign Applications', 'Indian Patent Office (IPO)', 'ipindiaonline.gov.in', 'https://ipindiaonline.gov.in/epatentfiling/goForLogin/doLogin', 0.0, 0.0, 0.0, 'Within 6 months of filing foreign applications (Section 8)', TRUE, 'Mandatory disclosure under Section 8 of all corresponding patent applications filed in foreign jurisdictions (USPTO, EPO, PCT).')
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
    description = EXCLUDED.description;
INSERT INTO official_forms (form_id, name, authority, portal, portal_url, fee_natural_person, fee_startup_msme, fee_large_entity, deadline, mandatory, description)
VALUES ('Form 5', 'Declaration as to Inventorship', 'Indian Patent Office (IPO)', 'ipindiaonline.gov.in', 'https://ipindiaonline.gov.in/epatentfiling/goForLogin/doLogin', 0.0, 0.0, 0.0, 'With complete specification or within 1 month', TRUE, 'Formal attestation that the named researchers are the true and first inventors of the Ayurvedic innovation.')
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
    description = EXCLUDED.description;
INSERT INTO official_forms (form_id, name, authority, portal, portal_url, fee_natural_person, fee_startup_msme, fee_large_entity, deadline, mandatory, description)
VALUES ('Form 9', 'Request for Early Publication', 'Indian Patent Office (IPO)', 'ipindiaonline.gov.in', 'https://ipindiaonline.gov.in/epatentfiling/goForLogin/doLogin', 2500.0, 2500.0, 10000.0, 'Anytime before mandatory 18-month publication', FALSE, 'Accelerates official publication from 18 months down to approximately 1 month, enabling earlier commercial licensing and examination request.')
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
    description = EXCLUDED.description;
INSERT INTO official_forms (form_id, name, authority, portal, portal_url, fee_natural_person, fee_startup_msme, fee_large_entity, deadline, mandatory, description)
VALUES ('Form 18A', 'Request for Expedited Examination', 'Indian Patent Office (IPO)', 'ipindiaonline.gov.in', 'https://ipindiaonline.gov.in/epatentfiling/goForLogin/doLogin', 4000.0, 4000.0, 20000.0, 'Within 48 months from priority date', FALSE, 'Fast-track examination available for Startups, MSMEs, female applicants, and entities utilizing Indian biological resources, granting first examination report (FER) within months.')
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
    description = EXCLUDED.description;
INSERT INTO official_forms (form_id, name, authority, portal, portal_url, fee_natural_person, fee_startup_msme, fee_large_entity, deadline, mandatory, description)
VALUES ('NBA Form I', 'Application for NBA Prior Approval for IPR', 'National Biodiversity Authority (NBA)', 'nbaindia.org / abs.nbaindia.org', 'http://nbaindia.org/', 10000.0, 10000.0, 10000.0, 'Mandatory prior to grant of patent (BDA 2023 Section 6)', TRUE, 'Statutory application under Section 6 of Biological Diversity Act for permission to commercialize patent based on Indian biological resources, establishing benefit sharing terms.')
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
    description = EXCLUDED.description;
INSERT INTO official_forms (form_id, name, authority, portal, portal_url, fee_natural_person, fee_startup_msme, fee_large_entity, deadline, mandatory, description)
VALUES ('AYUSH Form 25D', 'Manufacturing License for Ayurvedic/Siddha Drugs', 'State AYUSH Licensing Authority / CDSCO', 'e-ayush.gov.in (Sugam Portal)', 'https://e-ayush.gov.in/', 2000.0, 2000.0, 5000.0, 'Prior to commercial manufacture or clinical distribution', TRUE, 'Regulatory license under Drugs & Cosmetics Act for manufacturing Classical formulations or Patent & Proprietary medicines in a GMP-certified facility.')
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
    description = EXCLUDED.description;

-- 10. SEED DATA: Curated Jury Showcase Case Studies (4 Records)
INSERT INTO jury_presets (preset_id, title, short_desc, product_name, product_type, herbs, claim_use, core_objective, jurisdiction, language)
VALUES ('scenario-curcumin-piperine', 'Haridra (Curcumin) + Maricha (Piperine) Synergistic Bio-Enhancer', 'Tests Section 3(d)/3(e) Synergistic Efficacy hurdle & NBA Form I clearance', 'Haridra-Maricha Nano-Bioavailability Complex', 'Patent or Proprietary (P&P)', 'Curcuma longa (Haridra rhizome 95% Curcuminoids) + Piper nigrum (Maricha fruit 98% Piperine)', 'Patent Grant', 'Synergistic Bioavailability Enhancement (2000% increased serum absorption at specific 100:1 ratio)', 'india', 'en')
ON CONFLICT (preset_id) DO UPDATE SET
    title = EXCLUDED.title,
    short_desc = EXCLUDED.short_desc,
    product_name = EXCLUDED.product_name,
    product_type = EXCLUDED.product_type,
    herbs = EXCLUDED.herbs,
    claim_use = EXCLUDED.claim_use,
    core_objective = EXCLUDED.core_objective,
    jurisdiction = EXCLUDED.jurisdiction,
    language = EXCLUDED.language;
INSERT INTO jury_presets (preset_id, title, short_desc, product_name, product_type, herbs, claim_use, core_objective, jurisdiction, language)
VALUES ('scenario-ashwagandha-tkdl', 'Classical Ashwagandha Churna in Cow Milk (TKDL Conflict Test)', 'Demonstrates Section 3(p) Traditional Knowledge rejection & Defensive Publication routing', 'Ashwagandha Rasayana Churna Formulation', 'Classical / Generic (Schedule I)', 'Withania somnifera (Ashwagandha root powder 5g) + Cow Milk (Godugdha)', 'Defensive Publication / TKDL Shield', 'Demonstrate Traditional Knowledge Prior Art Bar under Section 3(p) & route to Classical AYUSH License', 'india', 'en')
ON CONFLICT (preset_id) DO UPDATE SET
    title = EXCLUDED.title,
    short_desc = EXCLUDED.short_desc,
    product_name = EXCLUDED.product_name,
    product_type = EXCLUDED.product_type,
    herbs = EXCLUDED.herbs,
    claim_use = EXCLUDED.claim_use,
    core_objective = EXCLUDED.core_objective,
    jurisdiction = EXCLUDED.jurisdiction,
    language = EXCLUDED.language;
INSERT INTO jury_presets (preset_id, title, short_desc, product_name, product_type, herbs, claim_use, core_objective, jurisdiction, language)
VALUES ('scenario-triphala-ophthalmic', 'Triphala Supercritical CO2 Ophthalmic Nano-Emulsion', 'Overcomes Section 3(p) via Novel Drug Delivery System (NDDS) & Industrial Process', 'OcuVeda Triphala Micro-Emulsion Eye Drops', 'Phytopharmaceutical / Novel Drug Delivery System', 'Emblica officinalis (Amalaki), Terminalia chebula (Haritaki), Terminalia bellirica (Bibhitaki) Supercritical CO2 extracts', 'Patent Grant', 'Novel delivery system providing 8-hour sustained intraocular pressure reduction without irritation', 'both', 'en')
ON CONFLICT (preset_id) DO UPDATE SET
    title = EXCLUDED.title,
    short_desc = EXCLUDED.short_desc,
    product_name = EXCLUDED.product_name,
    product_type = EXCLUDED.product_type,
    herbs = EXCLUDED.herbs,
    claim_use = EXCLUDED.claim_use,
    core_objective = EXCLUDED.core_objective,
    jurisdiction = EXCLUDED.jurisdiction,
    language = EXCLUDED.language;
INSERT INTO jury_presets (preset_id, title, short_desc, product_name, product_type, herbs, claim_use, core_objective, jurisdiction, language)
VALUES ('scenario-brahmi-global', 'Brahmi (Bacopa monnieri) Cognitive Peptide Complex (PCT Route)', 'International PCT & Nagoya Protocol compliance for export market', 'BacoMind Pro Memory & Neuro-protective Extract', 'Phytopharmaceutical', 'Bacopa monnieri (Brahmi whole plant, standardized to 55% Bacosides A & B)', 'Patent Grant (International PCT)', 'International patenting under PCT Articles 22/39 with Nagoya Protocol benefit-sharing clearance', 'international', 'en')
ON CONFLICT (preset_id) DO UPDATE SET
    title = EXCLUDED.title,
    short_desc = EXCLUDED.short_desc,
    product_name = EXCLUDED.product_name,
    product_type = EXCLUDED.product_type,
    herbs = EXCLUDED.herbs,
    claim_use = EXCLUDED.claim_use,
    core_objective = EXCLUDED.core_objective,
    jurisdiction = EXCLUDED.jurisdiction,
    language = EXCLUDED.language;