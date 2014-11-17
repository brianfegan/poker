/**
 * @fileOverview Poker
 * @author <a href="mailto:brianfegan@gmail.com">Brian Fegan</a>
 * @version 1.0
 */

/**
 * @name POKER
 * @type object
 * @description The controller for the poker game. Dealing, views and hand play is managed here.
 */
window.POKER = (function(self, window, undefined){
	
	/**
	 * @name POKER.deal
	 * @function
	 * @description Get a hand from the dealer service.
	 * @returns {string} A string of 5 cards
	 */
	var _deal = function() {
		return self.dealer.deal();
	},
	
	/**
	 * @name POKER.hand
	 * @function
	 * @description Returns a hand instance with public getScore and getError methods from the string passed in.
	 * @param {string} handStr An unformatted string representing a hand
	 * @returns {object} A hand instance
	 */
	_hand = function(handStr) {
		self.hand = null;
		self.hand = new POKER.Hand(handStr);
		return self.hand;
	},
	
	/**
	 * @name POKER.initialize
	 * @function
	 * @description Kicks off game functionality by setting up view manager and dealer service; can only be called once.
	 */
	_initialize = function() {
		if (self.initialized) return;
		self.view = new POKER.View();
		self.dealer = new POKER.Dealer();
		self.initialized = true;
	};
	
	return {
		initialize: _initialize,
		deal: _deal,
		hand: _hand
	};
	
})({}, window, undefined);