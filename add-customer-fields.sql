-- Add missing fields to customers table
ALTER TABLE crm_service.customers ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
ALTER TABLE crm_service.customers ADD COLUMN IF NOT EXISTS tax_id VARCHAR(50);
