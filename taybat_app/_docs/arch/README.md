# Taybat App — Architecture Refactoring Plan

**Date:** 2026-05-25  
**Scope:** React Native (Expo 54) · TypeScript · Zustand · Supabase · NativeWind · React Native Paper

---

## Document Index

| File | Purpose |
|---|---|
| [01_current_state.md](./01_current_state.md) | Current architecture inventory, layer map, identified problems |
| [02_target_architecture.md](./02_target_architecture.md) | Target design: Clean Architecture + Repository pattern, full diagrams |
| [03_folder_structure.md](./03_folder_structure.md) | Proposed directory tree with naming conventions |
| [04_refactor_phases.md](./04_refactor_phases.md) | Phased migration plan — each phase is independently deliverable |
| [05_patterns_reference.md](./05_patterns_reference.md) | Canonical code patterns each layer must follow |

---

## Goal Summary

Transform the current working prototype into a **production-ready, team-scalable** codebase while keeping the app running at every step.

| Dimension | Current | Target |
|---|---|---|
| Architecture | Ad-hoc layering | Clean Architecture (Presentation → Domain → Data) |
| API layer | Mock-only, not swappable | Repository/Adapter — mock & Supabase behind same interface |
| State | Mixed concerns in stores | Domain stores + TanStack Query for server state |
| Error handling | Ad-hoc strings | Typed error hierarchy, React Error Boundaries |
| Offline | None | Operation queue with Supabase sync |
| Testing | Zero coverage | Store unit tests, repository mocks, component snapshots |
| Folder | Layer-based (`stores/`, `api/`) | Feature-based with shared core |

---

## Quick Navigation

- Architecture diagrams → [02_target_architecture.md](./02_target_architecture.md)
- Where to put new files → [03_folder_structure.md](./03_folder_structure.md)
- What to build first → [04_refactor_phases.md](./04_refactor_phases.md)
- How to write a store → [05_patterns_reference.md](./05_patterns_reference.md)
