# Changelog - Ponloe.org v3.6

## [3.6.0] - 2026-03-02

### Added
- **Dark Mode System**: Complete implementation of dark mode with `ThemeContext`.
- **Theme Toggle**: Added a theme toggle switch in the `EditProfileModal` and updated the UI to respond to theme changes.
- **Share Menu**: New custom share modal for posts with options for Facebook, Telegram, WhatsApp, and link copying.
- **Saved Posts**: Added a "Saved" tab in the user profile to view and manage posts saved by the user.
- **Follow/Unfollow Logic**: Implemented real-time follow/unfollow functionality with Supabase integration.
- **PWA Service Worker**: Registered a service worker to enable PWA features and offline caching.
- **Theme-Aware UI**: Updated all major components (`App`, `FeedView`, `HomeWidgets`, `PostCard`, `PostFooter`, `ProfileView`, `EditProfileModal`) to support dark mode styling.

### Fixed
- **UI Consistency**: Improved responsive design and loading states across the application.
- **Post Actions**: Fixed the "Save Post" functionality to correctly sync with Supabase.
- **Navigation**: Enhanced the mobile top navigation with theme-aware active states.

### Technical Changes
- Added `ThemeContext.tsx` for global state management of the application theme.
- Created `ShareMenu.tsx` component for enhanced social sharing.
- Created `SavedPostsView.tsx` for displaying user's bookmarked content.
- Created `FollowButton.tsx` for reusable follow logic.
- Integrated `registerServiceWorker` in `main.tsx`.
- Applied Tailwind dark mode classes across the codebase.

---
*Developed with ❤️ for Ponloe.org*
