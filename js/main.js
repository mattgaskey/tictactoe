//Re-work this with KnockoutJS to use data bindings (see cat premium knockout)

$(function() {

	var model = {
		scoreP1: 0,
		scoreP2: 0,
		playerChoice: null,
		playerTurn: null,
		gameState: []
	};

	var controller = {

		// Event handler for modal window buttons
		choosePlayer: function(letter) {
			//assign clicked letter to playerChoice
			model.playerChoice = letter;
			//modal fades out
			$("#modal").css({"opacity": "0", "z-index": "-1", "pointer-events": "none"});
			//new game button reappears
			$("#start").removeClass("hidden");
			//set playerTurn to determine who goes first
			if (letter === "X") {
				model.playerTurn = true;
			} else if (letter === "O") {
				model.playerTurn = false;
			}
			//run newGame
			this.newGame();

		},

		//prep for new game
		newGame: function() {
			//clear gameState array
			model.gameState.length = 0;
			//initialize gameState array
			model.gameState.push([null, null, null], [null, null, null], [null, null, null]);
			//reset scores
			model.scoreP1 = 0;
			model.scoreP2 = 0;
			//run gameboard init
			gameboardView.init();
		},

		getPlayerChoice: function() {
			return model.playerChoice;
		},

		getPlayerScore: function(player) {
			return model["scoreP"+player];
		},

		switchPlayerTurn: function() {
			model.playerTurn = !model.playerTurn;
		},

		setModel: function(el, val) {
			model.el = val;
		},

		//update gameState array by replacing null value with letter value in arr[row][col]
		updateGameState: function(row, col, letter) {
			var arr = model.gameState;
			arr[row].splice(col, 1, letter);
		},

		//check for gameOver
		checkGameState: function() {
			var arr = model.gameState;
			var gameOver = false;
			//use areEqual function to determine if array values are the same for rows, columns and diagonals
			if (this.areEqual(arr[0][0], arr[0][1], arr[0][2]) || this.areEqual(arr[1][0], arr[1][1], arr[1][2]) || this.areEqual(arr[2][0], arr[2][1], arr[2][2])) {
				gameOver = true;
			} else if (this.areEqual(arr[0][0], arr[1][0], arr[2][0]) || this.areEqual(arr[0][1], arr[1][1], arr[2][1]) || this.areEqual(arr[0][2], arr[1][2], arr[2][2])) {
				gameOver = true;
			} else if (this.areEqual(arr[0][0], arr[1][1], arr[2][2]) || this.areEqual(arr[0][2], arr[1][1], arr[2][0])) {
				gameOver = true;
			} else {
				gameOver = false;
			}
			return gameOver;
		},

		//check for equal values across any number of arguments
		areEqual: function (){
	  	var len = arguments.length;
	  	for (var i = 1; i < len; i++){
	      if (arguments[i] === null || arguments[i] !== arguments[i-1])
	        return false;
			  }
			  return true;
		},

		//service for completing a computer player turn
		computerTurn: function() {
			var arr = model.gameState;
			
			//function for adding computer's choice to appropriate cell
			var insert = function(x, y, el) {
				var loc = $("div[data-row="+x+"][data-col="+y+"]");
				loc.text(el).css("height", "0");
			};

			//handler function to test random cells for possible moves
			function test() {
				//generates random row and col ints
				var randRow = controller.randomNumber(0, 2);
				var randCol = controller.randomNumber(0, 2);
				//if cell is available
				if (arr[randRow][randCol] == null) {
					//check if human player is "X"
					if (model.playerChoice === "X") {
						//and insert "O"
						insert(randRow, randCol, "O");
						controller.switchPlayerTurn();
						console.log(model.playerTurn);
						//check for gameOver
						controller.updateGameState(randRow, randCol, "O");
						if (controller.checkGameState() === true) {
							setTimeout(function() {
								alert("Game Over!");
							}, 100)};
					} else {
						//insert "X"
						insert(randRow, randCol, "X");
						controller.switchPlayerTurn();
						console.log(model.playerTurn);
						//check for gameOver
						controller.updateGameState(randRow, randCol, "X");
						if (controller.checkGameState() === true) {
							setTimeout(function() {
								alert("Game Over!");
							}, 100)};
					}	
				//if cell is not available, try a new random cell
				} else {
					test();
				}
			};
			//run the test
			test();
		}, 

		//service to return random integer in a set with min and max
		randomNumber: function(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},

		init: function() {
			gameView.init();
		}
	};

	var gameboardView = {
		init: function() {
			
			//run gameboard render
			this.render();
		},

		render: function() {
			//remove CSS hidden class on table
			$("#gameboard").removeClass("hidden");
			//clear any cell text
			$(".content").text("");
			//reset clickable areas in gameboard
			$(".content").css("height", "100%");
			//retrieve scores and paint to gameboard
			$("#score-p1").text(controller.getPlayerScore(1));
			$("#score-p2").text(controller.getPlayerScore(2));
			//lookup playerChoice
			var choice = controller.getPlayerChoice();
			//if player chose 'O', computer goes first
			if (choice === "O") {
				controller.computerTurn();
			}
			//bind click events - unbind any old click events from newGame recursion
			$(".content").unbind('click').click(function() {
				//look for row and col values from clicked table cell
				var row = $(this).attr("data-row");
				var col = $(this).attr("data-col");
				//if player is 'X', 
				if (choice === "X") {
					//add X to cell and remove cell height -> unclickable
					$(this).text("X").css("height", "0");
					//update gameState array with cell location and letter
					controller.updateGameState(row, col, "X");
					//if player is 'O',
				} else if (choice === "O") {
					//add O to cell and remove cell height -> unclickable
					$(this).text("O").css("height", "0");
					//update gameState array with cell location and letter
					controller.updateGameState(row, col, "O");
				}
				controller.switchPlayerTurn();
				console.log(model.playerTurn);
				//check if player move is gameOver
				if (controller.checkGameState() === true) {
					//if gameOver, wait 100ms for text to paint, then alert message
					setTimeout(function() {
						alert("Game Over!");
					}, 100);
					//otherwise, playerTurn is over
				} else {
					controller.setModel("playerTurn", false);
					//computer goes after pause to model AI thought
					setTimeout(function() {
						controller.computerTurn();
					}, 1000);
				}
			});
		}
	};

	var gameView = {
		//ready the app
		init: function() {
			//call the render
			this.render();
		},

		render: function() {
			//bind click handler to newGame button - unbind previous click handlers from newGame recursion
			$("#start").unbind('click').click(function() {
				//clear the gameState array
				model.gameState.length = 0;
				//hide the button
				$(this).addClass("hidden");
				//render the modal window to choose letter
				chooseView.render();
			});
		}
	};

	var chooseView = {
		render: function() {
			//fade in modal
			$("#modal").css({"opacity": "1", "z-index": "9999", "pointer-events": "auto"});
			//bind event handler to player letter choice button - unbind previous handler from newGame recursion
			$("#player-x").unbind('click').click(function() {
				controller.choosePlayer("X");
			});
			$("#player-o").unbind('click').click(function() {
				controller.choosePlayer("O");
			});
		}

	};

controller.init();
});