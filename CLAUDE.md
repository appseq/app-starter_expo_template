# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **bare-bones React Native (Expo) template** for building AI-powered identification apps. Built with TypeScript and includes RevenueCat/Superwall for subscription management, AIProxy for AI services, and Jina/Exa for search.

**🎯 TEMPLATE STATUS**: This codebase is a minimal template with infrastructure intact. Add your domain-specific screens, components, and AI prompts to create apps for plants, birds, rocks, art, jewelry, etc.

## Active Skills
- **`project-standards`** - Enforces asset management (local storage, royalty-free sources) and code quality standards (clean code, defensive programming, simplicity, zero regression). See `.claude/skills/project-standards/SKILL.md`.

## Development Commands

**Two ways to run commands:** Shell script (`eb`) or npm scripts.

Setup shell alias (one-time): `alias eb="./scripts/eb.sh"` in `~/.zshrc`

### Quick Reference

| Task | Shell (`eb`) | npm script |
|------|--------------|------------|
| Dev server | `eb dev` | `npm run dev` |
| Simulator (debug) | `eb sim` | `npm run sim` |
| Simulator (release) | `eb sim-r` | `npm run sim:release` |
| Device (debug) | `eb device` | `npm run device` |
| Device (release) | `eb device-r` | `npm run device:release` |
| Full release | `eb ship` | `npm run release` |
| Full release (auto) | `eb ship --auto` | `npm run release:auto` |
| Build IPA only | `eb ipa` | `npm run release:build` |
| Submit IPA | `eb submit` | `npm run release:submit` |
| Cleanup | `eb tidy` | `npm run clean` |
| Deep cleanup | `eb tidy --all` | `npm run clean:disk` |

### Demo Mode (for App Store screenshots)
- `npm run demo:enable` - Enable demo mode with sample data
- `npm run demo:disable` - Disable demo mode
- `npm run demo:status` - Check demo mode status

### Fastlane (App Store metadata)
- `npm run upload:metadata` - Upload metadata to App Store Connect
- `npm run upload:screenshots` - Upload screenshots
- `npm run upload:all` - Upload everything

## Architecture

### Tech Stack
- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand + React Query (TanStack Query)
- **Styling**: NativeWind (Tailwind for React Native)
- **UI Components**: Custom components with react-native-reanimated
- **Monetization**: RevenueCat for subscriptions
- **AI Service**: AIProxy for rock identification API

### Project Structure
- `/app` - Expo Router screens and navigation
  - `(tabs)` - Tab-based navigation screens
  - Layout files define navigation structure
- `/components` - Reusable UI components
- `/services` - API services (AIProxy, image handling, demo data)
- `/contexts` - React contexts (Subscription, Paywall)
- `/hooks` - Custom React hooks
- `/constants` - App constants and configuration
- `/utils` - Utility functions

### Key Services
- **AIProxy Service** (`services/aiproxy.ts`) - Handles identification API calls
- **Image Service** (`services/imageService.ts`) - Image processing and manipulation  
- **Demo Data Service** (`services/demoDataService.ts`) - Provides sample data for screenshots

### Configuration System (NEW)
- **Master Config** (`constants/appConfig.ts`) - Single source of truth for all app settings
- **Critical Configs** - App Store IDs, bundle identifiers, service keys centralized at top
- **Template Config** (`constants/appConfig.template.ts`) - Base template for new apps
- **Validation** - Built-in helpers to ensure configuration integrity

### Subscription System
- Uses RevenueCat for payment processing
- `contexts/SubscriptionContext` - Main subscription state management
- `components/PaywallProvider.tsx` - Paywall UI integration
- Premium features gated through `PremiumFeatureGate` component

## Environment Variables
Required in `.env` (see `.env.example`):
- `EXPO_PUBLIC_AIPROXY_KEY` - AIProxy API key for rock identification
- RevenueCat configuration in app initialization

## iOS-Specific Configuration
- Bundle ID: Update in `config/config.json`
- Team ID: Update in `config/config.json`
- Requires camera, photo library permissions
- Fastlane configured for automated deployment

## Testing Approach
No automated tests currently configured. Manual testing through:
- Expo Go app for quick iteration
- Development builds for native features
- TestFlight for beta testing

## Important Notes
- Always use absolute imports with `@/` prefix (configured in tsconfig)
- Camera and image picker require proper permissions setup
- Demo mode available for App Store screenshot generation
- Uses expo-dev-client for custom native code
- EAS Build configured for cloud builds

## Template Usage
When creating a new app from this template:

1. **Configuration**: Update `constants/appConfig.ts` critical section first
2. **Identity**: Change app name, bundle IDs, and service keys
3. **Content**: Customize AI prompts, UI text, and onboarding
4. **Assets**: Replace icons, splash screens, and background images  
5. **Build Config**: Update `app.json`, `package.json`, and `fastlane/Fastfile`
6. **Environment**: Copy `.env.example` to `.env` with actual values

See `TEMPLATE-SETUP.md` for detailed step-by-step instructions.