import {createApp} from 'vue'
import App from './App.vue'
import router from './router';
import axios from "axios";
import {createI18n} from 'vue-i18n'

import {IonicVue} from '@ionic/vue';
/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';
/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';
/* Theme variables */
import './theme/variables.css';


// Set base URL
axios.defaults.baseURL = process.env.VUE_APP_API_BASE_URL;

// Configure languages
const i18n = createI18n({
    locale: 'en',
    fallbackLocale: 'en',
    messages: {
        ca: require('./i18n/ca.json'),
        en: require('./i18n/en.json'),
        es: require('./i18n/es.json')
    },
});

const app = createApp(App)
    .use(IonicVue)
    .use(router)
    .use(i18n);

router.isReady().then(() => {
    app.mount('#app');
});