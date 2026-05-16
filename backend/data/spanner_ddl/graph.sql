-- Spanner Graph DDL for NexusAI Ecosystem Graph
-- Apply with: scripts/spanner_apply_ddl.py

CREATE TABLE IF NOT EXISTS MentorNode (
  mentor_id INT64 NOT NULL,
  name STRING(255),
  email STRING(255),
  industry STRING(500),
  country STRING(100),
  stage STRING(200),
  support_type STRING(500),
  capacity STRING(50),
) PRIMARY KEY (mentor_id);

CREATE TABLE IF NOT EXISTS CompanyNode (
  company_id INT64 NOT NULL,
  name STRING(255),
  industry STRING(200),
  stage STRING(100),
  country STRING(100),
  description STRING(MAX),
) PRIMARY KEY (company_id);

CREATE TABLE IF NOT EXISTS EventNode (
  event_id INT64 NOT NULL,
  name STRING(255),
  event_date DATE,
  location STRING(255),
) PRIMARY KEY (event_id);

CREATE TABLE IF NOT EXISTS PartnerNode (
  partner_id INT64 NOT NULL,
  name STRING(255),
  org_type STRING(100),
) PRIMARY KEY (partner_id);

CREATE TABLE IF NOT EXISTS MentoredEdge (
  mentor_id INT64 NOT NULL,
  company_id INT64 NOT NULL,
  event_id INT64,
  outcome_score FLOAT64,
  outcome_label STRING(50),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  CONSTRAINT FK_Mentored_Mentor FOREIGN KEY (mentor_id) REFERENCES MentorNode(mentor_id),
  CONSTRAINT FK_Mentored_Company FOREIGN KEY (company_id) REFERENCES CompanyNode(company_id),
) PRIMARY KEY (mentor_id, company_id);

CREATE TABLE IF NOT EXISTS ParticipatedEdge (
  entity_type STRING(50) NOT NULL,
  entity_id INT64 NOT NULL,
  event_id INT64 NOT NULL,
  CONSTRAINT FK_Participated_Event FOREIGN KEY (event_id) REFERENCES EventNode(event_id),
) PRIMARY KEY (entity_type, entity_id, event_id);

CREATE OR REPLACE PROPERTY GRAPH EcosystemGraph
  NODE TABLES (
    MentorNode KEY (mentor_id)
      LABEL Mentor
      PROPERTIES (mentor_id AS id, name, email, industry, country, stage, support_type, capacity),
    CompanyNode KEY (company_id)
      LABEL Company
      PROPERTIES (company_id AS id, name, industry, stage, country, description),
    EventNode KEY (event_id)
      LABEL Event
      PROPERTIES (event_id AS id, name, event_date, location),
    PartnerNode KEY (partner_id)
      LABEL Partner
      PROPERTIES (partner_id AS id, name, org_type)
  )
  EDGE TABLES (
    MentoredEdge KEY (mentor_id, company_id)
      SOURCE KEY (mentor_id) REFERENCES MentorNode (mentor_id)
      DESTINATION KEY (company_id) REFERENCES CompanyNode (company_id)
      LABEL MENTORED
      PROPERTIES (outcome_score, outcome_label, started_at, ended_at)
  );
