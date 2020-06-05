/**
 * @author Perelan
 * @version 1.0
 * @description A very simple webRTC chat and camera sample. 
 * 
 * Note: Only tested on FireFox!
 */

var localStream;        // The peer stream.
var peerID;             // Store peers id
var name;               // Store your name 
var con;                // store the established connection

///////////////////////////////////UserMedia///////////////////////////////////////////
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

// Assignment callbacks and vide/audio properties.
navigator.getUserMedia({video: true, audio: false}, getSuccess, getError);

// Success callback on getUserMedia
function getSuccess(stream){
    var ourStream = document.getElementById('video');
    ourStream.src = window.URL.createObjectURL(stream);
    ourStream.play();
    
    // Get stream and store!
    localStream = stream;
}

function getError(err){
    console.log(err);
}
//////////////////////////////////////////////////////////////////////////////////////

var peer = new Peer({
    key: 'lwjd5qra8257b9'   // Replace with your own key!
});

// Establish the peer and set your peer id. 
peer.on('open', function (id) {
    console.log("Peer id", id);
    document.getElementById('yourID').value = id;
});

/* Add button listener to the connect button */
document.getElementById("connect").addEventListener('click', function (event) {
    // Get the value from the name field and store it globally.
    name = document.getElementById("yourName").value;
    // Get the value from the peer id, and store that globally as well.
    peerID = document.getElementById("theirID").value;
    
    con = peer.connect(peerID);                 // Connect to the other peer.
    var call = peer.call(peerID, localStream);  // Use the global stream and call the peer.
    
    // Call the peer and wait for connection and display it in the video field.
    call.on('stream', function(othersStream){
        var video = document.getElementById('others-video');    
        video.src = window.URL.createObjectURL(othersStream);
        video.play();   
    });
});

/* Listen for connections */
peer.on('connection', function(con) {
    console.log("New connection");  // If fired, log it.
    
    con.on('open', function() {
        // Use to connection (con) to fetch data.
        con.on('data', function(data) {
            console.log('Received', data);
            document.getElementById("message").textContent += data.name + ": " + data.strings + '\n';
        });
    });
});

/* Add listener to the send button for chat message. */
document.getElementById('send').addEventListener('click', function(){
    var msg = document.getElementById("msg").value;
    document.getElementById("msg").value = "";
    document.getElementById("message").textContent += "Me: " + msg + '\n';

    console.log("send", msg);
    
    // Parse as json and send the string and your name
    con.send({
        strings: msg,
        name: name});
});

/* Will be fired when there's a incoming call. */
peer.on('call', function(call){
    call.answer(localStream);   // Accept the call on the stored stream;

    call.on('stream', function(othersStream){
        var video = document.getElementById('others-video');
        video.src = window.URL.createObjectURL(othersStream);
        video.play();
    });
});