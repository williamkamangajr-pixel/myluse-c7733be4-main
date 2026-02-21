-- Update stock tickers to match official LuSE symbols
-- First, update existing entries where we can match by name/description

-- Clear and insert all 24 official LuSE listed companies with correct tickers
DELETE FROM stocks;

INSERT INTO stocks (ticker, name, sector, current_price, previous_close, change, change_percent, volume, description, website, headquarters) VALUES
('AELZ', 'Airtel Networks Zambia', 'Telecommunications', 0, 0, 0, 0, 0, 'Airtel Networks Zambia Plc provides mobile telecommunications services.', 'https://www.airtel.co.zm', 'Lusaka'),
('ATEL', 'African Telecommunications', 'Telecommunications', 0, 0, 0, 0, 0, 'African Telecommunications provides telecom infrastructure services.', NULL, 'Lusaka'),
('BATZ', 'British American Tobacco Zambia', 'Consumer Goods', 0, 0, 0, 0, 0, 'British American Tobacco Zambia manufactures and sells tobacco products.', 'https://www.bat.com', 'Lusaka'),
('CEC', 'Copperbelt Energy Corporation', 'Utilities', 0, 0, 0, 0, 0, 'Copperbelt Energy Corporation Plc provides electricity to the mining industry.', 'https://www.cecinvestor.com', 'Kitwe'),
('CHAL', 'Chattel Holdings', 'Industrial', 0, 0, 0, 0, 0, 'Chattel Holdings Limited is an industrial conglomerate.', NULL, 'Lusaka'),
('CHIL', 'Chilanga Cement', 'Industrial', 0, 0, 0, 0, 0, 'Chilanga Cement Plc manufactures and distributes cement products.', NULL, 'Chilanga'),
('FARM', 'Farmers House', 'Financial Services', 0, 0, 0, 0, 0, 'Farmers House Plc provides agricultural financing and insurance.', NULL, 'Lusaka'),
('INVZ', 'Investrust Bank', 'Financial Services', 0, 0, 0, 0, 0, 'Investrust Bank Plc provides banking services to SMEs and individuals.', 'https://www.investrustbank.co.zm', 'Lusaka'),
('LAFZ', 'Lafarge Zambia', 'Industrial', 0, 0, 0, 0, 0, 'Lafarge Zambia Plc manufactures and sells cement and building materials.', 'https://www.lafarge.co.zm', 'Chilanga'),
('MAFS', 'Madison Asset Finance', 'Financial Services', 0, 0, 0, 0, 0, 'Madison Asset Finance provides asset financing solutions.', NULL, 'Lusaka'),
('MFEZ', 'Madison Financial Services', 'Financial Services', 0, 0, 0, 0, 0, 'Madison Financial Services provides insurance and financial services.', 'https://www.madison.co.zm', 'Lusaka'),
('METZ', 'Metal Fabricators of Zambia', 'Industrial', 0, 0, 0, 0, 0, 'Metal Fabricators of Zambia manufactures metal products.', NULL, 'Lusaka'),
('NATB', 'National Breweries', 'Consumer Goods', 0, 0, 0, 0, 0, 'National Breweries Plc produces and sells beverages.', 'https://www.natbrew.co.zm', 'Lusaka'),
('PRSC', 'Prima Reinsurance', 'Financial Services', 0, 0, 0, 0, 0, 'Prima Reinsurance Plc provides reinsurance services.', NULL, 'Lusaka'),
('PUMA', 'Puma Energy Zambia', 'Energy', 0, 0, 0, 0, 0, 'Puma Energy Zambia Plc distributes petroleum products.', 'https://www.pumaenergy.com', 'Lusaka'),
('REIZ', 'Real Estate Investments Zambia', 'Real Estate', 0, 0, 0, 0, 0, 'Real Estate Investments Zambia Plc owns and manages commercial properties.', NULL, 'Lusaka'),
('SBZL', 'Stanbic Bank Zambia', 'Financial Services', 0, 0, 0, 0, 0, 'Stanbic Bank Zambia Limited is part of the Standard Bank Group.', 'https://www.stanbicbank.co.zm', 'Lusaka'),
('SCBZ', 'Standard Chartered Bank Zambia', 'Financial Services', 0, 0, 0, 0, 0, 'Standard Chartered Bank Zambia Plc provides banking and financial services.', 'https://www.sc.com/zm', 'Lusaka'),
('SHOP', 'Shoprite Holdings Zambia', 'Retail', 0, 0, 0, 0, 0, 'Shoprite Holdings operates supermarkets across Zambia.', 'https://www.shoprite.co.za', 'Lusaka'),
('ZBFP', 'Zambeef Products', 'Consumer Goods', 0, 0, 0, 0, 0, 'Zambeef Products PLC is an integrated cold chain food products and retail company.', 'https://www.zambeefplc.com', 'Lusaka'),
('ZCCM-IH', 'ZCCM Investments Holdings', 'Mining', 0, 0, 0, 0, 0, 'ZCCM Investments Holdings Plc is a Zambian company that holds investments in mining and related industries.', 'https://www.zccm-ih.com.zm', 'Lusaka'),
('ZMRE', 'Zambia Re', 'Financial Services', 0, 0, 0, 0, 0, 'Zambia Re provides reinsurance services.', NULL, 'Lusaka'),
('ZNCO', 'Zanaco', 'Financial Services', 0, 0, 0, 0, 0, 'Zambia National Commercial Bank provides retail and corporate banking.', 'https://www.zanaco.co.zm', 'Lusaka'),
('ZSUG', 'Zambia Sugar', 'Agriculture', 0, 0, 0, 0, 0, 'Zambia Sugar Plc is one of the largest sugar producers in Africa.', 'https://www.zamsugar.co.zm', 'Mazabuka');

-- Ensure market summary exists
INSERT INTO market_summary (index_name, index_value, index_change, index_change_percent, total_volume, total_value_traded, advancing_stocks, declining_stocks, unchanged_stocks, market_status, last_updated)
VALUES ('LASI', 0, 0, 0, 0, 0, 0, 0, 0, 'closed', now())
ON CONFLICT DO NOTHING;