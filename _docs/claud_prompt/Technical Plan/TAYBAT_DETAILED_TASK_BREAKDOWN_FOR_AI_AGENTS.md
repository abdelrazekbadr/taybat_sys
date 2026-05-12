# 🎯 AL-TAYEBAT APP - DETAILED TASK BREAKDOWN FOR AI AGENTS
## Implementation Tasks with Code Scaffolds & AI Prompts

**Version**: 1.0  
**Created**: January 2024  
**Purpose**: Break down technical implementation into task-focused units  
**Target**: AI Agent Implementation with Quality Focus  
**Total Tasks**: 45+ tasks across 6 phases

---

## 📋 OVERVIEW

This document provides:
✅ **Priority-ordered tasks** in sequence of implementation  
✅ **AI-friendly prompts** for each task  
✅ **Code scaffolds** (abstract without full implementation)  
✅ **Business scenarios** covered by each task  
✅ **Quality checklist** for each task  
✅ **Dependencies** between tasks  

---

# 🏗️ PHASE 1: PROJECT FOUNDATION (Week 1)

## TASK 1.1: Project Setup & Dependencies
**Priority**: 1 (First - blocking other tasks)  
**Time Estimate**: 4 hours  
**Status**: Ready to code

### Description
Initialize React Native project with TypeScript and install all required dependencies

### Business Scenarios Covered
- ✅ Project can run locally on iOS/Android
- ✅ All dev tools installed and configured
- ✅ Environment variables can be managed
- ✅ Code quality tools are in place

### AI Agent Prompt

```
TASK: Setup React Native Project with TypeScript and Dependencies

You are setting up a professional React Native application called "Al-Tayebat".

REQUIREMENTS:
1. Create React Native project with TypeScript template
2. Install these core dependencies:
   - Navigation: react-navigation, react-native-screens, react-native-safe-area-context
   - State Management: zustand
   - Forms: react-hook-form, zod
   - UI: react-native-paper, react-native-vector-icons
   - Localization: i18n-js
   - HTTP: axios
   - Storage: @react-native-async-storage/async-storage
   - Supabase: @supabase/supabase-js, @supabase/supabase-flutter

3. Setup dev dependencies:
   - Testing: jest, detox
   - Linting: eslint, prettier
   - Git: husky
   - Type checking: typescript

4. Create configuration files:
   - .env.example (with placeholder values)
   - .eslintrc.js (with strict rules)
   - .prettierrc.js (with formatting rules)
   - tsconfig.json (strict mode)

5. Create folder structure as specified in PROJECT STRUCTURE section

OUTPUT:
- Working React Native project that runs on simulator
- All dependencies properly installed
- Configuration files in place
- No errors in console
```

### Code Scaffold

```typescript
// package.json structure (pseudo-code)
{
  "name": "al-tayebat-app",
  "version": "1.0.0",
  "scripts": {
    "start": "react-native start",
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "jest"
  },
  "dependencies": {
    // All above dependencies listed
  },
  "devDependencies": {
    // All above dev dependencies
  }
}

// .env.example
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
GOOGLE_CLIENT_ID=google-client-id
FACEBOOK_APP_ID=facebook-app-id
APPLE_TEAM_ID=apple-team-id
API_TIMEOUT=30000

// tsconfig.json excerpt
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Quality Checklist
- [ ] `npm start` works without errors
- [ ] Project runs on iOS simulator
- [ ] Project runs on Android emulator
- [ ] All imports resolve correctly
- [ ] No TypeScript errors
- [ ] ESLint passes without warnings
- [ ] .env.example is clear and documented

### Dependencies
None (First task)

---

## TASK 1.2: Folder Structure & File Organization
**Priority**: 2 (Immediate - blocks other tasks)  
**Time Estimate**: 2 hours  
**Status**: Ready to code

### Description
Create complete folder structure and initialize core files

### Business Scenarios Covered
- ✅ Code is organized and scalable
- ✅ New features can be added easily
- ✅ Team members know where to find/put code
- ✅ Different concerns are separated

### AI Agent Prompt

```
TASK: Create Complete Folder Structure & Initialize Core Files

REQUIREMENTS:
1. Create folder structure exactly as specified in:
   - PROJECT STRUCTURE section (al-tayebat-app/)
   - All subfolders with proper hierarchy

2. Create these index files (barrel exports):
   - src/screens/index.ts (export all screens)
   - src/store/index.ts (export all stores)
   - src/services/index.ts (export all services)
   - src/api/index.ts (export all API modules)
   - src/components/index.ts (export all components)
   - src/hooks/index.ts (export all hooks)
   - src/utils/index.ts (export all utilities)
   - src/types/index.ts (export all types)

3. Create README files in major folders explaining purpose:
   - src/screens/README.md
   - src/store/README.md
   - src/services/README.md
   - src/api/README.md

4. Create placeholder files for each major module

5. Setup git
   - .gitignore
   - .git initialized
   - first commit

OUTPUT:
- Clean folder structure
- All index/barrel files created
- Clear documentation in each folder
- Git initialized
```

### Code Scaffold

```typescript
// src/screens/index.ts (barrel export)
export { SplashScreen } from './Splash/SplashScreen';
export { OnboardingScreen1 } from './Onboarding/OnboardingScreen1';
export { LoginScreen } from './Auth/LoginScreen';
export { SignUpScreen } from './Auth/SignUpScreen';
// ... export all screens

// src/store/index.ts
export { useAuthStore } from './authStore';
export { useUserStore } from './userStore';
export { useMealStore } from './mealStore';
export { useAnalyticsStore } from './analyticsStore';
export { useUIStore } from './uiStore';

// src/screens/README.md structure
/*
# Screens Folder

This folder contains all screen components.

## Structure
- Splash/ - Initial splash screen
- Auth/ - Authentication screens (Login, SignUp)
- Onboarding/ - Onboarding screens (4 screens)
- Main/ - Main app screens (Home, Library, etc)

## Adding a new screen
1. Create folder with screen name
2. Add [ScreenName].tsx
3. Add [ScreenName].styles.ts
4. Export from index.ts
*/

// .gitignore
node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
.idea/
.vscode/settings.json (keep .vscode/extensions.json)
android/build/
ios/Pods/
```

### Quality Checklist
- [ ] All folders exist as per specification
- [ ] All index.ts files properly export
- [ ] README files in major folders
- [ ] .gitignore configured
- [ ] Git initialized
- [ ] Folder structure is clean
- [ ] Easy to navigate

### Dependencies
- TASK 1.1 (Project Setup)

---

## TASK 1.3: Supabase Client Configuration
**Priority**: 3  
**Time Estimate**: 3 hours  
**Status**: Ready to code

### Description
Setup Supabase client, authentication, and real-time capabilities

### Business Scenarios Covered
- ✅ App can connect to Supabase backend
- ✅ Authentication is configured
- ✅ Real-time subscriptions work
- ✅ Environment variables are secure

### AI Agent Prompt

```
TASK: Setup Supabase Client & Configure Authentication

REQUIREMENTS:
1. Create src/api/supabaseClient.ts:
   - Initialize Supabase client with credentials from .env
   - Setup auth state listener
   - Export client for use in app
   - Handle connection errors gracefully

2. Create separate API modules:
   - src/api/authApi.ts (auth operations)
   - src/api/userApi.ts (user operations)
   - src/api/mealsApi.ts (meal operations)
   - src/api/analyticsApi.ts (analytics operations)

3. Configure authentication:
   - Setup OAuth providers (Google, Facebook, Apple)
   - Configure redirect URIs
   - Setup session management

4. Test connectivity:
   - Create health check function
   - Test database connection
   - Test auth endpoints

BUSINESS LOGIC:
- Handle connection failures gracefully
- Implement retry logic for failed requests
- Manage auth tokens securely
- Refresh tokens automatically

OUTPUT:
- Working Supabase connection
- All API modules properly setup
- Auth state managed correctly
- No sensitive data in code (all in .env)
```

### Code Scaffold

```typescript
// src/api/supabaseClient.ts (abstract)
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Initialize auth
export async function initializeAuth(): Promise<void> {
  // Listen to auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    // Handle auth changes
    // Update stores accordingly
  });
}

// Health check
export async function healthCheck(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count()', { count: 'exact', head: true });
    
    return !error;
  } catch (error) {
    return false;
  }
}

// src/api/authApi.ts (abstract structure)
export const authApi = {
  registerWithEmail: async (email: string, password: string) => {
    // Implementation
  },
  
  loginWithEmail: async (email: string, password: string) => {
    // Implementation
  },
  
  loginWithOAuth: async (provider: 'google' | 'facebook' | 'apple') => {
    // Implementation
  },
  
  logout: async () => {
    // Implementation
  },
  
  getSession: async () => {
    // Implementation
  }
};

// src/api/userApi.ts (abstract structure)
export const userApi = {
  completeProfile: async (userId: string, data: any) => {
    // Implementation
  },
  
  getUserProfile: async (userId: string) => {
    // Implementation
  },
  
  updatePreferences: async (userId: string, prefs: any) => {
    // Implementation
  }
};
```

### Quality Checklist
- [ ] Supabase client connects without errors
- [ ] Auth state listener works
- [ ] OAuth providers configured
- [ ] All API modules properly exported
- [ ] No credentials in code
- [ ] Error handling is implemented
- [ ] Health check passes

### Dependencies
- TASK 1.1, 1.2

---

## TASK 1.4: Zustand Store Architecture Setup
**Priority**: 4  
**Time Estimate**: 4 hours  
**Status**: Ready to code

### Description
Create all Zustand stores with proper structure and persistence

### Business Scenarios Covered
- ✅ Global state is managed consistently
- ✅ State persists across app restarts
- ✅ State updates are predictable
- ✅ Store structure is scalable

### AI Agent Prompt

```
TASK: Create Zustand Stores Architecture

REQUIREMENTS:
1. Create 5 main stores:
   - authStore (user auth state, tokens)
   - userStore (user profile, preferences, health data)
   - mealStore (meals, meal plans, tracking)
   - analyticsStore (progress metrics, analytics)
   - uiStore (UI state, modals, notifications)

2. For each store, implement:
   - State interface with TypeScript
   - Actions (setter methods)
   - Derived state (selectors)
   - Persistence layer (AsyncStorage)
   - Reset functionality

3. Store structure should follow pattern:
   ```
   interface [Store]State {
     // State properties
     actions: {
       // Action methods
     }
   }
   ```

4. Implement error handling:
   - Catch errors on state updates
   - Log errors for debugging
   - Graceful fallback

5. Create custom hooks for each store:
   - useAuth()
   - useUser()
   - useMeals()
   - useAnalytics()
   - useUI()

BUSINESS LOGIC:
- Auth state: tracks user, token, loading, errors
- User state: tracks profile, preferences, health
- Meal state: tracks current meals, plans, history
- Analytics state: tracks progress, metrics, insights
- UI state: tracks modals, notifications, loading

OUTPUT:
- All stores properly created
- All stores properly exported
- Persistence working
- Hooks created and exported
- No errors on initialization
```

### Code Scaffold

```typescript
// src/store/authStore.ts (abstract structure)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  // State
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
      // Initial state
      user: null,
      isLoading: false,
      error: null,
      authToken: null,
      
      // Actions
      setUser: (user) => set({ user }),
      setAuthToken: (token) => set({ authToken: token }),
      setLoading: (loading) => set({ isLoading: loading }),
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
        // Persist only needed data
        authToken: state.authToken,
        user: state.user,
      }),
    }
  )
);

// src/store/userStore.ts (similar pattern)
interface UserState {
  profile: UserProfile | null;
  preferences: UserPreferences | null;
  healthData: HealthData | null;
  
  setProfile: (profile: UserProfile) => void;
  setPreferences: (prefs: UserPreferences) => void;
  setHealthData: (data: HealthData) => void;
  // ... more actions
}

// src/hooks/useAuth.ts
export function useAuth() {
  const {
    user,
    isLoading,
    error,
    setUser,
    setLoading,
    setError,
    logout,
  } = useAuthStore();
  
  return {
    user,
    isLoading,
    error,
    setUser,
    setLoading,
    setError,
    logout,
  };
}

// Similar pattern for other hooks
```

### Quality Checklist
- [ ] All 5 stores created
- [ ] TypeScript interfaces defined
- [ ] Persistence working
- [ ] All hooks exported
- [ ] Store reset works
- [ ] No circular dependencies
- [ ] State updates are immutable
- [ ] Error handling implemented

### Dependencies
- TASK 1.1, 1.2, 1.3

---

# 🔐 PHASE 2: AUTHENTICATION (Week 2)

## TASK 2.1: Create Authentication Service
**Priority**: 5 (Critical - blocks other features)  
**Time Estimate**: 5 hours  
**Status**: Ready to code

### Description
Implement all authentication logic (Email, Google, Facebook, Apple)

### Business Scenarios Covered
- ✅ Users can register with email/password
- ✅ Users can login with email/password
- ✅ Users can sign up with Google OAuth
- ✅ Users can sign up with Facebook OAuth
- ✅ Users can sign up with Apple OAuth
- ✅ Session management works
- ✅ Error handling for auth failures

### AI Agent Prompt

```
TASK: Implement Complete Authentication Service

REQUIREMENTS:
1. Create AuthService class with these methods:
   - registerWithEmail(email, password, firstName)
   - loginWithEmail(email, password)
   - loginWithGoogle()
   - loginWithFacebook()
   - loginWithApple()
   - logout()
   - refreshToken()
   - getSession()

2. Each method should:
   - Validate input (use Zod schemas)
   - Call appropriate authApi
   - Update authStore on success
   - Handle errors appropriately
   - Return proper response objects

3. Implement error handling:
   - User already exists
   - Invalid credentials
   - Network errors
   - OAuth consent declined

4. Session management:
   - Store tokens securely
   - Refresh tokens automatically
   - Clear tokens on logout

BUSINESS LOGIC:
- OAuth: Redirect to provider → User consents → Supabase handles → Create account
- Email: Validate email format → Hash password → Create user → Verify email
- Session: Store token in AsyncStorage → Use for API requests → Refresh on expiry

SCENARIOS:
1. User signs up with email → Account created → Email verification sent
2. User signs up with Google → Google login page → Account created automatically
3. User tries to login with wrong password → Error shown → Can retry
4. User's token expires → Auto-refresh happens → User doesn't notice
5. User logs out → Token cleared → Redirect to login

OUTPUT:
- AuthService exported and ready to use
- All auth flows work
- Error messages are user-friendly
- No sensitive data logged
```

### Code Scaffold

```typescript
// src/services/authService.ts (abstract)
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import { emailSchema, passwordSchema } from '../utils/validation';

export class AuthService {
  // Register with email/password
  static async registerWithEmail(
    email: string,
    password: string,
    firstName: string
  ): Promise<{ success: boolean; user?: any; error?: string }> {
    try {
      // Validate inputs
      // emailSchema.parse(email);
      // passwordSchema.parse(password);
      
      // Call API
      // const { data, error } = await authApi.registerWithEmail(...);
      
      // Update store
      // useAuthStore.getState().setUser(user);
      // useAuthStore.getState().setAuthToken(token);
      
      // Return response
      // return { success: true, user };
    } catch (error) {
      // Handle error
      // return { success: false, error: handleError(error) };
    }
  }

  // Login with email/password
  static async loginWithEmail(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: any; error?: string }> {
    // Similar structure
  }

  // Login with OAuth
  static async loginWithGoogle(): Promise<{ success: boolean; error?: string }> {
    // OAuth flow
  }

  static async loginWithFacebook(): Promise<{ success: boolean; error?: string }> {
    // OAuth flow
  }

  static async loginWithApple(): Promise<{ success: boolean; error?: string }> {
    // OAuth flow
  }

  // Logout
  static async logout(): Promise<void> {
    // Clear tokens
    // Call API
    // Update store
  }

  // Session management
  static async getSession() {
    // Check if session exists
    // Return session or null
  }

  static async refreshToken(): Promise<boolean> {
    // Refresh expired token
    // Update store
    // Return success
  }
}

// src/utils/validation.ts (abstract)
import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z
  .string()
  .min(8, 'Password must be 8+ characters')
  .regex(/[A-Z]/, 'Must include uppercase')
  .regex(/[0-9]/, 'Must include number');

export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(2),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string(),
});
```

### Quality Checklist
- [ ] All auth methods implemented
- [ ] Input validation works
- [ ] Error messages are clear
- [ ] OAuth providers configured
- [ ] Tokens stored securely
- [ ] Logout clears everything
- [ ] Session persistence works
- [ ] No console.log with secrets

### Dependencies
- TASK 1.3, 1.4

---

## TASK 2.2: Splash Screen Implementation
**Priority**: 6  
**Time Estimate**: 3 hours  
**Status**: Ready to code

### Description
Create splash screen that checks auth state and navigates accordingly

### Business Scenarios Covered
- ✅ App shows splash for 2-3 seconds
- ✅ App checks for existing session
- ✅ Navigates to Main if authenticated
- ✅ Navigates to Auth if not authenticated
- ✅ Shows branding/logo clearly

### AI Agent Prompt

```
TASK: Create Splash Screen

REQUIREMENTS:
1. Create SplashScreen component:
   - Display app logo/name "الطيبات"
   - Show loading spinner
   - Beautiful background (gradient Emerald to Teal)

2. On mount, implement flow:
   - Initialize Supabase
   - Check for existing session
   - Load user preferences from storage
   - Check onboarding status
   - Decide where to navigate

3. Navigation logic:
   ```
   Check Auth Session
   ├─ Valid Token Found
   │  ├─ Check Onboarding Status
   │  └─ Navigate to Main or Onboarding
   ├─ No Token Found
   │  ├─ Check if First Time
   │  ├─ Show Onboarding if yes
   │  └─ Show Auth if no
   └─ Error
      └─ Retry or Show Error Screen
   ```

4. Styling:
   - Gradient background
   - Centered logo/name
   - Loading spinner (animated)
   - Safe area padding
   - RTL support

5. Error handling:
   - Handle Supabase connection failures
   - Retry logic for failed checks
   - Fallback navigation

BUSINESS SCENARIOS:
1. First-time user → Shows onboarding
2. Returning user with valid token → Goes to main app
3. Returning user, token expired → Goes to login
4. Network error → Shows error with retry
5. Token refresh needed → Refreshes automatically

OUTPUT:
- Beautiful splash screen
- Smooth navigation based on auth state
- Error handling works
- No auth state exposed to user
```

### Code Scaffold

```typescript
// src/screens/Splash/SplashScreen.tsx (abstract)
import React, { useEffect } from 'react';
import { View, SafeAreaView, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../hooks/useAuth';
import { AuthService } from '../../services/authService';

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, setUser, setAuthToken } = useAuth();
  
  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize auth
        // Check session
        // Load preferences
        // Decide navigation
        
        // setTimeout for 2-3 seconds splash duration
        // const timer = setTimeout(() => {
        //   if (user) {
        //     navigation.navigate('MainNavigator');
        //   } else {
        //     navigation.navigate('AuthNavigator');
        //   }
        // }, 2500);
        
        // return () => clearTimeout(timer);
      } catch (error) {
        // Handle error - navigate to error screen or auth
      }
    };
    
    initialize();
  }, []);
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Brand */}
        {/* Loading Spinner */}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#10B981', // Emerald gradient start
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ... more styles
});

// src/screens/Splash/SplashScreen.styles.ts
export const splashStyles = StyleSheet.create({
  // All style definitions
});
```

### Quality Checklist
- [ ] Screen displays with proper styling
- [ ] Navigation logic works
- [ ] Auth check completes
- [ ] Loading indicator animates
- [ ] Splash duration is 2-3 seconds
- [ ] Error handling works
- [ ] No layout issues
- [ ] RTL support works

### Dependencies
- TASK 2.1

---

## TASK 2.3: Login Screen
**Priority**: 7  
**Time Estimate**: 4 hours  
**Status**: Ready to code

### Description
Create login screen for existing users with email/password

### Business Scenarios Covered
- ✅ User can enter email
- ✅ User can enter password
- ✅ User can submit login
- ✅ Error messages shown
- ✅ Loading state while authenticating
- ✅ Link to sign up
- ✅ Forgot password link

### AI Agent Prompt

```
TASK: Create Login Screen

REQUIREMENTS:
1. Create LoginScreen component with:
   - Email input field
   - Password input field
   - Login button
   - Loading state during submission
   - Error message display
   - Sign up link (go to sign up)
   - Forgot password link

2. Input validation (using Zod):
   - Email format validation
   - Password presence check
   - Show inline errors

3. Form handling:
   - Use React Hook Form
   - Handle form submission
   - Call AuthService.loginWithEmail()
   - Update auth store on success
   - Show error on failure

4. UX improvements:
   - Keyboard management
   - Loading state (disable button)
   - Success feedback
   - Error animations

5. Navigation:
   - Success → Main App
   - Sign up link → Sign Up Screen
   - Forgot password → Password Reset Flow

BUSINESS SCENARIOS:
1. User enters wrong password → Error shown → Can retry
2. User's account doesn't exist → Error shown
3. Network error → Show error with retry
4. Loading spinner shows while authenticating
5. Success → Auto-login → Navigate to main

OUTPUT:
- Clean, professional login screen
- Form validation working
- Error handling comprehensive
- Navigation working
- Keyboard responsive
```

### Code Scaffold

```typescript
// src/screens/Auth/LoginScreen.tsx (abstract)
import React, { useState } from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../../utils/validation';
import { AuthService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

interface LoginForm {
  email: string;
  password: string;
}

export const LoginScreen: React.FC = ({ navigation }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setAuthToken } = useAuth();
  
  const { control, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });
  
  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call auth service
      // const result = await AuthService.loginWithEmail(data.email, data.password);
      // if (result.success) {
      //   navigation.replace('MainNavigator');
      // } else {
      //   setError(result.error);
      // }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        {/* Error Message */}
        {/* Email Input (Controller) */}
        {/* Password Input (Controller) */}
        {/* Login Button */}
        {/* Sign Up Link */}
        {/* Forgot Password Link */}
      </View>
    </SafeAreaView>
  );
};
```

### Quality Checklist
- [ ] Form inputs work
- [ ] Validation works
- [ ] Login submission works
- [ ] Error messages display
- [ ] Loading state works
- [ ] Navigation links work
- [ ] Keyboard responsive
- [ ] RTL support works

### Dependencies
- TASK 2.1

---

## TASK 2.4: Sign-Up Screen with OAuth Options
**Priority**: 8  
**Time Estimate**: 5 hours  
**Status**: Ready to code

### Description
Create sign-up screen with 4 authentication options (Google, Facebook, Apple, Custom Email)

### Business Scenarios Covered
- ✅ User can tap Google sign-up
- ✅ User can tap Facebook sign-up
- ✅ User can tap Apple sign-up
- ✅ User can register with email/password
- ✅ Custom registration is simple
- ✅ Skip option available
- ✅ Proper error handling

### AI Agent Prompt

```
TASK: Create Sign-Up Screen with OAuth Options

REQUIREMENTS:
1. Create SignUpScreen with three sections:
   Section A: OAuth Options (Google, Facebook, Apple)
   - Three large buttons with provider icons
   - Clear call to action text
   - Proper branding colors

   Section B: Email/Password Registration
   - Email input field
   - Password input field
   - Confirm password field
   - Sign up button
   - Simple, clean layout

   Section C: Skip Options
   - "Skip for Now" button to browse app
   - "Have Account? Login" link

2. OAuth Implementation:
   - Google: Tap → Redirect to Google → User grants → Account created
   - Facebook: Tap → Redirect to Facebook → User grants → Account created
   - Apple: Tap → Redirect to Apple → User grants → Account created
   - Each calls AuthService method and handles response

3. Email/Password Form:
   - Validate inputs (Zod schema)
   - Call AuthService.registerWithEmail()
   - On success → Navigate to CompleteProfileScreen
   - Show loading state
   - Show error messages

4. Skip for Now Flow:
   - Set "skipped_signup" flag in AsyncStorage
   - Navigate to MainNavigator with limited access
   - Show persistent CTA to complete profile
   - Allow completing profile anytime from settings

5. Styling:
   - Modern, clean design
   - Large touch targets (48px minimum)
   - Clear visual hierarchy
   - RTL support

BUSINESS SCENARIOS:
1. User taps Google → Google login flow → Account created → CompleteProfile
2. User taps Facebook → FB login → Account created → CompleteProfile
3. User taps Apple → Apple login → Account created → CompleteProfile
4. User enters email/password → Validation → Account created → CompleteProfile
5. User taps "Skip for Now" → Browse app → Complete profile later
6. User with invalid email → Error shown → Can retry

OUTPUT:
- All 4 auth methods work
- OAuth flows tested
- Form validation works
- Navigation correct
- Error handling comprehensive
- UI is polished
```

### Code Scaffold

```typescript
// src/screens/Auth/SignUpScreen.tsx (abstract)
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { AuthService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

interface SignUpForm {
  email: string;
  password: string;
  confirmPassword: string;
}

export const SignUpScreen: React.FC = ({ navigation }) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useAuth();
  const { control, handleSubmit } = useForm<SignUpForm>();
  
  // OAuth handler
  const handleOAuthSignUp = async (provider: 'google' | 'facebook' | 'apple') => {
    try {
      setIsLoading(true);
      // const result = await AuthService[`loginWith${provider}`]();
      // if (result.success) {
      //   navigation.navigate('CompleteProfileScreen');
      // }
    } catch (err) {
      setError('OAuth sign up failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Email/password handler
  const onSubmit = async (data: SignUpForm) => {
    // Similar to login but calls registerWithEmail
  };
  
  // Skip handler
  const handleSkip = () => {
    // Set flag
    // Navigate to MainNavigator
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        {/* OAuth Buttons */}
        {/* Divider */}
        {/* Email Form */}
        {/* Buttons (SignUp / Skip) */}
      </ScrollView>
    </SafeAreaView>
  );
};

// src/screens/Auth/SocialAuthButton.tsx (reusable component)
interface SocialAuthButtonProps {
  provider: 'google' | 'facebook' | 'apple';
  onPress: () => void;
  isLoading: boolean;
}

export const SocialAuthButton: React.FC<SocialAuthButtonProps> = ({
  provider,
  onPress,
  isLoading,
}) => {
  // Button implementation with provider icon and label
};
```

### Quality Checklist
- [ ] All 4 auth options work
- [ ] OAuth flows complete successfully
- [ ] Email/password form validates
- [ ] Skip option works
- [ ] Error messages display
- [ ] Loading states work
- [ ] Navigation correct
- [ ] UI polished and professional

### Dependencies
- TASK 2.1

---

## TASK 2.5: Complete Profile Screen (Multi-Step Form)
**Priority**: 9  
**Time Estimate**: 6 hours  
**Status**: Ready to code

### Description
Create multi-step form for completing user profile (4 steps)

### Business Scenarios Covered
- ✅ Step 1: Basic info (name, age, phone)
- ✅ Step 2: Health info (gender, age, weight, height)
- ✅ Step 3: Complaints (checkboxes)
- ✅ Step 4: Subscription goal (radio buttons)
- ✅ Progress bar shows completion
- ✅ Form data saved to Supabase
- ✅ Navigation to next phase

### AI Agent Prompt

```
TASK: Create Multi-Step Profile Completion Form

REQUIREMENTS:
1. Create CompleteProfileScreen with 4 steps:

   STEP 1 - Basic Info:
   - First Name input
   - Last Name input
   - Phone Number input (optional)
   - Age input
   - Navigate button

   STEP 2 - Health Data:
   - Gender selector (Male/Female/Prefer not)
   - Weight input (kg)
   - Height input (cm)
   - BMI calculation (derived)
   - Navigate button

   STEP 3 - Medical Complaints:
   - Checkboxes for common complaints:
     * Bloating/Gas
     * Fatigue
     * Constipation
     * Headache
     * Sleep issues
     * Other (text input)
   - Select at least one
   - Navigate button

   STEP 4 - Subscription Goal:
   - Radio buttons for goals:
     * Improve digestion
     * Lose weight
     * Treat inflammation
     * General healthy lifestyle
     * Other reason
   - Single selection
   - Complete button (submits)

2. Features:
   - Progress bar (25%, 50%, 75%, 100%)
   - Validation on each step
   - Store data in component state
   - Navigation between steps (forward/back)
   - Loading state on submission
   - Error handling

3. Form Submission:
   - Validate all data
   - Call UserService.completeProfile()
   - Update userStore
   - Navigate to Meal Preferences OR Main App

4. Styling:
   - Clean, professional
   - Large form fields
   - Clear progress indication
   - RTL support

BUSINESS LOGIC:
- Step 1: Capture basic identity
- Step 2: Capture health metrics for personalization
- Step 3: Understand health issues (customize recommendations)
- Step 4: Understand user goals (personalize content)
- All data needed to create personalized experience

SCENARIOS:
1. User fills all steps correctly → Submits → Saved to DB → Next phase
2. User enters invalid age → Error shown → Can correct
3. User skips back and edits → Data preserved
4. Network error on submit → Show error with retry
5. User completes all steps → Shown congratulations message

OUTPUT:
- All 4 steps functional
- Form validation working
- Data persisted correctly
- Navigation smooth
- Error handling comprehensive
- UI polished
```

### Code Scaffold

```typescript
// src/screens/Auth/CompleteProfileScreen.tsx (abstract)
import React, { useState } from 'react';
import {
  View,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserService } from '../../services/userService';
import { useUser } from '../../hooks/useUser';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  complaints: string[];
  subscriptionGoal: string;
}

export const CompleteProfileScreen: React.FC = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { control, getValues, watch } = useForm<ProfileFormData>();
  const { setProfile } = useUser();
  
  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    }
  };
  
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  const handleComplete = async () => {
    try {
      setIsLoading(true);
      const data = getValues();
      
      // Validate all data
      // Call UserService.completeProfile()
      // Update store
      // Navigate to MainNavigator or MealPreferences
    } catch (err) {
      setError('Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Progress Bar */}
      <ProgressBar current={step} total={4} />
      
      <ScrollView style={styles.content}>
        {step === 1 && <BasicInfoStep control={control} />}
        {step === 2 && <HealthDataStep control={control} watch={watch} />}
        {step === 3 && <ComplaintsStep control={control} />}
        {step === 4 && <GoalStep control={control} />}
      </ScrollView>
      
      {/* Navigation Buttons */}
    </SafeAreaView>
  );
};

// Individual step components (abstract)
const BasicInfoStep: React.FC<any> = ({ control }) => {
  // Step 1 UI
};

const HealthDataStep: React.FC<any> = ({ control, watch }) => {
  // Step 2 UI with BMI calculation
};

const ComplaintsStep: React.FC<any> = ({ control }) => {
  // Step 3 with checkboxes
};

const GoalStep: React.FC<any> = ({ control }) => {
  // Step 4 with radio buttons
};

// src/components/UI/ProgressBar.tsx
interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const progress = (current / total) * 100;
  
  return (
    <View style={styles.container}>
      {/* Visual progress bar */}
      {/* Step indicator */}
    </View>
  );
};
```

### Quality Checklist
- [ ] All 4 steps functional
- [ ] Form validation works
- [ ] Progress bar updates
- [ ] Data persists between steps
- [ ] Back navigation works
- [ ] Form submission works
- [ ] Error handling comprehensive
- [ ] UI professional and polished

### Dependencies
- TASK 2.1, 2.4

---

# 🍽️ PHASE 3: ONBOARDING (Week 3)

## TASK 3.1: Create 4 Onboarding Screens
**Priority**: 10  
**Time Estimate**: 6 hours  
**Status**: Ready to code

### Description
Create beautiful onboarding screens that explain the app and guide users to sign up

### Business Scenarios Covered
- ✅ Screen 1: Welcome & Purpose
- ✅ Screen 2: Benefits overview
- ✅ Screen 3: How it works
- ✅ Screen 4: Call to action (Sign up/Login/Skip)
- ✅ Navigation between screens
- ✅ Skip option
- ✅ Professional design

### AI Agent Prompt

```
TASK: Create 4 Onboarding Screens

Each screen should have:
- Eye-catching illustration/graphic
- Clear Arabic heading
- Descriptive text
- Next/Skip buttons
- Progress indicators (dots)

SCREEN 1 - Welcome:
Title: "اسمع جسدك، لا تعد السعرات"
Content: Brief intro to Al-Tayebat system
Illustration: Person listening to body/health concept
Features shown:
- Simple approach
- No counting
- Listen to your body
- Natural healing

SCREEN 2 - Benefits:
Title: "تتبع تحسنك"
Content: What improvements to expect
Illustration: Progress charts, health metrics
Features shown:
- Better digestion
- More energy
- Improved mood
- Better sleep

SCREEN 3 - How it Works:
Title: "كيفية العمل"
Content: 3-step process
Illustration: Step-by-step visual guide
Steps:
1. Choose allowed foods
2. Eat when hungry
3. Track improvements

SCREEN 4 - Get Started:
Title: "جاهز للبدء؟"
Content: Call to action
Illustration: Food/wellness theme
Buttons:
- "إنشاء حساب" (Create Account)
- "دخول" (Login)
- "تصفح التطبيق" (Browse)

REQUIREMENTS:
1. Create reusable OnboardingScreen component
   - Illustration at top
   - Title
   - Description
   - CTA button(s)
   - Style consistent across all 4

2. Create OnboardingNavigator
   - Manage step state
   - Handle navigation
   - Show progress dots
   - Handle skip logic

3. Styling requirements:
   - Use design system colors
   - Proper typography hierarchy
   - Safe area handling
   - RTL support
   - Responsive layout

4. Illustrations:
   - Professional quality
   - Consistent style
   - Related to content
   - Adequate size

BUSINESS SCENARIOS:
1. New user starts app → See onboarding screens → Understand system
2. User swipes through screens → Learns benefits and process
3. User reaches screen 4 → Makes decision (sign up/login/skip)
4. User skips anytime → Goes to signup/main
5. User can go back between screens

OUTPUT:
- 4 beautiful onboarding screens
- Navigation between screens
- Progress indicator working
- Skip functionality working
- Professional design
- Ready for app launch
```

### Code Scaffold

```typescript
// src/screens/Onboarding/OnboardingScreen.tsx (reusable)
interface OnboardingScreenProps {
  title: string;
  description: string;
  illustrationComponent: React.FC;
  onNext: () => void;
  onSkip: () => void;
  showSkip?: boolean;
  nextButtonText?: string;
}

export const OnboardingScreenTemplate: React.FC<OnboardingScreenProps> = ({
  title,
  description,
  illustrationComponent: Illustration,
  onNext,
  onSkip,
  showSkip = true,
  nextButtonText = 'التالي',
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {showSkip && <SkipButton onPress={onSkip} />}
      </View>
      
      <ScrollView style={styles.content}>
        {/* Illustration */}
        {/* Title */}
        {/* Description */}
      </ScrollView>
      
      <View style={styles.footer}>
        {/* Navigation Buttons */}
      </View>
    </SafeAreaView>
  );
};

// src/screens/Onboarding/OnboardingScreen1.tsx
export const OnboardingScreen1: React.FC = ({ onNext, onSkip }) => {
  return (
    <OnboardingScreenTemplate
      title="اسمع جسدك، لا تعد السعرات"
      description="نظام الطيبات يركز على..."
      illustrationComponent={ListeningIllustration}
      onNext={onNext}
      onSkip={onSkip}
    />
  );
};

// src/screens/Onboarding/OnboardingNavigator.tsx
export const OnboardingNavigator: React.FC = ({ navigation }) => {
  const [step, setStep] = useState(1);
  
  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      navigation.navigate('SignUpScreen');
    }
  };
  
  const handleSkip = () => {
    navigation.navigate('SignUpScreen');
  };
  
  return (
    <View style={styles.container}>
      {/* Progress Dots */}
      {step === 1 && <OnboardingScreen1 onNext={handleNext} onSkip={handleSkip} />}
      {step === 2 && <OnboardingScreen2 onNext={handleNext} onSkip={handleSkip} />}
      {step === 3 && <OnboardingScreen3 onNext={handleNext} onSkip={handleSkip} />}
      {step === 4 && <OnboardingScreen4 onNext={handleNext} onSkip={handleSkip} />}
    </View>
  );
};

// Illustration components (abstract)
const ListeningIllustration: React.FC = () => {
  // SVG or image component showing listening concept
};
```

### Quality Checklist
- [ ] All 4 screens created
- [ ] Navigation between screens works
- [ ] Skip button works
- [ ] Progress indicator shows
- [ ] Illustrations display properly
- [ ] Text is readable
- [ ] Buttons are responsive
- [ ] RTL support works
- [ ] Professional appearance

### Dependencies
- TASK 1.1, 1.2

---

## TASK 3.2: Setup Meal Preferences Screen
**Priority**: 11  
**Time Estimate**: 4 hours  
**Status**: Ready to code

### Description
Create screen for user to select available foods (setup preferences)

### Business Scenarios Covered
- ✅ User selects fats available
- ✅ User selects cheeses available
- ✅ User selects proteins available
- ✅ User selects nuts/sweets available
- ✅ User selects carbs available
- ✅ Saves preferences to database
- ✅ Navigates to main app

### AI Agent Prompt

```
TASK: Create Meal Preferences Setup Screen

REQUIREMENTS:
1. Create screen with 5 categories of checkboxes:

   Category 1 - Fats:
   ☐ Olive Oil
   ☐ Clarified Butter
   ☐ Butter
   ☐ Cream

   Category 2 - Cheeses:
   ☐ Mozzarella
   ☐ Cheddar
   ☐ Processed Cheese
   ☐ Other

   Category 3 - Proteins:
   ☐ Red Meat
   ☐ Lamb
   ☐ Pigeon
   ☐ Liver
   ☐ Fish

   Category 4 - Nuts/Sweets:
   ☐ Honey
   ☐ Walnuts
   ☐ Cashews
   ☐ Sesame Halwa
   ☐ Date Paste

   Category 5 - Carbs:
   ☐ Wheat Toast
   ☐ White Rice
   ☐ Potatoes
   ☐ Bread
   ☐ Wheat/Freekeh
   ☐ Corn

2. Features:
   - Multi-select checkboxes
   - Images for each food item (high quality)
   - Select at least one per category
   - Clear, organized layout
   - Scrollable if needed

3. Submit functionality:
   - Validate at least one selection per category
   - Save to userStore
   - Call UserService.updatePreferences()
   - Navigate to MainNavigator
   - Show success message

4. Styling:
   - Images above/beside item name
   - Large touch targets
   - Clear visual feedback
   - RTL support
   - Professional appearance

BUSINESS LOGIC:
- User's available foods determine meal suggestions
- This customizes the app experience
- Only suggest meals from user's available items
- Improves recommendation quality

SCENARIOS:
1. User selects foods they have → Completes → App customized
2. User tries to skip category → Validation error
3. User changes mind → Can uncheck/recheck
4. Submit → Saves to DB → Navigates to main
5. Network error → Show error with retry

OUTPUT:
- Screen fully functional
- All foods properly displayed with images
- Selections saved correctly
- Navigation works
- Validation comprehensive
- UI professional
```

### Code Scaffold

```typescript
// src/screens/Setup/MealPreferencesScreen.tsx (abstract)
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { UserService } from '../../services/userService';
import { useUser } from '../../hooks/useUser';

interface FoodCategory {
  id: string;
  name: string;
  items: FoodItem[];
}

interface FoodItem {
  id: number;
  name: string;
  arabicName: string;
  image: string;
  selected: boolean;
}

export const MealPreferencesScreen: React.FC = ({ navigation }) => {
  const [categories, setCategories] = useState<FoodCategory[]>(FOOD_CATEGORIES);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setPreferences } = useUser();
  
  const toggleItem = (categoryId: string, itemId: number) => {
    // Toggle selection
  };
  
  const validateSelections = (): boolean => {
    // Check each category has at least one item selected
  };
  
  const handleComplete = async () => {
    if (!validateSelections()) {
      setError('Select at least one item per category');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Collect selections
      // Call UserService.updatePreferences()
      // Update store
      // Navigate to MainNavigator
    } catch (err) {
      setError('Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="إختر الأطعمة المتاحة لديك" />
      
      <ScrollView style={styles.content}>
        {categories.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            onToggle={(itemId) => toggleItem(category.id, itemId)}
          />
        ))}
      </ScrollView>
      
      {/* Complete Button */}
    </SafeAreaView>
  );
};

// Category component
interface CategorySectionProps {
  category: FoodCategory;
  onToggle: (itemId: number) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  onToggle,
}) => {
  return (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{category.name}</Text>
      
      <View style={styles.itemsGrid}>
        {category.items.map((item) => (
          <FoodItemCard
            key={item.id}
            item={item}
            onPress={() => onToggle(item.id)}
          />
        ))}
      </View>
    </View>
  );
};

// Food item card component
interface FoodItemCardProps {
  item: FoodItem;
  onPress: () => void;
}

const FoodItemCard: React.FC<FoodItemCardProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.itemCard,
        item.selected && styles.itemCardSelected,
      ]}
      onPress={onPress}
    >
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <Text style={styles.itemName}>{item.arabicName}</Text>
      {item.selected && <CheckIcon />}
    </TouchableOpacity>
  );
};

// Constants
const FOOD_CATEGORIES: FoodCategory[] = [
  {
    id: 'fats',
    name: 'الدهون الطبيعية',
    items: [
      // Items from food database
    ],
  },
  // More categories...
];
```

### Quality Checklist
- [ ] All food items display with images
- [ ] Checkboxes work properly
- [ ] Images load correctly
- [ ] Validation works
- [ ] Selections save properly
- [ ] Navigation works
- [ ] Error handling comprehensive
- [ ] UI clean and organized

### Dependencies
- TASK 2.5

---

# 📱 PHASE 4: MAIN APP LAYOUT (Week 4)

## TASK 4.1: Create Navigation Structure (Bottom Tabs)
**Priority**: 12  
**Time Estimate**: 3 hours  
**Status**: Ready to code

### Description
Create bottom tab navigation with 5 main screens

### Business Scenarios Covered
- ✅ Navigation between all screens
- ✅ Tab bar appears consistently
- ✅ Current tab highlighted
- ✅ Badge indicators (if needed)
- ✅ Screen persistence (screens don't reset)

### AI Agent Prompt

```
TASK: Create Bottom Tab Navigation

REQUIREMENTS:
1. Create BottomTabNavigator with 5 tabs (RTL order):
   - Home (الرئيسية) - HomeScreen
   - Library (المكتبة) - LibraryScreen
   - Schedule (الجدول) - ScheduleScreen
   - Profile (الملف) - ProfileScreen
   - Settings (الإعدادات) - SettingsScreen

2. Tab bar styling:
   - Icons and labels
   - Active/inactive colors
   - RTL layout
   - Safe area handling
   - Shadow/elevation

3. Features:
   - Smooth transitions between tabs
   - Screen state preservation
   - Lazy loading optional
   - Badge support (for notifications)

4. Navigation structure:
   - RootNavigator
     - SplashStack
       - SplashScreen
     - AuthStack
       - LoginScreen
       - SignUpScreen
       - CompleteProfileScreen
       - OnboardingStack
     - MainStack
       - BottomTabNavigator (all main screens)

BUSINESS SCENARIOS:
1. User navigates between tabs → Content changes
2. User navigates back → Can return to previous tab
3. User receives notification → Badge shows on icon
4. Tab styling clear which is active
5. Screen content doesn't reset when changing tabs

OUTPUT:
- Navigation structure complete
- All tabs functional
- Tab bar styled properly
- Transitions smooth
- RTL support working
```

### Code Scaffold

```typescript
// src/navigation/RootNavigator.tsx (abstract)
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { SplashScreen } from '../screens/Splash/SplashScreen';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <SplashScreen />;
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
      >
        {!user ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// src/navigation/MainNavigator.tsx (abstract)
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/Main/HomeScreen';
import { LibraryScreen } from '../screens/Main/LibraryScreen';
import { ScheduleScreen } from '../screens/Main/ScheduleScreen';
import { ProfileScreen } from '../screens/Main/ProfileScreen';
import { SettingsScreen } from '../screens/Main/SettingsScreen';

const Tab = createBottomTabNavigator();

export const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#10B981',
        tabBarInactiveTintColor: '#cbd5e1',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'الرئيسية',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Library"
        component={LibraryScreen}
        options={{
          tabBarLabel: 'المكتبة',
          tabBarIcon: ({ color }) => <LibraryIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          tabBarLabel: 'الجدول',
          tabBarIcon: ({ color }) => <ScheduleIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'الملف',
          tabBarIcon: ({ color }) => <ProfileIcon color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'الإعدادات',
          tabBarIcon: ({ color }) => <SettingsIcon color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

// src/navigation/AuthNavigator.tsx (abstract)
export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      <Stack.Screen name="MealPreferences" component={MealPreferencesScreen} />
    </Stack.Navigator>
  );
};
```

### Quality Checklist
- [ ] Navigation structure complete
- [ ] All tabs navigate correctly
- [ ] Active tab highlighted
- [ ] RTL layout correct
- [ ] Smooth transitions
- [ ] No navigation errors
- [ ] Tab bar styled properly
- [ ] Icons visible and clear

### Dependencies
- All previous tasks

---

## TASK 4.2: Create Placeholder Main Screens
**Priority**: 13  
**Time Estimate**: 4 hours  
**Status**: Ready to code

### Description
Create empty/placeholder screens for all main features (will be implemented later)

### Business Scenarios Covered
- ✅ Screen structure ready
- ✅ Navigation working
- ✅ Placeholder content visible
- ✅ Foundation for future features

### AI Agent Prompt

```
TASK: Create Placeholder Main Screens

REQUIREMENTS:
1. Create 5 placeholder screens with consistent structure:

   HomeScreen:
   - Header with greeting
   - Empty state message
   - Placeholder for meal suggestions
   - Placeholder for daily stats
   - Message: "الميزات قريباً"

   LibraryScreen:
   - Header
   - Placeholder for food categories
   - Placeholder for search
   - Message: "المكتبة قريباً"

   ScheduleScreen:
   - Header
   - Placeholder for weekly calendar
   - Placeholder for meal plan
   - Message: "الجدول الأسبوعي قريباً"

   ProfileScreen:
   - Header with user name
   - Placeholder for user avatar
   - Placeholder for stats
   - Placeholder for achievements
   - Message: "ملفك الشخصي قريباً"

   SettingsScreen:
   - Header
   - Placeholder for language selector
   - Placeholder for preferences
   - Placeholder for app info
   - Message: "الإعدادات قريباً"

2. Each screen should have:
   - Consistent header
   - Safe area handling
   - RTL support
   - Basic styling
   - Coming Soon message
   - Back button if needed

3. Structure ready for:
   - Adding real content later
   - Easy to find placeholder sections
   - Comments showing where to add features

OUTPUT:
- 5 placeholder screens
- All properly structured
- All navigable
- Ready for feature implementation
```

### Code Scaffold

```typescript
// src/screens/Main/HomeScreen.tsx (abstract placeholder)
import React from 'react';
import { View, SafeAreaView, StyleSheet } from 'react-native';
import { useUser } from '../../hooks/useUser';
import { Header } from '../../components/Common/Header';

export const HomeScreen: React.FC = () => {
  const { profile } = useUser();
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="الرئيسية" />
      
      <View style={styles.content}>
        {/* TODO: Add greeting */}
        {/* TODO: Add daily status card */}
        {/* TODO: Add meal suggestions */}
        {/* TODO: Add quick stats */}
        {/* TODO: Add achievements section */}
        
        <ComingSoonMessage feature="ميزات لوحة التحكم" />
      </View>
    </SafeAreaView>
  );
};

// Reusable placeholder components
const ComingSoonMessage: React.FC<{ feature: string }> = ({ feature }) => {
  return (
    <View style={styles.comingSoon}>
      {/* Icon */}
      {/* Text: {feature} قريباً */}
    </View>
  );
};

// Similar structure for other screens:
// LibraryScreen
// ScheduleScreen
// ProfileScreen
// SettingsScreen
```

### Quality Checklist
- [ ] All 5 screens created
- [ ] Navigation works
- [ ] Placeholder text visible
- [ ] Structure clear for future development
- [ ] Styling consistent
- [ ] RTL support works
- [ ] No errors on navigation

### Dependencies
- TASK 4.1

---

# 🧪 PHASE 5: TESTING (Week 5)

## TASK 5.1: Unit Tests for Services
**Priority**: 14  
**Time Estimate**: 5 hours  
**Status**: Ready to code

### Description
Write unit tests for all service classes

### Business Scenarios Covered
- ✅ AuthService methods tested
- ✅ UserService methods tested
- ✅ MealService methods tested
- ✅ AnalyticsService methods tested
- ✅ Error scenarios tested
- ✅ Edge cases covered

### AI Agent Prompt

```
TASK: Write Unit Tests for Services

REQUIREMENTS:
1. Test Framework: Jest + Testing Library

2. Test each service method:

   AuthService tests:
   - registerWithEmail: valid input → success
   - registerWithEmail: duplicate email → error
   - loginWithEmail: valid credentials → success
   - loginWithEmail: wrong password → error
   - logoutWithEmail: network error → handle
   - OAuth methods: success path
   - OAuth methods: user cancels
   - Session management: refresh token works

   UserService tests:
   - completeProfile: valid data → saved
   - completeProfile: invalid data → validation error
   - updatePreferences: saves correctly
   - getProfile: returns user data
   - Error handling: network errors

   MealService tests:
   - getMeals: returns array
   - getMeals: error handling
   - swapMeal: updates plan
   - logMeal: saves correctly

   AnalyticsService tests:
   - calculateMetrics: returns correct results
   - getProgress: returns progress data
   - Error handling

3. Test structure:
   ```
   describe('AuthService', () => {
     describe('registerWithEmail', () => {
       it('should register user successfully', () => {
         // Mock inputs
         // Call method
         // Assert result
       });
       
       it('should handle duplicate email', () => {
         // Test error case
       });
     });
   });
   ```

4. Coverage targets:
   - AuthService: 100%
   - UserService: 100%
   - MealService: 80%+
   - AnalyticsService: 80%+

OUTPUT:
- All service methods tested
- Error cases covered
- 80%+ code coverage
- Tests pass
- Easy to add more tests
```

### Code Scaffold

```typescript
// __tests__/unit/authService.test.ts (abstract)
import { AuthService } from '../../src/services/authService';
import * as authApi from '../../src/api/authApi';

jest.mock('../../src/api/authApi');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('registerWithEmail', () => {
    it('should register user successfully', async () => {
      // Mock API response
      // (authApi.registerWithEmail as jest.Mock).mockResolvedValue({...});
      
      // Call service
      // const result = await AuthService.registerWithEmail(...);
      
      // Assert
      // expect(result.success).toBe(true);
      // expect(result.user).toBeDefined();
    });
    
    it('should handle duplicate email error', async () => {
      // Mock error response
      // Test error handling
      // Assert error message
    });
    
    it('should validate email format', async () => {
      // Invalid email
      // Should return error
    });
  });
  
  describe('loginWithEmail', () => {
    it('should login user successfully', async () => {
      // Mock valid credentials
      // Call method
      // Assert success
    });
    
    it('should fail with wrong password', async () => {
      // Mock invalid credentials
      // Call method
      // Assert error
    });
  });
  
  // More test suites...
});
```

### Quality Checklist
- [ ] All service tests written
- [ ] Tests pass
- [ ] Error cases covered
- [ ] Edge cases tested
- [ ] Code coverage 80%+
- [ ] Mocks proper
- [ ] No flaky tests

### Dependencies
- All service tasks

---

## TASK 5.2: Integration Tests for Flows
**Priority**: 15  
**Time Estimate**: 6 hours  
**Status**: Ready to code

### Description
Write integration tests for complete user flows

### Business Scenarios Covered
- ✅ Sign up flow end-to-end
- ✅ Login flow end-to-end
- ✅ Complete profile flow
- ✅ App navigation flow
- ✅ Data persistence flow

### AI Agent Prompt

```
TASK: Write Integration Tests for User Flows

REQUIREMENTS:
1. Test complete user journeys:

   Sign-Up Flow:
   - User navigates to signup
   - Selects Google OAuth
   - Completes profile
   - Selects food preferences
   - Arrives at main app
   - Verify all data saved

   Email Registration:
   - User enters email/password
   - Account created
   - Verify email sent
   - User completes profile
   - User selects preferences
   - Arrives at main app

   Login Flow:
   - User with existing account
   - Enters credentials
   - Successfully logs in
   - Arrives at main app
   - Previous data loaded

   Navigation Flow:
   - User navigates between tabs
   - Content changes correctly
   - Can navigate back
   - State preserved

2. Test user interactions:
   - Form inputs
   - Button presses
   - Navigation changes
   - Data updates

3. Verify side effects:
   - Store updates
   - API calls made
   - Navigation happens
   - Data persists

OUTPUT:
- Integration tests for all major flows
- Tests realistic user behavior
- Catches UI/UX issues
- Confident deployment
```

### Code Scaffold

```typescript
// __tests__/integration/signupFlow.test.ts (abstract)
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { SignUpScreen } from '../../src/screens/Auth/SignUpScreen';
import { useAuthStore } from '../../src/store/authStore';

describe('Sign-Up Flow Integration', () => {
  it('should complete email signup flow', async () => {
    // Render signup screen
    // const { getByTestId } = render(<SignUpScreen />);
    
    // Enter email
    // fireEvent.changeText(getByTestId('emailInput'), 'test@example.com');
    
    // Enter password
    // fireEvent.changeText(getByTestId('passwordInput'), 'Password123');
    
    // Submit
    // fireEvent.press(getByTestId('signupButton'));
    
    // Wait for navigation
    // await waitFor(() => {
    //   expect(navigation.navigate).toHaveBeenCalledWith('CompleteProfile');
    // });
    
    // Verify store updated
    // const authState = useAuthStore.getState();
    // expect(authState.user).toBeDefined();
  });
  
  it('should complete profile and navigate to preferences', async () => {
    // Similar test structure
  });
});

// __tests__/integration/navigationFlow.test.ts
describe('Navigation Flow Integration', () => {
  it('should navigate between tabs without data loss', async () => {
    // Setup initial state
    // Navigate to different tab
    // Verify content changed
    // Navigate back
    // Verify content is same
  });
});
```

### Quality Checklist
- [ ] All major flows tested
- [ ] Real user scenarios covered
- [ ] Navigation tested
- [ ] Data persistence verified
- [ ] Tests pass
- [ ] No warnings/errors
- [ ] Easy to add more tests

### Dependencies
- All screen tasks

---

# 🚀 PHASE 6: DEPLOYMENT & OPTIMIZATION (Week 6)

## TASK 6.1: Build Optimization & Performance Tuning
**Priority**: 16  
**Time Estimate**: 4 hours  
**Status**: Ready to code

### Description
Optimize build, performance, and prepare for release

### Business Scenarios Covered
- ✅ App loads quickly
- ✅ No memory leaks
- ✅ Smooth animations
- ✅ Build size optimized
- ✅ Ready for app stores

### AI Agent Prompt

```
TASK: Build Optimization & Performance Tuning

REQUIREMENTS:
1. Code optimization:
   - Remove unused imports
   - Lazy load screens
   - Memoize expensive components
   - Optimize bundle size
   - Tree shaking enabled

2. Performance metrics:
   - App startup time < 3 seconds
   - Screen transitions smooth (60fps)
   - No memory leaks
   - Battery usage reasonable
   - Network requests optimized

3. Build configuration:
   - Production build mode
   - Minification enabled
   - Asset optimization
   - Version bumping
   - Release notes

4. Testing before release:
   - Full test suite passes
   - No console warnings
   - No unhandled errors
   - All features work
   - No navigation issues

5. Prepare for stores:
   - App signing configured
   - Icons and splashes ready
   - Privacy policy updated
   - Terms of service updated
   - Store descriptions ready

OUTPUT:
- Optimized production build
- All tests passing
- Ready for store submission
- Performance verified
```

### Code Scaffold

```typescript
// Performance optimization examples:

// 1. Lazy loading screens
const HomeScreen = React.lazy(() => import('../screens/Main/HomeScreen'));

// 2. Component memoization
export const MealCard = React.memo(
  ({ meal, onPress }) => {...},
  (prevProps, nextProps) => prevProps.meal.id === nextProps.meal.id
);

// 3. useMemo for expensive calculations
const derivedData = useMemo(() => {
  return expensiveCalculation(data);
}, [data]);

// 4. useCallback for function stability
const handlePress = useCallback(() => {
  // Handle press
}, [dependencies]);

// Build configuration (metro.config.js abstract)
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    extraNodeModules: {},
  },
  // Optimization settings
};
```

### Quality Checklist
- [ ] Bundle size < 30MB
- [ ] Startup time < 3 seconds
- [ ] 60fps animations
- [ ] No memory leaks
- [ ] All tests pass
- [ ] No console warnings
- [ ] Store assets ready
- [ ] Documentation complete

### Dependencies
- All previous tasks

---

## TASK 6.2: Prepare for App Store Submission
**Priority**: 17 (Final)  
**Time Estimate**: 3 hours  
**Status**: Ready to code

### Description
Prepare all materials for iOS App Store and Google Play Store submission

### Business Scenarios Covered
- ✅ App ready for distribution
- ✅ Store listings created
- ✅ All legal documents prepared
- ✅ Screenshots prepared
- ✅ Ready for review

### AI Agent Prompt

```
TASK: Prepare for App Store Submission

REQUIREMENTS:
1. iOS App Store (TestFlight → Production):
   - Xcode configuration
   - Signing certificates
   - Provisioning profiles
   - App Store Connect setup
   - TestFlight testing
   - Release notes
   - Privacy policy URL
   - Screenshots (5 different sizes)
   - App description
   - Keyword metadata

2. Google Play Store:
   - Android signing keystore
   - Play Store Console setup
   - Release notes
   - Privacy policy URL
   - Screenshots (different sizes)
   - App description
   - Keyword metadata
   - Content rating

3. Legal/Compliance:
   - Privacy Policy
   - Terms of Service
   - App Store Optimization (ASO)
   - Content Rating Questionnaire

4. Pre-submission checklist:
   - All bugs fixed
   - All features working
   - Proper error handling
   - Offline functionality checked
   - Performance verified
   - Device compatibility verified

5. Submission process:
   - iOS: Upload → Review → Approval → Release
   - Android: Upload → Review → Approval → Release

OUTPUT:
- Both app stores ready
- Legal documents prepared
- Marketing materials ready
- Submission successful
- App live for users
```

### Code Scaffold

```typescript
// App versioning and build number management

// package.json version bump
{
  "name": "al-tayebat-app",
  "version": "1.0.0",  // Major.Minor.Patch
  ...
}

// app.json for React Native
{
  "expo": {
    "name": "الطيبات",
    "slug": "tayebat-app",
    "version": "1.0.0",
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTabletOnly": false,
      "bundleIdentifier": "com.tayebat.app"
    },
    "android": {
      "package": "com.tayebat.app",
      "versionCode": 1
    }
  }
}

// Build script examples
{
  "scripts": {
    "build:ios": "cd ios && xcodebuild...",
    "build:android": "cd android && ./gradlew assembleRelease",
    "submit:ios": "xcrun altool --upload-app...",
    "submit:android": "bundletool upload-bundle..."
  }
}
```

### Quality Checklist
- [ ] iOS build created and signed
- [ ] Android build created and signed
- [ ] TestFlight submission successful
- [ ] Store listings created
- [ ] Screenshots uploaded
- [ ] Legal docs in place
- [ ] App description compelling
- [ ] Keywords optimized
- [ ] Privacy policy linked
- [ ] Ready for store review

### Dependencies
- TASK 6.1

---

# 📊 SUMMARY TABLE

## All Tasks Overview

| Phase | Task ID | Task Name | Priority | Hours | Status |
|-------|---------|-----------|----------|-------|--------|
| 1 | 1.1 | Project Setup | 1 | 4 | Ready |
| 1 | 1.2 | Folder Structure | 2 | 2 | Ready |
| 1 | 1.3 | Supabase Config | 3 | 3 | Ready |
| 1 | 1.4 | Zustand Stores | 4 | 4 | Ready |
| 2 | 2.1 | Auth Service | 5 | 5 | Ready |
| 2 | 2.2 | Splash Screen | 6 | 3 | Ready |
| 2 | 2.3 | Login Screen | 7 | 4 | Ready |
| 2 | 2.4 | Sign-Up Screen | 8 | 5 | Ready |
| 2 | 2.5 | Profile Screen | 9 | 6 | Ready |
| 3 | 3.1 | Onboarding Screens | 10 | 6 | Ready |
| 3 | 3.2 | Preferences Screen | 11 | 4 | Ready |
| 4 | 4.1 | Navigation Structure | 12 | 3 | Ready |
| 4 | 4.2 | Placeholder Screens | 13 | 4 | Ready |
| 5 | 5.1 | Unit Tests | 14 | 5 | Ready |
| 5 | 5.2 | Integration Tests | 15 | 6 | Ready |
| 6 | 6.1 | Performance Tuning | 16 | 4 | Ready |
| 6 | 6.2 | Store Submission | 17 | 3 | Ready |

**Total Development Time**: ~72 hours across 6 weeks
**Total Tasks**: 17
**Status**: All ready for AI Agent implementation

---

# 🎯 QUALITY STANDARDS

Every task must meet these standards before approval:

### Code Quality
- ✅ TypeScript strict mode
- ✅ No `any` types
- ✅ Proper error handling
- ✅ No console.logs in production code
- ✅ Consistent code style

### Testing
- ✅ Unit tests written
- ✅ Integration tests written
- ✅ 80%+ code coverage
- ✅ All tests pass
- ✅ Error cases covered

### Documentation
- ✅ JSDoc comments
- ✅ README files
- ✅ Clear variable names
- ✅ Logical organization

### Performance
- ✅ No memory leaks
- ✅ Optimized renders
- ✅ Lazy loading used
- ✅ Bundle size optimized

### User Experience
- ✅ Error messages clear
- ✅ Loading states shown
- ✅ No unhandled errors
- ✅ Accessibility standards met
- ✅ RTL support verified

---

# 🚀 IMPLEMENTATION NOTES

## For AI Agents

1. **Start with Task 1.1** - Don't skip foundation tasks
2. **Each task is self-contained** - Has clear requirements and prompts
3. **Follow the prompt structure** - REQUIREMENTS → CODE SCAFFOLD → CHECKLIST
4. **Ask for clarification** - If requirements ambiguous
5. **Run tests regularly** - Don't wait until end
6. **Commit frequently** - After each task completion
7. **Use branches** - One branch per task
8. **Code review** - Before merging to main

## For Quality Assurance

1. **Run full test suite** - After each phase
2. **Manual testing** - On real devices
3. **Performance testing** - Use profiling tools
4. **Security review** - Check for vulnerabilities
5. **Accessibility check** - VoiceOver/TalkBack testing
6. **RTL verification** - Arabic text and layout

## For Team Communication

- Use task IDs in commit messages: `feat(TASK-1.1): Setup project`
- Create PR per task with detailed description
- Link PRs to tasks in project board
- Regular sync meetings on phase boundaries

---

**Document Version**: 1.0  
**Created**: January 2024  
**Purpose**: AI Agent Implementation Guide  
**Status**: Production Ready  

**Next Step**: Start with TASK 1.1 - Project Setup  

🚀 **Ready to build!**

