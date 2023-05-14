// https://stackoverflow.com/a/45082999/2205935

var exec = require('child_process').exec;
var os = require('os');

function echo(_error, stdout, _stderr) { console.log(stdout) }

// Run command depending on the OS
if (os.type() === 'Linux') 
    exec("rm -R dist && echo 'dist folder removed'; parcel build --no-source-maps src/index.html --public-url ./", echo); 
else if (os.type() === 'Windows_NT') {
    exec("rmdir /S /Q dist", echo);
    exec("npx parcel build --no-source-maps src/index.html --public-url ./", echo);
} else
    throw new Error("Unsupported OS found: " + type());