import Vue from "nativescript-vue";

import App from "./components/App";
import RadListView from 'nativescript-ui-listview/vue';

Vue.use(RadListView);

Vue.config.silent = false;
Vue.use(RadListView);
new Vue({
    render: h => h(App)
}).$start();
