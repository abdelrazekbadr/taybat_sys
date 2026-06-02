# Feature Development Guide
### For Junior Developers — From UI to Supabase

> This guide walks you through building a complete feature from scratch, following the app's architecture. Read `01_architecture_overview.md` first if you haven't.

---

## The 8-Step Flow

Every feature follows the same path through the layers:

```
1. Define Types          →  types/
2. Create DB Table       →  Supabase SQL (or skip if mock-only for now)
3. Repository Interface  →  repositories/<domain>/IFeatureRepository.ts
4. Mock Implementation   →  repositories/<domain>/FeatureRepositoryMock.ts
5. Supabase Impl         →  repositories/<domain>/FeatureRepositorySupabase.ts
6. Factory               →  repositories/<domain>/index.ts
7. Zustand Store         →  stores/feature.store.ts
8. Screen + Components   →  app/(main)/feature.tsx + components/feature/
```

Plus two always-needed housekeeping steps:
- Add translation keys to `localization/translations/ar.json` and `en.json`
- Add any new `STORAGE_KEYS` if the feature persists locally

---

## Worked Example: Health Notes

We'll build a feature where users can write short daily health notes ("how do I feel today?"). This is a complete, realistic example covering every layer.

**Final result:** A screen in the main tab showing today's note with a text field to save it.

---

## Step 1 — Define the Types

File: `types/index.ts` (add to the existing types file)

```typescript
// A single health note written by the user
export interface HealthNote {
  id: number;
  user_id: string;         // references auth.users.id (UUID string)
  note_text: string;
  created_at: string;      // ISO 8601 date string
}
```

**Rules:**
- Use `string` for UUIDs (Supabase IDs are UUIDs, not numbers)
- Use `string` for dates (ISO format — easy to sort and compare)
- Field names match the Supabase table column names (snake_case)

---

## Step 2 — Create the Database Table (Supabase)

> Skip this step while developing in mock mode. Come back when you're ready to connect to Supabase.

Run this SQL in the **Supabase SQL Editor** (Project → SQL Editor → New Query):

```sql
-- Health notes table
create table public.health_notes (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users (id) on delete cascade,
  note_text   text not null,
  created_at  timestamptz not null default now()
);

-- Each user can have one note per day
create unique index health_notes_user_date_idx
  on public.health_notes (user_id, date(created_at at time zone 'UTC'));

-- Row-Level Security: users only see their own notes
alter table public.health_notes enable row level security;

create policy "Users can read their own notes"
  on public.health_notes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own notes"
  on public.health_notes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own notes"
  on public.health_notes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

**Why RLS?** Row-Level Security means even if someone gets your API key, they can never read another user's notes. Supabase enforces this at the database level.

---

## Step 3 — Repository Interface

File: `repositories/healthNotes/IHealthNotesRepository.ts`

```typescript
import type { HealthNote } from '@/types';

export interface CreateNotePayload {
  userId: string;
  noteText: string;
}

export interface IHealthNotesRepository {
  getNoteForToday(userId: string): Promise<HealthNote | null>;
  getNoteHistory(userId: string, limit?: number): Promise<HealthNote[]>;
  saveNote(payload: CreateNotePayload): Promise<HealthNote>;
}
```

**Why an interface?**
This is the contract. The store only knows about this interface — it doesn't care whether the data comes from memory, a file, or Supabase. You can swap the implementation without touching the store.

---

## Step 4 — Mock Implementation

File: `repositories/healthNotes/HealthNotesRepositoryMock.ts`

```typescript
import type { HealthNote } from '@/types';
import type { CreateNotePayload, IHealthNotesRepository } from './IHealthNotesRepository';

let _notes: HealthNote[] = [];
let _nextId = 1;

export class HealthNotesRepositoryMock implements IHealthNotesRepository {
  async getNoteForToday(userId: string): Promise<HealthNote | null> {
    const today = new Date().toISOString().split('T')[0];
    return (
      _notes.find(
        (n) => n.user_id === userId && n.created_at.startsWith(today),
      ) ?? null
    );
  }

  async getNoteHistory(userId: string, limit = 10): Promise<HealthNote[]> {
    return _notes
      .filter((n) => n.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  async saveNote(payload: CreateNotePayload): Promise<HealthNote> {
    const today = new Date().toISOString().split('T')[0];
    const existing = _notes.findIndex(
      (n) => n.user_id === payload.userId && n.created_at.startsWith(today),
    );
    const note: HealthNote = {
      id: existing >= 0 ? _notes[existing].id : _nextId++,
      user_id: payload.userId,
      note_text: payload.noteText,
      created_at: new Date().toISOString(),
    };
    if (existing >= 0) {
      _notes[existing] = note;
    } else {
      _notes.push(note);
    }
    return note;
  }
}
```

**Rules for mock implementations:**
- Use in-memory arrays (`_notes`) — no AsyncStorage needed for data
- Match the interface exactly (same method signatures, same return types)
- Simulate real behavior (today-only filter, upsert logic)

---

## Step 5 — Supabase Implementation

File: `repositories/healthNotes/HealthNotesRepositorySupabase.ts`

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';

import type { HealthNote } from '@/types';
import { NetworkError, NotFoundError, ServerError } from '@/shared/errors/AppError';
import type { CreateNotePayload, IHealthNotesRepository } from './IHealthNotesRepository';

export class HealthNotesRepositorySupabase implements IHealthNotesRepository {
  constructor(private readonly db: SupabaseClient) {}

  async getNoteForToday(userId: string): Promise<HealthNote | null> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await this.db
      .from('health_notes')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', `${today}T00:00:00Z`)
      .lt('created_at', `${today}T23:59:59Z`)
      .maybeSingle();                              // returns null if not found (no error)

    if (error) throw this.mapError(error);
    return data as HealthNote | null;
  }

  async getNoteHistory(userId: string, limit = 10): Promise<HealthNote[]> {
    const { data, error } = await this.db
      .from('health_notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw this.mapError(error);
    return (data ?? []) as HealthNote[];
  }

  async saveNote(payload: CreateNotePayload): Promise<HealthNote> {
    // upsert: insert or update if same user+date exists (relies on unique index)
    const { data, error } = await this.db
      .from('health_notes')
      .upsert(
        { user_id: payload.userId, note_text: payload.noteText },
        { onConflict: 'user_id,date(created_at at time zone \'UTC\')' },
      )
      .select()
      .single();

    if (error) throw this.mapError(error);
    if (!data) throw new NotFoundError('NOT_FOUND', 'لم يتم حفظ الملاحظة');
    return data as HealthNote;
  }

  private mapError(error: { code?: string; message?: string }): Error {
    if (error.code === 'PGRST301' || error.message?.includes('network')) {
      return new NetworkError(error);
    }
    return new ServerError('SERVER_ERROR', 'حدث خطأ في الخادم', error);
  }
}
```

**Key Supabase patterns used:**
- `.from('table_name')` — selects the table
- `.select('*')` — returns all columns
- `.eq('column', value)` — WHERE column = value
- `.maybeSingle()` — returns one row or null (never throws on missing)
- `.single()` — returns one row, throws if missing
- `.upsert()` — insert or update on conflict
- `.order('column', { ascending: false })` — ORDER BY

---

## Step 6 — Factory (Picks Mock or Supabase)

File: `repositories/healthNotes/index.ts`

```typescript
import { supabase } from '@/lib/supabase';

import type { IHealthNotesRepository } from './IHealthNotesRepository';
import { HealthNotesRepositoryMock } from './HealthNotesRepositoryMock';
import { HealthNotesRepositorySupabase } from './HealthNotesRepositorySupabase';

const USE_MOCK = process.env.EXPO_PUBLIC_USE_MOCK !== 'false';

export const healthNotesRepository: IHealthNotesRepository = USE_MOCK
  ? new HealthNotesRepositoryMock()
  : new HealthNotesRepositorySupabase(supabase);

export type { CreateNotePayload, IHealthNotesRepository } from './IHealthNotesRepository';
```

This is the only file that knows about `EXPO_PUBLIC_USE_MOCK`. The store imports `healthNotesRepository` and never cares which implementation is behind it.

---

## Step 7 — Zustand Store

File: `stores/healthNotes.store.ts`

```typescript
import { create } from 'zustand';

import { healthNotesRepository } from '@/repositories/healthNotes';
import { toUserMessage } from '@/shared/errors/AppError';
import type { HealthNote } from '@/types';

import { useUserStore } from './user.store';

interface HealthNotesState {
  todayNote: HealthNote | null;
  noteHistory: HealthNote[];
  isLoading: boolean;
  isSaving: boolean;
  errorMessage: string;

  initializeNotes: () => Promise<void>;
  saveNote: (text: string) => Promise<boolean>;
  resetNotes: () => void;
}

const initialState = {
  todayNote: null,
  noteHistory: [] as HealthNote[],
  isLoading: false,
  isSaving: false,
  errorMessage: '',
};

export const useHealthNotesStore = create<HealthNotesState>((set, get) => ({
  ...initialState,

  initializeNotes: async () => {
    set({ isLoading: true, errorMessage: '' });
    try {
      const user = useUserStore.getState().user;
      if (!user) {
        set({ isLoading: false });
        return;
      }
      const [todayNote, noteHistory] = await Promise.all([
        healthNotesRepository.getNoteForToday(user.id),
        healthNotesRepository.getNoteHistory(user.id),
      ]);
      set({ todayNote, noteHistory, isLoading: false });
    } catch (error: unknown) {
      set({ isLoading: false, errorMessage: toUserMessage(error) });
    }
  },

  saveNote: async (text) => {
    set({ isSaving: true, errorMessage: '' });
    try {
      const user = useUserStore.getState().user;
      if (!user) {
        set({ isSaving: false, errorMessage: 'تعذّر العثور على المستخدم' });
        return false;
      }
      const saved = await healthNotesRepository.saveNote({
        userId: user.id,
        noteText: text,
      });
      // update both today's note and history
      set((state) => ({
        todayNote: saved,
        noteHistory: [saved, ...state.noteHistory.filter((n) => n.id !== saved.id)],
        isSaving: false,
      }));
      return true;
    } catch (error: unknown) {
      set({ isSaving: false, errorMessage: toUserMessage(error) });
      return false;
    }
  },

  resetNotes: () => set({ ...initialState }),
}));
```

**Important patterns:**
- Two separate loading flags: `isLoading` (fetching) vs `isSaving` (write in progress) — lets the UI show different spinners
- Use `useUserStore.getState()` (not the hook) — stores can't subscribe to each other
- `toUserMessage(error)` converts any error to Arabic for the user
- `saveNote` returns `boolean` — the screen can show a success message on `true`

Also register the reset in `stores/storeReset.ts`:

```typescript
// Add this line inside resetAllAppStores():
useHealthNotesStore.getState().resetNotes();
```

And export from `stores/index.ts`:

```typescript
export * from './healthNotes.store';
```

---

## Step 8 — Screen

File: `app/(main)/health-notes.tsx`

```tsx
import React from 'react';
import { View, ScrollView } from 'react-native';
import { TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { AppText } from '@/components/common/AppText';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { useHealthNotesStore } from '@/stores/healthNotes.store';

export default function HealthNotesScreen() {
  const { t } = useTranslation();

  const todayNote = useHealthNotesStore((s) => s.todayNote);
  const isLoading = useHealthNotesStore((s) => s.isLoading);
  const isSaving = useHealthNotesStore((s) => s.isSaving);
  const errorMessage = useHealthNotesStore((s) => s.errorMessage);
  const initializeNotes = useHealthNotesStore((s) => s.initializeNotes);
  const saveNote = useHealthNotesStore((s) => s.saveNote);

  const [text, setText] = React.useState('');

  React.useEffect(() => {
    initializeNotes();
  }, [initializeNotes]);

  React.useEffect(() => {
    if (todayNote) setText(todayNote.note_text);
  }, [todayNote]);

  const handleSave = async () => {
    if (!text.trim()) return;
    const success = await saveNote(text.trim());
    if (success) {
      // Optionally show a toast or a brief confirmation
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-app-background">
        <AppText>{t('loading')}</AppText>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-app-background p-4">
      <AppText variant="bold" className="mb-4 text-xl text-app-text text-right">
        {t('health_notes.title')}
      </AppText>

      <TextInput
        multiline
        numberOfLines={4}
        value={text}
        onChangeText={setText}
        placeholder={t('health_notes.placeholder')}
        className="mb-4 bg-app-surface"
        textAlign="right"
      />

      {errorMessage ? (
        <AppText className="mb-4 text-sm text-red-500 text-right">{errorMessage}</AppText>
      ) : null}

      <PrimaryButton
        label={t('health_notes.save')}
        onPress={handleSave}
        loading={isSaving}
        disabled={!text.trim() || isSaving}
      />
    </ScrollView>
  );
}
```

**Screen rules:**
- Screen only reads state and calls actions — no business logic here
- Subscribe to individual slices: `useStore((s) => s.field)` not `useStore()`
- Call `initializeNotes()` in `useEffect` when the screen mounts
- Display `errorMessage` directly — no try/catch in the screen

---

## Step 9 — Add Translations

File: `localization/translations/ar.json` — add:

```json
"health_notes": {
  "title": "ملاحظة صحية اليوم",
  "placeholder": "كيف تشعر اليوم؟ اكتب ملاحظة قصيرة...",
  "save": "حفظ الملاحظة",
  "saved": "تم الحفظ"
}
```

File: `localization/translations/en.json` — add:

```json
"health_notes": {
  "title": "Today's Health Note",
  "placeholder": "How do you feel today? Write a short note...",
  "save": "Save Note",
  "saved": "Saved"
}
```

---

## Checklist Before You're Done

```
[ ] Type defined in types/index.ts
[ ] SQL table created in Supabase (or documented for later)
[ ] Interface file: IHealthNotesRepository.ts
[ ] Mock implementation matches interface exactly
[ ] Supabase implementation handles errors with AppError subclasses
[ ] Factory index.ts picks the right implementation
[ ] Store follows the standard shape (isLoading, errorMessage, reset)
[ ] Store's reset added to stores/storeReset.ts
[ ] Store exported from stores/index.ts
[ ] Screen subscribes to individual slices (not the whole store)
[ ] Screen calls initialize in useEffect
[ ] Translation keys added to both ar.json and en.json
[ ] npm run typecheck passes (zero errors)
[ ] npm run lint passes (zero errors)
```

---

## Quick Reference — What Goes Where

| You need to… | File to change |
|---|---|
| Add a field to the type | `types/index.ts` |
| Add a DB column | Supabase SQL Editor |
| Add a method to the feature | `IFeatureRepository.ts` → both impls → store action |
| Change an error message | `shared/errors/AppError.ts` or store catch block |
| Add a screen | `app/(main)/new-screen.tsx` |
| Add a tab entry | `app/(main)/_layout.tsx` |
| Add a translation string | Both `ar.json` and `en.json` |
| Persist something locally | `shared/storage/storageKeys.ts` + `storageService` |

---

## Common Mistakes to Avoid

**Don't call repositories from screens.**
Screens only call store actions. Repositories are hidden behind the store.

**Don't use the hook inside a store.**
```typescript
// ❌ Wrong — hooks only work in React components
const user = useUserStore((s) => s.user);

// ✅ Correct — use getState() inside stores
const user = useUserStore.getState().user;
```

**Don't forget to export from `stores/index.ts`.**
If you forget, TypeScript won't complain but the store won't be accessible via the barrel import.

**Don't hardcode Arabic text in JSX.**
Even single words must go through `t('key')`. Future language additions will thank you.

**Don't return early from the repository interface.**
The interface defines the contract. If your mock needs to return early, return the zero value (empty array, null) — don't change the signature.
