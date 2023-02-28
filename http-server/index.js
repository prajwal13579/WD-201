let http = require("http");
let fs = require("fs");

let home = '';
let projects = '';
let registration = '';

fs.readFile('home.html', (err,data)=>{
    if(err) throw err; 
    home = data.toString();
});


fs.readFile('projects.html', (err,data)=>{
    if(err) throw err; 
    home = data.toString();
});

fs.readFile('registration.html', (err,data)=>{
    if(err) throw err; 
    home = data.toString();
});

http.createServer((request, response)=>{
    let url = request.url;

    switch(url){
        case '/project': 
            response.writeHead(200, { "Content-Type": "text/html" });
            response.write(home);
            response.write(projects);
            response.end();
            break;
        case '/registration':
            response.writeHead(200, { "Content-Type": "text/html" });
            response.write(home);
            response.write(registration);
            response.end();
            break; 
        default:
            response.writeHead(200, { "Content-Type": "text/html" });
            response.write(home);
            response.write(home);
            response.end();
    }
}).listen(5000);