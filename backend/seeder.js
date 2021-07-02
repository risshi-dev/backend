import mongoose from 'mongoose'
import dotenv from 'dotenv'
import user from './data/users.js'
import products from './data/products.js'
import User from './models/userModel.js'
import Product from "./models/productModel.js";
import Order from "./models/orderModel.js";
import connectDb from './config/db.js'

dotenv.config()

connectDb()

const importData = async () =>{
    try {

        await User.deleteMany()
        await Order.deleteMany();
        await Product.deleteMany();

        const updatedUsers = await User.insertMany(user)

       const adminUser = updatedUsers.find(u => u.isAdmin===true)._id

       const sampleproduct = products.map(p=>{
           return {...p, user: adminUser }
       })
        
       await Product.insertMany(sampleproduct)

       console.log('Data Imported!')
       process.exit()

    } catch (error) {
        console.log(error.message)
        process.exit(1)
    }
} 


const deleteData = async () => {
	try {
		await User.deleteMany();
		await Order.deleteMany();
		await Product.deleteMany();

		console.log("Data Deleted!");
		process.exit();
	} 
    catch (error) {
		console.log(error.message);
		process.exit(1);
	}
};

if(process.argv[2]==='-d')
     {      
         deleteData()
     }
else
     {
         importData()
     }
   