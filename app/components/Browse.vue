<template lang="html">
    <Page >
        <GridLayout>
            <WebView ref="webView" row="1" col="0" 
            :src="url" @loadFinished="onLoad" />
        </GridLayout>

    </Page>
</template>

<script>
import { WebView } from 'tns-core-modules/ui/web-view'
let webViewInterfaceModule = require('nativescript-webview-interface');
import * as fs from "tns-core-modules/file-system";
import * as Permissions from "nativescript-permissions";

export default {
  data() {
    return {
      oWebViewInterface: null,
      url:''
    }
  },
  mounted(){
        Permissions.requestPermission(android.Manifest.permission.RECORD_AUDIO, "Needed for connectivity status").then(() => {
            console.log("Permission granted!");
        }).catch(() => {
            console.log("Permission is not granted (sadface)");
        });
  },
  methods: {
    onLoad() {

        console.log('------------------------------kkkr');
        console.log(fs.knownFolders.currentApp().path);
        //this.setupWebViewInterface();
        var webView = this.$refs.webView.nativeView;
        this.oWebViewInterface = new webViewInterfaceModule.WebViewInterface(webView,fs.knownFolders.currentApp().path+'/www/index.html');

    },
    setupWebViewInterface() {
      var webView = this.$refs.webView.nativeView;
      this.oWebViewInterface = new webViewInterfaceModule.WebViewInterface(webView,'../www/index.html');
    }
  }
}
</script>

<style lang="scss" scoped>
// Start custom common variables
@import "~@nativescript/theme/scss/variables/blue";
// End custom common variables

// Custom styles

</style>