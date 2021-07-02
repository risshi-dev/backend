import express from "express";
import tokenGenerator from '../jwtgenerator.js'
import User from "../models/userModel.js";
import aSH from "express-async-handler";
import { protect } from "../middleware/authMiddleware.js";
import mailer from '../mailer.js'
const userrouter = express.Router();

userrouter.post(
	"/login",
	aSH(async (req, res) => {
	const {email,password} = req.body

    const user = await User.findOne({email})

    if(user && await user.matchPassword(password))
	    { 
			res.status(200).json({
                                        _id:user._id,
										name: user.name,
										email: user.email,
										isAdmin: true,
                                        token:tokenGenerator(user._id)
									});
								}
    else
      res.status(401)
	  throw new Error('Invalid email or password')
	})
);

userrouter.post(
	"/register",
	aSH(async (req, res) => {
		const { name, email, password } = req.body;

		const userExists = await User.findOne({ email });

		if(userExists){

		res.status(400)
		throw new Error('user Already Exists')
	}

	const user = await User.create({name, email, password})

	if(user){
		res.status(201).json({
			_id: user._id,
			name: user.name,
			email: user.email,
			isAdmin: true,
			token: tokenGenerator(user._id),
		});

		mailer(user.email, 'Welcome to MernShop', 'You have been successfully registered.Happy Shopping')

	}

	else{
		res.status(400)
		throw new Error('Invalid User Data')
	}

	})
);

userrouter.get(
	"/profile",
	protect,
	aSH(async (req, res) => {

		const user = await User.findById(req.user._id)
        
		if(user){
		 res.json({
				_id: user._id,
				name: user.name,
				email: user.email,
				isAdmin: true,
			});
		}

		else{
			res.status(404)
			throw new Error('User Not Found')
		}
	})
);

userrouter.post(
	"/update",
	protect,
	aSH(async (req, res) => {

		const user = await User.findById(req.user._id)
        
		if(user){

			const {name, email, password} = req.body
		
			user.name = name || user.name
			user.email = email || user.email

			if(password)
			user.password = password
			
			const updatedUser = await user.save()
		res.status(200).json({
			_id:updatedUser._id,
			name: updatedUser.name,
			email: updatedUser.email,
			isAdmin: true,
			token:tokenGenerator(updatedUser._id)
		});

		}


		else{
			res.status(404)
			throw new Error('User Not Found')
		}
	})
);

export default userrouter