# BigQuery Setup Guide

## Overview
This guide provides step-by-step instructions for setting up and using BigQuery with vector embeddings for similarity search.

## Prerequisites
- Ensure you have a `docs.txt` file in the backend directory containing your data
- Python environment with required dependencies installed
- BigQuery project credentials configured

---

## Step 1: Build Vector JSONL File

Convert your source documents to JSONL format for BigQuery ingestion.

```bash
python scripts/build_vectors_jsonl.py --input docs.txt --output data.jsonl
```

**Description:** Generates vector embeddings from the documents in `docs.txt` and outputs them as JSONL format.

**Parameters:**
- `--input`: Source file (default: `docs.txt`)
- `--output`: Output JSONL file (default: `data.jsonl`)

---

## Step 2: Load Data into BigQuery

Upload the generated JSONL file to your BigQuery dataset.

```bash
python scripts/load_vectors.py --project PROJ_ID --dataset YOUR_DATASET_ID --table documents --source data.jsonl
```

**Description:** Loads vector data from the JSONL file into BigQuery database.

**Parameters:**
- `--project`: Your BigQuery project ID
- `--dataset`: Target dataset name
- `--table`: Target table name (default: `documents`)
- `--source`: Source JSONL file path

---

## Step 3: Perform Similarity Search

Use the API to query similar documents via vector search.

**Endpoint:** `/bigquery/vector/search`

**Description:** Search for documents similar to your query using vector embeddings stored in BigQuery.