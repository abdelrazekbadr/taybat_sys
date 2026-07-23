-- Al-Taybat reference/config data — copied from dev (mbbbdhyhtqkxakmblzmk) on
-- 2026-07-11, generated via `format('%L', ...)` against the live rows (not
-- hand-typed) so Arabic text and quoting are exact. Apply AFTER schema.sql.
--
-- Scope: reference/config tables only — meals, meal_items, health goals/
-- conditions, library topics, membership tiers/rules/config, public_config.
-- Deliberately excludes user data (profiles, user_meals, users_ratings,
-- community_posts, etc.) — prod launches with zero real users.
--
-- ⚠️ IMPORTANT — image URLs point at DEV's storage bucket, not prod's:
--   meals/meal_items don't store image URLs directly, but public_config.
--   meal_img_url, health_goals.image, health_conditions.image, and
--   library_topics.image_url are all full URLs like:
--     https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/...
--   If you insert these as-is, prod will hot-link dev's bucket for every
--   meal/goal/condition/topic image indefinitely — works today, but ties
--   prod's uptime to dev's and is not a real production setup. Before
--   shipping: copy the actual files from dev's `taybat_app_assets` bucket
--   into prod's bucket (Storage → each object, or `supabase storage cp`),
--   then find-and-replace `mbbbdhyhtqkxakmblzmk` → `<prod-ref>` in this
--   file's URLs before running it. Left as dev URLs below so this is at
--   least functional immediately; fix before real traffic.

-- ============================================================================
-- meal_item_categories (25 rows)
-- ============================================================================
insert into public.meal_item_categories (id, name, name_en, description, description_en) values
('1', 'حبوب', 'Grains', NULL, NULL),
('2', 'لحوم', 'Meats', NULL, NULL),
('3', 'سمك', 'Fish', NULL, NULL),
('4', 'طيور', 'Poultry', NULL, NULL),
('5', 'ألبان', 'Dairy', NULL, NULL),
('6', 'أجبان', 'Cheese', NULL, NULL),
('7', 'فواكه', 'Fruits', NULL, NULL),
('8', 'مكسرات', 'Nuts', NULL, NULL),
('9', 'محليات', 'Sweeteners', NULL, NULL),
('10', 'مسليات', 'Snacks', NULL, NULL),
('11', 'مشروبات', 'Drinks', NULL, NULL),
('12', 'أعشاب', 'Herbs', NULL, NULL),
('13', 'زيوت', 'Oils', NULL, NULL),
('20', 'الصيام', 'Fasting', NULL, NULL),
('1000', 'أحشاء', 'Offal', NULL, NULL),
('1001', 'بروتينات', 'Proteins', NULL, NULL),
('1002', 'بقوليات', 'Legumes', NULL, NULL),
('1003', 'تتبيلات', 'Seasonings', NULL, NULL),
('1004', 'حلويات', 'Desserts', NULL, NULL),
('1005', 'خضار', 'Vegetables', NULL, NULL),
('1006', 'خضار نشوية', 'Starchy vegetables', NULL, NULL),
('1007', 'عصائر', 'Juices', NULL, NULL),
('1008', 'معجنات', 'Pastries', NULL, NULL),
('1009', 'معجونات', 'Spreads', NULL, NULL),
('1010', 'مكملات', 'Supplements', NULL, NULL);

-- ============================================================================
-- meals (86 rows)
-- ============================================================================
insert into public.meals (id, name, meal_item_codes, zone, image_url, meal_type_ids, created_at, active, name_en, description, description_en, sequence, max_day_frequency, max_week_frequency, max_month_frequency, code, rating) values
('1', 'صيام', '', '1', NULL, '1', '2026-06-22 10:25:08.025073+00', 't', 'Sunnah Fasting', NULL, NULL, '20', '1', '2', '11', 'M001', '5'),
('2', 'توست قمح كامل + زبدة بلدي + عسل طبيعي', 'CB10,DF01,SW04', '1', NULL, '1', '2026-06-22 10:25:08.025073+00', 't', 'Whole wheat toast + country butter + natural honey', NULL, NULL, '20', '1', '7', '30', 'M002', '5'),
('3', 'ارز ابيض + بطاطس مسلوقة  + زبدة بلدى', 'CB01,CB07,DF01', '1', NULL, '1', '2026-06-22 10:25:08.025073+00', 't', 'White rice + boiled potatoes + country butter', NULL, NULL, '20', '1', '7', '30', 'M003', '5'),
('4', 'ارز ابيض + بطاطس مقلية  + زبدة بلدى', 'CB01,CB08,DF01', '1', NULL, '1', '2026-06-22 10:25:08.025073+00', 't', 'White rice + fried potatoes + country butter', NULL, NULL, '20', '1', '7', '30', 'M004', '5'),
('5', 'توست قمح كامل + جبنة جودة + زيتون كالاماتا', 'CB10,CH01,OL01', '2', NULL, '1', '2026-06-22 10:25:08.025073+00', 't', 'Whole wheat toast + Gouda cheese + Kalamata olives', NULL, NULL, '20', '1', '5', '20', 'M005', '4'),
('6', 'بطاطا حلوة مشوية + عسل اسود + سمن بلدي', 'CB05,SW03,DF02', '2', NULL, '1', '2026-06-22 10:25:08.025073+00', 't', 'Roasted sweet potato + black honey + country ghee', NULL, NULL, '20', '1', '7', '30', 'M006', '5'),
('7', 'توست قمح كامل + نوتيلا', 'CB10,SW08', '2', NULL, '1', '2026-06-22 10:25:08.025073+00', 't', 'Whole wheat toast + Nutella', NULL, NULL, '20', '1', '5', '20', 'M007', '4'),
('8', 'توست قمح كامل  + مربى تين', 'CB10,SW05', '3', NULL, '1', '2026-06-22 10:25:08.025073+00', 't', 'Whole wheat toast + natural fig jam', NULL, NULL, '20', '1', '5', '20', 'M008', '4'),
('9', 'توست قمح كامل + جبنة شيدر + زيتون كالاماتا', 'CB10,CH02,OL01', '2', NULL, '1', '2026-06-22 10:25:08.025073+00', 'f', 'Whole wheat toast + Cheddar cheese + Kalamata olives', NULL, NULL, '20', '1', '5', '20', 'M009', '4'),
('10', 'توست قمح كامل + بطاطس مسلوقة + سمن بلدي', 'CB10,CB07,DF02', '1', NULL, '1', '2026-06-22 10:25:08.025073+00', 't', 'Whole wheat toast + boiled potatoes + country ghee', NULL, NULL, '20', '1', '7', '30', 'M010', '5'),
('11', 'بطاطا حلوة مهروسة + قشطة طبيعية', 'CB06,DF03', '2', NULL, '1', '2026-06-22 10:25:08.025073+00', 't', 'Mashed sweet potato + natural cream', NULL, NULL, '20', '1', '7', '30', 'M011', '5'),
('12', 'توست قمح كامل + زبدة بلدي + مربى مشمش', 'CB10,DF01,FR11', '2', NULL, '1', '2026-06-22 10:25:08.025073+00', 't', 'Whole wheat toast + country butter + fresh apricots', NULL, NULL, '20', '1', '5', '20', 'M012', '4'),
('13', 'بطاطس مسلوقة + زيت زيتون + عسل طبيعى', 'CB07,OI01,SW04', '1', NULL, '1', '2026-06-22 10:25:08.025073+00', 't', 'Boiled potatoes + olive oil + natural honey', NULL, NULL, '20', '1', '7', '30', 'M013', '5'),
('14', 'توست قمح كامل + جبنة فلمنك + زيتون كالاماتا', 'CB10,CH03,OL01', '2', NULL, '1', '2026-06-22 10:25:08.025073+00', 't', 'Whole wheat toast + Edam cheese + Kalamata olives', NULL, NULL, '20', '1', '5', '20', 'M014', '4'),
('15', 'توست قمح كامل + جبنة ريكفورد +   زيت زيتون', 'CB10,CH05,OI01', '1', NULL, '1', '2026-06-22 10:25:08.025073+00', 't', 'Whole wheat toast + Roquefort cheese + olive oil', NULL, NULL, '20', '1', '7', '30', 'M015', '5'),
('16', 'توست قمح كامل + جبنة موتزاريلا + زيتون كالاماتا', 'CB10,CH04,OL01', '2', NULL, '1', '2026-06-22 10:25:08.025073+00', 't', 'Whole wheat toast + Mozzarella cheese + Kalamata olives', NULL, NULL, '20', '1', '5', '20', 'M016', '4'),
('17', 'بطاطا حلوة مهروسة + سمن بلدي + عصير جوافة', 'CB06,DF02,FR07', '2', NULL, '1', '2026-06-22 10:25:08.025073+00', 'f', 'Mashed sweet potato + country ghee + natural canned guava juice', NULL, NULL, '20', '1', '7', '30', 'M017', '5'),
('18', 'توست قمح كامل + زبدة بلدي + مربى فراولة', 'CB10,DF01,FR09', '2', NULL, '1', '2026-06-22 10:25:08.025073+00', 't', 'Whole wheat toast + country butter + fresh strawberries', NULL, NULL, '20', '1', '5', '20', 'M018', '4'),
('19', 'بطاطا حلوة مشوية +  تمر + زبدة', 'CB05,FR03,DF01', '2', NULL, '1', '2026-06-22 10:25:08.025073+00', 't', 'Roasted sweet potato + dates + country butter', NULL, NULL, '20', '1', '7', '30', 'M019', '5'),
('20', 'أرز أبيض + لحم بتلو مسلوق', 'CB01,MT07', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 't', 'White rice + boiled beef', NULL, NULL, '20', '1', '7', '30', 'M020', '5'),
('21', 'أرز أبيض + كبدة مسلوقة', 'CB01,MT02', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 't', 'White rice + boiled liver', NULL, NULL, '20', '1', '7', '30', 'M021', '5'),
('22', 'أرز بسمتي + سمك سردين  مشوي', 'CB04,FS02', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 't', 'Basmati rice + grilled sea sardine', NULL, NULL, '20', '1', '7', '30', 'M022', '5'),
('23', 'أرز أبيض + لحم ضأن مشوي', 'CB01,MT09', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'White rice + grilled lamb', NULL, NULL, '20', '1', '5', '20', 'M023', '4'),
('24', 'أرز أبيض + لحم إبل مسلوق', 'CB01,MT06', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'White rice + boiled camel meat', NULL, NULL, '20', '1', '7', '30', 'M024', '5'),
('25', 'أرز بالشعيرية + حمام مشوي', 'CB02,BD02', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'Vermicelli rice + grilled pigeon', NULL, NULL, '20', '1', '7', '30', 'M025', '5'),
('26', 'تمر + ماء دافئ + أرز أبيض + لحم بتلو مسلوق', 'FR03,DR03,CB01,MT07', '1', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'Dates + warm water + white rice + boiled beef (fasting)', NULL, NULL, '20', '1', '7', '30', 'M026', '5'),
('27', 'أرز أبيض + سمك ماكريل بحري مشوي', 'CB01,FS03', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 't', 'White rice + grilled sea mackerel', NULL, NULL, '20', '1', '7', '30', 'M027', '5'),
('28', 'محشي كوسا وفلفل بالأرز', 'MT12', '4', NULL, '2', '2026-06-22 10:25:08.025073+00', 't', 'Stuffed zucchini and pepper with rice', NULL, NULL, '20', '1', '3', '12', 'M028', '3'),
('29', 'أرز أبيض + سمان مشوي', 'CB01,BD03', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'White rice + grilled quail', NULL, NULL, '20', '1', '7', '30', 'M029', '5'),
('30', 'أرز أبيض + لحم أرانب مسلوق', 'CB01,MT05', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'White rice + boiled rabbit', NULL, NULL, '20', '1', '7', '30', 'M030', '5'),
('31', 'تمر  + أرز أبيض + لحم إبل مسلوق', 'FR03,CB01,MT06', '1', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'Dates + white rice + boiled camel meat', NULL, NULL, '20', '1', '7', '30', 'M031', '5'),
('32', 'أرز بالشعيرية + لحم ضأن مشوي', 'CB02,MT09', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 't', 'Vermicelli rice + grilled lamb', NULL, NULL, '20', '1', '5', '20', 'M032', '4'),
('33', 'أرز أبيض + حمام محشى', 'CB01,BD01', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 't', 'White rice + stuffed pigeon', NULL, NULL, '20', '1', '5', '20', 'M033', '4'),
('34', 'ممبار محشى + شوربة لحم', 'MT13,MT01', '3', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'Stuffed sausage casing + meat broth', NULL, NULL, '20', '1', '5', '20', 'M034', '4'),
('35', 'أرز بسمتي + سمان', 'CB04,BD03', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'Basmati rice + grilled quail', NULL, NULL, '20', '1', '7', '30', 'M035', '5'),
('36', 'أرز أبيض + لحم ماعز مسلوق + بطاطس مقلية', 'CB01,MT10,CB08', '1', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'White rice + boiled goat meat + fried potatoes', NULL, NULL, '20', '1', '7', '30', 'M036', '5'),
('37', 'تمر + ماء دافئ + أرز بالمكسرات + كفتة خروف', 'FR03,DR03,CB03,MT04', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 't', 'Dates + warm water + rice with nuts + lamb kofta (fasting)', NULL, NULL, '20', '1', '7', '30', 'M037', '5'),
('38', 'أرز أبيض + تونة', 'CB01,FS01', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'White rice + grilled natural sea tuna', NULL, NULL, '20', '1', '7', '30', 'M038', '5'),
('39', 'أرز بسمتي + لحم ماعز مشوي', 'CB04,MT11', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'Basmati rice + grilled goat meat', NULL, NULL, '20', '1', '5', '20', 'M039', '4'),
('40', 'تمر + ماء دافئ + أرز أبيض + كوارع', 'FR03,DR03,CB01,MT14', '1', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'Dates + warm water + white rice + boiled livestock trotters (fasting)', NULL, NULL, '20', '1', '7', '30', 'M040', '5'),
('41', 'ارز ابيض + كفتة  لحم بقرى', 'CB01,MT03', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 't', 'White rice + beef kofta', NULL, NULL, '20', '1', '5', '20', 'M041', '4'),
('42', 'أرز بالمكسرات + لحم بتلو مسلوق', 'CB03,MT07', '3', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'Rice with nuts + boiled beef', NULL, NULL, '20', '1', '5', '20', 'M042', '4'),
('43', 'تمر + شاي أخضر', 'FR03,DR01', '2', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Dates + green tea', NULL, NULL, '20', '1', '7', '30', 'M043', '5'),
('44', 'موز + عنب أسود', 'FR12,FR08', '3', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Banana + black grapes', NULL, NULL, '20', '1', '5', '20', 'M044', '4'),
('45', 'رمان طازج + موز', 'FR05,FR12', '3', NULL, '3', '2026-06-22 10:25:08.025073+00', 't', 'Fresh pomegranate + banana', NULL, NULL, '20', '1', '5', '20', 'M045', '4'),
('46', 'برقوق طازج + ينسون دافئ', 'FR01,HB03', '3', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Fresh plums + warm anise tea', NULL, NULL, '20', '1', '5', '20', 'M046', '4'),
('47', 'عنب أسود + قشطة طبيعية', 'FR08,DF03', '2', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Black grapes + natural cream', NULL, NULL, '20', '1', '7', '30', 'M047', '5'),
('48', 'تمر + قهوة تركية', 'FR03,DR02', '1', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Dates + Turkish coffee', NULL, NULL, '20', '1', '7', '30', 'M048', '5'),
('49', 'حلاوة طحينية غامقة', 'SW01', '3', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Dark tahini halva', NULL, NULL, '20', '1', '3', '12', 'M049', '3'),
('50', 'موز + لوز وكاجو', 'FR12,NT04,NT05', '3', NULL, '3', '2026-06-22 10:25:08.025073+00', 't', 'Banana + almonds and cashews', NULL, NULL, '20', '1', '5', '20', 'M050', '4'),
('51', 'عنب أسود + كراوية دافئة', 'FR08,HB02', '3', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Black grapes + warm caraway tea', NULL, NULL, '20', '1', '5', '20', 'M051', '4'),
('52', 'فراولة طازجة + قشطة طبيعية', 'FR09,DF03', '2', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Fresh strawberries + natural cream', NULL, NULL, '20', '1', '5', '20', 'M052', '4'),
('53', 'فشار ذرة طبيعي + تمر', 'CB12,FR03', '2', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Natural popcorn + dates', NULL, NULL, '20', '1', '5', '20', 'M053', '4'),
('54', 'تفاح مقشّر + موز', 'FR02,FR12', '3', NULL, '3', '2026-06-22 10:25:08.025073+00', 't', 'Peeled apple + banana', NULL, NULL, '20', '1', '5', '20', 'M054', '4'),
('55', 'كرز طازج + شاي أخضر', 'FR10,DR01', '3', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Fresh cherries + green tea', NULL, NULL, '20', '1', '5', '20', 'M055', '4'),
('56', 'شاي أخضر + فستق + ذرة مشوية', 'DR01,NT02,CB11', '3', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Green tea + pistachios + roasted corn kernels', NULL, NULL, '20', '1', '5', '20', 'M056', '4'),
('57', 'تمر + شاي زعتر', 'FR03,HB01', '2', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Dates + thyme tea', NULL, NULL, '20', '1', '7', '30', 'M057', '5'),
('58', 'تفاح مقشّر + قشطة طبيعية', 'FR02,DF03', '2', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Peeled apple + natural cream', NULL, NULL, '20', '1', '7', '30', 'M058', '5'),
('59', 'رمان طازج + لوز', 'FR05,NT05', '3', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Fresh pomegranate + almonds', NULL, NULL, '20', '1', '5', '20', 'M059', '4'),
('60', 'قشطة طبيعية بالعسل', 'DF03,SW04', '1', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Natural cream with honey', NULL, NULL, '20', '1', '7', '30', 'M060', '5'),
('61', 'تين طازج + موز', 'FR04,FR12', '3', NULL, '3', '2026-06-22 10:25:08.025073+00', 't', 'Fresh figs + banana', NULL, NULL, '20', '1', '5', '20', 'M061', '4'),
('62', 'عنب أسود + كاجو + ذرة مشوية', 'FR08,NT04,CB11', '3', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Black grapes + cashews + roasted corn kernels', NULL, NULL, '20', '1', '5', '20', 'M062', '4'),
('63', 'تفاح مقشّر + زبيب', 'FR02,FR06', '3', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Peeled apple + raisins', NULL, NULL, '20', '1', '5', '20', 'M063', '4'),
('64', 'مشمش طازج + تمر', 'FR11,FR03', '2', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Fresh apricots + dates', NULL, NULL, '20', '1', '5', '20', 'M064', '4'),
('65', 'رمان طازج + فول سوداني', 'FR05,NT03', '3', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Fresh pomegranate + peanuts', NULL, NULL, '20', '1', '5', '20', 'M065', '4'),
('66', 'شاي أخضر + حلاوة طحينية', 'DR01,SW01', '3', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Green tea + dark tahini halva', NULL, NULL, '20', '1', '5', '20', 'M066', '4'),
('67', 'شوكولاتة داكنة 70% + لوز', 'SW02,NT05', '3', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Dark chocolate 70%+ + almonds', NULL, NULL, '20', '1', '5', '20', 'M067', '4'),
('68', 'بطاطا حلوة مشوية + قشطة طبيعية + تمر', 'CB05,DF03,FR03', '2', NULL, '3', '2026-06-22 10:25:08.025073+00', 't', 'Roasted sweet potato + natural cream + dates', NULL, NULL, '20', '1', '7', '30', 'M068', '5'),
('69', 'تمر + قهوة تركية + عسل أسود', 'FR03,DR02,SW03', '2', NULL, '1', '2026-06-22 10:25:08.025073+00', 'f', 'Dates + Turkish coffee + black honey (molasses)', NULL, NULL, '20', '1', '7', '30', 'M069', '5'),
('70', 'عسل طبيعي + شوكولاتة داكنة + قهوة تركية', 'SW04,SW02,DR02', '2', NULL, '1', '2026-06-22 10:25:08.025073+00', 'f', 'Natural honey + dark chocolate 70%+ + Turkish coffee', NULL, NULL, '20', '1', '7', '30', 'M070', '5'),
('71', 'موز + لوز وكاجو + شاي أخضر', 'FR12,NT04,NT05,DR01', '3', NULL, '3', '2026-06-22 10:25:08.025073+00', 't', 'Banana + almonds and cashews + green tea', NULL, NULL, '20', '1', '5', '20', 'M071', '4'),
('72', 'رمان طازج + لوز + شاي أخضر', 'FR05,NT05,DR01', '3', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Fresh pomegranate + almonds + green tea', NULL, NULL, '20', '1', '5', '20', 'M072', '4'),
('73', 'تمر + لوز + قشطة طبيعية', 'FR03,NT05,DF03', '2', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Dates + almonds + natural cream', NULL, NULL, '20', '1', '7', '30', 'M073', '5'),
('74', 'عنب أسود + قشطة طبيعية + عسل', 'FR08,DF03,SW04', '2', NULL, '3', '2026-06-22 10:25:08.025073+00', 'f', 'Black grapes + natural cream + honey', NULL, NULL, '20', '1', '7', '30', 'M074', '5'),
('75', 'أرز أبيض + حبات ذرة مشوية + بطاطس مقلية + زبدة بلدي', 'CB01,CB11,CB08,DF01', '1', NULL, '2', '2026-06-22 10:25:08.025073+00', 't', 'White rice + roasted corn kernels + fried potatoes + country butter', NULL, NULL, '20', '1', '7', '30', 'M075', '5'),
('76', 'أرز أبيض + شوربة لحم + بطاطس مسلوقة', 'CB01,MT01,CB07', '1', NULL, '2', '2026-06-22 10:25:08.025073+00', 't', 'White rice + meat broth + boiled potatoes', NULL, NULL, '20', '1', '7', '30', 'M076', '5'),
('77', 'أرز أبيض + لحم ضأن مسلوق + بطاطس مقلية', 'CB01,MT08,CB08', '1', NULL, '2', '2026-06-22 10:25:08.025073+00', 't', 'White rice + boiled lamb + fried potatoes', NULL, NULL, '20', '1', '7', '30', 'M077', '4'),
('78', 'أرز أبيض + كفتة لحم بقري + بطاطس مسلوقة + شوربة لحم', 'CB01,MT03,CB07,MT01', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 't', 'White rice + beef kofta + boiled potatoes + meat broth', NULL, NULL, '20', '1', '7', '30', 'M078', '5'),
('79', 'أرز أبيض + كفتة لحم بقري + بطاطس مسلوقة + زيتون كالاماتا', 'CB01,MT03,CB07,OL01', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'White rice + beef kofta + boiled potatoes + Kalamata olives', NULL, NULL, '20', '1', '7', '30', 'M079', '5'),
('80', 'أرز أبيض + كفتة لحم خروف + بطاطس مسلوقة + زيتون كالاماتا', 'CB01,MT04,CB07,OL01', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'White rice + lamb kofta + boiled potatoes + Kalamata olives', NULL, NULL, '20', '1', '7', '30', 'M080', '5'),
('81', 'أرز أبيض + حمام محشي + بطاطس مقلية + زيتون كالاماتا', 'CB01,BD01,CB08,OL01', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 't', 'White rice + stuffed pigeon + fried potatoes + Kalamata olives', NULL, NULL, '20', '1', '5', '20', 'M081', '4'),
('82', 'أرز أبيض + سمك سردين بحري مشوي + بطاطس مقلية + زيتون كالاماتا', 'CB01,FS02,CB08,OL01', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'White rice + grilled sea sardine + fried potatoes + Kalamata olives', NULL, NULL, '20', '1', '7', '30', 'M082', '5'),
('83', 'أرز أبيض + شوربة لحم + بطاطس مسلوقة + زيتون كالاماتا', 'CB01,MT01,CB07,OL01', '2', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'White rice + meat broth + boiled potatoes + Kalamata olives', NULL, NULL, '20', '1', '7', '30', 'M083', '5'),
('84', 'أرز أبيض + بطاطس مسلوقة + زيت زيتون + زيتون كالاماتا', 'CB01,CB07,OI01,OL01', '1', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'White rice + boiled potatoes + olive oil + Kalamata olives', NULL, NULL, '20', '1', '7', '30', 'M084', '5'),
('85', 'أرز بسمتي + بطاطس مهروسة + جبنة جودة', 'CB04,CB09,CH01', '1', NULL, '2', '2026-06-22 10:25:08.025073+00', 't', 'Basmati rice + mashed potatoes + Gouda cheese', NULL, NULL, '20', '1', '7', '30', 'M085', '5'),
('86', 'أرز أبيض + سمك سردين بحري مشوي + بطاطس مسلوقة', 'CB01,FS02,CB07', '1', NULL, '2', '2026-06-22 10:25:08.025073+00', 'f', 'White rice + grilled sea sardine + boiled potatoes', NULL, NULL, '20', '1', '7', '30', 'M086', '5');

-- ============================================================================
-- meal_items (92 rows)
-- ============================================================================
insert into public.meal_items (id, name, category, zone, rating, frequency, notes, image_url, created_at, active, name_en, description, description_en, sequence, meal_category_id, code, max_day_frequency, max_week_frequency, max_month_frequency) values
('1', 'أرز أبيض', '1', '1', '5.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'White rice', NULL, NULL, '20', NULL, 'CB01', '2', '14', '60'),
('2', 'أرز بسمتي', '1', '1', '5.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Basmati rice', NULL, NULL, '20', NULL, 'CB04', '2', '14', '60'),
('3', 'أرز بالشعيرية', '1', '1', '5.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Vermicelli rice', NULL, NULL, '20', NULL, 'CB02', '2', '14', '60'),
('4', 'أرز بالمكسرات', '1', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Rice with nuts', NULL, NULL, '20', NULL, 'CB03', '1', '2', '8'),
('5', 'توست قمح كامل الحبة', '1', '2', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Whole wheat toast', NULL, NULL, '20', NULL, 'CB10', '1', '7', '30'),
('6', 'بطاطس مسلوقة', '1', '1', '5.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Boiled potatoes', NULL, NULL, '20', NULL, 'CB07', '2', '14', '60'),
('7', 'بطاطس مهروسة', '1', '1', '5.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Mashed potatoes', NULL, NULL, '20', NULL, 'CB09', '2', '14', '60'),
('8', 'بطاطا حلوة مشوية', '1', '4', '5.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Roasted sweet potato', NULL, NULL, '20', NULL, 'CB05', '1', '1', '4'),
('9', 'بطاطا حلوة مهروسة', '1', '4', '5.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Mashed sweet potato', NULL, NULL, '20', NULL, 'CB06', '1', '1', '4'),
('10', 'فشار ذرة طبيعي', '1', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Natural popcorn', NULL, NULL, '20', NULL, 'CB12', '1', '2', '8'),
('11', 'لحم بتلو مسلوق', '2', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Boiled beef', NULL, NULL, '20', NULL, 'MT07', '1', '2', '8'),
('12', 'لحم ضأن مشوي', '2', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Grilled lamb', NULL, NULL, '20', NULL, 'MT09', '1', '2', '8'),
('13', 'لحم ضأن مسلوق', '2', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Boiled lamb', NULL, NULL, '20', NULL, 'MT08', '1', '2', '8'),
('14', 'لحم إبل مسلوق', '2', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Boiled camel meat', NULL, NULL, '20', NULL, 'MT06', '1', '2', '8'),
('15', 'لحم ماعز مسلوق', '2', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Boiled goat meat', NULL, NULL, '20', NULL, 'MT10', '1', '2', '8'),
('16', 'لحم ماعز مشوي', '2', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Grilled goat meat', NULL, NULL, '20', NULL, 'MT11', '1', '2', '8'),
('17', 'لحم أرانب مسلوق', '2', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Boiled rabbit', NULL, NULL, '20', NULL, 'MT05', '1', '2', '8'),
('18', 'كبدة مسلوقة', '2', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Boiled liver', NULL, NULL, '20', NULL, 'MT02', '1', '2', '8'),
('19', 'محشي كوسا وباذنجان وفلفل بالأرز', '2', '4', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Stuffed zucchini eggplant and pepper with rice', NULL, NULL, '20', NULL, 'MT12', '1', '1', '4'),
('20', 'سمك سردين بحري مشوي', '3', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Grilled sea sardine', NULL, NULL, '20', NULL, 'FS02', '1', '2', '8'),
('21', 'سمك ماكريل بحري مشوي', '3', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Grilled sea mackerel', NULL, NULL, '20', NULL, 'FS03', '1', '2', '8'),
('22', 'تونة بحرية طبيعية مشوية', '3', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Grilled natural sea tuna', NULL, NULL, '20', NULL, 'FS01', '1', '2', '8'),
('23', 'حمام مشوي', '4', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Grilled pigeon', NULL, NULL, '20', NULL, 'BD02', '1', '2', '8'),
('24', 'سمان مشوي', '4', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Grilled quail', NULL, NULL, '20', NULL, 'BD03', '1', '2', '8'),
('25', 'زبدة بلدي', '5', '1', '5.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Country butter', NULL, NULL, '20', NULL, 'DF01', '2', '14', '60'),
('26', 'سمن بلدي', '5', '1', '5.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Country ghee', NULL, NULL, '20', NULL, 'DF02', '2', '14', '60'),
('27', 'قشطة طبيعية', '5', '1', '5.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Natural cream', NULL, NULL, '20', NULL, 'DF03', '2', '14', '60'),
('28', 'جبنة جودة', '6', '2', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Gouda cheese', NULL, NULL, '20', NULL, 'CH01', '1', '7', '30'),
('29', 'جبنة شيدر', '6', '2', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Cheddar cheese', NULL, NULL, '20', NULL, 'CH02', '1', '7', '30'),
('30', 'جبنة فلمنك', '6', '2', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Edam cheese', NULL, NULL, '20', NULL, 'CH03', '1', '7', '30'),
('31', 'جبنة موتزاريلا', '6', '2', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Mozzarella cheese', NULL, NULL, '20', NULL, 'CH04', '1', '7', '30'),
('32', 'تمر', '7', '1', '5.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Dates', NULL, NULL, '20', NULL, 'FR03', '2', '14', '60'),
('33', 'موز', '7', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Banana', NULL, NULL, '20', NULL, 'FR12', '1', '2', '8'),
('34', 'عنب أسود', '7', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Black grapes', NULL, NULL, '20', NULL, 'FR08', '1', '2', '8'),
('35', 'رمان طازج', '7', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Fresh pomegranate', NULL, NULL, '20', NULL, 'FR05', '1', '2', '8'),
('36', 'تفاح مقشّر', '7', '4', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Peeled apple', NULL, NULL, '20', NULL, 'FR02', '1', '1', '4'),
('37', 'فراولة طازجة', '7', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Fresh strawberries', NULL, NULL, '20', NULL, 'FR09', '1', '2', '8'),
('38', 'كرز طازج', '7', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Fresh cherries', NULL, NULL, '20', NULL, 'FR10', '1', '2', '8'),
('39', 'برقوق طازج', '7', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Fresh plums', NULL, NULL, '20', NULL, 'FR01', '1', '2', '8'),
('40', 'مشمش طازج', '7', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Fresh apricots', NULL, NULL, '20', NULL, 'FR11', '1', '2', '8'),
('41', 'تين طازج', '7', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Fresh figs', NULL, NULL, '20', NULL, 'FR04', '1', '2', '8'),
('42', 'زبيب', '7', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Raisins', NULL, NULL, '20', NULL, 'FR06', '1', '2', '8'),
('43', 'عصير جوافة معلب طبيعي', '7', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Natural canned guava juice', NULL, NULL, '20', NULL, 'FR07', '1', '2', '8'),
('44', 'لوز', '8', '4', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Almonds', NULL, NULL, '20', NULL, 'NT05', '1', '1', '4'),
('45', 'كاجو', '8', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Cashews', NULL, NULL, '20', NULL, 'NT04', '1', '2', '8'),
('46', 'فستق', '8', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Pistachios', NULL, NULL, '20', NULL, 'NT02', '1', '2', '8'),
('47', 'عين الجمل', '8', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Walnuts', NULL, NULL, '20', NULL, 'NT01', '1', '2', '8'),
('48', 'فول سوداني', '8', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Peanuts', NULL, NULL, '20', NULL, 'NT03', '1', '2', '8'),
('49', 'عسل طبيعي', '9', '2', '5.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Natural honey', NULL, NULL, '20', NULL, 'SW04', '1', '7', '30'),
('50', 'عسل أسود (دبس)', '9', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Black honey (molasses)', NULL, NULL, '20', NULL, 'SW03', '1', '2', '8'),
('51', 'نوتيلا', '9', '2', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Nutella', NULL, NULL, '20', NULL, 'SW08', '1', '7', '30'),
('52', 'مربى تين طبيعية', '9', '4', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Natural fig jam', NULL, NULL, '20', NULL, 'SW05', '1', '1', '4'),
('53', 'مربى مشمش طبيعية', '9', '4', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Natural apricot jam', NULL, NULL, '20', NULL, 'SW07', '1', '1', '4'),
('54', 'مربى فراولة طبيعية', '9', '4', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Natural strawberry jam', NULL, NULL, '20', NULL, 'SW06', '1', '1', '4'),
('55', 'حلاوة طحينية غامقة', '9', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Dark tahini halva', NULL, NULL, '20', NULL, 'SW01', '1', '2', '8'),
('56', 'شوكولاتة داكنة 70%', '9', '2', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Dark chocolate 70%+', NULL, NULL, '20', NULL, 'SW02', '1', '7', '30'),
('57', 'زيتون كالاماتا', '10', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Kalamata olives', NULL, NULL, '20', NULL, 'OL01', '1', '2', '8'),
('58', 'شاي أخضر', '11', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Green tea', NULL, NULL, '20', NULL, 'DR01', '1', '2', '8'),
('59', 'قهوة تركية', '11', '2', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Turkish coffee', NULL, NULL, '20', NULL, 'DR02', '1', '7', '30'),
('60', 'ماء دافئ', '11', '1', '5.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Warm water', NULL, NULL, '20', NULL, 'DR03', '2', '14', '60'),
('61', 'شاي زعتر', '12', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Thyme tea', NULL, NULL, '20', NULL, 'HB01', '1', '7', '30'),
('62', 'كراوية دافئة', '12', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Warm caraway tea', NULL, NULL, '20', NULL, 'HB02', '1', '7', '30'),
('63', 'ينسون دافئ', '12', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Warm anise tea', NULL, NULL, '20', NULL, 'HB03', '1', '7', '30'),
('64', 'زيت زيتون', '13', '1', '5.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Olive oil', NULL, NULL, '20', NULL, 'OI01', '2', '14', '60'),
('65', 'شوربة لحم', '2', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Meat broth', NULL, NULL, '20', NULL, 'MT01', '1', '2', '8'),
('66', 'بطاطس مقلية', '1', '1', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Fried potatoes', NULL, NULL, '20', NULL, 'CB08', '1', '7', '30'),
('67', 'كفتة لحم بقري', '2', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Beef kofta', NULL, NULL, '20', NULL, 'MT03', '1', '2', '8'),
('68', 'كفتة لحم خروف', '2', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Lamb kofta', NULL, NULL, '20', NULL, 'MT04', '1', '2', '8'),
('69', 'حمام محشي', '4', '4', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Stuffed pigeon', NULL, NULL, '20', NULL, 'BD01', '1', '1', '4'),
('70', 'حبات ذرة مشوية', '1', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Roasted corn kernels', NULL, NULL, '20', NULL, 'CB11', '1', '2', '8'),
('71', 'سكر طبيعي', '5', '1', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Natural sugar', NULL, NULL, '20', NULL, 'DF04', '1', '7', '30'),
('72', 'شمع العسل', '9', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Honeycomb', NULL, NULL, '20', NULL, 'SW09', '1', '2', '8'),
('73', 'غذاء ملكات النحل', '9', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Royal jelly', NULL, NULL, '20', NULL, 'SW10', '1', '2', '8'),
('74', 'حبوب اللقاح الطبيعية', '9', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Natural bee pollen', NULL, NULL, '20', NULL, 'SW11', '1', '2', '8'),
('75', 'اللبان الذكر (الكُندر)', '9', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Frankincense (Boswellia)', NULL, NULL, '20', NULL, 'SW12', '1', '2', '8'),
('76', 'المستكة اليونانية', '9', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Greek mastic', NULL, NULL, '20', NULL, 'SW13', '1', '2', '8'),
('77', 'حلاوة المولد (نوجا)', '9', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Nougat halva', NULL, NULL, '20', NULL, 'SW14', '1', '2', '8'),
('78', 'كمون دافئ', '12', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Warm cumin tea', NULL, NULL, '20', NULL, 'HB04', '1', '7', '30'),
('79', 'زيت الذرة وعباد الشمس', '13', '1', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Corn and sunflower oil', NULL, NULL, '20', NULL, 'OI02', '1', '7', '30'),
('80', 'خل قصب السكر الطبيعي', '13', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Natural sugarcane vinegar', NULL, NULL, '20', NULL, 'OI03', '1', '7', '30'),
('81', 'خل التفاح الطبيعي', '13', '3', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Natural apple cider vinegar', NULL, NULL, '20', NULL, 'OI04', '1', '7', '30'),
('82', 'الممبار المحشي', '2', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Stuffed sausage casing', NULL, NULL, '20', NULL, 'MT13', '1', '2', '8'),
('83', 'كوارع الأنعام المسلوقة', '2', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Boiled livestock trotters', NULL, NULL, '20', NULL, 'MT14', '1', '2', '8'),
('84', 'جبنة ريكفورد', '6', '2', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Roquefort cheese', NULL, NULL, '20', NULL, 'CH05', '1', '7', '30'),
('85', 'جبنة كشكفال', '6', '2', '4.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Kashkaval cheese', NULL, NULL, '20', NULL, 'CH06', '1', '7', '30'),
('86', 'عصير عنب معلب طبيعي', '7', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Natural canned grape juice', NULL, NULL, '20', NULL, 'FR13', '1', '2', '8'),
('87', 'عصير كريز معلب طبيعي', '7', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Natural canned cherry juice', NULL, NULL, '20', NULL, 'FR14', '1', '2', '8'),
('88', 'عصير توت معلب طبيعي', '7', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Natural canned mulberry juice', NULL, NULL, '20', NULL, 'FR15', '1', '2', '8'),
('89', 'قمر الدين المعلب', '7', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Canned apricot nectar', NULL, NULL, '20', NULL, 'FR16', '1', '2', '8'),
('90', 'جوافة طازجة بدون بذر', '7', '4', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Fresh seedless guava', NULL, NULL, '20', NULL, 'FR17', '1', '1', '4'),
('91', 'توت مجفف', '7', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Dried mulberries', NULL, NULL, '20', NULL, 'FR18', '1', '2', '8'),
('92', 'تين مجفف', '7', '3', '3.0', NULL, NULL, NULL, '2026-06-22 10:25:08.025073+00', 't', 'Dried figs', NULL, NULL, '20', NULL, 'FR19', '1', '2', '8');

-- ============================================================================
-- health_goals (8 rows)
-- ============================================================================
insert into public.health_goals (id, name, name_en, active, image, created_at, code, show_in_complete_profile) values
('1', 'تقليل الالتهاب', 'Reduce inflammation', 't', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/icons/goal_pain.png', '2026-06-01 22:32:53.621742+00', 'HG01', 't'),
('2', 'تحسين الهضم', 'Improve digestion', 't', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/icons/goal_digestive.png', '2026-06-01 22:32:53.621742+00', 'HG02', 't'),
('3', 'فقدان الوزن', 'Weight loss', 't', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/icons/goal_weight.png', '2026-06-01 22:32:53.621742+00', 'HG03', 't'),
('4', 'تحسين الطاقة', 'Improve energy', 't', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/icons/goal_power.png', '2026-06-01 22:32:53.621742+00', 'HG04', 't'),
('5', 'تحسين النوم', 'Improve sleep', 't', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/icons/goal_sleep.png', '2026-06-01 22:32:53.621742+00', 'HG05', 't'),
('6', 'التخلص من التوتر', 'Reduce stress', 't', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/icons/goal_worry.png', '2026-06-01 22:32:53.621742+00', 'HG06', 't'),
('7', 'لايوجد تحسن', 'No improvement', 't', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/icons/confused.png', '2026-06-03 14:44:46.084073+00', 'HG49', 'f'),
('8', 'أخري', 'Other', 't', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/icons/check.png', '2026-06-03 14:44:46.084073+00', 'HG50', 'f');

-- ============================================================================
-- health_conditions (8 rows)
-- ============================================================================
insert into public.health_conditions (id, code, name, name_en, active, image, created_at) values
('1', 'HC01', 'السكري', 'Diabetes', 't', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/icons/hc_diabetes.png', '2026-06-02 16:26:12.859975+00'),
('2', 'HC02', 'ضغط الدم', 'Blood pressure', 't', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/icons/hc_blood_pressure.png', '2026-06-02 16:26:12.859975+00'),
('3', 'HC03', 'الكوليسترول', 'Cholesterol', 't', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/icons/hc_colesterol.png', '2026-06-02 16:26:12.859975+00'),
('4', 'HC04', 'القولون العصبي', 'Irritable bowel', 't', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/icons/hc_intestine.png', '2026-06-02 16:26:12.859975+00'),
('5', 'HC05', 'التهاب المفاصل', 'Joint problems', 't', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/icons/hc_joint.png', '2026-06-02 16:26:12.859975+00'),
('6', 'HC50', 'أخرى', 'Other', 't', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/icons/hc_other.png', '2026-06-02 16:26:12.859975+00'),
('7', 'HC06', 'الجيوب الانفية', 'Sinusitis', 't', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/icons/hc_sinus.png', '2026-06-02 16:51:13.616039+00'),
('8', 'HC07', 'السمنة', 'Obesity', 't', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/icons/hc_obesity.png', '2026-06-02 16:51:13.616039+00');

-- ============================================================================
-- library_topics (5 rows)
-- ============================================================================
insert into public.library_topics (id, code, sequence, title, description, image_url, accent_color, icon, is_active, created_at) values
('1', 'app-goals', '5', 'أهداف تطبيق الطيبات', 'تطبيق الطيبات ليس مجرد دليل غذائي، بل هو منصة مجتمعية لمتابعة الصحة الفردية ودعم المجتمع من خلال المشاركة في هذا الاستقصاء، بهدف دراسة النظام الغذائي بوعي وقياس مدى فاعليته.', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/topics/mobile_app.png', '#10b981', 'Target', 't', '2026-06-04 20:14:14.985303+00'),
('2', 'system-intro', '10', 'ما هو نظام الطيبات؟', 'يقوم النظام على فلسفة استعادة التوازن الحيوي للجسم وتقليل الالتهابات من خلال مستويات غذائية متدرجة، تبدأ بالأكثر أمانًا وتنتهي بالأطعمة الممنوعة نهائيًا.', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/topics/mobile_app2.png', '#06B6D4', 'BookOpen', 't', '2026-06-04 20:14:14.985303+00'),
('3', 'forbidden-foods', '15', 'الممنوعات', 'هذه الأصناف ممنوعة نهائيًا، حتى لو دخلت ضمن مكونات منتجات أخرى. وفي حال تناولها عن طريق الخطأ، يُوصى بالصيام فورًا لمنح الجسم فرصة للتعافي والتخلص من المواد المسببة للالتهاب.', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/topics/forbidden.png', '#EF4444', 'ShieldX', 't', '2026-06-04 20:14:14.985303+00'),
('4', 'allowed-foods', '20', 'المسموحات', 'تنقسم الأغذية المسموحة إلى أربعة مستويات متدرجة. المستوى الأول يمكن تكرارة يوميا، ثم المستويات التالية تكرارها اقل وفقًا لاستجابة جسمك وتحسن حالتك الصحية.', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/topics/allowed.png', '#10B981', 'ShieldCheck', 't', '2026-06-04 20:14:14.985303+00'),
('5', 'weekly-rating', '25', 'تقييم الطيبات', 'بعد كل ٧ أيام من الالتزام، يُطلب منك تقييم حالتك الصحية خلال الأسبوع. هذه التقييمات ليست مجرد أرقام، بل تمثل مرجعًا علميًا يسهم في بناء قاعدة بيانات صحية جماعية تخدم الأفراد والباحثين والمجتمع.', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/topics/rating.png', '#F59E0B', 'Star', 't', '2026-06-04 20:14:14.985303+00');

-- ============================================================================
-- library_topic_items (29 rows)
-- ============================================================================
insert into public.library_topic_items (id, topic_id, code, sequence, icon, title, description, is_active) values
('1', '1', 'app-goals-1', '1', 'UtensilsCrossed', 'متابعة العادات الغذائية', 'سجّل وجباتك اليومية بسهولة، وتابع مدى التزامك بمستويات النظام الغذائي مع مرور الوقت.', 't'),
('2', '1', 'app-goals-2', '2', 'Shuffle', 'مقترحات وجبات مع إمكانية التبديل', 'يقترح التطبيق وجبات مناسبة لمستواك الصحي، مع إمكانية التبديل بين خيارات متعددة تناسب احتياجك.', 't'),
('3', '1', 'app-goals-3', '3', 'Star', 'التقييم الأسبوعي', 'بعد كل ٧ أيام من الالتزام، يظهر تقييم أسبوعي لقياس التحسن الصحي ومراقبة استجابة الجسم للنظام الغذائي.', 't'),
('4', '1', 'app-goals-4', '4', 'BarChart2', 'إحصائيات مجتمعية شفافة', 'تُجمَّع بيانات التقييمات لإعداد احصائيات للمستخدمين الملتزمين بالنظام لاستنتاج مدي فاعلية النظام بشكل مدروس قائم علي التطبيق والتأثير الجمعي.', 't'),
('5', '1', 'app-goals-5', '5', 'Users', 'مشاركة مجتمعية للصحة العامة', 'يجمعنا التطبيق في مجتمع يسعى إلى تحسين الصحة والتغذية، ويُسهم فيه كل فرد في بناء مرجع  للاحصائيات.', 't'),
('6', '1', 'app-goals-6', '6', 'Layers', 'مستويات الوجبات ونصائح الاستخدام', 'يصنّف التطبيق كل وجبة وفق مستواها الغذائي، ويوضح لك مدى تكرار تناولها المناسب لحالتك الصحية.', 't'),
('7', '1', 'app-goals-7', '7', 'Bell', 'تذكير أسبوعي بالوجبات', 'يتتبع التطبيق تكرار وجباتك، ويُذكّرك عند اقتراح الوجبات بعدد مرات تناولك لها خلال الأسبوع الماضي.', 't'),
('8', '2', 'system-intro-1', '1', 'HeartPulse', 'مبدأ الاستشفاء الذاتي', 'يعتمد النظام على تهيئة الجسم لإصلاح نفسه بنفسه، من خلال تقليل العوامل المسببة للالتهاب والالتزام بالأغذية الأكثر أمانًا.', 't'),
('9', '2', 'system-intro-2', '2', 'AlertTriangle', 'لا توقف الدواء دون استشارة الطبيب', ' لا يجوز إيقاف أي دواء إلا بعد استشارة الطبيب والتدرج تحت إشرافه.', 't'),
('10', '2', 'system-intro-3', '3', 'TrendingUp', 'عند تحسن صحتك', 'عند تحسن حالتك الصحية، يمكنك تناول بعض الأصناف المقيّدة بحذر واعتدال، مع مراقبة استجابة جسمك لأي رد فعل.', 't'),
('11', '2', 'system-intro-4', '4', 'Scale', 'الاعتدال في السكر والملح', 'حتى الأغذية المسموحة قد تصبح ضارة عند الإفراط في تناولها، لذلك يجب الاعتدال في استهلاك السكر والملح دائمًا.', 't'),
('12', '2', 'system-intro-5', '5', 'Ear', 'استمع إلى جسدك', 'كل شخص يختلف عن الآخر. راقب أي رد فعل هضمي أو حركي أو جلدي، وعُد إلى المستوى الأول فور ظهور أي أعراض.', 't'),
('13', '2', 'system-intro-6', '6', 'ShieldAlert', 'احذر من سوء التغذية', 'الالتزام بالنظام لا يعني الحرمان. احرص على التنوع في الأصناف المسموحة لضمان الحصول على جميع احتياجاتك الغذائية.', 't'),
('14', '3', 'forbidden-1', '1', 'Drumstick', 'البروتينات الممنوعة', 'البيض، الفراخ، البط، الديك الرومي، أسماك المزارع، أسماك المياه العذبة، الجمبري، السبيط، البلطي، البوري، البطارخ، واللانشون.', 't'),
('15', '3', 'forbidden-2', '2', 'Leaf', 'الخضروات والبصليات المحظورة', 'الثوم، البصل، الفلفل، الطماطم، الخضرة، الورقيات، الباذنجان، والجزر. وهي ممنوعة سواء كانت طازجة أو مطبوخة أو مستخدمة كمكوّن في أي طبق.', 't'),
('16', '3', 'forbidden-3', '3', 'Bean', 'البقوليات المحظورة', 'الفول، العدس، الفاصوليا، اللوبيا، الحمص، الفول السوداني، وفول الصويا بجميع مشتقاته.', 't'),
('17', '3', 'forbidden-4', '4', 'Wheat', 'منتجات الحبوب المحظورة', 'الدقيق الأبيض، الخبز البلدي، خبز السن، المكرونة التقليدية المصنوعة من الدقيق الأبيض، الشوفان المدلفن، البقسماط، والكيك.', 't'),
('18', '3', 'forbidden-5', '5', 'Milk', 'منتجات الألبان المحظورة', 'اللبن الجاموسي والبقري، الأجبان البيضاء الطرية، الجبن القديم، جبنة كيري، وكريمة مبيّض القهوة.', 't'),
('19', '3', 'forbidden-6', '6', 'Apple', 'الفواكه المحظورة', 'البطيخ، والحمضيات بجميع أنواعها، والليمون، والكيوي، والأناناس، والمانجو، والكنتالوب، والكاكا، والبابايا، والأفوكادو.', 't'),
('20', '3', 'forbidden-7', '7', 'GlassWater', 'المشروبات والمحسنات المحظورة', 'المشروبات الغازية، ومشروبات الطاقة، وشراب الشعير، ومشروبات الصويا، والزنجبيل، والشطة بجميع أشكالها.', 't'),
('21', '4', 'allowed-1', '1', 'ShieldCheck', 'مستوى 1 — الغذاء الأساسي (يومي إلزامي)', 'الأرز، البطاطس، زيت الزيتون، الملح، الخل، التمر، السكر، العسل، عصير القصب الطبيعي، وفيتامين د كمكمّل أساسي للجميع.', 't'),
('22', '4', 'allowed-2', '2', 'Sun', 'مستوى 2 — الغذاء المحدود (يومي مع مراقبة)', 'الأجبان الصفراء المعتقة (شيدر، جودا، فلمنك)، القهوة، الشاي الأخضر، الشوكولاتة، الفشار، الشيبس (الملح والزيت فقط)، توست القمح الكامل، الزيتون المخلل، والطحينة.', 't'),
('23', '4', 'allowed-3', '3', 'Flame', 'مستوى 3 — الغذاء المراقب (١–٣ مرات أسبوعيًا)', 'اللحوم الحمراء المسلوقة جيدًا (الضأن والجاموسي)، الأسماك البحرية غير المستزرعة، التونة والسردين المعلبان، العنب، الموز، الفراولة، التوت، الجوافة (بدون بذور)، السميد، مكرونة السميد، والمكسرات (باستثناء البندق المسلوق).', 't'),
('24', '4', 'allowed-4', '4', 'Sparkles', 'مستوى 4 — الغذاء الاستثنائي (نادر للأصحاء فقط)', 'للأطفال والبالغين الأصحاء فقط، وبمعدل نادر جدًا: البطاطا، القلقاس، اللوسة، المشروم، التفاح والكمثرى (بدون قشرة)، اللوز، والذرة المشوية.', 't'),
('25', '5', 'rating-1', '1', 'CalendarCheck', 'التقييم بعد كل ٧ أيام من الالتزام', 'يظهر التقييم تلقائيًا عند اكتمال ٧ أيام متتالية من التسجيل، ويشمل تقييم الالتزام الغذائي ومستوى التحسن الصحي العام.', 't'),
('26', '5', 'rating-2', '2', 'ClipboardList', 'تسجيل بيانات التحسن الصحي', 'يُسجَّل تقييم الحالة الصحية بشكل دوري، مما يتيح تتبع مسار التحسن الفعلي ورصد التقدم مع مرور الوقت.', 't'),
('27', '5', 'rating-3', '3', 'TrendingUp', 'مراقبة التحسن والسلوك الغذائي', 'يُحلَّل السلوك الغذائي لكل فرد لاكتشاف الأنماط الإيجابية والسلبية، ومساعدته على تحسين عاداته الصحية باستمرار.', 't'),
('28', '5', 'rating-5', '4', 'Globe', 'الشفافية العلمية والمرجعية الموثوقة', 'من خلال تطبيق النظام ومشاركة نتائجه بشفافية، نبني مرجعًا علميًا موثوقًا يواجه المعلومات المضللة ويحمي الناس من الاستغلال.', 't'),
('29', '5', 'rating-6', '5', 'Heart', 'الالتزام خدمة للصحة العامة', 'كل من يلتزم بالتطبيق ويسجل تقييمه بأمانة يسهم في حركة مجتمعية تهدف إلى تحسين صحة الأفراد وخدمة الصحة العامة.', 't');

-- ============================================================================
-- membership_point_rules (8 rows)
-- ============================================================================
insert into public.membership_point_rules (action_key, track, points, description_ar, is_active, updated_at) values
('add_daily_meal', 'committed', '10', 'إضافة وجبة يومية', 't', '2026-06-06 19:15:11.935564+00'),
('complete_weekly_rating', 'committed', '30', 'إتمام التقييم الأسبوعي', 't', '2026-06-06 19:15:11.935564+00'),
('consecutive_week_streak', 'committed', '20', 'مكافأة الالتزام الأسبوعي المتواصل', 't', '2026-06-06 19:15:11.935564+00'),
('create_community_post', 'supporter', '3', 'نشر في المجتمع', 't', '2026-06-06 19:15:11.935564+00'),
('share_meal', 'supporter', '5', 'مشاركة وجبة', 't', '2026-06-06 19:15:11.935564+00'),
('share_post', 'supporter', '5', 'مشاركة منشور', 't', '2026-06-06 19:15:11.935564+00'),
('share_stats', 'supporter', '8', 'مشاركة الإحصائيات', 't', '2026-06-06 19:15:11.935564+00'),
('share_topic', 'supporter', '5', 'مشاركة موضوع', 't', '2026-06-06 19:15:11.935564+00');

-- ============================================================================
-- membership_tiers (10 rows)
-- ============================================================================
insert into public.membership_tiers (track, tier_key, min_points, label_ar, icon_key, sort_order) values
('committed', 'starter', '0', 'مبتدئ', 'tier_starter', '1'),
('committed', 'bronze', '50', 'برونزي', 'tier_bronze', '2'),
('committed', 'silver', '150', 'فضي', 'tier_silver', '3'),
('committed', 'gold', '300', 'ذهبي', 'tier_gold', '4'),
('committed', 'platinum', '500', 'بلاتيني', 'tier_platinum', '5'),
('supporter', 'starter', '0', 'مبتدئ', 'tier_starter', '1'),
('supporter', 'bronze', '50', 'برونزي', 'tier_bronze', '2'),
('supporter', 'silver', '150', 'فضي', 'tier_silver', '3'),
('supporter', 'gold', '300', 'ذهبي', 'tier_gold', '4'),
('supporter', 'platinum', '500', 'بلاتيني', 'tier_platinum', '5');

-- ============================================================================
-- membership_config (3 rows)
-- ============================================================================
insert into public.membership_config (key, value, description, updated_at) values
('ad_cooldown_hours', '6', 'Min hours between counted ad views', '2026-06-06 19:15:11.935564+00'),
('max_daily_meal_events', '1', 'Max meal events counted per day for committed track', '2026-06-06 19:15:11.935564+00'),
('reset_window_days', '30', 'Rolling window in days for point calculation', '2026-06-06 19:15:11.935564+00');

-- ============================================================================
-- public_config (18 rows)
-- ============================================================================
insert into public.public_config (key, value) values
('app_fast_reminder_hour', '23'),
('app_fast_reminder_minute', '0'),
('app_meal_reminder_hour', '22'),
('app_meal_reminder_minute', '0'),
('app_rating_reminder_hour', '20'),
('app_rating_reminder_minute', '0'),
('community_hash_tags', '#نظام_الطيبات, #تطبيق_الطيبات, #الطيبات, #الأكل_الصحي, #نمط_حياة_صحي, #نظام_الطيبات_ضياء_العوضي, #افضل_تطبيق_نظام_الطيبات, #TayebatAppTag_1'),
('enable_contact', 'false'),
('meal_img_url', 'https://mbbbdhyhtqkxakmblzmk.supabase.co/storage/v1/object/public/taybat_app_assets/meals/'),
('rating_max_allowed_commitment', '5'),
('url_android_app', ''),
('url_facebook', ''),
('url_instagram', ''),
('url_ios_app', NULL),
('url_tiktok', ''),
('url_web', 'https://al-tayabat.com'),
('url_x', NULL),
('url_youtube', '');
