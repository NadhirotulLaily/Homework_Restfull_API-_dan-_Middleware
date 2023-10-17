const express = require('express');
const router = express.Router();
const pool = require('../config/db')
const { generateToken } = require('../helpers/jwt')


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