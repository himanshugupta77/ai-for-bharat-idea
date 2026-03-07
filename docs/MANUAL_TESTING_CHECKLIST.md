# Manual Testing Checklist

## Overview

This document provides a comprehensive manual testing checklist for the Bharat Sahayak AI Assistant platform. Manual testing validates user experience, accessibility, and cross-platform compatibility that automated tests cannot fully cover.

**Requirements Validated:** 24.4, 24.5

## Testing Environment Setup

### Required Devices
- [ ] Desktop/Laptop (Windows, macOS, Linux)
- [ ] Android phone (multiple screen sizes)
- [ ] iPhone (multiple screen sizes)
- [ ] Tablet (iPad, Android tablet)

### Required Browsers
- [ ] Google Chrome (latest)
- [ ] Mozilla Firefox (latest)
- [ ] Safari (latest)
- [ ] Microsoft Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Required Tools
- [ ] Screen reader (NVDA on Windows, JAWS, VoiceOver on macOS/iOS)
- [ ] Keyboard only (no mouse)
- [ ] Network throttling tools (Chrome DevTools)
- [ ] Color contrast analyzer
- [ ] Browser zoom (up to 200%)

## 1. Browser Compatibility Testing

### Chrome (Desktop)
- [ ] Landing page loads correctly
- [ ] Chat interface works
- [ ] Voice input/output works
- [ ] Eligibility form works
- [ ] Language switching works
- [ ] Dark mode works
- [ ] Low bandwidth mode works
- [ ] Animations are smooth
- [ ] No console errors

### Firefox (Desktop)
- [ ] Landing page loads correctly
- [ ] Chat interface works
- [ ] Voice input/output works
- [ ] Eligibility form works
- [ ] Language switching works
- [ ] Dark mode works
- [ ] Low bandwidth mode works
- [ ] Animations are smooth
- [ ] No console errors

### Safari (Desktop)
- [ ] Landing page loads correctly
- [ ] Chat interface works
- [ ] Voice input/output works (check WebKit compatibility)
- [ ] Eligibility form works
- [ ] Language switching works
- [ ] Dark mode works
- [ ] Low bandwidth mode works
- [ ] Animations are smooth
- [ ] No console errors

### Edge (Desktop)
- [ ] Landing page loads correctly
- [ ] Chat interface works
- [ ] Voice input/output works
- [ ] Eligibility form works
- [ ] Language switching works
- [ ] Dark mode works
- [ ] Low bandwidth mode works
- [ ] Animations are smooth
- [ ] No console errors

## 2. Mobile Device Testing

### iOS (iPhone)
- [ ] Landing page is responsive
- [ ] Touch interactions work (tap, swipe, scroll)
- [ ] Chat interface is usable on small screen
- [ ] Voice input works with iOS microphone
- [ ] Voice output plays correctly
- [ ] Eligibility form is usable
- [ ] Language selector works
- [ ] Dark mode works
- [ ] Keyboard appears correctly for text input
- [ ] No horizontal scrolling
- [ ] Safe area insets respected (notch)
- [ ] Orientation change handled (portrait/landscape)

### Android (Phone)
- [ ] Landing page is responsive
- [ ] Touch interactions work
- [ ] Chat interface is usable on small screen
- [ ] Voice input works with Android microphone
- [ ] Voice output plays correctly
- [ ] Eligibility form is usable
- [ ] Language selector works
- [ ] Dark mode works
- [ ] Keyboard appears correctly
- [ ] No horizontal scrolling
- [ ] Back button works correctly
- [ ] Orientation change handled

### iPad/Tablet
- [ ] Landing page uses tablet layout
- [ ] Chat interface uses two-column layout
- [ ] Touch interactions work
- [ ] Voice input/output works
- [ ] Eligibility form is well-spaced
- [ ] Language selector works
- [ ] Dark mode works
- [ ] Orientation change handled

## 3. Screen Reader Testing

### NVDA (Windows)
- [ ] Landing page is announced correctly
- [ ] Navigation landmarks are identified
- [ ] Buttons have descriptive labels
- [ ] Form fields have labels
- [ ] Error messages are announced
- [ ] Chat messages are announced
- [ ] Scheme cards are announced
- [ ] Eligibility results are announced
- [ ] Language selector is accessible
- [ ] Mode toggles are accessible

### JAWS (Windows)
- [ ] Landing page is announced correctly
- [ ] Navigation works with JAWS shortcuts
- [ ] Forms are navigable
- [ ] Dynamic content updates are announced
- [ ] ARIA live regions work
- [ ] Tables (if any) are announced correctly

### VoiceOver (macOS)
- [ ] Landing page is announced correctly
- [ ] Rotor navigation works
- [ ] Forms are accessible
- [ ] Dynamic content is announced
- [ ] Gestures work correctly

### VoiceOver (iOS)
- [ ] All elements are accessible
- [ ] Swipe navigation works
- [ ] Double-tap to activate works
- [ ] Form fields are labeled
- [ ] Dynamic content is announced
- [ ] Rotor works correctly

## 4. Keyboard Navigation Testing

### General Navigation
- [ ] Tab key moves focus forward
- [ ] Shift+Tab moves focus backward
- [ ] Focus order is logical
- [ ] Focus indicators are visible (2px outline)
- [ ] Skip to main content link works
- [ ] No keyboard traps

### Landing Page
- [ ] Can navigate to all sections
- [ ] CTA button is keyboard accessible
- [ ] Language selector works with keyboard
- [ ] Dark mode toggle works with keyboard
- [ ] Low bandwidth toggle works with keyboard

### Chat Interface
- [ ] Can focus on chat input
- [ ] Enter key sends message
- [ ] Can navigate to voice button
- [ ] Space/Enter activates voice button
- [ ] Can navigate through messages
- [ ] Can navigate through scheme cards
- [ ] Can activate "Check Eligibility" button

### Eligibility Form
- [ ] Can tab through all form fields
- [ ] Can select dropdown options with keyboard
- [ ] Can check/uncheck checkboxes with Space
- [ ] Enter key submits form
- [ ] Can navigate through result

### Modals/Dropdowns
- [ ] Escape key closes modals
- [ ] Focus is trapped in modal
- [ ] Focus returns to trigger after close
- [ ] Arrow keys navigate dropdown options

## 5. Low Bandwidth Testing

### Network Throttling
- [ ] Enable "Slow 3G" in Chrome DevTools
- [ ] Landing page loads within 10 seconds
- [ ] Chat interface is usable
- [ ] Images load (even if slowly)
- [ ] Animations are disabled in low bandwidth mode
- [ ] Audio is compressed
- [ ] No timeout errors

### Low Bandwidth Mode
- [ ] Toggle low bandwidth mode manually
- [ ] Animations are disabled
- [ ] Images are lower quality
- [ ] Audio is compressed (smaller file size)
- [ ] Lazy loading works
- [ ] Parallax effects are disabled
- [ ] Page is still functional

### Offline Behavior
- [ ] Disconnect network
- [ ] Appropriate error message shown
- [ ] No crashes or blank screens
- [ ] Retry mechanism works
- [ ] Service worker caches static assets (if implemented)

## 6. Language Testing

### All 11 Languages
Test each language individually:

#### English (en)
- [ ] UI text is in English
- [ ] Chat responses are in English
- [ ] Scheme names are in English
- [ ] Error messages are in English
- [ ] Font renders correctly

#### Hindi (hi)
- [ ] UI text is in Hindi (Devanagari script)
- [ ] Chat responses are in Hindi
- [ ] Scheme names are in Hindi
- [ ] Error messages are in Hindi
- [ ] Noto Sans Devanagari font loads
- [ ] Text is readable and properly spaced

#### Marathi (mr)
- [ ] UI text is in Marathi (Devanagari script)
- [ ] Chat responses are in Marathi
- [ ] Scheme names are in Marathi
- [ ] Font renders correctly

#### Tamil (ta)
- [ ] UI text is in Tamil
- [ ] Chat responses are in Tamil
- [ ] Scheme names are in Tamil
- [ ] Noto Sans Tamil font loads
- [ ] Tamil script renders correctly

#### Telugu (te)
- [ ] UI text is in Telugu
- [ ] Chat responses are in Telugu
- [ ] Scheme names are in Telugu
- [ ] Telugu script renders correctly

#### Bengali (bn)
- [ ] UI text is in Bengali
- [ ] Chat responses are in Bengali
- [ ] Scheme names are in Bengali
- [ ] Bengali script renders correctly

#### Gujarati (gu)
- [ ] UI text is in Gujarati
- [ ] Chat responses are in Gujarati
- [ ] Scheme names are in Gujarati
- [ ] Gujarati script renders correctly

#### Kannada (kn)
- [ ] UI text is in Kannada
- [ ] Chat responses are in Kannada
- [ ] Scheme names are in Kannada
- [ ] Kannada script renders correctly

#### Malayalam (ml)
- [ ] UI text is in Malayalam
- [ ] Chat responses are in Malayalam
- [ ] Scheme names are in Malayalam
- [ ] Malayalam script renders correctly

#### Punjabi (pa)
- [ ] UI text is in Punjabi (Gurmukhi script)
- [ ] Chat responses are in Punjabi
- [ ] Scheme names are in Punjabi
- [ ] Gurmukhi script renders correctly

#### Odia (or)
- [ ] UI text is in Odia
- [ ] Chat responses are in Odia
- [ ] Scheme names are in Odia
- [ ] Odia script renders correctly

### Language Switching
- [ ] Language persists across page navigation
- [ ] Language persists after page reload
- [ ] Switching language updates all UI elements
- [ ] Switching language updates chat messages
- [ ] Switching language updates error messages
- [ ] Font changes appropriately for each language

## 7. Visual and UX Testing

### Landing Page
- [ ] Gradient animation is smooth
- [ ] AI orb floats and glows
- [ ] Parallax scrolling works
- [ ] Hover effects work on buttons
- [ ] CTA button is prominent
- [ ] Features section is clear
- [ ] Architecture section is informative
- [ ] Smooth scroll behavior works

### Chat Interface
- [ ] Messages slide in smoothly
- [ ] Typing indicator animates
- [ ] Shimmer loading animation works
- [ ] Scheme cards have glassmorphism effect
- [ ] Scheme cards have hover effects
- [ ] Auto-scroll works
- [ ] Character counter updates
- [ ] Voice button morphs during recording
- [ ] Waveform visualization animates

### Eligibility Form
- [ ] Form fields have glass effect
- [ ] Focus effects work
- [ ] Validation errors are clear
- [ ] Conditional fields show/hide correctly
- [ ] Submit button is prominent

### Eligibility Result
- [ ] Eligible status is visually clear (green)
- [ ] Not eligible status is visually clear (red)
- [ ] Criteria checklist is easy to read
- [ ] Met criteria have checkmarks
- [ ] Unmet criteria have X marks
- [ ] Explanation is clear
- [ ] Application steps are numbered
- [ ] "Apply Now" button is prominent

### Dark Mode
- [ ] Background is dark
- [ ] Text is light and readable
- [ ] Contrast is sufficient (4.5:1 minimum)
- [ ] Glassmorphism adapts to dark mode
- [ ] Scheme cards look good in dark mode
- [ ] Forms are readable in dark mode
- [ ] No white flashes during mode switch

### Responsive Design
- [ ] Mobile layout (< 640px): single column
- [ ] Tablet layout (640px - 1024px): two columns
- [ ] Desktop layout (> 1024px): three columns
- [ ] No horizontal scrolling at any breakpoint
- [ ] Text is readable at all sizes
- [ ] Buttons are tappable (min 44x44px)
- [ ] Images scale appropriately

## 8. Functional Testing

### Chat Flow
- [ ] Can send text message
- [ ] Receives response within 5 seconds
- [ ] Response is relevant to query
- [ ] Scheme recommendations appear
- [ ] Can send follow-up messages
- [ ] Conversation context is maintained
- [ ] Can handle long messages (up to 1000 chars)
- [ ] Character limit is enforced
- [ ] Error handling works

### Voice Input Flow
- [ ] Microphone permission is requested
- [ ] Can start recording
- [ ] Waveform shows audio level
- [ ] Can stop recording manually
- [ ] Auto-stops after 2s silence
- [ ] Transcription appears in input field
- [ ] Detected language is shown
- [ ] Can send transcribed message
- [ ] Error handling works

### Voice Output Flow
- [ ] Can play audio response
- [ ] Audio is clear and natural
- [ ] Playback progress is shown
- [ ] Can pause/stop playback
- [ ] Low bandwidth mode uses compressed audio
- [ ] Audio plays in correct language

### Eligibility Check Flow
- [ ] Can navigate to eligibility form from scheme card
- [ ] Can fill all form fields
- [ ] Conditional fields work correctly
- [ ] Form validation works
- [ ] Can submit form
- [ ] Result appears within 1 second
- [ ] Eligible result shows all details
- [ ] Not eligible result shows explanations
- [ ] Can check eligibility for multiple schemes
- [ ] Can go back to chat

### Scheme Browsing
- [ ] Can view scheme list
- [ ] Can filter by category
- [ ] Pagination works
- [ ] Can view scheme details
- [ ] Scheme information is accurate
- [ ] Application steps are clear
- [ ] Required documents are listed
- [ ] Official website link works

## 9. Error Handling Testing

### Network Errors
- [ ] Disconnect network during chat
- [ ] Error message is user-friendly
- [ ] Retry mechanism works
- [ ] Connection indicator shows status
- [ ] Can recover after reconnection

### API Errors
- [ ] 400 Bad Request: Shows validation error
- [ ] 429 Too Many Requests: Shows rate limit message
- [ ] 500 Internal Server Error: Shows generic error
- [ ] Timeout: Shows timeout message
- [ ] All errors are in selected language

### Input Errors
- [ ] Empty message: Send button disabled
- [ ] Message too long: Character counter red, button disabled
- [ ] Invalid form data: Validation errors shown
- [ ] Missing required fields: Errors highlighted

### Permission Errors
- [ ] Microphone denied: Shows permission error
- [ ] Microphone unavailable: Shows device error
- [ ] Audio playback blocked: Shows playback error

## 10. Performance Testing

### Page Load
- [ ] Landing page loads within 1.5 seconds (FCP)
- [ ] Chat page loads within 1.5 seconds
- [ ] Time to Interactive < 3 seconds
- [ ] No layout shifts (CLS < 0.1)
- [ ] Images load progressively

### Interactions
- [ ] Button clicks respond immediately
- [ ] Animations are smooth (60fps)
- [ ] Scrolling is smooth
- [ ] No janky animations
- [ ] No memory leaks (check DevTools)

### API Response Times
- [ ] Chat response < 5 seconds (95th percentile)
- [ ] Voice transcription < 3 seconds
- [ ] Eligibility check < 1 second
- [ ] Scheme list < 1 second

## 11. Security Testing

### Input Sanitization
- [ ] Try XSS attack: `<script>alert('XSS')</script>`
- [ ] Try SQL injection: `'; DROP TABLE users; --`
- [ ] Try HTML injection: `<img src=x onerror=alert(1)>`
- [ ] All inputs are sanitized

### HTTPS
- [ ] All pages use HTTPS
- [ ] No mixed content warnings
- [ ] Certificate is valid
- [ ] Redirects HTTP to HTTPS

### Headers
- [ ] Content-Security-Policy header present
- [ ] X-Content-Type-Options: nosniff
- [ ] X-Frame-Options: DENY
- [ ] Strict-Transport-Security header present

## 12. Privacy Testing

### Session Management
- [ ] Session is created on first visit
- [ ] Session ID is stored in localStorage
- [ ] Session persists across page reloads
- [ ] Session expires after 24 hours
- [ ] Expiration warning shows when < 1 hour remains
- [ ] Can manually clear session

### Data Minimization
- [ ] Only essential data is collected
- [ ] No PII is stored beyond session
- [ ] Message content is sanitized
- [ ] Aadhaar/PAN numbers are redacted

### Privacy Controls
- [ ] Privacy notice is shown on first visit
- [ ] "Clear Session" button works
- [ ] Data retention policy is clear
- [ ] Can delete data immediately

## Test Execution

### Before Testing
1. Clear browser cache and cookies
2. Disable browser extensions
3. Use incognito/private mode
4. Document browser version and OS
5. Take screenshots of issues

### During Testing
1. Follow checklist systematically
2. Test one feature at a time
3. Document all issues found
4. Note steps to reproduce
5. Capture screenshots/videos

### After Testing
1. Compile test results
2. Categorize issues by severity
3. Create bug reports
4. Share findings with team
5. Retest after fixes

## Issue Severity Levels

- **Critical:** Blocks core functionality, data loss, security issue
- **High:** Major feature broken, poor UX, accessibility issue
- **Medium:** Minor feature issue, cosmetic problem
- **Low:** Enhancement, nice-to-have

## Test Report Template

```markdown
## Test Session Report

**Date:** [Date]
**Tester:** [Name]
**Environment:** [Browser, OS, Device]

### Summary
- Total Tests: [Number]
- Passed: [Number]
- Failed: [Number]
- Blocked: [Number]

### Issues Found
1. [Issue description]
   - Severity: [Critical/High/Medium/Low]
   - Steps to reproduce: [Steps]
   - Expected: [Expected behavior]
   - Actual: [Actual behavior]
   - Screenshot: [Link]

### Recommendations
- [Recommendation 1]
- [Recommendation 2]
```

## Sign-off

Manual testing completed by:

- [ ] QA Lead: _________________ Date: _______
- [ ] Product Manager: _________________ Date: _______
- [ ] Accessibility Specialist: _________________ Date: _______

**Status:** [ ] Approved for Production [ ] Needs Fixes

---

**Note:** This checklist should be executed before each major release. Update the checklist as new features are added or requirements change.
