// Import the http module
const http = require('http');

// Define the hostname and port
const hostname = '127.0.0.2';
const port = 3000;

// Create the server
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello, World! My name is Dhyey Patel\n');
});

// Make the server listen on the specified port and hostname
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
