import Vue from "nativescript-vue";

import App from "./components/App";
Vue.config.silent = false;
new Vue({
    render: h => h(App)
}).$start();
