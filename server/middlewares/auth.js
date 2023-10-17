const { generateToken, verifyToken} = require('../helpers/jwt')
const pool = require('../config/db')

module.exports = {
    authenticate: async function (request, response, next) {
        try {
            const accessToken = request.headers.access_token

            const decoded = verifyToken(accessToken)

            const checkUser = await pool.query(`SELECT * FROM public.users WHERE '${decoded.email}' AND password = '${decoded.password}'`)

            if(!checkUser) {
                request.role = checkUser.rows[0].role;
            } else {
                next({name: 'SignInError'})
            }
        } catch (error) {
            next(error)
        }
    },
    authorize: async function (request, response, next) {
        const isSupervisor = request.role === 'Supervisor'

        if(!isSupervisor) {
            next({name: 'Unauthorized'})
        }
    }
}