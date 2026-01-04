---
name: project-standards
description: Enforces project coding standards, asset management, and quality guidelines. Applies to all code changes, asset fetching, feature implementations, and development tasks.
---

# Project Standards

These standards apply to ALL work unless explicitly overridden by the user.

## Asset Management

### Fetching Assets
When fetching images, icons, or other assets from the internet:

1. **Always store locally** - Download and save to project's `assets/` folder
2. **Use appropriate subfolders**:
   - `assets/images/` - General images
   - `assets/icons/` - Icon files
   - `assets/demo/` - Demo/screenshot mode assets
   - `assets/backgrounds/` - Background images
3. **Clear naming** - Use descriptive, lowercase, hyphenated filenames
   - Good: `gold-ring-sample.jpg`, `diamond-icon.png`
   - Bad: `img1.jpg`, `download.png`

### Preferred Sources (in order)
1. **Unsplash** (unsplash.com) - Free, high-quality photos
2. **Pexels** (pexels.com) - Free stock photos/videos
3. **Pixabay** (pixabay.com) - Free images and vectors
4. **Freepik** (freepik.com) - Free vectors, icons, and photos
5. Only use paid/other sources if explicitly requested by user

### Asset Integration
- Update relevant service files when adding new assets
- Use `require()` or proper asset imports
- Verify assets load correctly before completing task

## Code Quality Standards

### Clean Code
- Meaningful variable and function names
- Single responsibility principle
- DRY (Don't Repeat Yourself) - reuse existing utilities and components
- Consistent formatting with project conventions
- Use absolute imports with `@/` prefix

### Defensive Programming
- Validate inputs at boundaries
- Handle null/undefined gracefully
- Use TypeScript types strictly (avoid `any`)
- Add fallbacks for network operations
- Graceful error handling with user feedback

### Simplicity
- Prefer simple solutions over clever ones
- Avoid premature optimization
- No unnecessary abstractions
- If 3 lines work, don't write 10
- Don't add features beyond what was requested

### Zero Regression
- Don't break existing functionality
- Test changes against current behavior
- Preserve backward compatibility
- When in doubt, ask before changing shared code
- Verify app runs correctly after changes
