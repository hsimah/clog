-- Schema::install output at the version 2 base revision (39140d2), before account administration.
CREATE TABLE "app_clog_inventory" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,
    "name" TEXT NOT NULL CHECK (length("name") <= 200),
    "date_added" TEXT NOT NULL,
    "item_id" INTEGER REFERENCES "app_clog_item"("id") ON DELETE RESTRICT,
    "location_id" INTEGER REFERENCES "app_clog_location"("id") ON DELETE RESTRICT
);
CREATE INDEX "app_clog_inventory_item_id_idx" ON "app_clog_inventory" ("item_id");
CREATE INDEX "app_clog_inventory_location_id_idx" ON "app_clog_inventory" ("location_id");
CREATE TABLE "app_clog_item" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,
    "name" TEXT NOT NULL CHECK (length("name") <= 200),
    "barcode" TEXT CHECK (length("barcode") <= 64)
);
CREATE INDEX "app_clog_item_name_idx" ON "app_clog_item" ("name");
CREATE UNIQUE INDEX "app_clog_item_barcode_uniq" ON "app_clog_item" ("barcode");
CREATE TABLE "app_clog_location" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL,
    "name" TEXT NOT NULL CHECK (length("name") <= 200)
);
CREATE UNIQUE INDEX "app_clog_location_name_uniq" ON "app_clog_location" ("name");
CREATE TABLE clog_users (
 id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT COLLATE NOCASE NOT NULL UNIQUE,
 password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('reader', 'editor')),
 enabled INTEGER NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX clog_item_barcode_nocase ON app_clog_item(barcode COLLATE CLOG_NOCASE);
CREATE UNIQUE INDEX clog_location_name_nocase ON app_clog_location(name COLLATE CLOG_NOCASE);
CREATE INDEX clog_item_name_nocase ON app_clog_item(name COLLATE CLOG_NOCASE);
CREATE INDEX app_clog_inventory_date_idx ON app_clog_inventory(date_added DESC, id ASC);
PRAGMA user_version = 2;
