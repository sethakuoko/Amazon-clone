const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    category: { type: String },
    rating: {
      value: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    inventory: { type: Number, default: 100 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
