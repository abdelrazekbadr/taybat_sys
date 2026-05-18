تم تنفيذ خطة auth_implementation_plan.md (Mock-first + قابلة للاستبدال لاحقاً بـ Supabase) مع تجاهل Apple Auth، واعتماد إدخالات selection-first قدر الإمكان.

ما تم تنفيذه

- طبقة Auth (Mock-first) + Contracts

  - الأنواع: auth.types.ts + تصديرها من types/index.ts
  - مفاتيح التخزين: storageKeys.ts
  - واجهات API: api/auth/types.ts
  - Mock APIs: authApi.mock.ts , userApi.mock.ts , والتصدير عبر api/auth/index.ts
  - خدمة الأعمال: auth.service.ts
  - تأخير Mock: mockDelay.ts
- Zustand Auth Store + Route Guard

  - المتجر: auth.store.ts
  - Route guard في الجذر: app/_layout.tsx
  - Splash يعتمد initializeAuth + توجيه حسب الجلسة وHAS_SEEN_ONBOARDING: splash.tsx , ونسخة الويب: splash.web.tsx
  - Onboarding يضبط HAS_SEEN_ONBOARDING ويوجه إلى auth-decision: onboarding.tsx
- شاشات Auth (بدون Apple)

  - التسجيل/الدخول/القرار/إعادة تعيين/إكمال الملف:
    - auth-decision.tsx
    - login.tsx
    - signup.tsx
    - reset-password.tsx
    - complete-profile.tsx
  - تسجيل المسارات داخل (auth): app/(auth)/_layout.tsx
- Selection-first في إدخالات الملف الشخصي

  - Chips للجنس/النشاط/الأهداف + مودالات اختيار لسنة الميلاد/الوزن/الطول:
    - ProfileStepBasic.tsx
    - ProfileStepHealth.tsx
    - ProfileStepGoals.tsx
    - مكونات مساعدة: ChipSelector.tsx , SelectionModal.tsx , StepIndicator.tsx
  - زر Google فقط (Apple متجاهل): SocialAuthButtons.tsx
- Guest Gate (Soft Gate)

  - Hook + Store + Sheet:
    - useAuthGate.ts
    - authGate.store.ts
    - AuthGateSheet.tsx
  - إدراج الشيت في (main): app/(main)/_layout.tsx
  - ربط الحماية على الأقل بـ:
    - تسجيل الوجبة: select-meal.tsx
    - تفضيل الوجبات: meal-preferences.tsx
      الترجمة (i18n)
- إضافة مفاتيح auth إلى: ar.json و en.json
  تحديث حالة الخطة
- تم تحديث سجل “Recent Updates” بإضافة إنجاز auth flow في: 0.1_app_overview.md
  التحقق
- تم تشغيل npm run lint و npm run typecheck بنجاح.
