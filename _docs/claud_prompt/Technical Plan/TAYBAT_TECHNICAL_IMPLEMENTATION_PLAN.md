# 🚀 AL-TAYEBAT APP - TECHNICAL IMPLEMENTATION PLAN
## Complete Technical Specification for React Native Mobile Application

**Version**: 1.0  
**Date**: January 2024  
**Status**: Ready for Development  
**Platform**: React Native (iOS & Android)  
**Backend**: Supabase (PostgreSQL + Real-time)  
**State Management**: Zustand  
**Localization**: i18n-js (Arabic RTL-first)

---

## 📋 TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Layer Specifications](#layer-specifications)
5. [Authentication Flow](#authentication-flow)
6. [Screen Specifications](#screen-specifications)
7. [Data Flow & Integration](#data-flow--integration)
8. [API Integration](#api-integration)
9. [Error Handling & Validation](#error-handling--validation)
10. [Performance Optimization](#performance-optimization)
11. [Testing Strategy](#testing-strategy)
12. [Deployment Plan](#deployment-plan)

---

## 🏗️ ARCHITECTURE OVERVIEW

### Application Layers Architecture

```
┌─────────────────────────────────────────────┐
│           UI LAYER (Screens)                │
│  ┌──────────────────────────────────────┐   │
│  │ Splash  │ Onboarding │ Auth │ Main   │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│      STATE MANAGEMENT LAYER (Zustand)       │
│  ┌──────────────────────────────────────┐   │
│  │ authStore │ userStore │ mealStore │   │   │
│  │ analyticsStore │ uiStore            │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│      SERVICE LAYER (Business Logic)         │
│  ┌──────────────────────────────────────┐   │
│  │ AuthService  │ UserService           │   │
│  │ MealService  │ AnalyticsService      │   │
│  │ NotificationService                  │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│    SUPABASE CLIENT LAYER (API Calls)        │
│  ┌──────────────────────────────────────┐   │
│  │ Supabase Auth │ Supabase DB          │   │
│  │ Supabase Realtime                    │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────┐
│         EXTERNAL SERVICES LAYER             │
│  ┌──────────────────────────────────────┐   │
│  │ Google Auth │ Facebook Auth          │   │
│  │ Apple Auth  │ Push Notifications     │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

---

## 💻 TECHNOLOGY STACK

### Frontend
- **Framework**: React Native 0.72+
- **Language**: TypeScript 5.0+
- **Navigation**: React Navigation 6.x
- **State Management**: Zustand 4.4+
- **Localization**: i18n-js 4.x (Arabic RTL-first)
- **Forms**: React Hook Form 7.x
- **Validation**: Zod 3.x
- **HTTP Client**: Axios 1.4+
- **UI Components**: React Native Paper (Material Design)
- **Icons**: React Native Vector Icons
- **Charts**: Victory Native (for analytics)
- **Storage**: React Native AsyncStorage

### Backend
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email, Google, Facebook, Apple)
- **Real-time**: Supabase Realtime
- **File Storage**: Supabase Storage
- **API**: RESTful + Real-time subscriptions

### Development Tools
- **Package Manager**: npm or yarn
- **Build Tool**: Metro
- **Testing**: Jest + Detox
- **Linting**: ESLint
- **Code Formatting**: Prettier
- **Git Hooks**: Husky
- **Version Control**: Git

---

## 📁 PROJECT STRUCTURE

```
al-tayebat-app/
├── .env.example                    # Environment variables template
├── .eslintrc.js                    # ESLint configuration
├── .prettierrc.js                  # Prettier configuration
├── app.json                        # React Native configuration
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript configuration
│
├── src/
│   ├── screens/
│   │   ├── Splash/
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── SplashScreen.styles.ts
│   │   │   └── SplashScreen.test.tsx
│   │   │
│   │   ├── Auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── SignUpScreen.tsx
│   │   │   ├── SocialAuthScreen.tsx
│   │   │   └── CompleteProfileScreen.tsx
│   │   │
│   │   ├── Onboarding/
│   │   │   ├── OnboardingScreen1.tsx
│   │   │   ├── OnboardingScreen2.tsx
│   │   │   ├── OnboardingScreen3.tsx
│   │   │   ├── OnboardingScreen4.tsx
│   │   │   └── OnboardingNavigator.tsx
│   │   │
│   │   ├── Main/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── LibraryScreen.tsx
│   │   │   ├── ScheduleScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── SettingsScreen.tsx
│   │   │
│   │   └── MainNavigator.tsx
│   │
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── userStore.ts
│   │   ├── mealStore.ts
│   │   ├── analyticsStore.ts
│   │   ├── uiStore.ts
│   │   └── index.ts
│   │
│   ├── services/
│   │   ├── authService.ts
│   │   ├── userService.ts
│   │   ├── mealService.ts
│   │   ├── analyticsService.ts
│   │   ├── notificationService.ts
│   │   └── index.ts
│   │
│   ├── api/
│   │   ├── supabaseClient.ts
│   │   ├── authApi.ts
│   │   ├── userApi.ts
│   │   ├── mealsApi.ts
│   │   └── analyticsApi.ts
│   │
│   ├── components/
│   │   ├── UI/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   │
│   │   ├── Layouts/
│   │   │   ├── MainLayout.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   └── BottomTabNavigator.tsx
│   │   │
│   │   └── Common/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── ErrorBoundary.tsx
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useUser.ts
│   │   ├── useMeals.ts
│   │   ├── useAnalytics.ts
│   │   └── useLocalization.ts
│   │
│   ├── utils/
│   │   ├── validation.ts
│   │   ├── formatting.ts
│   │   ├── dateHelpers.ts
│   │   ├── constants.ts
│   │   └── errorHandler.ts
│   │
│   ├── localization/
│   │   ├── i18n.ts
│   │   ├── translations/
│   │   │   ├── ar.json
│   │   │   └── en.json
│   │   └── index.ts
│   │
│   ├── types/
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── meals.ts
│   │   ├── analytics.ts
│   │   └── api.ts
│   │
│   ├── styles/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── theme.ts
│   │
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── types.ts
│   │
│   └── App.tsx
│
├── __tests__/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── README.md
```

---

## 🔧 LAYER SPECIFICATIONS

### 1️⃣ UI LAYER (Screens)

#### Layer Responsibility
- Display user interfaces
- Handle user interactions (taps, swipes, text input)
- Call Zustand store for data and actions
- Show loading/error states
- Navigate between screens

#### Key Screens to Implement

```typescript
// src/screens/Splash/SplashScreen.tsx
export const SplashScreen: React.FC = () => {
  useEffect(() => {
    // Check if user is authenticated
    // Redirect to appropriate screen after 2-3 seconds
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <AppLogo />
      <LoadingSpinner />
    </SafeAreaView>
  );
};
```

---

### 2️⃣ STATE MANAGEMENT LAYER (Zustand)

#### Layer Responsibility
- Maintain global app state
- Handle state mutations
- Persist user preferences
- Manage async operations

#### Store Implementation Example

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  authToken: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      error: null,
      authToken: null,
      
      setUser: (user) => set({ user }),
      setAuthToken: (token) => set({ authToken: token }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      logout: () => set({ user: null, authToken: null }),
      reset: () => set({
        user: null,
        isLoading: false,
        error: null,
        authToken: null,
      }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        authToken: state.authToken,
        user: state.user,
      }),
    }
  )
);
```

#### Required Stores
1. **authStore** - Authentication state, tokens, user session
2. **userStore** - User profile, preferences, health data
3. **mealStore** - Meals, meal plans, meal history
4. **analyticsStore** - Weekly/monthly analytics, progress
5. **uiStore** - UI state, modals, notifications

---

### 3️⃣ SERVICE LAYER (Business Logic)

#### Layer Responsibility
- Implement business logic
- Coordinate between API calls and stores
- Handle data transformations
- Manage side effects

#### Service Implementation Example

```typescript
// src/services/authService.ts
import { supabase } from '../api/supabaseClient';
import { useAuthStore } from '../store/authStore';

export class AuthService {
  // Custom email/password registration
  static async registerWithEmail(
    email: string,
    password: string,
    firstName: string
  ) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Store user in database
      await supabase.from('users').insert({
        id: data.user?.id,
        email,
        first_name: firstName,
      });
      
      return data.user;
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  }
  
  // Google OAuth registration/login
  static async loginWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Google login failed: ${error.message}`);
    }
  }
  
  // Facebook OAuth registration/login
  static async loginWithFacebook() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Facebook login failed: ${error.message}`);
    }
  }
  
  // Apple OAuth registration/login
  static async loginWithApple() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Apple login failed: ${error.message}`);
    }
  }
  
  // Logout
  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      useAuthStore.getState().logout();
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }
}

export default AuthService;
```

#### Required Services
1. **authService** - Authentication operations
2. **userService** - User profile operations
3. **mealService** - Meal management
4. **analyticsService** - Analytics & reporting
5. **notificationService** - Push notifications

---

### 4️⃣ SUPABASE CLIENT LAYER (API Integration)

#### Layer Responsibility
- Communicate with Supabase backend
- Handle authentication tokens
- Manage real-time subscriptions
- Handle network errors

#### Supabase Client Setup

```typescript
// src/api/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Initialize auth state
export async function initializeAuth() {
  const { data, error } = await supabase.auth.getSession();
  
  if (error) {
    console.error('Auth initialization failed:', error);
  }
  
  return data?.session;
}
```

---

## 🔐 AUTHENTICATION FLOW

### Overview
The app supports 4 authentication methods:
1. ✅ Gmail/Google OAuth
2. ✅ Facebook OAuth
3. ✅ Apple OAuth
4. ✅ Custom Email/Password Registration

### Authentication State Machine

```
┌─────────────┐
│   Splash    │
│   Screen    │
└──────┬──────┘
       ↓
    Check Session
       ├─ Has Valid Token → Go to Main App
       ├─ No Session → Go to Auth
       └─ Expired → Go to Login
       ↓
┌──────────────────────────────────────┐
│   Auth Decision Screen (3 Options)    │
├──────────────────────────────────────┤
│  [Sign Up] [Have Account? Login]     │
│  [Skip for Now - Browse App]         │
└──────┬───────────────────────────────┘
       ├─→ Sign Up Path
       ├─→ Login Path
       └─→ Skip Path
```

---

## 📱 SCREEN SPECIFICATIONS

### 1. SPLASH SCREEN (Analysis & Implementation)

#### Purpose
- Display app logo and branding
- Initialize app state
- Check authentication status
- Auto-navigate based on session

#### Technical Requirements

```typescript
// Specifications
- Duration: 2-3 seconds
- Display: App logo, brand name (الطيبات)
- Loading indicator: Animated spinner
- Background: Gradient (Emerald to Teal)
- Auto-navigate: Based on auth state

// Implementation Checklist
✓ Initialize Supabase client
✓ Check existing authentication session
✓ Load user preferences from AsyncStorage
✓ Initialize localization
✓ Setup analytics tracking
✓ Navigate to appropriate screen (Auth/Main/Onboarding)
```

#### Code Structure

```typescript
// src/screens/Splash/SplashScreen.tsx
import React, { useEffect } from 'react';
import { View, ActivityIndicator, SafeAreaView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { initializeAuth } from '../../api/supabaseClient';
import { useNavigation } from '@react-navigation/native';

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation();
  const { setAuthToken, setUser } = useAuthStore();
  
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check existing session
        const session = await initializeAuth();
        
        if (session) {
          setAuthToken(session.access_token);
          // Navigate to Main App
          navigation.navigate('MainNavigator');
        } else {
          // Navigate to Auth (Check if first-time user)
          // If first-time: show Onboarding
          // If has account: show Login
          navigation.navigate('AuthNavigator');
        }
      } catch (error) {
        console.error('Initialization error:', error);
        navigation.navigate('AuthNavigator');
      }
    };
    
    // Delay for 2-3 seconds
    const timer = setTimeout(() => {
      initialize();
    }, 2500);
    
    return () => clearTimeout(timer);
  }, [navigation, setAuthToken, setUser]);
  
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#10B981" />
    </SafeAreaView>
  );
};
```

---

### 2. ONBOARDING SCREENS (Analysis - 4 Screens)

#### Screen 1: Welcome & Purpose
- Title: "اسمع جسدك، لا تعد السعرات" (Listen to your body, don't count calories)
- Content: Brief explanation of Al-Tayebat system
- Action: "التالي" (Next) button
- Visual: Illustration of person listening to body signals

#### Screen 2: Benefits
- Title: "تتبع تحسنك" (Track your improvement)
- Content: What the app helps with (digestion, energy, mood)
- Action: "التالي" (Next) button
- Visual: Progress charts/metrics illustration

#### Screen 3: How It Works
- Title: "كيف يعمل التطبيق" (How the app works)
- Content: Simple 3-step process
- Action: "التالي" (Next) button
- Visual: Step-by-step illustration

#### Screen 4: Get Started
- Title: "جاهز للبدء؟" (Ready to start?)
- Actions:
  - "إنشاء حساب" (Create Account) → Sign Up
  - "لدي حساب بالفعل" (Already have account) → Login
  - "تصفح التطبيق أولاً" (Browse app first) → Skip to Main
- Visual: Food/health imagery

#### Implementation Strategy

```typescript
// src/screens/Onboarding/OnboardingScreen1.tsx
interface OnboardingScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

export const OnboardingScreen1: React.FC<OnboardingScreenProps> = ({
  onNext,
  onSkip,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <Header onClose={onSkip} />
      <ScrollView>
        <OnboardingIllustration />
        <Title text="اسمع جسدك، لا تعد السعرات" />
        <Description text="نظام الطيبات يركز على الاستماع لإشارات جسدك الحقيقية" />
        <FeatureList features={features} />
      </ScrollView>
      <BottomActions>
        <Button text="التالي" onPress={onNext} />
      </BottomActions>
    </SafeAreaView>
  );
};

// Store navigation state using Zustand
export const useOnboardingStore = create((set) => ({
  currentStep: 0,
  nextStep: () => set((state) => ({ currentStep: state.currentStep + 1 })),
  skipOnboarding: () => set({ currentStep: 4 }),
}));
```

---

### 3. SIGN-UP SCREEN (Analysis - 4 Options)

#### Option 1: Gmail/Google OAuth
```
┌────────────────────────┐
│  Sign Up with Google   │
│  ┌──────────────────┐  │
│  │ [Google Icon]    │  │
│  │ Continue with    │  │
│  │ Google           │  │
│  └──────────────────┘  │
└────────────────────────┘
```

#### Option 2: Facebook OAuth
```
┌────────────────────────┐
│ Sign Up with Facebook  │
│  ┌──────────────────┐  │
│  │ [FB Icon]        │  │
│  │ Continue with    │  │
│  │ Facebook         │  │
│  └──────────────────┘  │
└────────────────────────┘
```

#### Option 3: Apple OAuth
```
┌────────────────────────┐
│  Sign Up with Apple    │
│  ┌──────────────────┐  │
│  │ [Apple Icon]     │  │
│  │ Continue with    │  │
│  │ Apple            │  │
│  └──────────────────┘  │
└────────────────────────┘
```

#### Option 4: Custom Email/Password Registration
```
┌────────────────────────┐
│   Create an Account    │
│                        │
│  [Email Input]         │
│  [Password Input]      │
│  [Confirm Pass Input]  │
│                        │
│  [Sign Up Button]      │
│  [Skip for Now Button] │
└────────────────────────┘
```

#### Sign-Up Flow

```
Start: SocialAuthScreen (Choose method)
  ├─ OAuth (Google/Facebook/Apple)
  │   └─ Supabase OAuth redirect
  │       └─ User grants permission
  │           └─ Account created
  │               └─ Go to CompleteProfileScreen
  │
  └─ Custom Email/Password
      └─ Enter email & password
          └─ Validate & create account
              └─ Go to CompleteProfileScreen
                  └─ Enter: Name, Age, Weight, Gender, Complaints
                      └─ Save preferences
                          └─ Complete profile
                              └─ Go to Meal Preferences Setup
                                  └─ Select available foods
                                      └─ Go to Main App
```

#### Implementation

```typescript
// src/screens/Auth/SignUpScreen.tsx
export const SignUpScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleGoogleSignUp = async () => {
    // Call Google OAuth
    const result = await AuthService.loginWithGoogle();
    // Navigate to CompleteProfile
  };
  
  const handleCustomSignUp = async () => {
    // Validate inputs
    // Call AuthService.registerWithEmail(email, password)
    // Navigate to CompleteProfile
  };
  
  const handleSkipForNow = () => {
    // Allow browsing app as guest
    // Save flag in AsyncStorage
    // Navigate to Main App with limited access
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="إنشاء حساب" />
      
      <ScrollView>
        {/* OAuth Options */}
        <OAuthButton
          provider="google"
          onPress={handleGoogleSignUp}
        />
        <OAuthButton
          provider="facebook"
          onPress={() => AuthService.loginWithFacebook()}
        />
        <OAuthButton
          provider="apple"
          onPress={() => AuthService.loginWithApple()}
        />
        
        {/* OR Divider */}
        <Divider text="أو" />
        
        {/* Custom Registration */}
        <TextInput
          placeholder="البريد الإلكتروني"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          placeholder="كلمة المرور"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <Button
          text="إنشاء حساب"
          onPress={handleCustomSignUp}
        />
        
        <Button
          text="تصفح التطبيق أولاً"
          variant="ghost"
          onPress={handleSkipForNow}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
```

---

### 4. COMPLETE PROFILE SCREEN (Multi-Step)

After user creates account (OAuth or Email), they need to complete profile.

#### Step 1: Basic Information
```
┌──────────────────────────┐
│  أكمل بيانات حسابك        │
├──────────────────────────┤
│                          │
│  [الاسم الأول]           │
│  [اسم العائلة]           │
│  [رقم الهاتف - اختياري]  │
│                          │
│  [التالي]                │
└──────────────────────────┘
```

#### Step 2: Health Information
```
┌──────────────────────────┐
│  بيانات صحتك             │
├──────────────────────────┤
│                          │
│  [الجنس] ♀/♂            │
│  [العمر]                 │
│  [الوزن] كغ             │
│  [الطول] سم             │
│                          │
│  [التالي]                │
└──────────────────────────┘
```

#### Step 3: Medical Complaints
```
┌──────────────────────────┐
│  هل تعاني من؟           │
├──────────────────────────┤
│                          │
│  ☐ الانتفاخ والغازات    │
│  ☐ التعب والإرهاق       │
│  ☐ الإمساك              │
│  ☐ الصداع               │
│  ☐ أخرى (نص حر)        │
│                          │
│  [التالي]                │
└──────────────────────────┘
```

#### Step 4: Subscription Goal
```
┌──────────────────────────┐
│  لماذا تنضم للتطبيق؟     │
├──────────────────────────┤
│                          │
│  (Radio Buttons)         │
│  ◉ تحسين الهضم          │
│  ○ فقدان الوزن          │
│  ○ علاج الالتهاب        │
│  ○ نمط حياة صحي عام     │
│  ○ أخرى                 │
│                          │
│  [اكتمل الإعداد]         │
└──────────────────────────┘
```

#### Implementation

```typescript
// src/screens/Auth/CompleteProfileScreen.tsx
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import UserService from '../../services/userService';

export const CompleteProfileScreen: React.FC = () => {
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    gender: '',
    age: '',
    weight: '',
    height: '',
    complaints: [],
    subscriptionGoal: '',
  });
  
  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Save complete profile to Supabase
      await UserService.completeProfile(profileData);
      // Navigate to Meal Preferences
      navigation.navigate('MealPreferencesScreen');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ProgressBar currentStep={step} totalSteps={4} />
      
      {step === 1 && <BasicInfoForm />}
      {step === 2 && <HealthInfoForm />}
      {step === 3 && <ComplaintsForm />}
      {step === 4 && <SubscriptionGoalForm />}
      
      <Button text="التالي" onPress={handleNext} />
    </SafeAreaView>
  );
};
```

---

### 5. SKIP FOR NOW LOGIC

If user selects "Skip for Now":
1. User can browse app in **limited mode**
2. Can view:
   - Library (allowed/forbidden foods)
   - Sample meal plans
   - How the system works
3. Cannot:
   - Track meals
   - View analytics
   - Get personalized recommendations
4. Show persistent CTA: "اكتمل ملفك الآن" (Complete your profile)
5. Allow completing profile anytime from Settings

---

### 6. LOGIN SCREEN

For returning users.

```typescript
// src/screens/Auth/LoginScreen.tsx
export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleEmailLogin = async () => {
    const { user, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (user) {
      // Navigate to Main App
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Title text="تسجيل الدخول" />
      
      <TextInput placeholder="البريد الإلكتروني" />
      <TextInput placeholder="كلمة المرور" secureTextEntry />
      
      <Button text="دخول" onPress={handleEmailLogin} />
      
      <Link text="لا تملك حساباً؟ سجل الآن" />
      <Link text="هل نسيت كلمة المرور؟" />
    </SafeAreaView>
  );
};
```

---

### 7. MAIN APP LAYOUT

After authentication, show main app with bottom tab navigation.

```typescript
// src/navigation/MainNavigator.tsx
export const MainNavigator: React.FC = () => {
  return (
    <BottomTabNavigator
      screens={[
        {
          name: 'Home',
          component: HomeScreen,
          icon: 'home',
          label: 'الرئيسية',
        },
        {
          name: 'Library',
          component: LibraryScreen,
          icon: 'library-books',
          label: 'المكتبة',
        },
        {
          name: 'Schedule',
          component: ScheduleScreen,
          icon: 'calendar',
          label: 'الجدول',
        },
        {
          name: 'Profile',
          component: ProfileScreen,
          icon: 'account-circle',
          label: 'الملف',
        },
        {
          name: 'Settings',
          component: SettingsScreen,
          icon: 'cog',
          label: 'الإعدادات',
        },
      ]}
    />
  );
};
```

---

## 🌍 LOCALIZATION (Multi-Language & RTL)

### i18n Setup

```typescript
// src/localization/i18n.ts
import i18n from 'i18n-js';
import { I18nManager } from 'react-native';

// Import translations
import ar from './translations/ar.json';
import en from './translations/en.json';

i18n.translations = { ar, en };
i18n.locale = 'ar'; // Default to Arabic
i18n.defaultLocale = 'ar';
i18n.enableFallback = true;

// Enable RTL for Arabic
if (i18n.locale === 'ar') {
  I18nManager.forceRTL(true);
  I18nManager.allowRTL(true);
}

export default i18n;
```

### Translation Structure

```json
// src/localization/translations/ar.json
{
  "screens": {
    "splash": {
      "title": "الطيبات"
    },
    "onboarding": {
      "screen1": {
        "title": "اسمع جسدك، لا تعد السعرات",
        "description": "نظام الطيبات يركز على..."
      }
    }
  },
  "buttons": {
    "next": "التالي",
    "skip": "تخطي",
    "signup": "إنشاء حساب"
  }
}
```

### Usage in Components

```typescript
// Usage
const title = i18n.t('screens.onboarding.screen1.title');

// Custom hook
export const useTranslation = () => {
  const [language, setLanguage] = useState(i18n.locale);
  
  const translate = (key: string) => i18n.t(key);
  
  return { translate, language, setLanguage };
};
```

---

## 🔄 DATA FLOW & INTEGRATION

### User Registration Flow

```typescript
// 1. User selects Google OAuth
SignUpScreen
  → AuthService.loginWithGoogle()
    → supabase.auth.signInWithOAuth('google')
      → Redirect to Google consent
        → User grants permission
          → Supabase creates/updates auth user
            → useAuthStore.setUser(user)
              → useAuthStore.setAuthToken(token)
                → Navigate to CompleteProfileScreen

// 2. Service completes profile
CompleteProfileScreen
  → handleNext()
    → UserService.completeProfile(data)
      → supabase.from('users').update(data)
        → useUserStore.setProfile(data)
          → Navigate to MealPreferencesScreen
            → MealPreferencesScreen
              → Select available foods
                → Navigate to MainNavigator
```

### State Updates Flow

```
UI Layer (Screen)
  ↓ User Action (onPress, onChange)
  ↓
Service Layer (AuthService.loginWithGoogle)
  ↓ Async Call
  ↓
Supabase Client (supabase.auth)
  ↓ Response
  ↓
Service Layer (Update Store)
  ↓
Zustand Store (useAuthStore.setUser)
  ↓
UI Layer (useAuthStore Hook)
  ↓
Re-render with new data
```

---

## 🌐 API INTEGRATION

### Authentication API

```typescript
// src/api/authApi.ts

export const authApi = {
  // Email/Password Registration
  registerWithEmail: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  },
  
  // Email/Password Login
  loginWithEmail: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },
  
  // OAuth
  loginWithGoogle: async () => {
    return await supabase.auth.signInWithOAuth({ provider: 'google' });
  },
  
  loginWithFacebook: async () => {
    return await supabase.auth.signInWithOAuth({ provider: 'facebook' });
  },
  
  loginWithApple: async () => {
    return await supabase.auth.signInWithOAuth({ provider: 'apple' });
  },
  
  // Logout
  logout: async () => {
    return await supabase.auth.signOut();
  },
  
  // Get current session
  getSession: async () => {
    return await supabase.auth.getSession();
  },
};
```

### User API

```typescript
// src/api/userApi.ts

export const userApi = {
  // Complete profile
  completeProfile: async (userId: string, profileData: any) => {
    const { data, error } = await supabase
      .from('users')
      .update(profileData)
      .eq('id', userId);
    
    return { data, error };
  },
  
  // Get user profile
  getUserProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    return { data, error };
  },
  
  // Update preferences
  updatePreferences: async (userId: string, preferences: any) => {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
      });
    
    return { data, error };
  },
};
```

---

## ⚠️ ERROR HANDLING & VALIDATION

### Input Validation

```typescript
// src/utils/validation.ts
import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be 8+ characters');

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  }
);

// Usage
try {
  const validated = signUpSchema.parse(formData);
} catch (error) {
  // Show validation errors
}
```

### Error Handling

```typescript
// src/utils/errorHandler.ts

export const handleApiError = (error: any): string => {
  if (error.message.includes('User already registered')) {
    return 'البريد الإلكتروني مستخدم بالفعل';
  }
  
  if (error.message.includes('Invalid login')) {
    return 'البريد أو كلمة المرور غير صحيحة';
  }
  
  return 'حدث خطأ ما. حاول لاحقاً';
};

// Usage in Services
try {
  await authService.login(email, password);
} catch (error) {
  const errorMessage = handleApiError(error);
  useAuthStore.setState({ error: errorMessage });
}
```

---

## ⚡ PERFORMANCE OPTIMIZATION

### Lazy Loading

```typescript
// src/navigation/RootNavigator.tsx
import { lazy, Suspense } from 'react';

const HomeScreen = lazy(() => import('../screens/Main/HomeScreen'));
const SettingsScreen = lazy(() => import('../screens/Main/SettingsScreen'));

export const RootNavigator = () => (
  <Suspense fallback={<LoadingSpinner />}>
    {/* Navigation */}
  </Suspense>
);
```

### Memoization

```typescript
// src/components/MealCard.tsx
import React, { memo } from 'react';

export const MealCard = memo(({ meal, onPress }: Props) => {
  return (
    <TouchableOpacity onPress={onPress}>
      {/* Card content */}
    </TouchableOpacity>
  );
}, (prev, next) => prev.meal.id === next.meal.id);
```

### Caching Strategy

```typescript
// Cache API responses in Zustand
const useMealStore = create((set) => ({
  meals: [],
  cachedAt: null,
  
  fetchMeals: async () => {
    // Check if cache is fresh (< 1 hour)
    if (cachedAt && Date.now() - cachedAt < 3600000) {
      return meals;
    }
    
    // Fetch from API
    const data = await mealsApi.getMeals();
    set({ meals: data, cachedAt: Date.now() });
  },
}));
```

---

## 🧪 TESTING STRATEGY

### Unit Tests

```typescript
// __tests__/unit/authService.test.ts
import { AuthService } from '../../src/services/authService';

describe('AuthService', () => {
  it('should register user with email', async () => {
    const user = await AuthService.registerWithEmail(
      'test@example.com',
      'password123',
      'Test'
    );
    
    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/authFlow.test.ts
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useAuthStore } from '../../src/store/authStore';
import { AuthService } from '../../src/services/authService';

describe('Authentication Flow', () => {
  it('should complete signup and set user in store', async () => {
    const { result } = renderHook(() => useAuthStore());
    
    await act(async () => {
      await AuthService.registerWithEmail(
        'test@example.com',
        'password123',
        'Test'
      );
    });
    
    await waitFor(() => {
      expect(result.current.user).toBeDefined();
    });
  });
});
```

### E2E Tests

```typescript
// __tests__/e2e/signup.test.ts
describe('Sign Up Flow E2E', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  
  it('should complete signup flow', async () => {
    // Navigate to sign up
    await element(by.text('Sign Up')).tap();
    
    // Enter email
    await element(by.id('emailInput')).typeText('test@example.com');
    
    // Enter password
    await element(by.id('passwordInput')).typeText('password123');
    
    // Submit
    await element(by.text('Create Account')).tap();
    
    // Verify navigation
    await waitFor(element(by.text('Complete Your Profile')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
```

---

## 📦 DEPLOYMENT PLAN

### Development Environment
```bash
npm install
npm start
# Runs Metro bundler
```

### Testing Before Release
```bash
npm test                 # Unit & integration tests
detox test e2e          # End-to-end tests
npm run lint            # Code quality
npm run type-check      # TypeScript
```

### Building

#### iOS
```bash
cd ios
pod install
cd ..
npx react-native run-ios --device
```

#### Android
```bash
npx react-native run-android
```

### Release Build

#### iOS
```bash
cd ios
xcodebuild -workspace Tayebat.xcworkspace \
  -scheme Tayebat \
  -configuration Release \
  -archivePath ./build/Tayebat.xcarchive
```

#### Android
```bash
cd android
./gradlew assembleRelease
```

### Distribution
- **App Store**: TestFlight → App Store
- **Google Play**: Internal Testing → Beta → Production

---

## 📋 IMPLEMENTATION TIMELINE

### Phase 1: Foundation (Week 1-2)
- ✅ Project setup & dependencies
- ✅ Supabase configuration
- ✅ Zustand stores setup
- ✅ Localization setup (i18n)

### Phase 2: Authentication (Week 2-3)
- ✅ Splash screen
- ✅ OAuth integration (Google, Facebook, Apple)
- ✅ Custom email/password registration
- ✅ Login screen
- ✅ Session persistence

### Phase 3: Onboarding (Week 3-4)
- ✅ 4 Onboarding screens
- ✅ Complete profile screens
- ✅ Meal preferences setup
- ✅ Skip for now logic

### Phase 4: Main App Screens (Week 4-5)
- ✅ Home screen (empty state)
- ✅ Library screen (empty state)
- ✅ Schedule screen (empty state)
- ✅ Profile screen (empty state)
- ✅ Settings screen (empty state)
- ✅ Bottom tab navigation

### Phase 5: Testing & Deployment (Week 5-6)
- ✅ Unit testing
- ✅ Integration testing
- ✅ E2E testing
- ✅ Bug fixes
- ✅ Build & submit

---

## 🎯 SUCCESS CRITERIA

✅ Users can sign up via 4 methods (Google, Facebook, Apple, Custom)  
✅ Users can complete profile with minimal data input  
✅ Users can skip signup and browse app  
✅ Proper RTL support for Arabic  
✅ Smooth navigation between screens  
✅ Error handling & validation working  
✅ All tests passing  
✅ App stores ready for submission  

---

## 📞 SUPPORT & NEXT STEPS

**Next Phase**: Implement detail screens (Home, Library, Schedule, Meals, Analytics) - TBD

**Questions**: Refer to this document or contact the development team

---

**Document Version**: 1.0  
**Last Updated**: January 2024  
**Status**: Ready for Implementation  

