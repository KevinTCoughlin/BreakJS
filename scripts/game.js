// Breakout Style game written in JavaScript
// Author: Kevin Coughlin
// Created: 07/09/12

// Request Animation Frame
// As per Paul Irish's specifications 
// @ paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
	return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback, element){
				window.setTimeout(callback, 1000 / 60);
			};
})();

// Get DOM's Canvas Node named 'canvas'
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

// Player Variables
var score = 0;
var lives = 3;

// Globals r bad mmmkay
var bricks = [];
var player = new paddle();
var pongBall = new ball(canvas.width/2, canvas.height/2);
var ball_lock = false; 				// Disallow mid-game changing of ball's velocity

//  Bricks set up
var rows = 4; 						// Number of Rows of Bricks
var columns = 5; 					// Number of Columns of Bricks
var brick_height = 5;

// Audio
var paddleSound = new Audio("./sounds/BlipHighPitch.wav");
var brickSound = new Audio("./sounds/BonkLowPitch.wav");

// Breakout Brick Object
function brick(){
	this.width = 50; 				// Brick Width
	this.height = brick_height; 	// Brick height
	this.color = "#FFFFFF"; 		// Brick Color
	this.x = 0; 					// X-position
	this.y = 0;						// Y-position
	this.vx = -1;					// Velocity X
	this.vy = -1; 					// Velocity Y
	this.health = 1; 				// How many hits to remove
}

// Player paddle object
function paddle(){
	this.x = 200;
	this.y = 140; 					// Confused on this value
	this.width = 75;
	this.height = 4; 				// Confused on this value
	this.color = "#FFFFFF";
}

// Ball Object
function ball(x, y){
	this.x = x;
	this.y = y;
	this.vx = 0;
	this.vy = 0;
	this.width = 15;
	this.height = 5;
	//this.radius = 5;
	this.color = "#FFFFFF";
}

// Draw the Ball Object
function drawBall(){
	ctx.fillStyle = pongBall.color;
	ctx.fillRect(pongBall.x, pongBall.y, pongBall.width, pongBall.height);
}

// Initialize Player Paddle
var player = new paddle();

// Get Mouse position relative to canvas
function getMousePos(canvas, evt){
	var obj = canvas;
	var top = 0;
	var left = 0;
	while(obj && obj.tagName != 'BODY'){
		top += obj.offsetTop;
		left += obj.offsetLeft;
		obj = obj.offsetParent;
	}

	var mouseX = evt.clientX - left + window.pageXOffset;
	var mouseY = evt.clientY - top + window.pageYOffset;
	return {
		x: mouseX,
		y: mouseY
	};
}

// Initialize Game
function init(){
	// Populate Bricks Array on Game initialization
	populateBricks();

	// Begin Game Loop on Game Initialization
	gameLoop();
	
	// Attach mousemove event listener to canvas
	canvas.addEventListener('mousemove', function(evt){
		var mousePos = getMousePos(canvas, evt);

		// Set player x to mouse's x
		player.x = mousePos.x;	
		
		// Check bounds with canvas size, correct if outside bounds
		if(player.x >= canvas.width-player.width){
			player.x = canvas.width-player.width;
		} else if(player.x <= 0){
			player.x = 0;
		}
	});
}

// On click, begin moving ball
$('canvas').click(function(){
	if(!ball_lock){
		ball_lock = true;
		pongBall.vx = 1.75; 	// X-velocity
		pongBall.vy = 1.75; 	// Y-velocity
	}
});

// This is where the Bricks get naughty
function populateBricks(){
	// For each row
	for(var k = 0; k < rows; k++){
		// Change color for each row for breakout feel
		var rowcolor = "#FFFFFF"; // default
		if(k == 0){ rowcolor = "#FF0000" }
		else if(k == 1){ rowcolor = "#FF6600" }
		else if(k == 2){ rowcolor = "#00FF00"}
		else if(k == 3){ rowcolor = "#FFFF00" }

		// For each column
		for(var i = 0; i < columns; i++){
			// Relative width of the brick given the # of columns and width of canvas
			var relativeWidth = canvas.width / columns;

			var item = new brick();
				item.x = i*relativeWidth;
				item.y = k*item.height;
				item.color = rowcolor;

			// Width - Minus one for differentiation of bricks
			item.width = (canvas.width / columns)-1;

			// Height - Minus one for differentiation of bricks 
			item.height = item.height - 1;

			// Push brick onto bricks array
			bricks.push(item);
		}
	}
}

// Render Game
function render(){

	// Draw Bricks
	for(var i = 0; i < bricks.length; i++){
		ctx.fillStyle = bricks[i].color;
		ctx.fillRect(bricks[i].x, bricks[i].y, bricks[i].width, bricks[i].height);
	}

	// Update Score
	$('#score').html(score);

	// Update Lives
	$('#lives').html(lives);
}

// Draw Player Paddle
function drawPaddle(){
	ctx.fillStyle = "#FFFFFF"
	ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Clear Canvas for Animation
function clearCanvas(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Move Pong Ball
function moveBall(){
	pongBall.x += pongBall.vx;
	pongBall.y += pongBall.vy;
}

// Reset Ball
function resetBall(){
	pongBall.x = canvas.width/2;
	pongBall.y = canvas.height/2;
	pongBall.vx = 0;
	pongBall.vy = 0;
}

// Detect collision
function detectCollision(){
	if(pongBall.x+pongBall.width >= canvas.width || pongBall.x <= 0){
		pongBall.vx *= -1;
	}
	if(pongBall.y <= rows*brick_height){
		for(var i = 0; i < bricks.length; i++){
			if(pongBall.y <= bricks[i].y+bricks[i].height){
				if(pongBall.x >= bricks[i].x && pongBall.x <= bricks[i].x+bricks[i].width){
					brickSound.play(); 	// Play ball hit brick sound
					bricks.splice(i, 1); 	// Remove affected brick
					score += 50;			// Add 50 points to score
					pongBall.vy *= -1; 		// Reverse Y-velocity
				}
			}
		}
		// Else pong ball hit the back wall
		if(pongBall.y <= 0){
			pongBall.vy *= -1;
		}
	}
	if(pongBall.y+pongBall.height >= canvas.height){
		lives--;
		ball_lock = false;
		// Destroy Ball
		if(lives >= 0){
			resetBall();
		} else{
			// Reset Game
			score = 0;
			lives = 3;
			resetBall();
		}
	}
	if(pongBall.x >= player.x && pongBall.x <= player.x+player.width){
		if(pongBall.y+pongBall.height >= player.y){
			paddleSound.play(); // Play ball hit paddle sound
			pongBall.vy *= -1;
		}
	}
}

// Game Loop
function gameLoop(){
	moveBall();
	detectCollision();
	clearCanvas();
	render();
	drawPaddle();
	drawBall();
	requestAnimFrame(gameLoop, canvas);
}