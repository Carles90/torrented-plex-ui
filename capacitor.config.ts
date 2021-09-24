import {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'io.ionic.starter',
    appName: 'TPlex',
    webDir: 'dist',
    bundledWebRuntime: false,
    server: {
        cleartext: true
    }
};

export default config;
