# Mobile-First Progressive Web App

**Category:** DX Improvement
**Quarter:** Q3
**T-shirt Size:** M

## Why This Matters

Cat feeding happens at home, often in the kitchen, typically with a phone in hand. The most natural moment to log a meal is immediately after feeding—standing by the food bowl with a phone. Yet the current app, while responsive, is not optimized for this mobile-first use case. There's no offline support, no "add to home screen" prompt, no push notifications, and the UI wasn't designed for one-handed thumb operation.

A Progressive Web App (PWA) transforms the experience. Users can install the app to their home screen, log meals offline (syncing when back online), receive reminders to feed or log, and interact with a UI designed for mobile ergonomics. This meets users where they are—in the kitchen, phone in hand, cat demanding breakfast.

PWAs also reduce friction compared to native apps: no app store approval, instant updates, one codebase for all platforms, and lower maintenance burden.

## Current State

- Responsive design exists (Tailwind breakpoints)
- No `manifest.json` for PWA installation
- No service worker for offline support
- No push notification capability
- No "add to home screen" flow
- UI designed desktop-first, adapted to mobile
- Heavy reliance on dialogs (awkward on mobile)
- No gesture support (swipe actions)
- No offline data persistence

## Proposed Future State

**PWA Infrastructure:**
- Web app manifest with icons, colors, display mode
- Service worker with smart caching strategies
- Offline-first architecture with background sync
- Install prompt at appropriate moments
- Standalone display mode (feels like native app)

**Mobile-Optimized UI:**
- Bottom navigation instead of header-only nav
- Larger touch targets (minimum 48px)
- Thumb-zone optimization (important actions reachable one-handed)
- Swipe gestures for common actions (swipe to mark preference)
- Pull-to-refresh patterns
- Floating action button for quick meal logging
- Sheet-style dialogs instead of centered modals

**Offline Support:**
- Meal logging works offline
- Queued sync when connection restored
- Visual indicator for sync status
- Conflict resolution for offline edits
- Local data persistence (IndexedDB)

**Push Notifications:**
- Feeding reminders (customizable times)
- Low inventory alerts
- Household activity notifications
- Permission request at appropriate moment

**Performance:**
- Aggressive asset caching
- Optimized bundle splitting
- Image optimization (WebP, lazy loading)
- Skeleton loading states
- Target: Lighthouse PWA score > 95

## Key Deliverables

- [ ] Create `manifest.json` with app metadata and icons
- [ ] Implement service worker with Workbox
- [ ] Design and implement offline storage layer (IndexedDB)
- [ ] Build background sync for offline actions
- [ ] Create install prompt component and logic
- [ ] Redesign navigation for mobile (bottom nav)
- [ ] Increase all touch targets to 48px minimum
- [ ] Implement swipe gestures on meal/food cards
- [ ] Create floating action button for quick add
- [ ] Convert dialogs to bottom sheets on mobile
- [ ] Implement pull-to-refresh
- [ ] Build sync status indicator
- [ ] Implement push notification infrastructure
- [ ] Create notification preferences UI
- [ ] Add feeding reminder system
- [ ] Optimize images with next/image and WebP
- [ ] Implement code splitting and lazy loading
- [ ] Achieve Lighthouse PWA score > 95
- [ ] Add loading skeletons throughout

## Prerequisites

- Smart Inventory Management (#05) - For low-stock push notifications
- Multi-User Household (#06) - For household activity notifications

## Risks & Open Questions

- **iOS limitations**: iOS Safari has limited PWA support (no push notifications until iOS 16.4+, limited background sync). Need graceful degradation.
- **Service worker complexity**: Caching strategies are complex. Wrong choices lead to stale data or cache bloat.
- **Offline conflict resolution**: If multiple household members make offline changes, how to resolve? Last-write-wins? Merge?
- **Notification permission**: Users are notification-fatigued. Need to ask at the right moment with clear value proposition.
- **Testing complexity**: Testing offline scenarios and push notifications is challenging. Need robust testing strategy.
- **Bundle size**: Service worker adds overhead. Need to monitor total bundle size impact.

## Notes

PWA configuration files to create:
```
public/
  manifest.json
  icons/
    icon-192.png
    icon-512.png
    apple-touch-icon.png
  sw.js (or via next-pwa)
```

Recommended tooling:
- **next-pwa** or **@serwist/next** - Service worker integration with Next.js
- **workbox** - Service worker utilities
- **idb-keyval** - Simple IndexedDB wrapper for offline storage
- **web-push** - Server-side push notification handling

Key files to modify:
- `next.config.mjs` - PWA configuration
- `app/layout.tsx` - Meta tags, manifest link
- `components/layout/*` - Mobile navigation redesign
- All dialog components - Convert to sheets on mobile
- New: `lib/offline.ts` - Offline storage and sync
- New: `lib/push.ts` - Push notification handling
- New: `components/ui/bottom-sheet.tsx` - Mobile-friendly modals

Mobile navigation pattern:
```
Desktop: Header with horizontal nav
Mobile: Bottom nav with 4-5 icons (Home, Foods, Meals, Dashboard, Settings)
```

This initiative enhances: Every other initiative benefits from better mobile UX
