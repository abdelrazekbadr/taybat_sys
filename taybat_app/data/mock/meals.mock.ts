import type { Meal } from '@/types';

export const MOCK_MEALS: Meal[] = Object.freeze([
  // ─── إفطار فقط (meal_type_ids: "1") ──────────────────────────────────────
  { id: 1,  code: 'M001', name: 'تمر بعسل طبيعي',                          meal_item_codes: 'DATES,HONEY',                                      dominant_zone: 1, rating: 5, image_url: '', meal_type_ids: '1' },
  { id: 2,  code: 'M002', name: 'توست قمح كامل بطحينة وعسل',               meal_item_codes: 'WHOLE_WHEAT_TOAST,TAHINI,HONEY',                   dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '1' },
  { id: 3,  code: 'M003', name: 'توست قمح كامل بجبن شيدر',                 meal_item_codes: 'WHOLE_WHEAT_TOAST,CHEDDAR',                        dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '1' },
  { id: 4,  code: 'M004', name: 'توست قمح كامل بمربى البلح',               meal_item_codes: 'WHOLE_WHEAT_TOAST,DATE_JAM',                       dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '1' },
  { id: 5,  code: 'M005', name: 'توست قمح كامل بجبن أبيض وزيت الزيتون',   meal_item_codes: 'WHOLE_WHEAT_TOAST,WHITE_CHEESE,OLIVE_OIL',         dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '1' },
  { id: 6,  code: 'M006', name: 'تمر وجبن شيدر معتق',                      meal_item_codes: 'DATES,CHEDDAR',                                    dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '1' },
  { id: 7,  code: 'M007', name: 'توست قمح كامل بطحينة وسمسم',              meal_item_codes: 'WHOLE_WHEAT_TOAST,TAHINI,SESAME',                  dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '1' },
  { id: 8,  code: 'M008', name: 'تمر ورطب طبيعي',                          meal_item_codes: 'DATES,FRESH_DATES',                                dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '1' },
  { id: 9,  code: 'M009', name: 'توست قمح كامل بدبس البلح والطحينة',       meal_item_codes: 'WHOLE_WHEAT_TOAST,DATE_MOLASSES,TAHINI',           dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '1' },
  { id: 10, code: 'M010', name: 'تمر وجبن جودا',                            meal_item_codes: 'DATES,GOUDA',                                      dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '1' },
  { id: 11, code: 'M011', name: 'توست قمح كامل بالزيتون وزيت الزيتون',    meal_item_codes: 'WHOLE_WHEAT_TOAST,PICKLED_OLIVES,OLIVE_OIL',       dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '1' },
  { id: 12, code: 'M012', name: 'توست قمح كامل بالحلاوة الطحينية',         meal_item_codes: 'WHOLE_WHEAT_TOAST,HALAWA_TAHINI',                  dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '1' },

  // ─── غداء فقط (meal_type_ids: "2") ───────────────────────────────────────
  { id: 13, code: 'M013', name: 'أرز باللحم الضاني المسلوق',               meal_item_codes: 'RICE,LAMB_BOILED,OLIVE_OIL,SALT',                  dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2' },
  { id: 14, code: 'M014', name: 'أرز باللحم البلدي المسلوق',               meal_item_codes: 'RICE,BEEF_BOILED,OLIVE_OIL,SALT',                  dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2' },
  { id: 15, code: 'M015', name: 'أرز بالسمك البحري المشوي',                meal_item_codes: 'RICE,SEAFISH_GRILLED,OLIVE_OIL,SALT',              dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2' },
  { id: 16, code: 'M016', name: 'أرز بالتونة وزيت الزيتون',                meal_item_codes: 'RICE,TUNA_CANNED,OLIVE_OIL',                       dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2' },
  { id: 17, code: 'M017', name: 'مكرونة سميد باللحم الضاني',               meal_item_codes: 'SEMOLINA_PASTA,LAMB_BOILED,OLIVE_OIL,SALT',        dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2' },
  { id: 18, code: 'M018', name: 'أرز بالسردين وزيت الزيتون',               meal_item_codes: 'RICE,SARDINE_CANNED,OLIVE_OIL',                    dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2' },
  { id: 19, code: 'M019', name: 'أرز وبطاطس باللحم البلدي',                meal_item_codes: 'RICE,POTATO,BEEF_BOILED,OLIVE_OIL',                dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2' },
  { id: 20, code: 'M020', name: 'أرز بلحم الأرانب المسلوق',                meal_item_codes: 'RICE,RABBIT_BOILED,OLIVE_OIL,SALT',                dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2' },
  { id: 21, code: 'M021', name: 'أرز بالحمام المسلوق',                     meal_item_codes: 'RICE,PIGEON_BOILED,OLIVE_OIL,SALT',                dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2' },
  { id: 22, code: 'M022', name: 'أرز بالسمان المسلوق',                     meal_item_codes: 'RICE,QUAIL_BOILED,OLIVE_OIL,SALT',                 dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2' },
  { id: 23, code: 'M023', name: 'سميد خشن باللحم الضاني والبهارات',        meal_item_codes: 'SEMOLINA_COARSE,LAMB_BOILED,WHOLE_SPICES,OLIVE_OIL',dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2' },
  { id: 24, code: 'M024', name: 'أرز بالكبدة الضاني المسلوقة',             meal_item_codes: 'RICE,LAMB_LIVER_BOILED,SALT',                      dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2' },
  { id: 25, code: 'M025', name: 'ذرة مسلوقة باللحم البلدي وزيت الزيتون',  meal_item_codes: 'CORN_BOILED,BEEF_BOILED,OLIVE_OIL,SALT',           dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2' },
  { id: 26, code: 'M026', name: 'أرز بالسمك والكريمة',                     meal_item_codes: 'RICE,SEAFISH_GRILLED,COOKING_CREAM,OLIVE_OIL',     dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2' },

  // ─── غداء وعشاء (meal_type_ids: "2,3") ──────────────────────────────────
  { id: 27, code: 'M027', name: 'مكرونة سميد بالتونة وزيت الزيتون',       meal_item_codes: 'SEMOLINA_PASTA,TUNA_CANNED,OLIVE_OIL',             dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2,3' },
  { id: 28, code: 'M028', name: 'أرز بالتونة والزيتون المخلل',             meal_item_codes: 'RICE,TUNA_CANNED,PICKLED_OLIVES,OLIVE_OIL',        dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2,3' },
  { id: 29, code: 'M029', name: 'أرز بالسردين والفلفل الأسود',             meal_item_codes: 'RICE,SARDINE_CANNED,BLACK_PEPPER,OLIVE_OIL',       dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2,3' },
  { id: 30, code: 'M030', name: 'سميد وسط بالتونة والزيتون المخلل',        meal_item_codes: 'SEMOLINA_MEDIUM,TUNA_CANNED,PICKLED_OLIVES,OLIVE_OIL', dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2,3' },
  { id: 31, code: 'M031', name: 'أرز باللحم الضاني وكريمة الطبخ',          meal_item_codes: 'RICE,LAMB_BOILED,COOKING_CREAM,OLIVE_OIL',         dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2,3' },
  { id: 32, code: 'M032', name: 'أرز بالسمك البحري والفلفل الأسود',        meal_item_codes: 'RICE,SEAFISH_GRILLED,BLACK_PEPPER,OLIVE_OIL',      dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2,3' },
  { id: 33, code: 'M033', name: 'بطاطس وأرز بالسمك البحري',                meal_item_codes: 'RICE,POTATO,SEAFISH_GRILLED,OLIVE_OIL',            dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2,3' },

  // ─── عشاء فقط (meal_type_ids: "3") ───────────────────────────────────────
  { id: 34, code: 'M034', name: 'أرز بالطحينة ودبس الرمان',                meal_item_codes: 'RICE,TAHINI,POMEGRANATE_MOLASSES',                  dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '3' },
  { id: 35, code: 'M035', name: 'أرز بالزيتون المخلل وزيت الزيتون',        meal_item_codes: 'RICE,PICKLED_OLIVES,OLIVE_OIL',                    dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '3' },
  { id: 36, code: 'M036', name: 'بطاطس مسلوقة بزيت الزيتون والملح',        meal_item_codes: 'POTATO,OLIVE_OIL,SALT',                            dominant_zone: 1, rating: 5, image_url: '', meal_type_ids: '3' },
  { id: 37, code: 'M037', name: 'سميد وسط بالطحينة والسمسم',               meal_item_codes: 'SEMOLINA_MEDIUM,TAHINI,SESAME',                    dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '3' },
  { id: 38, code: 'M038', name: 'أرز بالجبن الأبيض وزيت الزيتون',          meal_item_codes: 'RICE,WHITE_CHEESE,OLIVE_OIL',                      dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '3' },
  { id: 39, code: 'M039', name: 'بطاطس وذرة مسلوقة بالملح',                meal_item_codes: 'POTATO,CORN_BOILED,SALT',                          dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '3' },
  { id: 40, code: 'M040', name: 'سميد خشن بزيت الزيتون والملح',            meal_item_codes: 'SEMOLINA_COARSE,OLIVE_OIL,SALT',                   dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '3' },
  { id: 41, code: 'M041', name: 'أرز بالطحينة والسمسم والعسل',             meal_item_codes: 'RICE,TAHINI,SESAME,HONEY',                         dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '3' },

  // ─── إفطار وعشاء (meal_type_ids: "1,3") ─────────────────────────────────
  { id: 42, code: 'M042', name: 'أرز بزيت الزيتون والملح',                 meal_item_codes: 'RICE,OLIVE_OIL,SALT',                              dominant_zone: 1, rating: 5, image_url: '', meal_type_ids: '1,3' },
  { id: 43, code: 'M043', name: 'تمر ومكسرات',                             meal_item_codes: 'DATES,MIXED_NUTS',                                 dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '1,3' },
  { id: 44, code: 'M044', name: 'توست قمح كامل بالطحينة والزيتون المخلل',  meal_item_codes: 'WHOLE_WHEAT_TOAST,TAHINI,PICKLED_OLIVES',          dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '1,3' },
  { id: 45, code: 'M045', name: 'رطب بدبس البلح',                          meal_item_codes: 'FRESH_DATES,DATE_MOLASSES',                        dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '1,3' },
  { id: 46, code: 'M046', name: 'توست قمح كامل بالجبن الجودا والزيت',      meal_item_codes: 'WHOLE_WHEAT_TOAST,GOUDA,OLIVE_OIL',               dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '1,3' },

  // ─── جميع الوجبات (meal_type_ids: "1,2,3") ───────────────────────────────
  { id: 47, code: 'M047', name: 'أرز وبطاطس بزيت الزيتون والملح',         meal_item_codes: 'RICE,POTATO,OLIVE_OIL,SALT',                       dominant_zone: 1, rating: 5, image_url: '', meal_type_ids: '1,2,3' },
  { id: 48, code: 'M048', name: 'بطاطس مسلوقة بزيت الزيتون والخل',        meal_item_codes: 'POTATO,OLIVE_OIL,VINEGAR',                         dominant_zone: 1, rating: 5, image_url: '', meal_type_ids: '1,2,3' },
  { id: 49, code: 'M049', name: 'أرز بالفلفل الأسود وزيت الزيتون',         meal_item_codes: 'RICE,BLACK_PEPPER,OLIVE_OIL',                      dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '1,2,3' },
  { id: 50, code: 'M050', name: 'أرز بزيت الذرة والملح',                   meal_item_codes: 'RICE,CORN_OIL,SALT',                               dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '1,2,3' },

  // ─── وجبات تجريبية (demo) ─────────────────────────────────────────────────
  { id: 51, code: 'D51', name: 'إفطار - تمر وعسل وجبن جودا',             meal_item_codes: 'DATES,HONEY,GOUDA',                                dominant_zone: 2, rating: 4, image_url: '', meal_type_ids: '1' },
  { id: 52, code: 'D52', name: 'إفطار - توست بطحينة وعسل ومكسرات',       meal_item_codes: 'WHOLE_WHEAT_TOAST,TAHINI,HONEY,MIXED_NUTS',        dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '1' },
  { id: 53, code: 'D53', name: 'غداء - أرز بالسمان والبهارات الكاملة',    meal_item_codes: 'RICE,QUAIL_BOILED,WHOLE_SPICES,OLIVE_OIL',         dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2' },
  { id: 54, code: 'D54', name: 'غداء - أرز بالحمام وكريمة الطبخ',         meal_item_codes: 'RICE,PIGEON_BOILED,COOKING_CREAM,OLIVE_OIL',       dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '2' },
  { id: 55, code: 'D55', name: 'عشاء - سميد بجبن أبيض وزيتون مخلل',      meal_item_codes: 'SEMOLINA_MEDIUM,WHITE_CHEESE,PICKLED_OLIVES,OLIVE_OIL', dominant_zone: 3, rating: 3, image_url: '', meal_type_ids: '3' },
]) as unknown as Meal[];
