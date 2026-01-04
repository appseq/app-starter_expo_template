---
argument-hint: [feature description] (optional - leave empty for bugfix mode)
description: Generate tongue-in-cheek App Store release notes for all localizations
allowed-tools: Glob, Read, Write
---

# Generate App Store Release Notes

Generate playful, tongue-in-cheek release notes for the App Store.

## Instructions

1. **Scan for localizations**: List all language folders in `fastlane/metadata/` (exclude `_backlog` folder)
2. **Determine mode**:
   - If `$ARGUMENTS` is empty → **Bugfix mode**: Generic bug fixes and improvements
   - If `$ARGUMENTS` has content → **Feature mode**: Highlight the specified feature
3. **Generate notes** for EACH detected language folder
4. **Write** to `fastlane/metadata/<lang>/release_notes.txt` for all languages

## Style Guidelines

- **Tone**: Playful, witty, tongue-in-cheek
- **Length**: 3-5 short lines
- **App-themed**: Use jewelry/gemstone puns and references where appropriate
- **Culturally adapted**: Match humor style to each language's culture
- **Professional**: Still informative despite the playful tone
- **NO EMOJIS**: App Store Connect does not support emoji icons - use plain text only

## Examples

**Bugfix mode (English):**
```
We've been polishing gems and squashing bugs!

This update brings:
- Performance tweaks that sparkle
- Stability improvements worth their weight in gold
- Minor fixes - because even diamonds need the occasional buff
```

**Feature mode (English) - e.g., "dark mode":**
```
Introducing Dark Mode - for when you want your jewelry to shine even brighter!

What's new:
- Beautiful dark theme that makes gems pop
- Easier on the eyes during late-night browsing
- Plus the usual round of polish and fixes
```

## Mode

$ARGUMENTS
