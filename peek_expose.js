// peek.tools.expedia.com has this object : socket
// using it, we can register for data updates.
// it is not created with the page, rather when the user connects, it is created.
// after created, register for data after  socket.acks.connected is true
// socket.on('userInteractionMatch', uim);
// where uim is a function to call.
// each time the connection is broken and remade, registration must be redone.
//
// extensions should create an element with class "extension_ids" and id of themselves
//

if (socket) {
    console.log('peek expose : socket exists');

    window.peek_socket = socket;
} else {

    console.log('peek expose : socket does not exists');
}

function callback_from_extension(data) {

}

var message_index = 0;

function onUserInteractionMatch(data) {
    //console.log('data received from expedia peek tool');
    for (var i = 0 ; i < extension_ids_to_notify.length ; i++) {
        var extension_id = extension_ids_to_notify[i];
        var data_for_extension = {
            command: 'peek_data_content',
            message_index: message_index++,
            peek_data: data
        };

        chrome.runtime.sendMessage(extension_id, data_for_extension, callback_from_extension);
    }
}

function onConnectionChange(connected) {
    for (var i = 0 ; i < extension_ids_to_notify.length ; i++) {
        var extension_id = extension_ids_to_notify[i];
        var data_for_extension = {
            command: 'peek_data_connection_change',
            message_index: message_index++,
            connected: connected
        };

        chrome.runtime.sendMessage(extension_id, data_for_extension, callback_from_extension);
    }
}

var log_prefix = 'peek_expose: ';
var registered_for_callback = false;
var extension_ids_to_notify = [];
function ping_for_changes() {
    if (!socket) return;
    if (socket.connected && !registered_for_callback) {
        console.log(log_prefix + 'register for user interaction match callback');
        socket.on('userInteractionMatch', onUserInteractionMatch);
        registered_for_callback = true;
        onConnectionChange(true);
        setTimeout(function(){
            onConnectionChange(true);
        }, 2000);
    }
    if (!socket.connected && registered_for_callback) {
        console.log(log_prefix + 'un register for user interaction match callback');
        registered_for_callback = false;
        onConnectionChange(false);
    }
    var extension_ids_elements = document.getElementsByClassName('extension_ids');
    for (var i = 0 ; i < extension_ids_elements.length ; i++) {
        var id = extension_ids_elements[i].id;
        if (extension_ids_to_notify.indexOf(id) < 0) {
            console.log(log_prefix + 'adding new extension id: ' + id);
            extension_ids_to_notify.push(id);
        }
    }
}

setInterval( ping_for_changes, 1000);

// nope: making it global does not expose it to the content script.
//function get_peek_socket() {
//    return socket;
//}
//
//window.get_peek_socket = get_peek_socket;

