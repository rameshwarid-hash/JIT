# Manual Test Cases — Clients / Vendors / Employees (Masters)

| Field | Value |
|-------|-------|
| Module | Masters |
| Role | Super Admin (deny PM/FR) |

---

# A. Clients

## Positive
| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| CL-P-01 | Page load | Nav Masters → Clients | H1 Clients; table/search |
| CL-P-02 | Create valid client | Add → name+email+phone → save | 201; searchable; Active |
| CL-P-03 | Auto code | Open Add | Code disabled + generated |
| CL-P-04 | Search by name | Search created | Row visible |
| CL-P-05 | Search by code | Search code | Row visible |
| CL-P-06 | Filter Active/Inactive | Select status | Filtered rows |
| CL-P-07 | Open details | Click row | Overview + Users tabs |
| CL-P-08 | Cancel delete | Delete → Cancel | No DELETE call; record remains |

## Negative
| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| CL-N-01 | Blank name | Submit empty name | No POST; validation |
| CL-N-02 | Invalid email | `a@b` | No POST; validation |
| CL-N-03 | Invalid search | `XYZ123` | Empty state |
| CL-N-04 | PM access URL | PM → `/super-admin/masters/clients` | Redirect away |
| CL-N-05 | FR access URL | FR → clients URL | Redirect away |

## Boundary
| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| CL-B-01 | Max name length | Max chars | Accept or clear limit msg |
| CL-B-02 | Duplicate name | Create same as Internal QA | **Expect reject**; note if 201 defect |
| CL-B-03 | Phone letters | `ABCDEF` | **Expect reject**; note if accepted |
| CL-B-04 | Page size edges | First/last page | Showing label correct |

## UI / A11y / Perf / Exploratory
| ID | Scenario | Expected |
|----|----------|----------|
| CL-U-01 | Columns Name, Code, Users, Email, Phone, Status | Present |
| CL-A-01 | Add dialog focus trap | Works |
| CL-PF-01 | List load | Within SLA |
| CL-E-01 | Pagination page 2 | **Compare UI vs API** (known bug) |
| CL-E-02 | Sort headers | Document missing `aria-sort` |
| CL-S-01 | Delete without confirm | Must not delete |

---

# B. Vendors

## Positive
| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| VN-P-01 | Load + search seed | Search InfraEquip / IER-002 | Found |
| VN-P-02 | Create vendor | Valid name/email/phone | Created + searchable |
| VN-P-03 | Status filters | Active/Inactive | Correct subset |
| VN-P-04 | Cancel add | Open → Cancel | No create |

## Negative / Boundary / Permission
| ID | Scenario | Expected |
|----|----------|----------|
| VN-N-01 | Blank name | Validation; no create |
| VN-N-02 | Invalid email | Validation |
| VN-N-03 | Alphabetic phone | Reject **[VERIFY]** |
| VN-N-04 | Unauthorized role URL | Denied |
| VN-B-01 | Long notes/address | Handled |
| VN-E-01 | Duplicate vendor name | Document actual |

---

# C. Employees

## Positive
| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| EM-P-01 | Load + search seed | Rahul Patel / JIT-EM-005 | Found |
| EM-P-02 | Create PM | Fill + role Project Manager | Created; login possible later |
| EM-P-03 | Create FR | Role Field Resource | Created |
| EM-P-04 | Create SA user | Role Super Administrator | Created **[VERIFY impact]** |
| EM-P-05 | Role filter | Field Resource / PM | Filtered |
| EM-P-06 | Cancel add | Cancel | No create |

## Negative / Boundary / Security
| ID | Scenario | Expected |
|----|----------|----------|
| EM-N-01 | Blank first name | Validation |
| EM-N-02 | Invalid email | Dialog stays; no create |
| EM-N-03 | Weak password | Policy message **[VERIFY]** |
| EM-N-04 | Duplicate email | Reject |
| EM-B-01 | Optional phone/location empty | Allowed |
| EM-R-01 | PM/FR cannot open employees | Denied |
| EM-U-01 | Empty state copy | “No users found” — confirm intended |
| EM-E-01 | Add Gate Pass | Document full behaviour |
| EM-S-01 | Created user password in UI | Not re-displayed in list |

---

## Cross-master regression

| ID | Scenario | Expected |
|----|----------|----------|
| MST-G-01 | Client used in Create Project | Appears in client dropdown |
| MST-G-02 | Vendor used in Create Project | Appears in vendor dropdown |
| MST-G-03 | Employee assignable as PM/FR | Appears in assign search |
