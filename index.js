const http = require('http');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const { EOL } = require('os');

const server = http.createServer((req, res) => {
    if (req.url === '/' && req.method === 'GET') {
        res.writeHead(200, {
            'content-type': 'text/html'
        });

        res.write(`
        <!DOCTYPE html>
        <html lang="en">
        
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Node JS Form</title>
        </head>
        
        <body>
            <form action="/upload2" method="POST" enctype="multipart/form-data">
                <div>
                    <label for="username">Username</label>
                    <input type="text" name="username" id="username" />
                </div>
                <div>
                    <label for="password">Password</label>
                    <input type="password" name="password" id="password" />
                </div>
                <div>
                    <label for="avatar">Avatar</label>
                    <input type="file" name="avatar" id="avatar" />
                </div>
                <div>
                    <input type="submit" value="Register">
                </div>
            </form>
        </body>
        
        </html>
        `);

        res.end();
        // Simple form
    } else if (req.url === '/' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('close', () => {
            const data = querystring.parse(body);

            console.log(data);

            res.end();
        });
    } else if (req.url === '/upload' && req.method === 'POST') {
        const body = [];

        req.on('data', chunk => {
            body.push(chunk);
        });

        req.on('close', () => {
            const dataBuffer = Buffer.concat(body);
            const data = dataBuffer.toString('binary');
            const bondary = req.headers['content-type'].split('boundary=').at(1);
            const parts = data.split(`--${bondary}`);

            const [meta, imageData] = parts[3].split(EOL + EOL);
            const fileName = meta.match(/filename="(.+)"/)[1];
            const savePath = path.join(__dirname, 'uploads', fileName);

            fs.writeFile(savePath, imageData, 'binary', (err) => {
                if (err) {
                    return res.end();
                }

                console.log('Image uploaded');

                res.writeHead(302, {
                    'location': '/'
                });
                res.end();
            });
        });
    } else if (req.url === '/upload2' && req.method === 'POST') {
        const form = new formidable.IncomingForm();
        form.parse(req, (err, fields, files) => {
            const savePath = path.join(__dirname, 'uploads', files['avatar'].at(0).originalFilename);

            fs.copyFile(files['avatar'].at(0).filepath, savePath, (err) => {
                console.log('Image uploaded');
                res.end();
            })
        });
    }
});

server.listen(5000);
console.log('Server is listening on port 5000...');