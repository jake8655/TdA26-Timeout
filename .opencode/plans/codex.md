## Restore Material Actions + Simplify Module Creation + Enforce Reveal Rules

### Summary

- Add schema validation to the newly introduced module form.
- Reduce module creation to title + description only (frontend + backend contract).
- Restore pre-module material action UX (Visit Site / Download) for both lecturer and student views.
- Enforce “cannot reveal empty module” in backend and mirror that in frontend with disabled reveal + hint.
- Regenerate web API client after schema change and run targeted checks.

### Important API / Interface Changes

1. ModuleCreateRequest contract will change:

- Remove initialMaterialName
- Remove initialMaterialUrl
- Remove initialMaterialDescription
- Remove initialQuizTitle
- Keep only title and optional description

2. PUT /courses/{courseId}/modules/{moduleId}/reveal behavior will change:

- Returns 400 when module has no materials and no quizzes.
- Existing success behavior unchanged for non-empty modules in live courses.

### Implementation Plan

1. Update module form validation and fields in frontend

- File: course-modules-section.tsx
- Add a zod schema for module form (title required/non-blank, description string).
- Attach schema via validators.onChange in useAppForm.
- Remove initialMaterial* and initialQuizTitle from:
    - defaultValues
    - submit payload
    - rendered form fields
- Keep create/edit mode behavior, with create submitting only title/description.

2. Restore lecturer material action buttons (pre-module behavior)

- File: course-modules-section.tsx
- In module material rows, add right-side action button:
    - URL material: Visit Site + external-link icon
    - File material: Download + download icon
- Keep existing edit/delete controls for lecturer.
- Preserve existing draft-only edit/delete restrictions.

3. Restore student material action buttons (pre-module behavior)

- File: course-detail-client.tsx
- Update ModuleMaterialRow UI to include explicit right-side action buttons:
    - URL: Visit Site
    - File: Download
- Keep links opening in new tab as before.

4. Enforce reveal rule in frontend UX (chosen option)

- File: course-modules-section.tsx
- Compute per-module content count (materials + quizzes).
- Disable Reveal button when count is 0.
- Add small inline hint near action area explaining reveal requires at least one material or quiz.

5. Enforce reveal rule in backend

- File: ModuleController.java
- createModule:
    - Remove initial-content requirement check.
    - Remove initial material/quiz auto-creation logic.
- CreateModuleRequest:
    - Keep only title, description.
- revealModule:
    - Add guard: if module has zero file attachments, zero URL attachments, and zero quizzes, return 400 with clear message.
- Keep existing auth and live-status checks.

6. Sync OpenAPI schema and generated client

- File: server-schema.yml
- Update ModuleCreateRequest schema to only title + description.
- Regenerate web client artifacts with bun openapi:generate in apps/web:
    - types.gen.ts
    - sdk.gen.ts
    - zod.gen.ts
    - @tanstack/react-query.gen.ts
    - plus any other generated files touched by the generator.

### Test Cases and Verification

1. Frontend functional checks

- Create-module dialog shows only title and description.
- Empty title is blocked by client validation.
- Module can be created without material/quiz.
- Lecturer module material rows show Visit Site or Download buttons.
- Student module material rows show Visit Site or Download buttons.
- Empty module in live state has disabled Reveal + hint text.
- Non-empty module in live state can be revealed.

2. Backend API checks

- POST /courses/{courseId}/modules with {title, description} returns 201.
- PUT /courses/{courseId}/modules/{moduleId}/reveal on empty module returns 400.
- Same reveal call on non-empty module returns 200 and marks module visible.

3. Static/build checks

- cd apps/web && bun types
- cd apps/web && bun check
- cd apps/server && ./google-java-format -n $(find ./src -name "*.java")
- cd apps/server && ./gradlew build

### Assumptions and Defaults

- “All new forms” scope = newly added module form only (not a broad audit of unchanged forms).
- “Same as before” for material actions means explicit labeled buttons (Visit Site / Download) with old interaction pattern (open in new tab).
- Frontend reveal UX uses disabled button + hint, with backend still authoritative.
- No test files under tests/ will be touched or run.
