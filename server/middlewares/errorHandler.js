module.exports = {
    errorHandlers: (error, request, response, next) => {
        if(error) {
            switch (error.name) {
                case "SignInError":
                    response.status(409).json({message: 'Invalid username/password'})
                case "Unauthorized":
                    response.status(401).json({message: 'You dont have access'})
                default:
                    response.status(500).json({message: 'Internal server error'})
            }
        }
    }
}