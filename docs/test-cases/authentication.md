# Manual Test Cases — Authentication

| Field | Value |
|-------|-------|
| Module | Authentication |
| Roles | Super Admin, Project Manager, Field Resource |
| Related rules | AUTH-*, RBAC-05 |

---

## Positive

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| AUTH-P-01 | SA login | Open `/login` → valid SA creds → Sign In | Leave login; land `/super-admin/dashboard`; `ji_access_token` set |
| AUTH-P-02 | PM login | Valid PM creds | Land `/project-manager/dashboard`; token set |
| AUTH-P-03 | FR login | Valid FR creds | Land `/field-resource/dashboard`; token set |
| AUTH-P-04 | Logout SA | Profile → Log out | `/login`; token cleared |
| AUTH-P-05 | Re-login after logout | Logout → login again | Fresh session works |
| AUTH-P-06 | Login page branding | Open `/login` | Title Sign In; heading Project Activity Reporting System |

## Negative

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| AUTH-N-01 | Wrong password | Valid email + wrong password | Stay on `/login`; error alert; no token |
| AUTH-N-02 | Unknown email | Fake email + any password | Stay on login; error |
| AUTH-N-03 | Empty email | Blank email + password → Sign In | Validation; no successful API auth |
| AUTH-N-04 | Empty password | Email + blank password | Validation; stay on login |
| AUTH-N-05 | Both empty | Sign In with blanks | Validation; stay on login |
| AUTH-N-06 | SQL/XSS in email | `' OR 1=1--` / `<script>` | Rejected; no XSS execution |

## Boundary

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| AUTH-B-01 | Extremely long email | 500+ char email | Handled gracefully |
| AUTH-B-02 | Extremely long password | 500+ char password | Handled gracefully |
| AUTH-B-03 | Leading/trailing spaces in email | ` user@x.com ` | Trim or reject consistently |

## UI

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| AUTH-U-01 | Remember me visible | Inspect login | Checkbox present |
| AUTH-U-02 | Forgot Password link | Inspect | Link present and navigates |
| AUTH-U-03 | Password masking | Type password | Masked input |
| AUTH-U-04 | Responsive login | 375/768/1280 | No overlap; controls usable |

## Permission

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| AUTH-R-01 | Unauthenticated SA URL | Clear storage → `/super-admin/dashboard` | Redirect `/login` |
| AUTH-R-02 | Unauthenticated PM URL | `/project-manager/dashboard` | Redirect `/login` |
| AUTH-R-03 | Unauthenticated FR URL | `/field-resource/dashboard` | Redirect `/login` |

## Accessibility

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| AUTH-A-01 | Labels | Screen reader / a11y tree | Email Address, Password labelled |
| AUTH-A-02 | Keyboard submit | Tab to Sign In / Enter | Submits |
| AUTH-A-03 | Error announced | Failed login | Alert accessible |

## Security

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| AUTH-S-01 | Token not in URL | After login | No token query params |
| AUTH-S-02 | Password not in localStorage | Inspect storage | Password absent |
| AUTH-S-03 | Brute force UX | Many failures | Rate limit or lock messaging **[VERIFY]** |
| AUTH-S-04 | CSRF/login API | Direct POST without UI | Server validates |

## Regression

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| AUTH-G-01 | Role switch same browser | SA logout → PM login → FR login | Correct homes each time; no menu bleed |
| AUTH-G-02 | Post-logout deep link | Logout → FR dashboard | Force login (E2E_010) |

## Performance

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| AUTH-PF-01 | Login latency | Measure Sign In → dashboard | Within agreed SLA (e.g. <5s staging) |

## Exploratory / Edge

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| AUTH-E-01 | Mid-login refresh | Submit then F5 quickly | Consistent end state |
| AUTH-E-02 | Two tabs login different roles | Tab A SA, Tab B PM (sessionStorage) | Document actual isolation behaviour |
| AUTH-E-03 | Delete token mid-session | Remove `ji_access_token` → navigate | Re-auth required |
| AUTH-E-04 | Back button after login | Browser Back | Does not re-show authenticated form incorrectly |
| AUTH-E-05 | Expired refresh token | Wait/force expiry | Clear error + login |
