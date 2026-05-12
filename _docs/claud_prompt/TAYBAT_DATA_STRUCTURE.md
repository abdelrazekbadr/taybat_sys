# 🗄️ تطبيق الطيبات - البنية الهندسية والبيانات
## Data Structure & JSON Models - المرحلة الأولى

---

## 📊 الكيانات الأساسية (Core Entities)

تم تصميم هذه البيانات بناءً على متطلبات نظام الطيبات والواجهة المستخدم.

---

## 👤 User (المستخدم)

```json
{
  "user": {
    "id": "uuid-string",
    "firstName": "أحمد",
    "lastName": "محمد",
    "email": "ahmed@example.com",
    "phoneNumber": "+201012345678",
    "dateOfBirth": "1990-05-15",
    "gender": "male",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z",
    
    "health": {
      "currentWeight": 85.5,
      "height": 175,
      "bodyType": "medium",
      "primaryGoal": "improve_digestion",
      "medicalComplaints": [
        "bloating",
        "fatigue",
        "constipation"
      ],
      "isEatingFirstMeal": false
    },
    
    "dietaryPreferences": {
      "availableFats": [
        "olive_oil",
        "clarified_butter",
        "butter",
        "cream"
      ],
      "availableCheeses": [
        "mozzarella",
        "cheddar",
        "processed_cheese"
      ],
      "availableProteins": [
        "red_meat",
        "lamb",
        "pigeon",
        "liver"
      ],
      "availableNuts": [
        "honey",
        "walnuts",
        "cashews",
        "sesame_halwa"
      ],
      "availableCarbsBase": [
        "wheat_toast",
        "white_rice",
        "potatoes",
        "bread",
        "wheat",
        "corn"
      ]
    },
    
    "appPreferences": {
      "language": "ar",
      "darkMode": false,
      "notificationsEnabled": true,
      "pushNotifications": {
        "hungerReminders": true,
        "waterReminders": false,
        "achievementAlerts": true,
        "weeklyReviewReminder": true
      }
    },
    
    "stats": {
      "joinedDate": "2024-01-15",
      "currentStreak": 4,
      "totalBadges": 1,
      "lastEvaluationDate": "2024-01-20",
      "totalMealsTracked": 18
    }
  }
}
```

---

## 🍽️ Meal (الوجبة)

```json
{
  "meal": {
    "id": "meal-uuid",
    "name": "أرز + لحم مشوي + سمن",
    "arabicName": "أرز بسمن مع لحم ماعز مشوي",
    "description": "وجبة متوازنة حسب نظام الطيبات",
    
    "ingredients": [
      {
        "id": "ingredient-1",
        "name": "أرز أبيض",
        "category": "carbs",
        "quantity": 150,
        "unit": "g",
        "isAllowed": true
      },
      {
        "id": "ingredient-2",
        "name": "لحم ماعز",
        "category": "protein",
        "quantity": 150,
        "unit": "g",
        "isAllowed": true,
        "frequency": "up_to_3_times_weekly"
      },
      {
        "id": "ingredient-3",
        "name": "سمن بلدي",
        "category": "fat",
        "quantity": 30,
        "unit": "ml",
        "isAllowed": true
      }
    ],
    
    "nutrition": {
      "estimatedCalories": 580,
      "protein": 38,
      "carbs": 52,
      "fat": 18
    },
    
    "dietPlan": "taybat",
    "mealType": "lunch",
    "prepTime": 45,
    "difficultyLevel": "easy",
    "tags": ["allowed", "high-protein", "moderate"],
    
    "image": {
      "url": "https://cdn.taybat.app/meals/rice-lamb.jpg",
      "alt": "أرز أبيض مع لحم ماعز مشوي",
      "source": "professional_food_photo"
    },
    
    "isAvailableForAllUsers": true,
    "isHidden": false,
    
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 📅 MealPlan / WeeklySchedule (الجدول الأسبوعي)

```json
{
  "weeklyMealPlan": {
    "id": "plan-uuid",
    "userId": "user-uuid",
    "weekNumber": 3,
    "startDate": "2024-01-21",
    "endDate": "2024-01-27",
    
    "schedule": [
      {
        "day": "sunday",
        "arabicName": "الأحد",
        "dayNumber": 0,
        "meals": [
          {
            "mealSlot": "breakfast",
            "arabicSlot": "الإفطار",
            "suggestedMealId": "meal-uuid-001",
            "suggestedMeal": "توست بالردة مع عسل وتمر",
            "isCompleted": false,
            "completedAt": null,
            "replacementMealId": null,
            "notes": ""
          },
          {
            "mealSlot": "lunch",
            "arabicSlot": "الغداء",
            "suggestedMealId": "meal-uuid-002",
            "suggestedMeal": "أرز + لحم مشوي + سمن",
            "isCompleted": true,
            "completedAt": "2024-01-21T13:30:00Z",
            "replacementMealId": null,
            "notes": "شعرت براحة أكثر من المعتاد"
          },
          {
            "mealSlot": "snack",
            "arabicSlot": "وجبة خفيفة",
            "suggestedMealId": "meal-uuid-003",
            "suggestedMeal": "تمر أو موز",
            "isCompleted": false,
            "completedAt": null,
            "replacementMealId": null,
            "notes": ""
          }
        ]
      },
      {
        "day": "monday",
        "arabicName": "الاثنين",
        "dayNumber": 1,
        "isFasting": true,
        "fastingType": "weekly_fast",
        "meals": []
      }
    ],
    
    "totalPlannedMeals": 17,
    "completedMeals": 8,
    "completionRate": 47,
    
    "createdAt": "2024-01-21T00:00:00Z",
    "updatedAt": "2024-01-21T14:00:00Z"
  }
}
```

---

## ⭐ Badge / Achievement (الشارة)

```json
{
  "badge": {
    "id": "badge-001",
    "code": "enthusiastic_beginner",
    "name": "المبتديء المتحمس",
    "arabicName": "المبتديء المتحمس",
    "description": "أكملت التسجيل وابتدأت رحلتك",
    "arabicDescription": "أكملت بيانات التسجيل وابتدأت رحلتك في نظام الطيبات",
    
    "icon": {
      "emoji": "🌟",
      "customIcon": "https://cdn.taybat.app/badges/beginner.svg",
      "color": "#f59e0b"
    },
    
    "criteria": {
      "type": "profile_completion",
      "condition": "completeRegistrationAndSetup",
      "requirementValue": 1,
      "description": "إكمال التسجيل والإعداد"
    },
    
    "reward": {
      "points": 10,
      "motivation": "أنت الآن جزء من مجتمع الطيبات!"
    },
    
    "visibility": "always_visible",
    "category": "achievement",
    "difficulty": "easy",
    
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## 📋 WeeklyEvaluation / Progress Review (التقييم الأسبوعي)

```json
{
  "weeklyEvaluation": {
    "id": "eval-uuid",
    "userId": "user-uuid",
    "week": 3,
    "evaluationDate": "2024-01-27T20:00:00Z",
    "week_range": {
      "start": "2024-01-21",
      "end": "2024-01-27"
    },
    
    "symptomsAssessment": [
      {
        "symptom": "bloating",
        "arabicSymptom": "الانتفاخ والغازات",
        "previousScore": 4,
        "currentScore": 2,
        "improvement": true,
        "improvementPercentage": 50
      },
      {
        "symptom": "fatigue",
        "arabicSymptom": "التعب والإرهاق",
        "previousScore": 4,
        "currentScore": 3,
        "improvement": true,
        "improvementPercentage": 25
      },
      {
        "symptom": "constipation",
        "arabicSymptom": "الإمساك",
        "previousScore": 3,
        "currentScore": 2,
        "improvement": true,
        "improvementPercentage": 33
      }
    ],
    
    "overallAssessment": {
      "question": "كيف شعرت بشكل عام هذا الأسبوع؟",
      "arabicQuestion": "كيف شعرت بشكل عام هذا الأسبوع؟",
      "score": 4,
      "scaleMax": 5,
      "emoji": "😊"
    },
    
    "notes": {
      "userNotes": "لاحظت تحسن كبير في الانتفاخ بعد تجنب الخضار النيئة",
      "improvement_noted": true,
      "recommendations": "استمر على هذا النمط، قد تحتاج لزيادة تناول السمك المسموح"
    },
    
    "sharingIntent": {
      "wantsToShare": true,
      "successStory": {
        "title": "تحسن ملحوظ في الأسبوع الثالث",
        "description": "بعد 3 أسابيع من اتباع نظام الطيبات، لاحظت فرق كبير في الانتفاخ والطاقة",
        "metrics": {
          "bloatingReduction": "50%",
          "energyImprovement": "واضح جداً"
        }
      },
      "shareChannels": ["facebook", "whatsapp"],
      "isPublished": false,
      "publishDate": null
    },
    
    "stats": {
      "mealCompletionRate": 65,
      "daysWithoutComplaints": 3,
      "newBadgesEarned": ["weekly_success"]
    },
    
    "createdAt": "2024-01-27T20:30:00Z"
  }
}
```

---

## 📱 DailyStatus / Today's Check-in (حالة اليوم)

```json
{
  "todayStatus": {
    "date": "2024-01-28",
    "userId": "user-uuid",
    
    "hunger": {
      "isHungry": true,
      "hungryAt": "13:00",
      "lastMealTime": "08:30",
      "timeSinceLastMeal": 270,
      "isReadyToEat": true
    },
    
    "hydration": {
      "isThirsty": true,
      "glassesDrunk": 3,
      "lastDrinkTime": "14:15"
    },
    
    "mood": {
      "currentMood": 4,
      "scaleMax": 5,
      "emoticon": "😊",
      "lastUpdated": "2024-01-28T14:30:00Z"
    },
    
    "mealsToday": {
      "breakfast": {
        "completed": true,
        "mealName": "توست بالردة مع عسل",
        "time": "08:30",
        "feedback": "شعرت بالشبع السريع"
      },
      "lunch": {
        "completed": false,
        "scheduled": true,
        "plannedMeal": "أرز + لحم مشوي"
      }
    },
    
    "currentMealSuggestion": {
      "mealId": "meal-uuid-002",
      "mealName": "أرز + لحم مشوي + سمن",
      "imageUrl": "https://cdn.taybat.app/meals/rice-lamb.jpg",
      "estimatedCalories": 580,
      "readyToEat": true,
      "canBSwapped": true
    },
    
    "streakInfo": {
      "currentStreak": 4,
      "consecutiveDaysCompleted": 4,
      "lastCompletedDay": "2024-01-27"
    }
  }
}
```

---

## 🍲 FoodLibrary / AllowedFoods (مكتبة الأطعمة)

```json
{
  "foodLibrary": {
    "lastUpdated": "2024-01-15T10:00:00Z",
    
    "categories": [
      {
        "id": "carbs",
        "arabicName": "النشويات",
        "description": "مصدر الطاقة الأساسي",
        "items": [
          {
            "id": "food-001",
            "name": "White Rice",
            "arabicName": "أرز أبيض",
            "isAllowed": true,
            "notes": "سهل الهضم",
            "image": "https://cdn.taybat.app/foods/white-rice.jpg"
          },
          {
            "id": "food-002",
            "name": "Wheat Toast",
            "arabicName": "توست بالردة",
            "isAllowed": true,
            "notes": "غني بالألياف الطبيعية",
            "image": "https://cdn.taybat.app/foods/wheat-toast.jpg"
          }
        ]
      },
      {
        "id": "proteins",
        "arabicName": "البروتينات",
        "description": "محدود: 3 مرات أسبوعياً",
        "items": [
          {
            "id": "food-003",
            "name": "Red Meat",
            "arabicName": "لحم أحمر",
            "isAllowed": true,
            "frequency": "up_to_3_times_weekly",
            "notes": "مصدر حديد وبروتين",
            "image": "https://cdn.taybat.app/foods/red-meat.jpg"
          }
        ]
      },
      {
        "id": "fats",
        "arabicName": "الدهون الطبيعية",
        "description": "دعم الهرمونات",
        "items": [
          {
            "id": "food-004",
            "name": "Olive Oil",
            "arabicName": "زيت الزيتون",
            "isAllowed": true,
            "image": "https://cdn.taybat.app/foods/olive-oil.jpg"
          }
        ]
      }
    ],
    
    "restrictedFoods": [
      {
        "id": "restricted-001",
        "name": "Chicken",
        "arabicName": "دجاج",
        "isRestricted": true,
        "reason": "يحتوي على أوميجا 6 عالية",
        "arabicReason": "يزيد من الالتهاب"
      },
      {
        "id": "restricted-002",
        "name": "Raw Vegetables",
        "arabicName": "الخضار النيئة",
        "isRestricted": true,
        "reason": "صعبة الهضم",
        "arabicReason": "تزيد من الإجهاد الهضمي"
      }
    ]
  }
}
```

---

## 🎮 UserProgress / Overall Stats (إحصائيات المستخدم)

```json
{
  "userProgress": {
    "userId": "user-uuid",
    "joinDate": "2024-01-15",
    "currentWeek": 3,
    "totalDaysActive": 13,
    
    "adherenceStats": {
      "totalMealsLogged": 28,
      "mealCompletionRate": 65,
      "currentStreak": 4,
      "longestStreak": 7,
      "weeklyCompletionRate": 70
    },
    
    "healthImprovement": {
      "initialComplaints": [
        "bloating",
        "fatigue",
        "constipation"
      ],
      "improvementTracking": [
        {
          "complaint": "bloating",
          "week1": 4,
          "week2": 3,
          "week3": 2,
          "overallImprovement": "50%"
        },
        {
          "complaint": "fatigue",
          "week1": 4,
          "week2": 3.5,
          "week3": 3,
          "overallImprovement": "25%"
        }
      ]
    },
    
    "badgesEarned": [
      {
        "badgeCode": "enthusiastic_beginner",
        "earnedDate": "2024-01-15",
        "category": "achievement"
      },
      {
        "badgeCode": "first_correct_meal",
        "earnedDate": "2024-01-15",
        "category": "achievement"
      }
    ],
    
    "nextMilestones": [
      {
        "milestone": "week_success",
        "progress": 57,
        "requiredDays": 7,
        "currentDays": 4
      },
      {
        "milestone": "month_success",
        "progress": 13,
        "requiredDays": 30,
        "currentDays": 13
      }
    ]
  }
}
```

---

## 📊 Database Schema (للمطورين)

### Collections/Tables المطلوبة:

```sql
-- Users Table
users (
  id: UUID,
  firstName: String,
  lastName: String,
  email: String,
  phoneNumber: String,
  dateOfBirth: Date,
  gender: Enum (male, female, other),
  currentWeight: Float,
  height: Integer,
  bodyType: Enum (slim, medium, large),
  primaryGoal: String,
  medicalComplaints: Array<String>,
  language: String,
  darkMode: Boolean,
  createdAt: DateTime,
  updatedAt: DateTime
)

-- Meals Table
meals (
  id: UUID,
  name: String,
  arabicName: String,
  description: String,
  ingredients: Array<Object>,
  nutrition: Object,
  mealType: Enum (breakfast, lunch, snack, dinner),
  prepTime: Integer,
  difficulty: Enum (easy, medium, hard),
  image: Object,
  isAvailable: Boolean,
  createdAt: DateTime
)

-- Weekly Meal Plans Table
weekly_meal_plans (
  id: UUID,
  userId: UUID,
  weekNumber: Integer,
  startDate: Date,
  endDate: Date,
  schedule: Array<Object>,
  totalPlanned: Integer,
  completedMeals: Integer,
  completionRate: Float,
  createdAt: DateTime,
  updatedAt: DateTime
)

-- Badges Table
badges (
  id: UUID,
  code: String,
  name: String,
  arabicName: String,
  description: String,
  criteria: Object,
  icon: Object,
  reward: Object,
  isActive: Boolean,
  createdAt: DateTime
)

-- User Badges (Many-to-Many)
user_badges (
  id: UUID,
  userId: UUID,
  badgeId: UUID,
  earnedDate: DateTime,
  createdAt: DateTime
)

-- Weekly Evaluations Table
weekly_evaluations (
  id: UUID,
  userId: UUID,
  week: Integer,
  evaluationDate: DateTime,
  symptomsAssessment: Array<Object>,
  overallScore: Integer,
  notes: String,
  sharingIntent: Object,
  createdAt: DateTime
)

-- Daily Status Table
daily_status (
  id: UUID,
  userId: UUID,
  date: Date,
  hunger: Object,
  hydration: Object,
  mood: Integer,
  mealsToday: Array<Object>,
  currentStreak: Integer,
  createdAt: DateTime,
  updatedAt: DateTime
)

-- Food Library Table
food_library (
  id: UUID,
  name: String,
  arabicName: String,
  category: String,
  isAllowed: Boolean,
  notes: String,
  image: String,
  frequency: String,
  createdAt: DateTime
)

-- User Preferences Table
user_preferences (
  userId: UUID,
  availableFats: Array<String>,
  availableCheeses: Array<String>,
  availableProteins: Array<String>,
  availableNuts: Array<String>,
  availableCarbsBase: Array<String>,
  updatedAt: DateTime
)
```

---

## 🔄 API Endpoints المتوقعة

### Authentication
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/verify
```

### User Profile
```
GET    /api/users/:id
PUT    /api/users/:id
POST   /api/users/:id/health
PUT    /api/users/:id/preferences
```

### Meals
```
GET    /api/meals
GET    /api/meals/:id
GET    /api/meals/search
POST   /api/meals/swap
```

### Weekly Plans
```
GET    /api/meal-plans/:userId/:week
POST   /api/meal-plans/:userId
PUT    /api/meal-plans/:userId/:week
POST   /api/meal-plans/:userId/:day/mark-complete
```

### Evaluations
```
POST   /api/evaluations/:userId
GET    /api/evaluations/:userId/:week
GET    /api/evaluations/:userId/history
POST   /api/evaluations/:userId/share
```

### Badges
```
GET    /api/badges
GET    /api/users/:id/badges
POST   /api/users/:id/badges/check
```

### Daily Status
```
GET    /api/status/:userId/today
PUT    /api/status/:userId/today
POST   /api/status/:userId/mood
POST   /api/status/:userId/hunger
```

---

## 🔐 Validation Rules (قواعد التحقق)

```json
{
  "validationRules": {
    "user": {
      "firstName": {
        "type": "string",
        "required": true,
        "minLength": 2,
        "maxLength": 50
      },
      "email": {
        "type": "string",
        "required": true,
        "pattern": "email",
        "unique": true
      },
      "phoneNumber": {
        "type": "string",
        "required": false,
        "pattern": "phone_numbers",
        "unique": true
      },
      "currentWeight": {
        "type": "float",
        "required": true,
        "min": 30,
        "max": 300
      }
    },
    "evaluation": {
      "symptomsScore": {
        "type": "integer",
        "min": 1,
        "max": 5,
        "required": true
      },
      "overallScore": {
        "type": "integer",
        "min": 1,
        "max": 5,
        "required": true
      },
      "notes": {
        "type": "string",
        "maxLength": 500,
        "required": false
      }
    }
  }
}
```

---

## 📱 Response Structure (بنية الاستجابة الموحدة)

```json
{
  "success": true,
  "statusCode": 200,
  "message": "تم الحصول على البيانات بنجاح",
  "data": {
    // البيانات الفعلية
  },
  "timestamp": "2024-01-28T14:30:00Z"
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "بيانات غير صحيحة",
  "error": {
    "code": "INVALID_INPUT",
    "details": "حقل البريد الإلكتروني مطلوب"
  },
  "timestamp": "2024-01-28T14:30:00Z"
}
```

---

## 🔄 Data Flow المتوقع

### User Journey:
```
1. Registration Flow
   - POST /auth/register (بيانات أساسية)
   - POST /users/:id/health (بيانات صحية)
   - PUT /users/:id/preferences (الأطعمة المتاحة)

2. Daily Usage
   - GET /status/:userId/today
   - GET /meal-plans/:userId/:week
   - POST /meal-plans/:userId/:day/mark-complete
   - PUT /status/:userId/mood

3. Weekly Evaluation
   - GET /evaluations/:userId/:week
   - POST /evaluations/:userId
   - POST /evaluations/:userId/share

4. Progress Tracking
   - GET /users/:id/badges
   - GET /evaluations/:userId/history
```

---

## 💾 Caching Strategy (استراتيجية التخزين المؤقت)

```
User Profile: Cache for 1 hour
Meals: Cache for 24 hours
Weekly Plans: Cache for 12 hours
User Badges: Cache for 30 minutes
Daily Status: No cache (always fresh)
```

---

## 🔐 Security & Privacy

```json
{
  "dataProtection": {
    "sensitiveFields": [
      "email",
      "phoneNumber",
      "healthData",
      "medicalComplaints"
    ],
    "encryption": "AES-256",
    "dataMinimization": true,
    "userConsentRequired": true,
    "shareableLimitedToOptIn": true,
    "deletionRight": true
  }
}
```

---

## 📈 Future Scalability Considerations

1. **User Growth**: Implement pagination for all list endpoints
2. **Data Growth**: Use database indexing on frequently queried fields
3. **International**: Prepare for multi-language support
4. **Community**: Add social features in Phase 2 (followers, likes, comments)
5. **Analytics**: Log user actions for improvement tracking
6. **AI Integration**: Prepare architecture for ML recommendations in Phase 2

---

## ✅ Implementation Checklist for Developers

```
Database:
☐ Create all tables/collections
☐ Set up relationships and foreign keys
☐ Add validation rules
☐ Create indexes
☐ Set up backup strategy

API:
☐ Implement all endpoints
☐ Add authentication middleware
☐ Add validation middleware
☐ Add error handling
☐ Add logging
☐ Add rate limiting

Security:
☐ Implement JWT/OAuth
☐ Add data encryption
☐ Implement HTTPS
☐ Add input sanitization
☐ Add CORS handling

Testing:
☐ Unit tests
☐ Integration tests
☐ Load testing
☐ Security testing
```

---

**Note**: هذا الملف يقدم البنية الأساسية للمرحلة الأولى. قد تحتاج لتعديلات بناءً على التكنولوجيا المختارة والمتطلبات الإضافية.

---

**Version**: 1.0  
**Status**: Ready for Backend Development  
**Last Updated**: 2024
