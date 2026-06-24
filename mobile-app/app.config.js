// Values from mobile-app/.env (EXPO_PUBLIC_*)
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const EAS_PROJECT_ID = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;

if (!API_URL) {
  throw new Error('Missing EXPO_PUBLIC_API_URL in mobile-app/.env');
}

export default {
  expo: {
    name: 'District Sports',
    slug: 'district-sports',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    extra: {
      apiUrl: API_URL,
      eas: {
        projectId: EAS_PROJECT_ID || undefined,
      },
    },
    plugins: [
      [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#2563eb',
        },
      ],
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.districtsports.mobile',
    },
    android: {
      package: 'com.districtsports.mobile',
      versionCode: 1,
      usesCleartextTraffic: true,
      googleServicesFile: './google-services.json',
      permissions: ['POST_NOTIFICATIONS'],
      adaptiveIcon: {
        backgroundColor: '#2563eb',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
  },
};
