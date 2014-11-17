/**
 * @fileOverview poker.hand.js
 * @author <a href="mailto:brianfegan@gmail.com">Brian Fegan</a>
 * @version 1.0
 */

window.POKER = window.POKER || {};
POKER.Hand = (function(POKER, window, undefined){
	
	/**
	 * @name POKER.Hand
	 * @class
	 * @description Turns a string of cards into a card model instance.
	 * @requires POKER
	 * @param {string} cards A string which represents a poker hand.
	 */
	var Hand = function(cards) {
		
		// set up the instance and format hand from string
		this.error = false;
		this.cards = cards;
		_makeArrOfCardObjs.call(this);
		
		// if hand is valid, evaluate cards and set the hand score
		if (this.error === false) {
			this.pairs = {};
			this.triplets = {};
			this.quads = {};
			_evaluateCards.call(this);
			_setScore.call(this);
		}
		
	},
	
	/**
	 * @name POKER.Hand~_getRankFromFaceCard
	 * @function
	 * @description Takes in a shorthand face card string, and returns its numerical equivalent.
	 * @param {string} faceCard
	 * @returns {number} Translated numerical rank
	 */
	_getRankFromFaceCard = function(faceCard) {
		var map = { J:11, Q:12, K:13, A:14 };
		return map[faceCard];
	},
	
	/**
	 * @name POKER.Hand~_getCardRank
	 * @function
	 * @description Takes in a card string and extracts its numerical ranking between 2 and 14.
	 * @param {string} card
	 * @returns {number} Card rank
	 */
	_getCardRank = function(card) {
		var rank = card.substr(0, card.length-1);
		if ( isNaN(rank) ) {
			rank = _getRankFromFaceCard(rank.toUpperCase());
		} else {
			rank = parseInt(rank, 10);
		}
		if ( (typeof rank == 'number') && (rank > 1) && (rank < 15) ) {
			return rank;
		} else {
			throw "Invalid rank...these aren't the cards you're looking for.";
		}
	},
	
	/**
	 * @name POKER.Hand~_getCardSuit
	 * @function
	 * @description Takes in a card string and extracts its suit; "C", "D", "H", or "S".
	 * @param {string} card
	 * @returns {string} Card suit
	 */
	_getCardSuit = function(card) {
		var suit = card.charAt(card.length-1).toUpperCase();
		if ( (suit == 'C') || (suit == 'D') || (suit == 'H') || (suit == 'S') ) {
			return suit;
		} else {
			throw 'Invalid suit...what is this, UNO?';
		}			
	},
	
	/**
	 * @name POKER.Hand~_sortObjByKey
	 * @function
	 * @description Used as an array sort function; sort array of objects by a key in each object.
	 * @param {string} field The key we wish to sort by
	 * @param {boolean} reverse	True will reverse the result
	 * @param {function} primer	Function to run on test var
	 */
	_sortObjByKey = function(field, reverse, primer) {
		var key = function (x) {return primer ? primer(x[field]) : x[field]};
		return function (a,b) {
			var A = key(a), B = key(b);
			return (A < B ? -1 : (A > B ? 1 : 0)) * [1,-1][+!!reverse];
		}
	},
	
	/**
	 * @name POKER.Hand~_makeArrOfCardObjs
	 * @function
	 * @description Convert cards string into a validated array of card objects, with rank and suit keys, sorted by rank.
	 */
	_makeArrOfCardObjs = function() {
		
		try {
			
			if (this.cards === '') throw 'No cards!';
		
			// break up string into an array
			this.cards = this.cards.split(' ');
	    	if (this.cards.length !== 5) throw 'Follow the example or click deal!';
	    	
	    	// break up array into object of rank/suit pairs
	    	var i, card;
			for (i=0; i<this.cards.length; i++) {
				card = this.cards[i];
				this.cards[i] = {rank:_getCardRank(card), suit:_getCardSuit(card)};
			}
			
			// sort cards numerically and evaluate hand
			this.cards.sort(_sortObjByKey('rank', false, window.parseInt));
		
		}
		
		// if the card string was invalid in any way, set the error msg for this instance
		catch(err) {
			this.error = 'Error: ' + err;
		}
		
	},
	
	/**
	 * @name POKER.Hand~_trackFlush
	 * @function
	 * @description Track if hand is a flush; compare card suit passed in against a baseline suit.
	 * @params {boolean} isFlush Used to determine if we should keep checking or if flush is already false
	 * @params {string} cardSuit The suit of a card
	 * @params {string} baseSuit The baseline suit to compare against
	 * @returns {boolean} If hand is tracking as a flush
	 */
	_trackFlush = function(isFlush, cardSuit, baseSuit) {
		return ( (isFlush && (cardSuit === baseSuit)) ? true : false );
	},
	
	/**
	 * @name POKER.Hand~_trackStraight
	 * @function
	 * @description Track if hand is a straight; compare card rank passed in against the previous rank.
	 * @params {boolean} isStraight Used to determine if we should keep checking or if straight is already false
	 * @params {number} rank The rank of a card
	 * @params {number} lastRank The rank of the previous card to compare against
	 * @returns {boolean} If hand is tracking as a straight
	 */
	_trackStraight = function(isStraight, rank, lastRank) {
		return ( (isStraight && (rank === (lastRank+1))) ? true : false );
	},
	
	/**
	 * @name POKER.Hand~_trackSets
	 * @function
	 * @description Track if hand has sets of pairs, three of a kind, or four of a kind.
	 * @params {object} sets A temp object of ranks as keys; values increment if multiple instances of ranks are found.
	 * @params {number} rank The rank of a card
	 * @returns {object} The updated temp object
	 */
	_trackSets = function(sets, rank) {
		if (sets[rank] === undefined) {
			sets[rank] = 1;
		} else {
			sets[rank] = sets[rank] + 1;
			if (sets[rank] === 2) {
				this.pairs[rank] = true;
			} else if (sets[rank] === 3) {
				delete this.pairs[rank];
				this.triplets[rank] = true;
			} else if  (sets[rank] === 4) {
				delete this.triplets[rank];
				this.quads[rank] = true;
			}
		}
		return sets;
	},
	
	/**
	 * @name POKER.Hand~_evaluateCards
	 * @function
	 * @description Loop through sorted cards array to determine if cards are a straight, a flush, and if similar rank sets exist. 
	 */
	_evaluateCards = function() {
		
		var cards = this.cards,
			baseSuit = cards[0].suit,
			isStraight = true,
			isFlush = true,
			sets = {},
			rank,
			lastRank,
			i;
				
		for (i=0; i<5; i++) {
			rank = cards[i].rank;
			if (i !== 0) {
				isStraight = _trackStraight(isStraight, rank, lastRank);
				isFlush = _trackFlush(isFlush, cards[i].suit, baseSuit);
			}
			sets = _trackSets.call(this, sets, rank);
			lastRank = rank;
		}
		
		this.isStraight = isStraight;
		this.isFlush = isFlush;
		
	},
	
	/**
	 * @name POKER.Hand~_getFormattedSuit
	 * @function
	 * @description Takes in a shorthand suit string and returns its user friendly equivalent. 
	 * @param {string} suit The shorthand card suit
	 * @returns {string} Formatted suit
	 */
	_getFormattedSuit = function(suit) {
		var map = { C:'Clubs', D:'Diamonds', H:'Hearts', S:'Spades' };
		return map[suit];
	},
	
	/**
	 * @name POKER.Hand~_getFormattedRank
	 * @function
	 * @description Takes in a numerical rank and returns its user friendly equivalent. 
	 * @param {number} rank The numerical card rank
	 * @param {boolean} plural Declares if the return value should be plural.
	 * @returns {string} Formatted rank
	 */
	_getFormattedRank = function(rank, plural) {
		var map = {
			2: 'Deuce',
			3: 'Three',
			4: 'Four',
			5: 'Five',
			6: 'Six',
			7: 'Seven',
			8: 'Eight',
			9: 'Nine',
			10: 'Ten',
			11: 'Jack',
			12: 'Queen',
			13: 'King',
			14: 'Ace'
		};
		return ( (plural) ? map[rank]+'s' : map[rank] );
	},
	
	/**
	 * @name POKER.Hand~_setScore
	 * @function
	 * @description From the results of the cards evaluation, sets what the highest final score is for this hand.
	 */
	_setScore = function() {
		
		var quadKeys = Object.getOwnPropertyNames(this.quads),
			tripKeys = Object.getOwnPropertyNames(this.triplets),
			pairKeys = Object.getOwnPropertyNames(this.pairs),
			tripsLen = tripKeys.length,
			pairsLen = pairKeys.length;
		
		if (this.isFlush && this.isStraight) {
			if (this.cards[0].rank === 10) {
				this.score = 'Royal Flush, ' + _getFormattedSuit(this.cards[0].suit);
			} else {
				this.score = 'Straight Flush, ' + _getFormattedRank(this.cards[0].rank) + ' to ' + _getFormattedRank(this.cards[4].rank) + ', ' + _getFormattedSuit(this.cards[0].suit);
			}
			return;
		}
		
		if (quadKeys.length) {
			this.score = 'Four of a Kind, ' + _getFormattedRank(quadKeys[0], true);
			return;
		}
		
		if (tripsLen && pairsLen) {
			this.score = 'Full House, ' + _getFormattedRank(tripKeys[0], true) + ' over ' + _getFormattedRank(pairKeys[0], true);
			return;
		}
		
		if (this.isFlush) {
			this.score = 'Flush, ' + _getFormattedSuit(this.cards[0].suit);
			return;
		}

		if (this.isStraight) {
			this.score = 'Straight, ' + _getFormattedRank(this.cards[0].rank) + ' to ' + _getFormattedRank(this.cards[4].rank);
			return;
		}

		if (tripsLen) {
			this.score = 'Three of a Kind, ' + _getFormattedRank(tripKeys[0], true);
			return;
		}
		
		if (pairsLen > 1) {
			this.score = 'Two Pair, ' + _getFormattedRank(pairKeys[0], true) + ' and ' + _getFormattedRank(pairKeys[1], true);
		} else if (pairsLen === 1) {
			this.score = 'Pair of ' + _getFormattedRank(pairKeys[0], true);	
		} else {
			this.score = 'High Card, ' + _getFormattedRank(this.cards[4].rank);
		}
		
	};
	
	// public methods
	Hand.prototype = {
		
		/**
		 * @name POKER.Hand.getScore
		 * @function
		 * @description Get the formatted hand score outside of this model instance.
		 * @returns {string} Final score
		 */
		getScore : function() {
			return this.score;		
		},
		
		/**
		 * @name POKER.Hand.getError
		 * @function 
		 * @description Get the error status or message outside of this model instance.
		 * @returns {boolean|string} Either false or an error messsage
		 */
		getError : function() {
			return this.error;		
		}
					
	};
	
	return Hand;
	
})(POKER, window, undefined);