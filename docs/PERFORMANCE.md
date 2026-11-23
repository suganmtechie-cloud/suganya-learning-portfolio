# Learning Studio performance architecture

The application keeps the initial workspace focused and defers code that is not needed immediately.

## Loading boundaries

- **Application shell:** React, the pathway workspace and shared styles load on the initial visit.
- **Module and lesson editor:** loaded when a saved pathway draft renders the editor. The editor is not part of the initial workspace chunk when there are no drafts.
- **Resource library:** loaded when its section approaches the viewport. An IntersectionObserver with a 600-pixel root margin starts the import before the user reaches the section. Browsers without Intersection Observer load it immediately.
- **Firebase Authentication:** the sign-in panel is loaded only after the user selects **Load cloud sign-in**. The Firebase web configuration module itself contains no Firebase SDK imports.
- **Cloud Firestore:** the repository dynamically imports its Firestore adapter only when a signed-in user requests pathway data. Browser drafts remain available without cloud configuration.

React lazy and Suspense provide the code-splitting boundary and an accessible loading message. The resource-library placeholder reserves visible space until the section is close to the viewport.

## Verify locally

```bash
npm run test:unit
npm run typecheck
npm run build
```

In browser developer tools, inspect the Network panel with cache disabled:

1. Open /app/ without scrolling. The resource-library, module-editor, Firebase Auth and Firestore chunks should not be requested.
2. Scroll near the resource-library section. Its chunk should load and replace the placeholder.
3. Create a pathway draft. The module and lesson editor chunk should load when the draft appears.
4. Select **Load cloud sign-in**. Firebase Auth code should load.
5. After a successful sign-in, Firestore code should load when the workspace requests the user's pathways.

The application must continue to work with Firebase configuration absent: browser drafts remain usable and the cloud sign-in panel is replaced by setup guidance.

## Bundle-size policy

Do not hide Vite's chunk-size warning by raising build.chunkSizeWarningLimit without measurement. Record generated chunk sizes in CI or a local production build, then investigate any remaining large eager dependencies before adding more tooling.
