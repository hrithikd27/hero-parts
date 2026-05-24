-- ============================================================
--  Hero Parts Platform — Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    parent_id   BIGINT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS parts (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    sku              VARCHAR(50)  NOT NULL UNIQUE,
    name             VARCHAR(500) NOT NULL,
    hindi_name       VARCHAR(500),
    description      TEXT,
    category_id      BIGINT,
    price            DECIMAL(10,2),
    mrp              DECIMAL(10,2),
    unit             VARCHAR(20) DEFAULT 'PCS',
    compatible_models VARCHAR(500),
    eshop_url        VARCHAR(500),
    image_url        VARCHAR(500),
    in_stock         BOOLEAN DEFAULT TRUE,
    stock_qty        INT DEFAULT 0,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_part_category FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS search_aliases (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_id     BIGINT NOT NULL,
    alias       VARCHAR(500) NOT NULL,
    alias_type  VARCHAR(30) NOT NULL,  -- HINDI, SLANG, PHONETIC, SYMPTOM, COLOR, MODEL_SLANG
    language    VARCHAR(10) DEFAULT 'hi',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alias_part FOREIGN KEY (part_id) REFERENCES parts(id),
    CONSTRAINT uq_alias_part UNIQUE (part_id, alias)
);

CREATE INDEX IF NOT EXISTS idx_alias_text ON search_aliases(alias);
CREATE INDEX IF NOT EXISTS idx_alias_part  ON search_aliases(part_id);

CREATE TABLE IF NOT EXISTS dealers (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    dealer_code  VARCHAR(30) NOT NULL UNIQUE,
    name         VARCHAR(200) NOT NULL,
    contact_name VARCHAR(100),
    phone        VARCHAR(15),
    email        VARCHAR(100),
    city         VARCHAR(100),
    state        VARCHAR(100),
    pincode      VARCHAR(10),
    active       BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS eshop_clicks (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_sku    VARCHAR(50),
    part_name   VARCHAR(500),
    eshop_url   VARCHAR(500),
    session_id  VARCHAR(64),
    clicked_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_click_sku        ON eshop_clicks(part_sku);
CREATE INDEX IF NOT EXISTS idx_click_session    ON eshop_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_click_clicked_at ON eshop_clicks(clicked_at);

CREATE TABLE IF NOT EXISTS search_logs (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    query           VARCHAR(300) NOT NULL,
    dealer_id       BIGINT,
    results_count   INT DEFAULT 0,
    top_part_sku    VARCHAR(50),
    match_type      VARCHAR(30),  -- EXACT_SKU, EXACT_NAME, ALIAS, FUZZY, NO_RESULT, IMAGE
    source          VARCHAR(10) DEFAULT 'text',  -- 'text', 'voice', or 'image'
    session_id      VARCHAR(64),
    searched_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_log_dealer FOREIGN KEY (dealer_id) REFERENCES dealers(id)
);

CREATE INDEX IF NOT EXISTS idx_log_source     ON search_logs(source);
CREATE INDEX IF NOT EXISTS idx_log_searched_at ON search_logs(searched_at);