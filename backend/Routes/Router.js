import express from 'express'
import Product from '../models/productModel.js'
import aSH from 'express-async-handler'
import {protect} from '../middleware/authMiddleware.js'
const router = express.Router()


router.get("/", aSH(async (req, res) => {

   const products = await Product.find({})
	res.json(products);
}));

router.get("/top_products", aSH(async (req, res) => {

   const products = await Product.find({}).sort({rating:-1}).limit(2)
	res.json(products);

}));

router.get("/search", aSH(async (req, res) => {

   const search = {name:{$regex : req.query.key, $options : 'i'}}

   const products = await Product.find({...search})
   if(products)
	   res.json(products);
   else
     throw new Error('No Product Found')
}));

router.get("/:id", aSH(async (req, res) => {
	const product = await Product.findById(req.params.id);

    if(product)
     	res.json(product);
    else
       res.status(404).json({'message':'Item Not Found'})
}));


router.post(
	"/:id/reviews",
	protect,
	aSH(async (req, res) => {

		const product = await Product.findById(req.params.id)

      if(!product){
			res.status(404)
			throw new Error('Product Not Found')
		}

      const ifReviewed = product.reviews.find(r => r.user.toString() === req.user._id)
        
		if(ifReviewed){
          
         res.status(400)
         throw new Error('Already Reviewed')
			
		}

      const {rating, comment} = req.body
		
		const review = {
         user: req.user._id,
         name: req.user.name,
         rating : Number(rating),
         comment : comment
      }

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

      await product.save()

      res.status(201).json({message: 'Your Review has been added'})

		
	})
);


export default router

