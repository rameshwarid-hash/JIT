# QA Documentation Index

Principal QA analysis for **JIT Project Activity Reporting System** (Playwright automation repo + staging app + Excel TC packs).

## Status

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 1 | [PROJECT_ANALYSIS.md](./PROJECT_ANALYSIS.md) | Done |
| 2 | [ROLE_MATRIX.md](./ROLE_MATRIX.md) | Done |
| 3 | [BUSINESS_RULES.md](./BUSINESS_RULES.md) | Done |
| 4 | [TEST_STRATEGY.md](./TEST_STRATEGY.md) | Done |
| 5 | [BUG_PATTERNS.md](./BUG_PATTERNS.md) | Done |
| 6 | [test-cases/](./test-cases/) | Done |
| 7 | [framework/FRAMEWORK_REVIEW.md](./framework/FRAMEWORK_REVIEW.md) | Done |
| 8 | [framework/RECOMMENDED_STRUCTURE.md](./framework/RECOMMENDED_STRUCTURE.md) | Done |
| 9 | Playwright automation expansion | **Blocked** until P0 fixes + product decisions |
| 10 | Role-based execution matrix | Defined in TEST_STRATEGY / ROLE_MATRIX |
| 11 | Exploratory | [EXPLORATORY_BUG_CATALOG.md](./EXPLORATORY_BUG_CATALOG.md) + BUG_PATTERNS |
| 12 | Code quality | FRAMEWORK_REVIEW SOLID/DRY/KISS |

## Confirmed roles

1. Super Admin / Super Administrator  
2. Project Manager  
3. Field Resource  

*(No separate Manager / Employee / Admin portal found — env keys `ADMIN_*` and `EMPLOYEE_*` map to PM and FR.)*

## Highest-priority suspected defects

1. Client pagination UI vs API desync  
2. Client phone accepts alphabetic values  
3. Duplicate client names may return 201  
4. FR may not see PM comments (`Comments (0)`)  
5. Project Edit missing → update sync untestable  
6. Automation: missing `cancelAdd*` methods; E2E parallel state risk  

## Next recommended actions

1. Log suspected defects in your tracker.  
2. Fix P0 framework issues (see FRAMEWORK_REVIEW).  
3. Manually execute smoke + RBAC + comment visibility charters.  
4. Only then expand Phase 9 automation against `docs/test-cases/*`.
