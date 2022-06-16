import express from "express";
import tokenGenerator from "../jwtgenerator.js";
import Order from "../models/orderModel.js";
import aSH from "express-async-handler";
import { protect } from "../middleware/authMiddleware.js";
import Razorpay from "razorpay";
import mailer from "../mailer.js";
const orderRouter = express.Router();

orderRouter.post(
  "/create_order_razorpay",
  protect,
  aSH(async (req, res) => {
    var instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const { totalPrice } = req.body;

    var options = {
      amount: totalPrice * 100, // amount in the smallest currency unit
      currency: "INR",
    };

    instance.orders.create(options, function (err, order) {
      const { id } = order;

      if (!err) res.status(201).json(id);
      else throw new Error(JSON.stringify(err));
    });
  })
);

orderRouter.post(
  "/create_order",
  protect,
  aSH(async (req, res) => {
    const orderDetails = req.body;

    const order = await Order.create(orderDetails);

    if (order) {
      res.status(201).json(order);
      mailer(
        req.user.email,
        "Your order has been placed",
        `Your order for ${orderDetails.orderItems.map(
          (order) => order.name
        )} has been placed.`
      );
    } else res.status(400);
    throw new Error("Internal Server Error");
  })
);

orderRouter.get(
  "/get_orders",
  protect,
  aSH(async (req, res) => {
    const order = await Order.find({ user: req.user._id }).populate(
      "user",
      "name email"
    );

    if (order) res.status(201).json(order);
    else res.status(404);
    throw new Error("Order Not Found");
  })
);

//fetch single product

orderRouter.get(
  "/get_order/:id",
  protect,
  aSH(async (req, res) => {
    const order = await (
      await Order.findById(req.params.id).populate("user", "name email")
    ).execPopulate();

    if (order) res.status(201).json(order);
    else res.status(404);
    throw new Error("Order Not Found");
  })
);

orderRouter.post(
  "/orderPaid/:id",
  protect,
  aSH(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentDetails = {
        id: req.body.id,
        update_time: Date.now(),
      };

      const updatedOrder = await order.save();

      res.json(updatedOrder);
    } else res.status(404);
    throw new Error("Order Not Found");
  })
);

export default orderRouter;
