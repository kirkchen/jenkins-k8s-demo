const DiscountService = require('./services/discountService');
const express = require('express');

const app = express();
const discountService = new DiscountService();

app.get('/', function (req, res) {
    const price = req.query.price;

    const discountPrice = discountService.getDiscount(price);

    res.json({ discountPrice });
});

app.listen(3000, function () {
    console.log('App is listening on port 3000!');
});