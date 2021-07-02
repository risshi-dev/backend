import express from 'express'
import dotenv from 'dotenv'
import connectDb  from './config/db.js'
import router from './Routes/Router.js'
import userrouter from "./Routes/userAuthRoutes.js";
import cors  from 'cors'
import {notFound, errorHandler} from './middleware/errormiddleware.js'
import orderRouter from './Routes/orderRoutes.js';
import path from 'path'
dotenv.config()
const app = express()
app.use(express.json())
app.use(cors())

connectDb()

app.use((req, res, next)=>{
    console.log(req.originalUrl)
    next()
})



app.use('/api/products',router)
app.use('/api/users',userrouter )
app.use('/api/orders', orderRouter)

app.get('/api/payment_settings', (req,res) => res.json(process.env.RAZORPAY_KEY))

const __dirname = path.resolve()

if(process.env.NODE_ENV==='production'){
    app.use(express.static(path.join(__dirname, '/frontend/build')))

    app.get('*', (req,res) => res.sendFile(path.resolve('frontend', 'build', 'index.html')))
}
else{
    app.get('/', (req,res)=>{
        res.send("Api is running")
    })
}


app.use(notFound)

app.use(errorHandler)

const Port = process.env.PORT || 5000
app.listen(Port,console.log(`Listening on ${Port}`))