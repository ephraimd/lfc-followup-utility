const http = require('http');
const fs = require('fs');


let server = http.createServer();

server.on('request', (req, res)=> {
    res.writeHead(200, {'Content-Type': 'application/octet-stream'});
    fs.createReadStream('vid/video.mp4').pipe(res);
});

server.listen(8080);
console.log('Server Started on port 8080');

/**
 * On the server cmd, each run opens a session
 * you can assign full file path names as aliases
 * these files can then be requested from the client
 * or the client can send commands to navigate the directories
 * then can command the app to return any data as application/octet
 */