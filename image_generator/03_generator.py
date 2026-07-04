#!/usr/bin/env python3
"""
Pollinations Meal Image Generator
توليد صور احترافية لجميع الوجبات من ملف CSV
"""

import csv
import requests
import os
from pathlib import Path
from typing import Dict, List
import json
from datetime import datetime

# ========== CONFIG ==========
API_KEY = "sk_jnjLVXy6zidl1mBNHn0qLqPfApJ0KNY3"
API_URL = "https://gen.pollinations.ai/generate"
OUTPUT_DIR = "meal_images"
MODEL = "turbo"  # أو "flux" أو "dall-e"
WIDTH = 768
HEIGHT = 768
BATCH_SIZE = 5  # كم صورة تولد قبل التوقف
DELAY_BETWEEN_REQUESTS = 2  # ثواني

# ========== MEAL DESCRIPTIONS ==========
# خريطة رموز العناصر إلى أوصافها
ITEM_DESCRIPTIONS = {
    'CB01': 'fluffy white Egyptian rice mound',
    'CB02': 'vermicelli rice',
    'CB03': 'rice with nuts',
    'CB04': 'basmati rice',
    'CB05': 'roasted sweet potato',
    'CB06': 'mashed sweet potato',
    'CB07': 'boiled potatoes',
    'CB08': 'golden crispy fried potatoes',
    'CB09': 'mashed potatoes',
    'CB10': 'whole wheat toast',
    'CB11': 'roasted corn',
    'CB12': 'popcorn',
    'MT01': 'soup',
    'MT02': 'boiled liver',
    'MT03': 'beef kofta',
    'MT04': 'lamb kofta',
    'MT05': 'boiled rabbit meat',
    'MT06': 'boiled camel meat',
    'MT07': 'boiled veal meat',
    'MT08': 'boiled lamb meat',
    'MT09': 'grilled lamb meat',
    'MT10': 'boiled goat meat',
    'MT11': 'grilled goat meat',
    'MT12': 'stuffed courgette with rice',
    'MT13': 'stuffed tripe',
    'MT14': 'boiled trotters',
    'FS01': 'grilled tuna',
    'FS02': 'grilled sardine fillet',
    'FS03': 'grilled mackerel',
    'BD01': 'stuffed pigeon',
    'BD02': 'grilled pigeon',
    'BD03': 'roasted quail',
    'DF01': 'country butter',
    'DF02': 'country ghee',
    'DF03': 'natural cream',
    'DF04': 'natural sugar',
    'CH01': 'Gouda cheese',
    'CH02': 'Cheddar cheese',
    'CH03': 'Flemish cheese',
    'CH04': 'Mozzarella cheese',
    'CH05': 'Rickvord cheese',
    'CH06': 'Kashkaval cheese',
    'FR01': 'fresh plums',
    'FR02': 'peeled apple',
    'FR03': 'dates',
    'FR04': 'fresh figs',
    'FR05': 'fresh pomegranate',
    'FR06': 'raisins',
    'FR07': 'guava juice',
    'FR08': 'black grapes',
    'FR09': 'fresh strawberries',
    'FR10': 'fresh cherries',
    'FR11': 'fresh apricots',
    'FR12': 'banana',
    'FR13': 'dried figs',
    'FR14': 'dried apricots',
    'FR15': 'dried cherries',
    'FR16': 'dried berries',
    'FR17': 'fresh kiwi',
    'FR18': 'fresh pineapple',
    'FR19': 'fresh mango',
    'NT01': 'walnuts',
    'NT02': 'pistachios',
    'NT03': 'peanuts',
    'NT04': 'cashews',
    'NT05': 'almonds',
    'SW01': 'tahini halva',
    'SW02': 'dark chocolate 70%',
    'SW03': 'molasses',
    'SW04': 'natural honey',
    'SW05': 'fig jam',
    'SW06': 'strawberry jam',
    'SW07': 'apricot jam',
    'SW08': 'Nutella',
    'SW09': 'date paste',
    'SW10': 'date syrup',
    'SW11': 'honey syrup',
    'SW12': 'tahini syrup',
    'SW13': 'carob syrup',
    'SW14': 'nougat',
    'OL01': 'Kalamata olives',
    'OI01': 'olive oil',
    'OI02': 'corn oil',
    'OI03': 'apple vinegar',
    'OI04': 'natural vinegar',
    'OI05': 'green tea',
    'DR01': 'green tea',
    'DR02': 'Turkish coffee',
    'DR03': 'warm water',
    'HB01': 'thyme tea',
    'HB02': 'caraway tea',
    'HB03': 'anise tea',
    'HB04': 'cumin tea',
}

def build_meal_prompt(meal_name: str, item_codes: str) -> str:
    """
    بناء وصف احترافي للوجبة من رموز العناصر
    """
    if not item_codes.strip():
        # صيام
        return "Serene minimalist image: empty ceramic plate, soft neutral background, warm peaceful lighting, suggesting fasting and spiritual wellness, elegant simplicity, magazine quality"
    
    items = [ITEM_DESCRIPTIONS.get(code.strip(), code.strip()) for code in item_codes.split(',')]
    
    # اختبر عدد العناصر وبناء وصف ديناميكي
    if len(items) <= 2:
        arrangement = "artfully arranged side-by-side on a cream ceramic plate"
    elif len(items) == 3:
        arrangement = "artfully arranged with items positioned strategically on cream ceramic dish"
    else:
        arrangement = "perfectly composed and arranged on a cream ceramic serving plate"
    
    prompt = f"""Professional food photography, ultra-realistic, {arrangement}: {', '.join(items)}.
    Complete full plate visible, no cutoff edges, warm soft natural window light from the side, 
    shallow depth of field with blurred neutral beige wooden table background, 
    appetizing warm color palette, glistening natural sheen on food, elegant plating,
    editorial gourmet magazine quality, restaurant professional styling, 4k ultra HD, sharp focus on food,
    Middle-Eastern cuisine, fresh and inviting presentation, perfect lighting and shadows."""
    
    return prompt

def generate_image(prompt: str, meal_id: str, meal_name: str, seed: int = 42) -> bool:
    """
    توليد صورة واحدة من الوجبة
    """
    try:
        params = {
            "prompt": prompt,
            "seed": seed,
            "width": WIDTH,
            "height": HEIGHT,
            "model": MODEL,
            "nologo": "true"
        }
        
        headers = {
            "Authorization": f"Bearer {API_KEY}"
        }
        
        print(f"  📸 Generating for meal {meal_id}: {meal_name}...", end=" ", flush=True)
        
        response = requests.get(API_URL, params=params, headers=headers, timeout=120)
        
        if response.status_code != 200:
            print(f"❌ HTTP {response.status_code}")
            return False
        
        # حفظ الصورة
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        filename = f"{OUTPUT_DIR}/meal_{meal_id}_{meal_name.replace(' ', '_')[:20]}.png"
        
        with open(filename, 'wb') as f:
            f.write(response.content)
        
        print(f"✅ Saved to {filename}")
        return True
    
    except requests.exceptions.Timeout:
        print("❌ Timeout (API slow)")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def process_meals_csv(csv_file: str, limit: int = None):
    """
    قراءة ملف CSV والوجبات وتوليد الصور
    """
    print(f"\n🍽️  Pollinations Meal Image Generator")
    print(f"{'='*60}")
    print(f"API: {API_URL}")
    print(f"Model: {MODEL}")
    print(f"Size: {WIDTH}x{HEIGHT}")
    print(f"Output: {OUTPUT_DIR}/")
    print(f"{'='*60}\n")
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            meals = list(reader)
    except FileNotFoundError:
        print(f"❌ File not found: {csv_file}")
        return
    
    total = min(len(meals), limit) if limit else len(meals)
    success = 0
    failed = 0
    
    for i, meal in enumerate(meals[:limit]):
        meal_id = meal.get('id', '').strip() or f"row{i}"
        meal_name = meal.get('name', 'Unknown').strip()
        item_codes = meal.get('meal_item_codes', '').strip()
        
        # بناء الوصف
        prompt = build_meal_prompt(meal_name, item_codes)
        
        # توليد الصورة
        if generate_image(prompt, meal_id, meal_name, seed=i):
            success += 1
        else:
            failed += 1
        
        # تأخير بين الطلبات
        if i < total - 1:
            import time
            time.sleep(DELAY_BETWEEN_REQUESTS)
    
    print(f"\n{'='*60}")
    print(f"✅ Summary: {success} successful, {failed} failed out of {total} meals")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    # جرّب أولًا على 3 وجبات للتأكد من أن API key يعمل
    print("\n🔑 Testing API connection with first 3 meals...\n")
    process_meals_csv(
        '/mnt/user-data/outputs/meals_-_meals.csv',
        limit=3
    )
    
    # بعد التأكد، أطلق للـ 86 كاملة (غيّر limit إلى None أو 86):
    # process_meals_csv('/mnt/user-data/outputs/meals_-_meals.csv', limit=None)