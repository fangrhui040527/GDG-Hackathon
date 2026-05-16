-- Create dataset and table for vector search
CREATE SCHEMA IF NOT EXISTS `yokoyoko.vector_dw`;

CREATE TABLE IF NOT EXISTS `yokoyoko.vector_dw.documents` (
  doc_id STRING NOT NULL,
  content STRING,
  metadata JSON,
  embedding ARRAY<FLOAT64>
);
