const express = require('express');
const router = express.Router();
const pool = require('../config/db')
const {authorize} = require('../middlewares/auth')
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express()
const port = 3000

const options = {
    definition: {
      openapi: '3.0.0',
        info: {
            title: 'Express API with Swagger',
            version: '0.1.0',
            description:
                'This is simple CRUD API application made with Express and documented wit swagger',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
        "tags": [
            {
                "name": "MOVIES",
                "description": "POST tag description example"
            }
        ]
    },
    apis: ['.router/*'],
  };
  
  const specs = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  

/**
  @swagger
 * components:
 *  schemas:
 *      movies:
 *          type: object
 *          properties: 
 *            id:
 *              type: string
 *              description: The auto-generated id of the movies
 *            title:
 *              type: string
 *              description: The title of your movies
 *            genres:
 *              type: string
 *              description: The genre of movies 
 *            year: 
 *              type: string
 *              description: The year the film was broadcast
 */


/**
 * @swagger
 * /movies
 *              get:
 *                  summary : To get all data movies from postgres
 *                  "tags" : [MOVIES]
 *                  description: This api is used to fetch data form postgres
 *                  responses:
 *                      200:
 *                          description: This api is used to fetch data from postgres
 *                          content:
 *                              application/json:
 *                                  schema:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#components/schema/movies'
 */

/**
 * @swagger
 * /movies:
 *              get:
 *                  summary :   To get all data movies from postgres
 *                  "tags" : ["MOVIES"]
 *                  description: This api is used to fetch data from postgres
 *                  parameters:
 *                      - in: path
 *                        nama : id
 *                        requires: true
 *                        description Numeric ID required
 *                        schema:
 *                          type: integer
 *                  responses:
 *                      200:
 *                          description: This api is used to fetch data form postgres
 *                      400:
 *                          description: Invalid ID supplied
 *                      400:
 *                          description: User not found
 *                          content:
 *                              application/json:
 *                                  schema:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#components/schema/Movies'
 */

/**
 * @swagger
 * /movies:
 *              post:
 *                  sumary: Used to insert data movies to postgres
 *                  "tags": ["MOVIES    "]
 *                  description: This api is used to fetch data ftom postgres
 *                  requestBody:
 *                      required: true
 *                      content:
 *                          application/json:
 *                              schema:
 *                                  $ref: '#components/schemas/Movies'
 *                  responses:
 *                      200:
 *                          description: Added Succesfully
 *                      400:
 *                          description: Invalid input
 */

/**
 * @swagger
 * /Movies/(id):
 *              delete:
 *                   summary : This APPI is used to deleted record data film postgres
 *                   "tags" : [ "MOVIES" ]
 *                   description : This api is used to fetch data from postgres
 *                   parameters:
 *                      - in: path
 *                        nama : id
 *                        requires: true
 *                        description Numeric ID required
 *                        schema:
 *                          type: integer
 *                  responses:
 *                      200:
 *                          description: This api is used to fetch data form postgres
 *                      400:
 *                          description: Invalid ID supplied
 *                      400:
 *                          description: User not found
 */

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