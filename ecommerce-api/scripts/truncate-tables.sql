-- =============================================================================
-- truncate-tables.sql
-- Wipes all application data from the ecommerce_db database for a clean test run.
--
-- Truncates the product catalog AND all transactional data (orders, customers,
-- payments, shipping, addresses). The EF Core migration history table
-- (__efmigrationshistory) is intentionally left untouched so the schema stays
-- intact and the API does not try to re-run migrations.
--
-- Usage (from a shell with the MySQL client on PATH):
--   mysql -h 127.0.0.1 -P 3306 -u ecommerce_user -p ecommerce_db < truncate-tables.sql
--
-- Or from inside the mysql prompt:
--   USE ecommerce_db;
--   SOURCE truncate-tables.sql;
--
-- NOTE: TRUNCATE is destructive and cannot be rolled back. Make sure you are
-- pointing at the correct (local/dev) database before running.
-- =============================================================================

USE ecommerce_db;

-- Disable FK checks so child/parent tables can be truncated in any order.
SET FOREIGN_KEY_CHECKS = 0;

-- Transactional data (child tables first is not required with FK checks off,
-- but kept in dependency order for clarity).
TRUNCATE TABLE orderlines;
TRUNCATE TABLE orderpayments;
TRUNCATE TABLE ordershippinginfos;
TRUNCATE TABLE orders;
TRUNCATE TABLE deliveryaddresses;
TRUNCATE TABLE customers;

-- Product catalog.
TRUNCATE TABLE products;

SET FOREIGN_KEY_CHECKS = 1;

-- Confirm everything is empty (and the catalog count, which should be 0).
SELECT 'customers'          AS tbl, COUNT(*) AS rows_left FROM customers
UNION ALL SELECT 'orders',             COUNT(*) FROM orders
UNION ALL SELECT 'orderlines',         COUNT(*) FROM orderlines
UNION ALL SELECT 'orderpayments',      COUNT(*) FROM orderpayments
UNION ALL SELECT 'ordershippinginfos', COUNT(*) FROM ordershippinginfos
UNION ALL SELECT 'deliveryaddresses',  COUNT(*) FROM deliveryaddresses
UNION ALL SELECT 'products',           COUNT(*) FROM products;
