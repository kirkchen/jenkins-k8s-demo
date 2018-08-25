var mocha = require('mocha');
var chai = require('chai');
chai.should();

describe('Discount Service', () => {
    var discountService; 
    before(() => {
        const DiscountService = require('../services/discountService');
        discountService = new DiscountService();
    });

    it('does 80% discount if price over 500', () => {
       // Arrange
       var price = 600;
       var expected = 480;
       var actual = 0;
       
       // Act
       actual = discountService.getDiscount(price);
       
       // Assert
       actual.should.equal(expected); 
    });

    it('does no discount if price less than or equal to 500', () => {
       // Arrange
       var price = 400;
       var expected = 400;
       var actual = 0;
       
       // Act
       actual = discountService.getDiscount(price);
       
       // Assert
       actual.should.equal(expected); 
    });
});