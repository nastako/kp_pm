'use strict';
// save file at clear
/*
function download(filename, text) {
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
function saveAs(){
  const sMarkup =  document.getElementById('debug').innerHTML; 
  var oNewDoc = document.open('text/html');     
  oNewDoc.write( sMarkup + "<hr>" );
  oNewDoc.close();
    }
*/
function saveAs(){
  var today = new Date();
	var yy = today.getFullYear();
  var dd = (today.getDate() < 10 ? '0' : '') + today.getDate();        
  var mnt = ((today.getMonth() + 1) < 10 ? '0' : '')+(today.getMonth() + 1); 
	var hh = (today.getHours() < 10 ? '0' : '') + today.getHours();  
	var mm = (today.getMinutes() < 10 ? '0' : '') + today.getMinutes();
  var ss = (today.getSeconds() < 10 ? '0' : '') + today.getSeconds(); 
  var dateTime = yy+mnt+dd+'_'+hh+mm+ss+'.html';
  
  const sMarkup =  document.getElementById('debug').innerHTML; 
  var element = document.createElement('a');
  element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(sMarkup));
  //element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(sMarkup));	
  element.setAttribute('download', dateTime);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
   
    }

//

let m = new Monitor();

let printJson = function(o) {
    let debug = document.getElementById('debug');
    let line = document.createElement('p');
    let p = '';

    p = '{ ';
    for (let k in o.data) {
        if (o.data.hasOwnProperty(k)) {
            p += k + ':' + o.data[k].toFixed(2) + ', ';
        }
    }

    line.textContent = p.replace(/, $/, ' },');
    debug.appendChild(line);

    window.scrollTo(0, document.body.scrollHeight);
};

let clearDebug = function() {
    // save file
  /*
    var text = document.getElementById('debug').innerHTML
    var filename = "test.txt";
    download(filename, text );
    var blob = new Blob([text], {type: "text/plain;charset=utf-8"});
    window.saveAs(blob, "blob_method.txt");
    //
    */
    document.getElementById('debug').innerHTML = '';
};

let toggleInstructions = function() {
    toggleClass(document.getElementById('instructions'), 'hidden');
};

let toggleMessages = function() {
    toggleClass(document.getElementById('messages'), 'hidden');
};

let clearMessageTypes = function() {
    let boxes = document.querySelectorAll('input[type=checkbox]:checked');
    boxes.forEach((b) => {
        b.checked = false;
    });
};

document.addEventListener('DOMContentLoaded', function() {
    if (!navigator.bluetooth) {
       toggleClass(document.querySelector('#unsupported'), 'hidden');
       document.querySelectorAll('button').forEach(function(b) { b.disabled = true; });
       return;
    }

    let uiConnected = function() {
        document.querySelector('#connect').disabled = false;
        document.querySelector('#connect').textContent = 'Disconnect';

        document.querySelector('#toggle_messages').disabled = false;

        document.querySelector('#monitorInformation').textContent = 'Getting monitor information, please wait...';

        m.getMonitorInformation().
            then(information => {
                let mi = document.querySelector('#monitorInformation');
                mi.textContent = information.firmwareRevision + ' | ' +
                        information.hardwareRevision + ' | ' +
                        information.manufacturerName + ' | ' +
                        information.serialNumber;
            });
    };

    let uiPending = function() {
        document.querySelector('#connect').disabled = true;

        document.querySelector('#toggle_messages').disabled = true;
    };

    let uiDisconnected = function() {
        document.querySelector('#connect').disabled = false;
        document.querySelector('#connect').textContent = 'Connect';

        clearMessageTypes();
        document.querySelector('#monitorInformation').textContent = '';

        document.querySelector('#toggle_messages').disabled = true;
        addClass(document.getElementById('messages'), 'hidden');
    };

    let cbDisconnected = function() {
        m.removeEventListener('disconnect', cbDisconnected);
        uiDisconnected();
    };

    let cbMessage = function(e) {
        printJson(e);
    };

    document.querySelector('#clear').addEventListener('click', function() {
        clearDebug();
    });

    document.querySelector('#toggle_instructions').addEventListener('click', function() {
        toggleInstructions();
    });

    document.querySelector('#toggle_messages').addEventListener('click', function() {
        toggleMessages();
    });

    /*
     * Setup message type change.
     */
    let boxes = document.querySelectorAll('input[type=checkbox]');
    boxes.forEach((element) => {
        element.addEventListener('change', (e) => {
            if (element.checked) {
                m.addEventListener(element.value, cbMessage);
                console.log('notification added for ' + element.value);
            } else {
                m.removeEventListener(element.value, cbMessage);
                console.log('notification removed for ' + element.value);
            }
        });
    });

    document.querySelector('#connect').addEventListener('click', function() {
        uiPending();

        if (m.connected()) {
            cbDisconnected();
            uiDisconnected();
            m.disconnect();
        } else {
            m.connect()
            .then(() => {
                m.addEventListener('disconnect', cbDisconnected);
                uiConnected();
            })
            .catch(error => {
                uiDisconnected();
                console.log(error);
            });
        }
    });

    uiDisconnected();
});
