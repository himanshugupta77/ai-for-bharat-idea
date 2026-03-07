# Bharat Sahayak Frontend

Premium multilingual AI welfare assistant built with React 18, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion
- **Routing**: React Router v6
- **HTTP Client**: Axios

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components (Landing, Chat, About)
├── hooks/          # Custom React hooks
├── utils/          # Helper functions and constants
├── types/          # TypeScript type definitions
├── App.tsx         # Main app component
├── main.tsx        # App entry point
└── index.css       # Global styles and CSS variables
```

## Design System

### Colors
- **Saffron**: #FF9933 (Primary)
- **Green**: #138808 (Secondary)
- **White**: #FFFFFF (Accent)
- **Glass effects**: Glassmorphism with backdrop blur

### Typography
- **Primary**: Inter
- **Indian Languages**: Noto Sans (Devanagari, Tamil, Bengali, etc.)

### Animations
- Gradient animation (15s)
- Float animation (3s)
- Glow pulse (2s)
- Shimmer loading (2s)
- Slide-in, fade-in, scale-in transitions

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Features

- 🌍 11 language support (English + 10 Indian languages)
- 🎨 Premium Apple-level UI with glassmorphism
- 🌓 Dark mode support
- 📱 Fully responsive design
- ♿ WCAG 2.1 AA accessibility compliance
- 🎭 Smooth animations with Framer Motion
- 🔊 Voice input/output capabilities
- 📶 Low bandwidth mode optimization

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3001
```

## Code Quality

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured with React and TypeScript rules
- **Prettier**: Consistent code formatting
- **Type Safety**: Full type coverage with custom types

## Accessibility

- Keyboard navigation support
- ARIA labels and roles
- Screen reader announcements
- Focus indicators
- Color contrast compliance

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)
