<template lang="html">
    <Page >
        <ActionBar :title="currentUser">
            <ActionItem @tap="getconnectionID" ios.systemIcon="16" ios.position="right" height="10vh"
                text="connect" android.position="popup">
            </ActionItem>
            <ActionItem @tap="connectToPeerPrompt" ios.systemIcon="16"
                ios.position="right" text="connect to user" android.position="popup">
            </ActionItem>
            <ActionItem @tap="waitforpeer" ios.systemIcon="16"
                ios.position="right" text="wait for connection" android.position="popup">
            </ActionItem>
            <ActionItem @tap="about" ios.systemIcon="16"
                ios.position="right" text="About" android.position="popup">
            </ActionItem>
        </ActionBar>

        <DockLayout width="100%" height="100%" backgroundColor="lightgray"
            stretchLastChild="false">
            <GridLayout columns="*,auto" style="padding: 10"
                class="bottom-tabs" height="71" orientation="horizontal"
                dock="bottom">
                <TextField class="chatTextField" row="0" col="0"
                    v-model="message"></TextField>
                <Button class="chatBtn" row="0" col="1" text="send"
                    @tap=chat(message,currentUser)></Button>

                <WebView v-show="false" ref="webView" row="2" col="0"  height="10%" :src="url" @loadFinished="onLoad" />
            </GridLayout>


            <RadListView dock="top" height="100%" width="100%" ref="messageList"
                padding="5" for="chat in chats" class="list" style="background:black;">
                <v-template>
                    <GridLayout columns="*" rows="auto" class="msg">

                        <StackLayout :class="filter(chat.from)"
                            orientation="horizontal"
                            :horizontalAlignment="align(chat.from)">
                            <Label :text="chat.message" class="msg_text"
                                textWrap="true" verticalAlignment="top">
                            </Label>
                        </StackLayout>

                    </GridLayout>
                </v-template>
            </RadListView>

        </DockLayout>

    </Page>
</template>

<script>
import { WebView } from 'tns-core-modules/ui/web-view'
let webViewInterfaceModule = require('nativescript-webview-interface');
import * as fs from "tns-core-modules/file-system";
import * as Permissions from "nativescript-permissions";
var dialogs = require("tns-core-modules/ui/dialogs");

export default {
  data() {
    return {
      oWebViewInterface: null,
      url:'',
      peerid:'',
      currentUser: "",
      message: '',
      chats: [],
      isBusy:false,
      otherUser:''
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

        this.oWebViewInterface.on('peerID', (eventData) =>{
            // perform action on event
            console.log('we got an id!!!!!!!!!!!!!!!!');
            alert(eventData);
            this.peerid = eventData;
            this.currentUser = eventData;
            this.isBusy = false;
            this.chat('id : '+eventData,'system');
        });
        this.oWebViewInterface.on('destroyed', (eventData) =>{
            // perform action on event
            console.log('destroyed!!!!!!!!!!!!!!!!!!!!!!!!');
            this.peerid = eventData;
            this.isBusy = true;
            this.getconnectionID();
            this.chat('connection lost : retrying....','system');

        });
        this.oWebViewInterface.on('recieveData', (eventData) =>{
            // perform action on event
            console.log('recieving data!!!!!!!!!!!!!!!!!!');
            this.chat(eventData,'other');
        });
        this.oWebViewInterface.on('recieveDataReady', (eventData) =>{
            // perform action on event
            console.log('recieving data ready!!!!!!!!!!!!!!!!!!');
            this.chat(eventData,'other');
        });
        this.oWebViewInterface.on('ConnectedTo', (eventData) =>{
            // perform action on event
            console.log('connected to!!!!!!!!!!!!!!!!!!');
            this.chat(eventData,'other');
        });
        this.oWebViewInterface.on('error', (eventData) =>{
            // perform action on event
            console.log('error !!!!!!!!!!!!!!!!!!');
            this.chat('error','system');
            this.isBusy = true;
            // setTimeout(() => { 
            //     this.getconnectionID();
            // }, 30000);
        });
        

    },
    connectToPeerPrompt(){

        dialogs.prompt("Connect to another user :", "").then((r) => {
            console.log("Dialog result: " + r.result + ", text: " + r.text);
            this.otherUser = r.text;
            this.chat('connecting to user.......','system');
            this.oWebViewInterface.callJSFunction('connectToPeer', this.otherUser, function(result){
                alert(result);
            });
        });

    },
    waitforpeer(){
            this.chat('standby','system');
            this.oWebViewInterface.callJSFunction('waitforpeer', 'connect', function(result){
                alert(result);
            });
    },
    setupWebViewInterface() {
      var webView = this.$refs.webView.nativeView;
      this.oWebViewInterface = new webViewInterfaceModule.WebViewInterface(webView,'../www/index.html');
    },
    getconnectionID(){
      this.isBusy = true;
      this.chat('connecting.......','system');
      this.oWebViewInterface.callJSFunction('functionCalledByNative', ['gg'], function(result){
        alert(result);
      });
    },
    about(){

      this.chat('Created by Hendrikus van katwijk','system');
      this.chat('peer to peer messaging app. v0.0.1','system');
    },
    alert(msg) {
        alert(msg);
    },
    scroll(count) {
        console.log("scrolling to ", count);
        this.$nextTick(() => {
            this.$refs.messageList.scrollToIndex(count - 1,
                false);
        });
    },
    chat(message,from) {
        this.chats.push({
            message: message,
            from: from
        });
        this.scroll(this.chats.length);
        if(from == this.currentUser){
            this.oWebViewInterface.callJSFunction('sendmessagefromnative', message, function(result){
                alert(result);
            });
        }
        this.message = "";
    },
    filter(sender) {
        if (sender == this.currentUser) {
            return "me";
        } else if(sender == 'system'){
            return "system";
        }else {
            return "them";
        }
    },
    align(sender) {
        if (sender == this.currentUser) {
            return "right";
        } else {
            return "left";
        }
    },
    showImage(sender) {
        if (sender == this.currentUser) {
            return "collapsed";
        } else {
            return "visible";
        }
    }
  }
}
</script>

<style lang="scss" scoped>
// Start custom common variables
@import "~@nativescript/theme/scss/variables/blue";
// End custom common variables

// Custom styles
    .home-panel {
        vertical-align: center;
        font-size: 20;
        margin: 15;
    }

    .description-label {
        margin-bottom: 15;
    }

    ListView {
        separator-color: white;
    }
    .system {
        font-size: 14;
        padding: 5;
    }

    .system .msg_text {
        background-color: black;
        color: red;
        padding: 8;
        margin-right: 10;
        margin-left: 10;
        border-radius: 5;
    }
    .msg {
        font-size: 14;
        padding: 5;
    }

    .me .msg_text {
        background-color: #30A9FF;
        color: white;
        padding: 8;
        margin-right: 10;
        margin-left: 10;
        border-radius: 5;
    }

    .them .msg_text {
        background-color: #e0e0e0;
        color: #333;
        padding: 7;
        border-radius: 5;
        margin-right: 40;
    }

    .authorimg {
        margin: 0 5 5 5;
        width: 30;
        height: 30;
        border-radius: 15;
    }

    .chatTextField {
        padding: 5;
        background-color: lightgray;
        border-radius: 4;
    }

    Button {
        padding: 5;
        margin: 5;
        background-color: dodgerblue;
        color: white;
        height: 40;
        border-radius: 5;
    }
</style>