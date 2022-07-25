// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const { ipcRenderer } = require('electron')
const Timer = require('timer.js')
let menu = ['main', 'add', 'view', 'about']
function change(id) {
    console.log("change");
    for(let i=0;i<menu.length;i++) {
        if(menu[i] != id) {
            document.getElementById(menu[i]).style.display = "none";
            document.getElementById(`a-${menu[i]}`).removeAttribute("class");
        } else {
            document.getElementById(menu[i]).style.display = "block";
            document.getElementById(`a-${menu[i]}`).setAttribute("class","active");
        }
    }
}

// let start = (name, value) =>  {
//     console.log(name, value);

// }
// startWork(10)
