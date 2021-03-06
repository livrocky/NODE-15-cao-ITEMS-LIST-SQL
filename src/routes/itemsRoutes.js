const express = require('express');
const mysql = require('mysql2/promise');
const { dbConfig } = require('../config');

const itemsRoutes = express.Router();
module.exports = itemsRoutes;

// PAIMTI VISUS ITEMUS (ARBA TIK 10) // (VEIKIA)

// itemsRoutes.get('/items', async (req, res) => {
//   let connection;
//   try {
//     // 1 prisijungti
//     connection = await mysql.createConnection(dbConfig);
//     console.log('connected');
//     // 2 atlikti veiksma
//     const sql = 'SELECT * FROM `items` LIMIT 10';
//     const [rows, fields] = await connection.query(sql);
//     res.json(rows);
//   } catch (error) {
//     // // err gaudom klaidas
//     console.log('home route error ===', error);
//     res.status(500).json('something went wrong');
//   } finally {
//     // 3 atsijungti
//     if (connection) connection.end();
//     // connection?.close();
//   }
// });

// GET route paims ir paduos visus įrašus iš duomenų bazės. Pakoreguokime, kad būtų galime nustatyti limit'ą su search query (t.y. ?limt=10).

itemsRoutes.get('/items', async (req, res) => {
  let connection;
  try {
    const { limit } = req.query;
    console.log('limit ===', limit);
    connection = await mysql.createConnection(dbConfig);
    const sql = 'SELECT * FROM `items` LIMIT ?';
    const [getItemsWithLimit] = await connection.execute(sql, [limit]);
    res.json(getItemsWithLimit);
  } catch (error) {
    res.status(500).json('error in get items with limit');
  } finally {
    await connection?.end();
  }
});

// PAPOSTINTI VIENA ITEMA //

itemsRoutes.post('/items/post', async (req, res) => {
  let connection;
  try {
    const { id, title } = req.body;
    const connection = await mysql.createConnection(dbConfig);
    const sql = `INSERT INTO items (id, title) VALUES (?, ?)`;
    const [rows] = await connection.execute(sql, [id, title]);
    console.log('connected');
    res.json(rows);
  } catch (error) {
    // // err gaudom klaidas
    res.status(500).json('error in post items');
  } finally {
    await connection?.end();
  }
});

// ISTRINTI VIENA ITEMA //

itemsRoutes.delete('/items/:itemId', async (req, res) => {
  // res.json(req.params.itemId);
  let conn;
  try {
    const { itemId } = req.params;
    conn = await mysql.createConnection(dbConfig);
    const sql = 'DELETE FROM items WHERE `id` = ?';
    const [deleteRezult] = await conn.execute(sql, [itemId]);
    if (deleteRezult.affectedRows !== 1) {
      res.status(400).json({ success: false, error: `item with id ${itemId}, was not found` });
      return;
    }
    if (deleteRezult.affectedRows === 1) {
      res.json('DELETED');
      return;
    }
    throw new Error('sometnig wrong in deleteRezult.affectedRows');
  } catch (error) {
    console.log('error DELETE posts', error);
    res.sendStatus(500);
  } finally {
    await conn?.end();
  }
});
