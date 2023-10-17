const express = require('express');
const router = express.Router();
const pool = require('../config/db')
const {authorize} = require('../middlewares/auth')

router.use(authorize);

router.get('/', async function (request, response) {
    const page = parseInt(request.query.page) || 1;
    const limit = 10;

    try {
        const offset = (page - 1) * limit;
        const query = `SELECT * FROM public.movies LIMIT ${limit} OFFSET ${offset}`;
        const result = await pool.query(query);

        response.json(result.rows);
    } catch (error) {
        next(error)
    }
});

router.post('/', function ( request, response) {
    const id = request.body.id;
    const title = request.body.title;
    const genres = request.body.genres;
    const year = request.body.year;
    
    const query = 'INSERT INTO public.movies (id, title, genres, year) VALUES ($1, $2, $3, $4)';
    const values = [id, title, genres, year];
    pool.query(query, values, (error, result) => {
            if (error) {
                console.error('Error executing query:', error);
                response.status(500).send('Internal Server Error');
            } else {
                response.status(201).json({ message: 'Data berhasil disimpan ke dalam database!', rows: result.rows });
            }    
        })
     });

    

router.put('/:moviesId', function (request, response) {
    const { title, genres } = request.body;
    const { moviesId } = request.params;

    const query = 'UPDATE public.movies SET title = $1, genres = $2 WHERE id = $3';
        const values = [title, genres, moviesId];
        pool.query(query, values, (error, result) => {
        if (error) {
            console.error('Error executing query:', error);
            response.status(500).send('Internal Server Error');
        } else {
            response.status(201).json({ message: 'success', rows: result.rows})
        }
    })
});

router.delete('/:moviesId', function (request, response) {
    const { moviesId } = request.params
    const query = `DELETE FROM public.movies  WHERE id = $1`
    const values = [moviesId];

    pool.query(query, values, (error, result) => {

        if(error) {
            if(error.includes('Internal server error')) {
                response.status(500).json({ error: 'Data not found' })
            } else if (error.includes('unauthorized')) {
                response.status(401).json({ error: 'Data not found' })
            }
        } else {
            response.status(200).json({ message: 'success', rows: result.rows})
        }
    })
});

module.exports = router;