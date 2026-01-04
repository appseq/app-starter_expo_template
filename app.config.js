/**
 * Expo Configuration
 * ===================
 *
 * This file reads from config.json (shared configuration).
 * This eliminates redundancy with constants/appConfig.ts.
 *
 * IMPORTANT: To change app configuration:
 * - Edit config.json (single source of truth for basic config)
 * - Both this file and appConfig.ts read from config.json
 */

const config = require('./config/config.json');

module.exports = {
  expo: {
    // App Identity
    name: config.app.name,
    slug: config.app.slug,
    version: config.app.version,
    orientation: config.app.orientation,
    scheme: config.app.scheme,

    // UI Settings
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,

    // Assets
    icon: config.assets.icon,
    splash: {
      image: config.assets.splashIcon,
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },

    // iOS Configuration
    ios: {
      supportsTablet: config.ios.supportsTablet,
      bundleIdentifier: config.bundleId.ios,
      infoPlist: {
        NSCameraUsageDescription: config.ios.permissions.camera,
        NSMicrophoneUsageDescription: config.ios.permissions.microphone,
        NSPhotoLibraryUsageDescription: config.ios.permissions.photoLibrary,
        ITSAppUsesNonExemptEncryption: false,
      },
      appleTeamId: config.appStore.appleTeamId,
    },

    // Android Configuration
    android: {
      adaptiveIcon: {
        foregroundImage: config.assets.adaptiveIcon,
        backgroundColor: '#ffffff',
      },
      package: config.bundleId.android,
      permissions: config.android.permissions,
    },

    // Web Configuration
    web: {
      favicon: config.assets.favicon,
    },

    // Plugins
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            minSdkVersion: 26,
          },
          ios: {
            deploymentTarget: '15.1',
          },
        },
      ],
      [
        'expo-router',
        {
          origin: config.services.router.origin,
        },
      ],
      [
        'expo-camera',
        {
          cameraPermission: config.ios.permissions.camera,
          microphonePermission: config.ios.permissions.microphone,
          recordAudioAndroid: true,
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission: config.ios.permissions.photoLibrary,
        },
      ],
      'expo-localization',
    ],

    // Experiments
    experiments: {
      typedRoutes: true,
    },

    // Extra Configuration
    extra: {
      router: {
        origin: config.services.router.origin,
      },
      eas: {
        projectId: config.services.eas.projectId,
      },
    },
  },
};
