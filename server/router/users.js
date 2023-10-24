const express = require('express');
const router = express.Router();
const pool = require('../config/db')
const { generateToken } = require('../helpers/jwt')
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
                "name": "USERS",
                "description": "POST tag description example"
            }
        ]
    },
    apis: ['.router/*'],
  };
  
  const specs = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));


/**
 * @swagger
 * components:
 *  schemas:
 *      users:
 *          type: object
 *          properties: 
 *            id:
 *              type: string
 *              description: The auto-generated id of the movies
 *            email:
 *              type: string
 *              description: The email of your movies
 *            gender:
 *              type: string
 *              description: The your gender
 *            password: 
 *              type: string
 *              description: Fill in the password uniquely and easy to remember
 *            role: 
 *              type: string
 *              description: The role you play
 */

/**
 * @swagger
 * /users:
 *              get:
 *                  summary :   To get all data users from postgres
 *                  "tags" : ["USERS"]
 *                  description: This api is used to fetch data from postgres
 *                  responses:
 *                      200:
 *                          description: This api is used to fetch data form postgres
 *                          content:
 *                              application/json:
 *                                  schema:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#components/schema/users'
 */

/**
 * @swagger
 * /users:
 *              post:
 *                  summary : used to insert data users to postgres
 *                  "tags" : ["USERS"]
 *                  description: This api is used to fetch from postgres
 *                  requestBody:
 *                      required: true
 *                      content:
 *                          application/json:
 *                              schema:
 *                                  $ref: '#components/schema/users'
 *                  response:
 *                      200:
 *                          description: Added Succesfully
 *                      405:
 *                          description: Invalid input
 */

/**
 * @swagger
 * /login
 *              get:
 *                  summary : To get all data users from postgres
 *                  "tags" : ["USERS"]
 *                  description: This api is used to fetch data from postgres
 *                  parameters:
 *                      - in: path
 *                        name: email
 *                        required: true
 *                        description: Character email required
 *                        schema:
 *                          type: string
 *                      - in: path
 *                        name: password
 *                        required: true
 *                        description: Character password required
 *                        schema:
 *                          type: string
 *                  responses:
 *                      200:
 *                          description: This api is used to fetch data from postgres
 *                      400:
 *                          description: Invalid email/password supplied
 *                          content:
 *                              application/json:
 *                                  schema:
 *                                      type: array
 *                                      items:
 *                                          $ref: '#components/schema/users'
 */



router.get('/', async function (request, response, next) {
    const page = parseInt(request.query.page) || 1;
    const limit = 10;

    try {
        const offset = (page - 1) * limit;
        const query = `SELECT * FROM users LIMIT ${limit} OFFSET ${offset}`;
        const result = await pool.query(query);

        response.json(result.rows);
    } catch (error) {
        next(error)
    }
});

router.post('/register', function (request, response, next) {
    const {id, email, gender, password, role} = request.body

    pool.query(`INSERT INTO users (id, email, gender, password, role) VALUES ('${id}', '${email}', '${gender}', '${password}', '${role}')`, (error, result) => {
       
        if(error) {
            next({name: 'SignInError'})
        } else {
            response.status(201).json({ message: 'success', rows: result.rows });
        }
        
    })
});


router.get('/login', function (request, response, next) {
    const {email, password} = request.body

    pool.query(`SELECT * FROM public.users WHERE email = '${email}' AND password = '${password}'`, (error, result) => {
       
        if(error) {
            next({name: 'SignInError'})
        } else {
            const {email, password} = result.rows[0]

            const generateUserToken = generateToken({ email, password})
            response.status(200).json({access_token: generateUserToken, result: result.rows [0] })
        }
        
    })
});



module.exports = router;