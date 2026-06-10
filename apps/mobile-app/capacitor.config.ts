import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.factory.mobile',
  appName: '工厂移动App',
  webDir: 'dist',
  server: {
    hostname: 'localhost',
    androidScheme: 'http',
    allowNavigation: ['sso.corp.aygjm.lan', 'sso.corp.aygjm.lan:18080'],
  },
};

export default config;
