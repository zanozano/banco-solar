const { Pool } = require('pg');
const axios = require('axios');

const pool = new Pool({
	user: 'postgres',
	host: 'localhost',
	password: 'postgres',
	port: 5433,
	database: 'bancosolar',
});

// getUsers
const getUsers = async () => {
	try {
		const result = await pool.query('SELECT * FROM usuarios');
		console.log('Tabla usuarios: ', result.rows);
		return result.rows;
	} catch (error) {
		console.log('Error', error);
		return error;
	}
};

// postUsers
const postUsers = async (datos) => {
	const insertValue = {
		text: 'INSERT INTO usuarios (nombre, balance) VALUES ($1, $2) RETURNING *;',
		values: datos,
	};

	try {
		const result = await pool.query(insertValue);
		return result;
	} catch (error) {
		console.log('Error:', error);
		return error;
	}
};

// editUsers
const editUsers = async (datos) => {
	console.log(datos);

	const editValue = {
		text: 'UPDATE usuarios SET nombre = $2, balance = $3 WHERE id = $1 RETURNING *',
		values: datos,
	};

	try {
		const result = await pool.query(editValue);
		return result;
	} catch (error) {
		console.log(error);
		return error;
	}
};

// deleteUsers
const deleteUsers = async (id) => {
	try {
		const result = await pool.query(
			`
            DELETE FROM transferencias WHERE emisor = ${id} OR receptor = ${id};
            DELETE FROM usuarios WHERE id = '${id}';
            `
		);
		return result;
	} catch (error) {
		console.log(error.code);
		return error;
	}
};

// getTransfers
const getTransfers = async () => {
	try {
		const result = await pool.query('SELECT * FROM transferencias;');
		console.log('Tabla transferencias: ', result.rows);
		return result.rows;
	} catch (error) {
		console.log('Error', error);
		return error;
	}
};

// postTransfers
const postTransfers = async (datos) => {
	try {
		const { data } = await axios.get('http://localhost:3000/usuarios');

		const emisor = data.filter((elemento) => {
			return elemento.nombre == datos[0];
		});

		const receptor = data.filter((elemento) => {
			return elemento.nombre == datos[1];
		});

		const result = await pool.query(
			`
            BEGIN;
            UPDATE usuarios SET balance = balance - ${datos[2]} WHERE nombre = '${datos[0]}';
            UPDATE usuarios SET balance = balance + ${datos[2]} WHERE nombre = '${datos[1]}';
            INSERT INTO transferencias (
                emisor,
                receptor,
                monto,
                fecha)
            VALUES (${emisor[0].id},
                ${receptor[0].id},
                '${datos[2]}',
                now()
                );
            COMMIT;
            `
		);
		return result;
	} catch (error) {
		await pool.query('ROLLBACK');
		console.log(error);
		return error;
	}
};

// exports
module.exports = { getUsers, postUsers, editUsers, deleteUsers, getTransfers, postTransfers };
