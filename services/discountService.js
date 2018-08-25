function DiscountService() {}

DiscountService.prototype.getDiscount = function (price) {
    if (price > 500) {
        return price * 0.7;
    }

    return price;
}

module.exports = DiscountService;