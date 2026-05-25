# 06 — Architecture Diagrams

All diagrams use [Mermaid](https://mermaid.js.org/) syntax — renderable in GitHub, Obsidian, VS Code, and most Markdown viewers.

---

## D1 — System Layers (Clean Architecture)

```mermaid
graph TB
    subgraph PRESENTATION["Presentation Layer"]
        direction LR
        SCR[Screens<br/>app/]
        COMP[Components<br/>components/ + features/*/components]
        STORE[Zustand Stores<br/>features/*/store]
        TQ[TanStack Query<br/>features/*/hooks]
    end

    subgraph DOMAIN["Domain Layer"]
        direction LR
        UC[Use-Cases<br/>features/*/domain/*UseCase.ts]
        DT[Domain Types<br/>features/*/domain/*.types.ts]
        AGG[Aggregators<br/>features/stats/domain/statsAggregator.ts]
    end

    subgraph DATA["Data Layer"]
        direction LR
        REPO[Repository Interfaces<br/>features/*/repository/I*.ts]
        MOCK[Mock Impl<br/>*.repository.mock.ts]
        SUP[Supabase Impl<br/>*.repository.supabase.ts]
        FACT[Factory<br/>repository/index.ts]
    end

    subgraph INFRA["Infrastructure"]
        direction LR
        SB[(Supabase)]
        AS[(AsyncStorage)]
        NET[Network<br/>fetchyClient]
    end

    SCR --> STORE
    SCR --> TQ
    STORE --> UC
    TQ --> REPO
    UC --> REPO
    FACT -->|env var| MOCK
    FACT -->|env var| SUP
    MOCK --> AS
    SUP --> SB
    NET --> SB

    style PRESENTATION fill:#dbeafe,stroke:#3b82f6
    style DOMAIN fill:#dcfce7,stroke:#22c55e
    style DATA fill:#fef9c3,stroke:#eab308
    style INFRA fill:#fee2e2,stroke:#ef4444
```

---

## D2 — Feature Vertical Slice (Auth Example)

```mermaid
graph LR
    subgraph app["app/(auth)/login.tsx"]
        LS[LoginScreen]
    end

    subgraph store["features/auth/store/"]
        AS[authSession.store.ts]
    end

    subgraph domain["features/auth/domain/"]
        LU[loginUseCase.ts]
        VL[auth.schemas.ts - zod]
    end

    subgraph repo["features/auth/repository/"]
        IRI[IAuthRepository.ts]
        MOCK[auth.repository.mock.ts]
        SUP[auth.repository.supabase.ts]
        FAC[index.ts - factory]
    end

    subgraph infra["Infrastructure"]
        SS[storageService]
        SBC[supabaseClient]
    end

    LS -->|useAuthSessionStore| AS
    AS -->|loginUseCase(repo, payload)| LU
    LU -->|validate| VL
    LU -->|repo.login()| IRI
    FAC -->|implements| MOCK
    FAC -->|implements| SUP
    MOCK --> SS
    SUP --> SBC
    IRI -.->|interface| FAC
```

---

## D3 — Repository Swap Mechanism

```mermaid
flowchart TD
    ENV{EXPO_PUBLIC_USE_MOCK}

    ENV -->|true| MOCK[AuthRepositoryMock<br/>AsyncStorage-backed<br/>deterministic]
    ENV -->|false| SUP[AuthRepositorySupabase<br/>supabase.auth.*<br/>real network]

    MOCK --> IFACE[IAuthRepository]
    SUP --> IFACE

    IFACE --> UC[loginUseCase]
    UC --> STORE[authSession.store]
    STORE --> SCREEN[LoginScreen]

    style ENV fill:#fbbf24,stroke:#d97706
    style IFACE fill:#a7f3d0,stroke:#10b981
```

---

## D4 — State Ownership (Zustand vs TanStack Query)

```mermaid
graph LR
    subgraph CLIENT["Client State — Zustand"]
        direction TB
        SES[Auth Session<br/>+ Status machine]
        LANG[Language<br/>+ Theme mode]
        FORM[Form draft state]
        GATE[Auth gate open/close]
        PROF[Profile setup steps]
    end

    subgraph SERVER["Server State — TanStack Query"]
        direction TB
        MEALS[Meals catalog<br/>stale: 30 min]
        UMEAL[User meal logs<br/>stale: 5 min]
        UPROF[User profile<br/>stale: 5 min]
        FEED[Community feed<br/>paginated, stale: 1 min]
        STATS[Weekly ratings<br/>stale: 10 min]
    end

    subgraph WRITE["Write Operations — Mutations"]
        direction TB
        LM[Log meal → invalidate user meals]
        FU[Follow user → invalidate stats]
        RP[React to post → optimistic update]
        SR[Submit rating → invalidate ratings]
    end

    style CLIENT fill:#dbeafe,stroke:#3b82f6
    style SERVER fill:#dcfce7,stroke:#22c55e
    style WRITE fill:#fef9c3,stroke:#eab308
```

---

## D5 — Auth State Machine

```mermaid
stateDiagram-v2
    [*] --> idle

    idle --> initializing : app boot

    initializing --> authenticated : valid session found
    initializing --> unauthenticated : no session / expired
    initializing --> guest : guest mode chosen

    unauthenticated --> loading : login / signup attempt
    loading --> authenticated : success
    loading --> error : failure
    error --> loading : retry

    authenticated --> profile_incomplete : profile_completed = false
    profile_incomplete --> authenticated : profile saved

    authenticated --> unauthenticated : logout
    guest --> loading : login from gate
```

---

## D6 — Offline Operation Queue

```mermaid
sequenceDiagram
    participant Screen
    participant MutationHook
    participant OfflineQueue
    participant SyncManager
    participant Repository

    Screen->>MutationHook: logMeal(entry)
    MutationHook->>MutationHook: check isOnline

    alt Online
        MutationHook->>Repository: logMeal(entry)
        Repository-->>MutationHook: UserMeal
        MutationHook->>Screen: success
    else Offline
        MutationHook->>OfflineQueue: enqueue({ op: 'logMeal', payload })
        MutationHook->>Screen: optimistic update (UI shows meal)
    end

    Note over SyncManager: connectivity restored

    SyncManager->>OfflineQueue: dequeue all
    loop for each queued op
        SyncManager->>Repository: execute op
        alt Success
            SyncManager->>OfflineQueue: remove entry
            SyncManager->>Screen: invalidate TanStack cache
        else Retryable failure
            SyncManager->>OfflineQueue: increment retryCount
        else Non-retryable (4xx)
            SyncManager->>OfflineQueue: discard
            SyncManager->>Screen: show "sync conflict" toast
        end
    end
```

---

## D7 — Error Handling Flow

```mermaid
flowchart TD
    ACT[Repository / Use-Case]
    ACT -->|throws AppError subclass| STORE[Zustand Store]
    STORE -->|toUserMessage| ERR[errorMessage string]
    ERR --> SCREEN[Screen renders error inline]

    ACT -->|uncaught| EB[React Error Boundary]
    EB --> FB[Feature Fallback UI<br/>retry button]

    SCREEN -->|for transient errors| TOAST[Toast / Snackbar]

    subgraph Error Types
        NE[NetworkError]
        ICE[InvalidCredentialsError]
        SE[SessionExpiredError]
        VE[ValidationError]
        SVE[ServerError]
    end

    NE & ICE & SE & VE & SVE --> ACT
```

---

## D8 — Stats / Charts Data Flow

```mermaid
flowchart LR
    subgraph Data Sources
        RK[useUserMeals<br/>TanStack Query]
        RR[useRatings<br/>TanStack Query]
    end

    subgraph Aggregation
        AGG[statsAggregator.ts<br/>pure functions]
    end

    subgraph Chart Data
        WT[weeklyTrend<br/>DailySummary array]
        ZD[zoneDistribution<br/>ZoneDistribution]
        RT[ratingTrend<br/>RatingPoint array]
    end

    subgraph Components
        LC[AdherenceLineChart]
        DC[ZoneDonutChart]
        BC[WeeklyBarChart]
    end

    RK -->|meals: UserMeal[]| AGG
    RR -->|ratings: WeeklyRating[]| AGG
    AGG --> WT --> LC
    AGG --> ZD --> DC
    AGG --> RT --> BC
```

---

## D9 — Test Pyramid

```mermaid
graph TB
    subgraph E2E["E2E Tests (5-10) — Detox"]
        E1[login → log meal → view stats]
        E2[signup → complete profile → home]
    end

    subgraph INT["Integration Tests (20-30) — RN Testing Library"]
        I1[LoginScreen + authSession.store + mock repo]
        I2[HomeScreen + useTodayMeals hook]
        I3[StatsScreen + statsAggregator + mock data]
    end

    subgraph UNIT["Unit Tests (50+) — Jest"]
        U1[loginUseCase]
        U2[logMealUseCase]
        U3[statsAggregator pure functions]
        U4[AuthRepositoryMock contract]
        U5[errorUtils.toUserMessage]
        U6[offlineQueue FIFO]
    end

    E2E --> INT --> UNIT

    style E2E fill:#fee2e2,stroke:#ef4444
    style INT fill:#fef9c3,stroke:#eab308
    style UNIT fill:#dcfce7,stroke:#22c55e
```

---

## D10 — Feature Dependency Graph (Target)

```mermaid
graph TD
    subgraph shared["shared/ (no upward deps)"]
        ERR[errors/]
        STO[storage/]
        API[api/]
        OFF[offline/]
    end

    AUTH[features/auth] --> shared
    USER[features/user] --> shared
    MEALS[features/meals] --> shared
    TRACK[features/tracking] --> shared
    TRACK --> MEALS
    COMM[features/community] --> shared
    RATE[features/ratings] --> shared
    STATS[features/stats] --> TRACK
    STATS --> RATE

    APP[app/ screens] --> AUTH
    APP --> USER
    APP --> MEALS
    APP --> TRACK
    APP --> COMM
    APP --> RATE
    APP --> STATS

    style shared fill:#f3f4f6,stroke:#9ca3af
    style APP fill:#dbeafe,stroke:#3b82f6
```

Features may only import from `shared/`. The only allowed cross-feature dependency is `tracking` → `meals` (tracking needs meal types) and `stats` → `tracking` + `ratings` (aggregation input). All others are forbidden.

---

## D11 — Folder Anatomy of One Feature

```
features/auth/
│
├── domain/               Pure business logic — no React, no Supabase
│   ├── auth.types.ts     AuthSession, AuthUser, LoginPayload, SignupPayload
│   ├── auth.schemas.ts   Zod schemas for validation
│   ├── loginUseCase.ts   Orchestrates: validate → repo.login()
│   ├── signupUseCase.ts
│   ├── logoutUseCase.ts
│   └── initSessionUseCase.ts
│
├── repository/           Data access — one interface, two implementations
│   ├── IAuthRepository.ts        ← contract
│   ├── IUserProfileRepository.ts
│   ├── auth.repository.mock.ts   ← AsyncStorage-backed
│   ├── auth.repository.supabase.ts ← supabase.auth.*
│   ├── userProfile.repository.mock.ts
│   ├── userProfile.repository.supabase.ts
│   └── index.ts                  ← factory (picks impl from env)
│
├── store/                Zustand — narrow slices
│   ├── authSession.store.ts   Status machine + session
│   ├── profileSetup.store.ts  Multi-step form state
│   └── authGate.store.ts      UI: gate sheet open/close
│
├── hooks/                React Query + thin store wrappers
│   ├── useAuthSession.ts     thin selector wrapper
│   └── useAuthGate.ts        requireAuth() logic
│
└── components/           Auth-specific UI — dumb, props-only
    ├── SocialAuthButtons.tsx
    ├── AuthGateSheet.tsx
    ├── ProfileStepBasic.tsx
    ├── ProfileStepHealth.tsx
    └── ProfileStepGoals.tsx
```

This pattern repeats for every feature. A new developer can open `features/community/` and understand the entire community feature without reading anything else.
