<div align="center">

  <img src="frontend/public/veda.png" alt="Vedha Mind logo" width="220"/>

  <h1>Vedha Mind</h1>

  <p>
    <strong>
      A multilingual, RAG-based, source-cited AI assistant for Intellectual Property
      &amp; regulatory guidance in Ayurveda — across national and international regimes.
    </strong>
  </p>

</div>

---

## Overview

Ayurveda sits at the intersection of ancient codified knowledge and modern IP law — patents, geographical indications, trademarks, copyright, trade secrets, plant-variety rights, Access-and-Benefit-Sharing (ABS) duties, and drug-regulatory classification can overlap for a single product.

**Vedha Mind** helps practitioners, researchers, AYUSH startups, MSMEs, and cultivators navigate this landscape by answering IPR and regulatory questions with **accuracy, source citation, and strict jurisdictional clarity**.

The assistant first helps classify an Ayurvedic formulation — such as **classical/generic, patent-or-proprietary, new/non-classical drug, phytopharmaceutical, Ayurveda-Aahar/nutraceutical, or cosmetic** — and then answers grounded, citation-backed questions about patents, GI, trademarks, ABS compliance, and TKDL prior art.

**India and International tracks are kept explicitly and permanently separate**, preventing the two regulatory regimes from being conflated in a single answer.

---

## Key Features

* **Jurisdiction Toggle** — India vs. International answer sets, kept visibly separate across data, retrieval, and prompt levels.

* **Formulation Classification Flow** — Routes a product query to the appropriate IP and ABS posture before answering.

* **Source-Cited RAG** — Every claim resolves to a statute, rule, treaty article, or registry record; **no citation, no answer**.

* **TKDL Prior-Art Matching** — Flags potential Section 3(p) conflicts against the Traditional Knowledge Digital Library.

* **Patent Lifecycle Tracking** — Tracks status, filing/grant dates, and computed or reported expiry for both Indian and international filings.

* **Multilingual Retrieval & Generation** — Uses native multilingual embeddings without a lossy translate-then-embed step, with a Bhashini-ready interface.

* **Reranked Retrieval** — Applies cross-encoder reranking on top of vector search for more legally precise retrieval.

* **Structured Per-Search Reports** — Provides an **India section, International section, and Recommendation section** for each search.

* **Anti-Hallucination Validator** — Validates generated citations against the retrieved sources before returning an answer.

* **DPDP-Aligned Audit Trail** — Records queries, retrieval sets, and escalatio
