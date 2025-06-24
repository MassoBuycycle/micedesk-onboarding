-- Migration: Add contract file types
-- Description: Add file type categories for contract and onboarding documents

-- Insert contract file types
INSERT IGNORE INTO file_types (name, code, category, allowed_extensions, max_size) VALUES
-- Contract/Onboarding files
('Contract Documents', 'contract_docs', 'contract', '["pdf", "doc", "docx"]', 10485760),
('Contract PDFs', 'contract_pdf', 'contract', '["pdf"]', 10485760),
('Signed Contracts', 'signed_contracts', 'contract', '["pdf"]', 10485760),
('Onboarding Documents', 'onboarding_docs', 'contract', '["pdf", "doc", "docx", "txt"]', 10485760),
('Technical Setup Guides', 'tech_guides', 'contract', '["pdf", "doc", "docx"]', 10485760),
('Access Forms', 'access_forms', 'contract', '["pdf", "doc", "docx"]', 5242880),
('SLA Documents', 'sla_docs', 'contract', '["pdf"]', 10485760),
('Legal Documents', 'legal_docs', 'contract', '["pdf", "doc", "docx"]', 10485760),
('Agreements', 'agreements', 'contract', '["pdf", "doc", "docx"]', 10485760),
('Addendums', 'addendums', 'contract', '["pdf", "doc", "docx"]', 5242880);

-- Also add to onboarding_file_types table
INSERT IGNORE INTO onboarding_file_types (name, code, category, allowed_extensions, max_size) VALUES
-- Contract/Onboarding files
('Contract Documents', 'contract_docs', 'contract', '["pdf", "doc", "docx"]', 10485760),
('Contract PDFs', 'contract_pdf', 'contract', '["pdf"]', 10485760),
('Signed Contracts', 'signed_contracts', 'contract', '["pdf"]', 10485760),
('Onboarding Documents', 'onboarding_docs', 'contract', '["pdf", "doc", "docx", "txt"]', 10485760),
('Technical Setup Guides', 'tech_guides', 'contract', '["pdf", "doc", "docx"]', 10485760),
('Access Forms', 'access_forms', 'contract', '["pdf", "doc", "docx"]', 5242880),
('SLA Documents', 'sla_docs', 'contract', '["pdf"]', 10485760),
('Legal Documents', 'legal_docs', 'contract', '["pdf", "doc", "docx"]', 10485760),
('Agreements', 'agreements', 'contract', '["pdf", "doc", "docx"]', 10485760),
('Addendums', 'addendums', 'contract', '["pdf", "doc", "docx"]', 5242880); 