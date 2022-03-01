const http = require('http');
const fs = require('fs');
const url = require('url');
const {
	getUsers,
	postUsers,
	editUsers,
	deleteUsers,
	getTransfers,
	postTransfers,
} = require('./consultas');

http.createServer(async (req, res) => {
	const { id } = url.parse(req.url, true).query;

	// get html
	if (req.url == '/' && req.method === 'GET') {
		res.writeHead(200, { 'Content-Type': 'text/html' });
		fs.readFile('index.html', 'utf8', (err, html) => {
			if (err) {
				console.log('Error', err);
			}
			res.end(html);
		});
	}

	// get users
	if (req.url == '/usuarios' && req.method === 'GET') {
		const data = await getUsers();
		res.statusCode = 200;
		res.end(JSON.stringify(data));
	}

	// post users
	if (req.url == '/usuario' && req.method == 'POST') {
		let body = '';
		req.on('data', (chunk) => {
			body += chunk;
		});
		req.on('end', async () => {
			const data = Object.values(JSON.parse(body));
			const request = await postUsers(data);
			res.statusCode = 201;
			res.end(JSON.stringify(request));
		});
	}

	// put users
	if (req.url == `/usuario?id=${id}` && req.method == 'PUT') {
		let body = '';

		req.on('data', (chunk) => {
			body += chunk;
		});

		req.on('end', async () => {
			const datos = Object.values(JSON.parse(body));
			await editUsers(datos);
			res.statusCode = 200;
			res.end('Recurso editado con éxito!');
		});
	}

	// delete users
	if (req.url.startsWith(`/usuario?id=${id}`) && req.method == 'DELETE') {
		const data = [`${id}`];

		await deleteUsers(data);
		res.statusCode = 200;
		res.end('Registro eliminado con éxito!');
	}

	// get transfers
	if (req.url == '/transferencias' && req.method === 'GET') {
		const data = await getTransfers();
		res.statusCode = 200;
		res.end(JSON.stringify(data));
	}

	// post transferencias
	if (req.url == '/transferencia' && req.method == 'POST') {
		let body = '';
		req.on('data', (chunk) => {
			body += chunk;
		});
		req.on('end', async () => {
			const data = Object.values(JSON.parse(body));
			const request = await postTransfers(data);
			res.statusCode = 201;
			res.end(JSON.stringify(request));
		});
	}
}).listen(3000, console.log('Server On'));
