import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.vibeflow.app',
  appName: 'VibeFlow AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
