#!/bin/bash

#
# Expo Build (eb) - Unified build command wrapper
#
# Usage:
#   eb <command> [options]
#
# Setup:
#   chmod +x scripts/eb.sh
#   alias eb="./scripts/eb.sh"  # Add to ~/.zshrc
#

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Get script directory (works even when called via alias)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Change to project directory
cd "$PROJECT_DIR" || exit 1

# Display help
show_help() {
    echo -e "${BOLD}${BLUE}Expo Build (eb) - Command Reference${NC}"
    echo ""
    echo -e "${BOLD}Development${NC}"
    echo "  eb dev              Start dev server (cleared cache)"
    echo ""
    echo -e "${BOLD}iOS Simulator${NC}"
    echo "  eb sim              Clean + build + simulator (debug)"
    echo "  eb sim-r            Clean + build + simulator (release)"
    echo ""
    echo -e "${BOLD}iOS Device${NC}"
    echo "  eb device           Clean + build + device (debug)"
    echo "  eb device-r         Clean + build + device (release)"
    echo ""
    echo -e "${BOLD}Android${NC}"
    echo "  eb sim-a            Clean + build + emulator (debug)"
    echo "  eb sim-a-r          Clean + build + emulator (release)"
    echo "  eb device-a         Clean + build + device (debug)"
    echo "  eb device-a-r       Clean + build + device (release)"
    echo ""
    echo -e "${BOLD}Release${NC}"
    echo "  eb ship             Full release pipeline (interactive)"
    echo "  eb ship --auto      Full release pipeline (no prompts)"
    echo "  eb ipa              Build production IPA only"
    echo "  eb submit [path]    Submit IPA to App Store"
    echo ""
    echo -e "${BOLD}App Store (Fastlane)${NC}"
    echo "  eb notes            Generate release notes (bugfix mode, LLM-powered)"
    echo "  eb notes \"feature\"  Generate release notes with new feature"
    echo "  eb upload           Upload all (metadata + screenshots)"
    echo "  eb upload meta      Upload metadata only"
    echo "  eb upload notes     Upload release notes only"
    echo "  eb upload screens   Upload screenshots only"
    echo "  eb resize           Resize screenshots for App Store"
    echo ""
    echo -e "${BOLD}Cleanup${NC}"
    echo "  eb tidy             Standard cleanup (~25GB)"
    echo "  eb tidy --all       Aggressive cleanup (~50GB+)"
    echo ""
    echo -e "${BOLD}Utilities${NC}"
    echo "  eb disk             Check available disk space"
    echo "  eb demo on          Enable demo mode"
    echo "  eb demo off         Disable demo mode"
    echo "  eb demo             Check demo mode status"
    echo "  eb help             Show this help"
    echo ""
}

# Check disk space
check_disk() {
    echo -e "${BOLD}Disk Space${NC}"
    df -h / | tail -1 | awk '{print "  Available: " $4 " / " $2 " (" $5 " used)"}'
    echo ""
    echo -e "${CYAN}Xcode DerivedData:${NC}"
    du -sh ~/Library/Developer/Xcode/DerivedData 2>/dev/null || echo "  Not found"
    echo -e "${CYAN}Xcode Caches:${NC}"
    du -sh ~/Library/Caches/com.apple.dt.Xcode 2>/dev/null || echo "  Not found"
    echo -e "${CYAN}iOS Device Support:${NC}"
    du -sh ~/Library/Developer/Xcode/iOS\ DeviceSupport 2>/dev/null || echo "  Not found"
}

# Main command handler
case "$1" in
    # Development
    dev)
        echo -e "${CYAN}Starting dev server...${NC}"
        npx expo start --dev-client --clear
        ;;

    # iOS Simulator
    sim)
        echo -e "${CYAN}Building for iOS Simulator (Debug)...${NC}"
        npx expo prebuild --clean && npx expo run:ios
        ;;
    sim-r)
        echo -e "${CYAN}Building for iOS Simulator (Release)...${NC}"
        npx expo prebuild --clean && npx expo run:ios --configuration Release
        ;;

    # iOS Device
    device)
        echo -e "${CYAN}Building for iOS Device (Debug)...${NC}"
        npx expo prebuild --clean && npx expo run:ios --device
        ;;
    device-r)
        echo -e "${CYAN}Building for iOS Device (Release)...${NC}"
        npx expo prebuild --clean && npx expo run:ios --device --configuration Release --non-interactive
        ;;

    # Android Emulator
    sim-a)
        echo -e "${CYAN}Building for Android Emulator (Debug)...${NC}"
        npx expo prebuild --clean && npx expo run:android
        ;;
    sim-a-r)
        echo -e "${CYAN}Building for Android Emulator (Release)...${NC}"
        npx expo prebuild --clean && npx expo run:android --variant release
        ;;

    # Android Device
    device-a)
        echo -e "${CYAN}Building for Android Device (Debug)...${NC}"
        npx expo prebuild --clean && npx expo run:android --device
        ;;
    device-a-r)
        echo -e "${CYAN}Building for Android Device (Release)...${NC}"
        npx expo prebuild --clean && npx expo run:android --device --variant release
        ;;

    # Release pipeline
    ship)
        shift
        node scripts/release.js "$@"
        ;;

    # Build IPA only
    ipa)
        echo -e "${CYAN}Building production IPA...${NC}"
        npm run validate-config && npx expo prebuild --clean && npm install && eas build --platform ios --local --profile production --non-interactive
        ;;

    # Submit to App Store
    submit)
        shift
        node scripts/submit.js "$@"
        ;;

    # Generate release notes (LLM-powered via Claude Code)
    notes)
        shift
        if [ -z "$1" ]; then
            echo -e "${CYAN}Generating release notes (bugfix mode)...${NC}"
            claude --print "/release-notes"
        else
            echo -e "${CYAN}Generating release notes with feature: $*${NC}"
            claude --print "/release-notes $*"
        fi
        ;;

    # Fastlane upload commands
    upload)
        case "$2" in
            meta|metadata)
                echo -e "${CYAN}Uploading metadata to App Store Connect...${NC}"
                cd fastlane && fastlane upload_metadata
                ;;
            notes|release-notes)
                echo -e "${CYAN}Uploading release notes to App Store Connect...${NC}"
                cd fastlane && fastlane upload_release_notes
                ;;
            screens|screenshots)
                echo -e "${CYAN}Uploading screenshots to App Store Connect...${NC}"
                cd fastlane && fastlane upload_screenshots
                ;;
            *)
                echo -e "${CYAN}Uploading all (metadata + screenshots) to App Store Connect...${NC}"
                cd fastlane && fastlane upload_start
                ;;
        esac
        ;;

    # Resize screenshots
    resize)
        echo -e "${CYAN}Resizing screenshots for App Store...${NC}"
        cd fastlane && fastlane resize_screenshots
        ;;

    # Cleanup
    tidy|clean)
        shift
        node scripts/clean.js "$@"
        ;;

    # Disk space check
    disk)
        check_disk
        ;;

    # Demo mode
    demo)
        case "$2" in
            on|enable)
                node scripts/demo-mode.js enable
                ;;
            off|disable)
                node scripts/demo-mode.js disable
                ;;
            *)
                node scripts/demo-mode.js status
                ;;
        esac
        ;;

    # Validation
    validate)
        npm run validate-config && npm run sync-config
        ;;

    # Help
    help|-h|--help|"")
        show_help
        ;;

    # Unknown command
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
