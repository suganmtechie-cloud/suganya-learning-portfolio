# Learning Studio resource library

## Available resources

The React workspace includes five curated links to existing portfolio materials:

- Learning design approach
- Assessment and rubric
- Feedback system
- Sample 90-minute session
- Course and module template

These links point to the existing Markdown resources in this repository. The source files remain the maintained versions; the React library does not copy or fork their contents.

## Add a resource

A user can add a title, short description, category, format and HTTPS URL. The library rejects non-HTTPS schemes, embedded URL credentials, malformed links and duplicate URLs.

Custom links are stored in the current browser's local storage. They are not uploaded, shared with other users or synchronized across devices. Do not enter private learner information or confidential company links.

## Current limitations

- No file upload or download service is enabled.
- No cloud resource table or Supabase migration has been applied.
- No Firebase resource collection is active.
- Browser storage is a convenience for this preview, not a backup or access-control boundary.

Before enabling cloud resources, choose the active backend, define owner-scoped records and review its security policies. If Supabase is selected, enable Row Level Security and test cross-user denial before exposing resource rows or storage objects to the browser.
