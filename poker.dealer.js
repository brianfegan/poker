/**
 * @fileOverview poker.dealer.js
 * @author <a href="mailto:brianfegan@gmail.com">Brian Fegan</a>
 * @version 1.0
 */

window.POKER = window.POKER || {};
POKER.Dealer = (function(POKER, window, undefined){
	
	/**
	 * @name POKER.Dealer
	 * @class
	 * @description A service that builds, shuffles and deals a hand of cards.
	 * @requires POKER
	 */
	var Dealer = function() {
		this.deck = _getNewDeck();
		_shuffleDeck.call(this);
	},
	
	/**
	 * @name POKER.Dealer~_getNewDeck
	 * @function
	 * @description Returns a new deck of cards; 4 suits, 13 cards per suit.
	 * @returns {array} A new deck of cards
	 */
	_getNewDeck = function() {
		var suits = ['c', 'd', 'h', 's'], faceMap = {11:'J', 12:'Q', 13:'K', 14:'A'}, deck = [], rank, suit, i, j;
		for (var i=0; i<4; i++) {
			suit = suits[i];
			for (j=2; j<15; j++) {
				if (j < 11) {
					deck.push(j + suit);
				} else {
					deck.push(faceMap[j] + suit);
				}
			}
		}
		return deck;
	},
	
	/**
	 * @name POKER.Dealer~_shuffleDeck
	 * @function
	 * @description Shuffles a dealer instance's deck using knuth algorithm, and resets deal index to zero. 
	 */
	_shuffleDeck = function() {
		var deck = this.deck, temp, i, j;
		for (i=deck.length-1; i>0; i--) {
			j = Math.floor(Math.random() * (i + 1));
			temp = deck[i];
			deck[i] = deck[j];
			deck[j] = temp;
		}
		this.index = 0;
	};
	
	// public methods
	Dealer.prototype = {
		
		/**
		 * @name POKER.Dealer.deal
		 * @function
		 * @description Deals a string of cards using the top of the current shuffled deck. Reshuffles if at the end of the deck.
		 * @returns {string} A five-card hand as a string
		 */
		deal : function() {
			if (this.index > 48) _shuffleDeck.call(this);
			for (var i=this.index; i<(this.index+5); i++) {
				card = this.deck[i];
				hand = (i == this.index) ? card : (hand + ' ' + card);	
			}
			this.index = this.index + 5;
			return hand;
		}
		
	};
	
	return Dealer;
	
})(POKER, window, undefined);