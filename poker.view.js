/**
 * @fileOverview poker.view.js
 * @author <a href="mailto:brianfegan@gmail.com">Brian Fegan</a>
 * @version 1.0
 */

window.POKER = window.POKER || {};
POKER.View = (function(POKER, window, undefined){
	
	/**
	 * @name POKER.View
	 * @class
	 * @description A view manager for the poker DOM interactions.
	 * @requires POKER
	 */
	var View = function() {
		
		// save dom elements for future reference
		this.handEle = document.getElementById('hand');
		this.submitEle = document.getElementById('submit');
		this.yourScore = document.getElementById('yourScore');
		this.scoreEle = document.getElementById('score');
		this.errorEle = document.getElementById('error');
		
		// bind event listeners
		var formEle = document.getElementById('form');
		formEle.addEventListener('submit', _onFormSubmit.bind(this), true);
		formEle.addEventListener('reset', _onFormReset.bind(this), true);
		document.getElementById('deal').addEventListener('click', _onDealClick.bind(this), true);
		
	},
	
	/**
	 * @name POKER.View~_playHand
	 * @function
	 * @description Creates a hand class out of the hand input value and updates views based on the result.
	 */
	_playHand = function() {
		var hand = POKER.hand(this.handEle.value), error = hand.getError();
		// if cards being played are valid, disable form and show score
		if (error === false) {
			this.scoreEle.innerHTML = hand.getScore();
			this.handEle.disabled = true;
			this.submitEle.disabled = true;
			this.yourScore.style.display = 'block';
			this.errorEle.style.display = 'none';
		}
		// else, cards are invalid. show error message
		else {
			this.errorEle.innerHTML = error;
			this.errorEle.style.display = 'block';
		}
	},

	/**
	 * @name POKER.View~_onDealClick
	 * @function
	 * @description Asks for a new deal from the controller, and attempts to play dealt cards. 
	 */
	_onDealClick = function() {
		this.handEle.value = POKER.deal();
		_playHand.call(this);
	},
	
	/**
	 * @name POKER.View~_onFormSubmit
	 * @function
	 * @description If a user enters cards manually and hits submit, prevent the default submission and play cards.
	 * @param {event} e The form submit event
	 */
	_onFormSubmit = function(e) {
		e.preventDefault();
		_playHand.call(this);
	},
	
	/**
	 * @name POKER.View~_onFormReset
	 * @function
	 * @description After a hand is played, user must reset form; enable form elements and hide messaging. 
	 */
	_onFormReset = function() {
		this.handEle.disabled = false;
		this.submitEle.disabled = false;
		this.yourScore.style.display = 'none';
		this.errorEle.style.display = 'none';
	};
	
	return View;
	
})(POKER, window, undefined);