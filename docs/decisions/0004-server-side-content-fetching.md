# ADR 0004: Server-Side Content Fetching via Service Role

**Date:** 2026-05-21
**Status:** Accepted

## Context

Course content tables (content_library_elements, question_bank, primary_source_citations, glossary, case_studies) currently have RLS policies that grant access only to the service role. Authenticated students cannot read these tables directly from the browser.

The alternative would be authenticated-read policies gated on enrollment (e.g., `EXISTS (SELECT 1 FROM enrollments WHERE student_id = auth.uid() AND course_id = content_library_elements.course_id AND status = 'active')`).

## Decision

Keep service-role-only access. All content reads go through Server Actions or API routes that use the lib/supabase/admin.ts client, after the server code has verified the student's enrollment via application logic.

## Alternatives considered

- Enrollment-gated authenticated-read RLS policies. Rejected: makes RLS the only enforcement layer; a buggy policy is a content leak.
- Allow authenticated read for all content with no gating. Rejected: defeats the point of paid courses.

## Consequences

- +defense-in-depth (application logic + RLS would both have to fail for a leak)
- +simpler RLS policies, easier to audit
- +faster queries (service role skips RLS evaluation)
- +course content cannot be queried by a browser, even from an authenticated session — structurally impossible
- -all content reads must go through server-side code; no client-side Supabase queries against content tables
- -lib/lesson/, lib/mock/, lib/grader/ etc. must always use the admin client for content reads
