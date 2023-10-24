const express = require('express')
const bodyParser  = require('body-parser')
require("dotenv").config();
const { authenticate } = require('./middlewares/auth')


const app = express()
const port = 3000


const usersRouter = require('./router/users')
const moviesRouter = require('./router/movies')


app.use(bodyParser.urlencoded ({ extended: false}))
app.use(bodyParser.json())

app.use('/users', usersRouter);
app.use(authenticate);
app.use('/movies', moviesRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})