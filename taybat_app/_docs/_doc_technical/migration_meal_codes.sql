-- =============================================================================
-- Migration: add code to meal_items, rename meal_item_ids → meal_item_codes
-- Run order: 1→2→3→4→5→6→7
-- Safe to re-run: uses IF NOT EXISTS / IF EXISTS / ON CONFLICT DO NOTHING
-- =============================================================================


-- ---------------------------------------------------------------------------
-- STEP 1 — Add nullable code column to meal_items
-- ---------------------------------------------------------------------------
ALTER TABLE public.meal_items ADD COLUMN IF NOT EXISTS code TEXT;


-- ---------------------------------------------------------------------------
-- STEP 2 — Populate codes for all existing meal items
-- ---------------------------------------------------------------------------
UPDATE public.meal_items SET code = 'RICE'                    WHERE id = 1001;
UPDATE public.meal_items SET code = 'POTATO'                  WHERE id = 1002;
UPDATE public.meal_items SET code = 'OLIVE_OIL'               WHERE id = 1003;
UPDATE public.meal_items SET code = 'SALT'                    WHERE id = 1004;
UPDATE public.meal_items SET code = 'VINEGAR'                 WHERE id = 1005;
UPDATE public.meal_items SET code = 'DATES'                   WHERE id = 1006;
UPDATE public.meal_items SET code = 'SUGAR'                   WHERE id = 1007;
UPDATE public.meal_items SET code = 'HONEY'                   WHERE id = 1008;
UPDATE public.meal_items SET code = 'SUGARCANE_JUICE_FRESH'   WHERE id = 1009;
UPDATE public.meal_items SET code = 'VITAMIN_D'               WHERE id = 1010;
UPDATE public.meal_items SET code = 'CHEDDAR'                 WHERE id = 2001;
UPDATE public.meal_items SET code = 'EDAM_CHEESE'             WHERE id = 2002;
UPDATE public.meal_items SET code = 'GOUDA'                   WHERE id = 2003;
UPDATE public.meal_items SET code = 'KASHKAVAL'               WHERE id = 2004;
UPDATE public.meal_items SET code = 'PARMESAN'                WHERE id = 2005;
UPDATE public.meal_items SET code = 'ROQUEFORT'               WHERE id = 2006;
UPDATE public.meal_items SET code = 'AMERICAN_CHEESE'         WHERE id = 2007;
UPDATE public.meal_items SET code = 'WHITE_CHEESE'            WHERE id = 2008;
UPDATE public.meal_items SET code = 'TURKISH_COFFEE'          WHERE id = 2009;
UPDATE public.meal_items SET code = 'AMERICANO'               WHERE id = 2010;
UPDATE public.meal_items SET code = 'ESPRESSO'                WHERE id = 2011;
UPDATE public.meal_items SET code = 'EARL_GREY'               WHERE id = 2012;
UPDATE public.meal_items SET code = 'GREEN_TEA'               WHERE id = 2013;
UPDATE public.meal_items SET code = 'HERBAL_DRINKS'           WHERE id = 2014;
UPDATE public.meal_items SET code = 'RAMADAN_JUICES'          WHERE id = 2015;
UPDATE public.meal_items SET code = 'SUGARCANE_JUICE'         WHERE id = 2016;
UPDATE public.meal_items SET code = 'JUHAYNA_GUAVA'           WHERE id = 2017;
UPDATE public.meal_items SET code = 'JUHAYNA_APPLE'           WHERE id = 2018;
UPDATE public.meal_items SET code = 'JUHAYNA_GRAPE'           WHERE id = 2019;
UPDATE public.meal_items SET code = 'JUHAYNA_BERRY'           WHERE id = 2020;
UPDATE public.meal_items SET code = 'JUHAYNA_POMEGRANATE'     WHERE id = 2021;
UPDATE public.meal_items SET code = 'FRESH_DATES'             WHERE id = 2022;
UPDATE public.meal_items SET code = 'DATE_JAM'                WHERE id = 2023;
UPDATE public.meal_items SET code = 'DATE_MOLASSES'           WHERE id = 2024;
UPDATE public.meal_items SET code = 'CHOCOLATE'               WHERE id = 2025;
UPDATE public.meal_items SET code = 'POPCORN'                 WHERE id = 2026;
UPDATE public.meal_items SET code = 'PLAIN_CHIPS'             WHERE id = 2027;
UPDATE public.meal_items SET code = 'PICKLED_OLIVES'          WHERE id = 2028;
UPDATE public.meal_items SET code = 'SESAME'                  WHERE id = 2029;
UPDATE public.meal_items SET code = 'TAHINI'                  WHERE id = 2030;
UPDATE public.meal_items SET code = 'WHOLE_WHEAT_TOAST'       WHERE id = 2031;
UPDATE public.meal_items SET code = 'BLACK_PEPPER'            WHERE id = 2032;
UPDATE public.meal_items SET code = 'POMEGRANATE_MOLASSES'    WHERE id = 2033;
UPDATE public.meal_items SET code = 'SUNFLOWER_OIL'           WHERE id = 2034;
UPDATE public.meal_items SET code = 'CORN_OIL'                WHERE id = 2035;
UPDATE public.meal_items SET code = 'BEEF_BOILED'             WHERE id = 3001;
UPDATE public.meal_items SET code = 'LAMB_BOILED'             WHERE id = 3002;
UPDATE public.meal_items SET code = 'LAMB_LIVER_BOILED'       WHERE id = 3003;
UPDATE public.meal_items SET code = 'TROTTERS_BOILED'         WHERE id = 3004;
UPDATE public.meal_items SET code = 'HEAD_MEAT_BOILED'        WHERE id = 3005;
UPDATE public.meal_items SET code = 'STUFFED_INTESTINE'       WHERE id = 3006;
UPDATE public.meal_items SET code = 'AKKAWI_BOILED'           WHERE id = 3007;
UPDATE public.meal_items SET code = 'RABBIT_BOILED'           WHERE id = 3008;
UPDATE public.meal_items SET code = 'QUAIL_BOILED'            WHERE id = 3009;
UPDATE public.meal_items SET code = 'PIGEON_BOILED'           WHERE id = 3010;
UPDATE public.meal_items SET code = 'SEAFISH_GRILLED'         WHERE id = 3011;
UPDATE public.meal_items SET code = 'TUNA_CANNED'             WHERE id = 3012;
UPDATE public.meal_items SET code = 'SARDINE_CANNED'          WHERE id = 3013;
UPDATE public.meal_items SET code = 'GRAPES'                  WHERE id = 3014;
UPDATE public.meal_items SET code = 'BANANA'                  WHERE id = 3015;
UPDATE public.meal_items SET code = 'STRAWBERRY'              WHERE id = 3016;
UPDATE public.meal_items SET code = 'BERRIES'                 WHERE id = 3017;
UPDATE public.meal_items SET code = 'GUAVA'                   WHERE id = 3018;
UPDATE public.meal_items SET code = 'FIG'                     WHERE id = 3019;
UPDATE public.meal_items SET code = 'POMEGRANATE_JUICE'       WHERE id = 3020;
UPDATE public.meal_items SET code = 'CACTUS_JUICE'            WHERE id = 3021;
UPDATE public.meal_items SET code = 'SEMOLINA_COARSE'         WHERE id = 3022;
UPDATE public.meal_items SET code = 'SEMOLINA_MEDIUM'         WHERE id = 3023;
UPDATE public.meal_items SET code = 'SEMOLINA_PASTA'          WHERE id = 3024;
UPDATE public.meal_items SET code = 'CORN_BOILED'             WHERE id = 3025;
UPDATE public.meal_items SET code = 'BASBOUSA'                WHERE id = 3026;
UPDATE public.meal_items SET code = 'NUTELLA'                 WHERE id = 3027;
UPDATE public.meal_items SET code = 'HALAWA_TAHINI'           WHERE id = 3028;
UPDATE public.meal_items SET code = 'JELLY'                   WHERE id = 3029;
UPDATE public.meal_items SET code = 'FONDANT'                 WHERE id = 3030;
UPDATE public.meal_items SET code = 'SYRIAN_SEEDS'            WHERE id = 3031;
UPDATE public.meal_items SET code = 'MIXED_NUTS'              WHERE id = 3032;
UPDATE public.meal_items SET code = 'HAZELNUT_BOILED'         WHERE id = 3033;
UPDATE public.meal_items SET code = 'COOKING_CREAM'           WHERE id = 3034;
UPDATE public.meal_items SET code = 'ASHTA_CREAM'             WHERE id = 3035;
UPDATE public.meal_items SET code = 'STRAWBERRY_FIG_JAM'      WHERE id = 3036;
UPDATE public.meal_items SET code = 'MOZZARELLA'              WHERE id = 3037;
UPDATE public.meal_items SET code = 'WHOLE_SPICES'            WHERE id = 3038;
UPDATE public.meal_items SET code = 'SWEET_POTATO'            WHERE id = 4001;
UPDATE public.meal_items SET code = 'TARO'                    WHERE id = 4002;
UPDATE public.meal_items SET code = 'BUTTERNUT_SQUASH'        WHERE id = 4003;
UPDATE public.meal_items SET code = 'ZUCCHINI'                WHERE id = 4004;
UPDATE public.meal_items SET code = 'APPLE'                   WHERE id = 4005;
UPDATE public.meal_items SET code = 'PEAR'                    WHERE id = 4006;
UPDATE public.meal_items SET code = 'ALMONDS'                 WHERE id = 4007;
UPDATE public.meal_items SET code = 'EGGS'                    WHERE id = 5001;
UPDATE public.meal_items SET code = 'CHICKEN'                 WHERE id = 5002;
UPDATE public.meal_items SET code = 'GARLIC'                  WHERE id = 5003;
UPDATE public.meal_items SET code = 'ONION'                   WHERE id = 5004;
UPDATE public.meal_items SET code = 'TOMATO'                  WHERE id = 5005;
UPDATE public.meal_items SET code = 'LEGUMES'                 WHERE id = 5006;
UPDATE public.meal_items SET code = 'WHITE_FLOUR'             WHERE id = 5007;
UPDATE public.meal_items SET code = 'CITRUS'                  WHERE id = 5008;


-- ---------------------------------------------------------------------------
-- STEP 3 — Enforce NOT NULL + UNIQUE on code
-- ---------------------------------------------------------------------------
ALTER TABLE public.meal_items ALTER COLUMN code SET NOT NULL;

ALTER TABLE public.meal_items
  DROP CONSTRAINT IF EXISTS meal_items_code_unique;
ALTER TABLE public.meal_items
  ADD CONSTRAINT meal_items_code_unique UNIQUE (code);


-- ---------------------------------------------------------------------------
-- STEP 4 — Rename meal_item_ids → meal_item_codes in meals table
--          and update all existing rows to use codes instead of IDs
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'meals' AND column_name = 'meal_item_ids'
  ) THEN
    ALTER TABLE public.meals RENAME COLUMN meal_item_ids TO meal_item_codes;
  END IF;
END $$;

UPDATE public.meals SET meal_item_codes = 'DATES,HONEY'                                      WHERE id = 1;
UPDATE public.meals SET meal_item_codes = 'WHOLE_WHEAT_TOAST,TAHINI,HONEY'                   WHERE id = 2;
UPDATE public.meals SET meal_item_codes = 'WHOLE_WHEAT_TOAST,CHEDDAR'                        WHERE id = 3;
UPDATE public.meals SET meal_item_codes = 'WHOLE_WHEAT_TOAST,DATE_JAM'                       WHERE id = 4;
UPDATE public.meals SET meal_item_codes = 'WHOLE_WHEAT_TOAST,WHITE_CHEESE,OLIVE_OIL'         WHERE id = 5;
UPDATE public.meals SET meal_item_codes = 'DATES,CHEDDAR'                                    WHERE id = 6;
UPDATE public.meals SET meal_item_codes = 'WHOLE_WHEAT_TOAST,TAHINI,SESAME'                  WHERE id = 7;
UPDATE public.meals SET meal_item_codes = 'DATES,FRESH_DATES'                                WHERE id = 8;
UPDATE public.meals SET meal_item_codes = 'WHOLE_WHEAT_TOAST,DATE_MOLASSES,TAHINI'           WHERE id = 9;
UPDATE public.meals SET meal_item_codes = 'DATES,GOUDA'                                      WHERE id = 10;
UPDATE public.meals SET meal_item_codes = 'WHOLE_WHEAT_TOAST,PICKLED_OLIVES,OLIVE_OIL'       WHERE id = 11;
UPDATE public.meals SET meal_item_codes = 'WHOLE_WHEAT_TOAST,HALAWA_TAHINI'                  WHERE id = 12;
UPDATE public.meals SET meal_item_codes = 'RICE,LAMB_BOILED,OLIVE_OIL,SALT'                  WHERE id = 13;
UPDATE public.meals SET meal_item_codes = 'RICE,BEEF_BOILED,OLIVE_OIL,SALT'                  WHERE id = 14;
UPDATE public.meals SET meal_item_codes = 'RICE,SEAFISH_GRILLED,OLIVE_OIL,SALT'              WHERE id = 15;
UPDATE public.meals SET meal_item_codes = 'RICE,TUNA_CANNED,OLIVE_OIL'                       WHERE id = 16;
UPDATE public.meals SET meal_item_codes = 'SEMOLINA_PASTA,LAMB_BOILED,OLIVE_OIL,SALT'        WHERE id = 17;
UPDATE public.meals SET meal_item_codes = 'RICE,SARDINE_CANNED,OLIVE_OIL'                    WHERE id = 18;
UPDATE public.meals SET meal_item_codes = 'RICE,POTATO,BEEF_BOILED,OLIVE_OIL'                WHERE id = 19;
UPDATE public.meals SET meal_item_codes = 'RICE,RABBIT_BOILED,OLIVE_OIL,SALT'                WHERE id = 20;
UPDATE public.meals SET meal_item_codes = 'RICE,PIGEON_BOILED,OLIVE_OIL,SALT'                WHERE id = 21;
UPDATE public.meals SET meal_item_codes = 'RICE,QUAIL_BOILED,OLIVE_OIL,SALT'                 WHERE id = 22;
UPDATE public.meals SET meal_item_codes = 'SEMOLINA_COARSE,LAMB_BOILED,WHOLE_SPICES,OLIVE_OIL' WHERE id = 23;
UPDATE public.meals SET meal_item_codes = 'RICE,LAMB_LIVER_BOILED,SALT'                      WHERE id = 24;
UPDATE public.meals SET meal_item_codes = 'CORN_BOILED,BEEF_BOILED,OLIVE_OIL,SALT'           WHERE id = 25;
UPDATE public.meals SET meal_item_codes = 'RICE,SEAFISH_GRILLED,COOKING_CREAM,OLIVE_OIL'     WHERE id = 26;
UPDATE public.meals SET meal_item_codes = 'SEMOLINA_PASTA,TUNA_CANNED,OLIVE_OIL'             WHERE id = 27;
UPDATE public.meals SET meal_item_codes = 'RICE,TUNA_CANNED,PICKLED_OLIVES,OLIVE_OIL'        WHERE id = 28;
UPDATE public.meals SET meal_item_codes = 'RICE,SARDINE_CANNED,BLACK_PEPPER,OLIVE_OIL'       WHERE id = 29;
UPDATE public.meals SET meal_item_codes = 'SEMOLINA_MEDIUM,TUNA_CANNED,PICKLED_OLIVES,OLIVE_OIL' WHERE id = 30;
UPDATE public.meals SET meal_item_codes = 'RICE,LAMB_BOILED,COOKING_CREAM,OLIVE_OIL'         WHERE id = 31;
UPDATE public.meals SET meal_item_codes = 'RICE,SEAFISH_GRILLED,BLACK_PEPPER,OLIVE_OIL'      WHERE id = 32;
UPDATE public.meals SET meal_item_codes = 'RICE,POTATO,SEAFISH_GRILLED,OLIVE_OIL'            WHERE id = 33;
UPDATE public.meals SET meal_item_codes = 'RICE,TAHINI,POMEGRANATE_MOLASSES'                 WHERE id = 34;
UPDATE public.meals SET meal_item_codes = 'RICE,PICKLED_OLIVES,OLIVE_OIL'                    WHERE id = 35;
UPDATE public.meals SET meal_item_codes = 'POTATO,OLIVE_OIL,SALT'                            WHERE id = 36;
UPDATE public.meals SET meal_item_codes = 'SEMOLINA_MEDIUM,TAHINI,SESAME'                    WHERE id = 37;
UPDATE public.meals SET meal_item_codes = 'RICE,WHITE_CHEESE,OLIVE_OIL'                      WHERE id = 38;
UPDATE public.meals SET meal_item_codes = 'POTATO,CORN_BOILED,SALT'                          WHERE id = 39;
UPDATE public.meals SET meal_item_codes = 'SEMOLINA_COARSE,OLIVE_OIL,SALT'                   WHERE id = 40;
UPDATE public.meals SET meal_item_codes = 'RICE,TAHINI,SESAME,HONEY'                         WHERE id = 41;
UPDATE public.meals SET meal_item_codes = 'RICE,OLIVE_OIL,SALT'                              WHERE id = 42;
UPDATE public.meals SET meal_item_codes = 'DATES,MIXED_NUTS'                                 WHERE id = 43;
UPDATE public.meals SET meal_item_codes = 'WHOLE_WHEAT_TOAST,TAHINI,PICKLED_OLIVES'          WHERE id = 44;
UPDATE public.meals SET meal_item_codes = 'FRESH_DATES,DATE_MOLASSES'                        WHERE id = 45;
UPDATE public.meals SET meal_item_codes = 'WHOLE_WHEAT_TOAST,GOUDA,OLIVE_OIL'               WHERE id = 46;
UPDATE public.meals SET meal_item_codes = 'RICE,POTATO,OLIVE_OIL,SALT'                       WHERE id = 47;
UPDATE public.meals SET meal_item_codes = 'POTATO,OLIVE_OIL,VINEGAR'                         WHERE id = 48;
UPDATE public.meals SET meal_item_codes = 'RICE,BLACK_PEPPER,OLIVE_OIL'                      WHERE id = 49;
UPDATE public.meals SET meal_item_codes = 'RICE,CORN_OIL,SALT'                               WHERE id = 50;


-- ---------------------------------------------------------------------------
-- STEP 5 — Insert 5 demo meals for testing
-- ---------------------------------------------------------------------------
INSERT INTO public.meals (id, name, meal_item_codes, zone, meal_type_ids, active)
VALUES
  (51, 'إفطار - تمر وعسل وجبن جودا',           'DATES,HONEY,GOUDA',                                    2, '1',   true),
  (52, 'إفطار - توست بطحينة وعسل ومكسرات',     'WHOLE_WHEAT_TOAST,TAHINI,HONEY,MIXED_NUTS',            3, '1',   true),
  (53, 'غداء - أرز بالسمان والبهارات الكاملة', 'RICE,QUAIL_BOILED,WHOLE_SPICES,OLIVE_OIL',             3, '2',   true),
  (54, 'غداء - أرز بالحمام وكريمة الطبخ',      'RICE,PIGEON_BOILED,COOKING_CREAM,OLIVE_OIL',           3, '2',   true),
  (55, 'عشاء - سميد بجبن أبيض وزيتون مخلل',   'SEMOLINA_MEDIUM,WHITE_CHEESE,PICKLED_OLIVES,OLIVE_OIL',3, '3',   true)
ON CONFLICT (id) DO UPDATE SET
  name            = EXCLUDED.name,
  meal_item_codes = EXCLUDED.meal_item_codes,
  zone            = EXCLUDED.zone,
  meal_type_ids   = EXCLUDED.meal_type_ids;


-- ---------------------------------------------------------------------------
-- STEP 6 — Rename meal_item_ids → meal_item_codes in user_meals table
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'user_meals' AND column_name = 'meal_item_ids'
  ) THEN
    ALTER TABLE public.user_meals RENAME COLUMN meal_item_ids TO meal_item_codes;
  END IF;
END $$;


-- ---------------------------------------------------------------------------
-- STEP 7 — Update schema comment in meals table
-- ---------------------------------------------------------------------------
COMMENT ON COLUMN public.meals.meal_item_codes
  IS 'Comma-separated meal_item.code values (e.g. RICE,LAMB_BOILED,OLIVE_OIL)';

COMMENT ON COLUMN public.meal_items.code
  IS 'Short uppercase snake_case identifier, unique per item (e.g. RICE, OLIVE_OIL)';

COMMENT ON COLUMN public.user_meals.meal_item_codes
  IS 'Comma-separated meal_item.code values logged with this user meal';
