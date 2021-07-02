import jwt from 'jsonwebtoken'

const tokenGenerator = (id) =>{
    return jwt.sign({id}, process.env.PRIVATETOKEN,{
        expiresIn:'30d'
    }) 

}

export default tokenGenerator