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
	    window.setTimeout(callback, 1000/60);
	};
})();



// --- The Game Object ---
function Game(canvas) {
    // --- Game Objects ---
    // Player Object
    function Player() {
	var score = 0;
	this.getScore = function() { return score; };
	this.awardPoints = function(points) { score += points; };
	var lives = 3;
	this.getLives = function() { return lives; };
	this.kill = function() { lives--; }
	this.isDead = function() { return !(lives > 0); }
    }
    // Player paddle object
    function Paddle(){
	this.width = canvas.width/6;
	this.height = 8;
	this.x = canvas.width/2-this.width/2;
	this.y = canvas.height-this.height*2;
	this.color = "#FFFFFF";
    }
    // Breakout Brick Object
    function Brick(){
	this.width = canvas.width/8; // Brick Width
	this.height = canvas.height/24; // Brick height
	this.color = "#FFFFFF"; // Brick Color
	this.x = 0;                 // X-position
	this.y = 0;                 // Y-position
	this.vx = -1;               // Velocity X
	this.vy = -1;               // Velocity Y
	this.health = 1;            // How many hits to remove
    }
    // Ball Object
    function Ball(x, y){
	this.x = x;
	this.y = y;
	this.vx = 0;
	this.vy = 0;
	this.width = 16;
	this.height = 16;
	//this.radius = 5;
	this.color = "#FFFFFF";
	this.move = function() {
	    this.x += this.vx;
	    this.y += this.vy;
	}
    }
    // --- Variables ---
    // Audio constants
    const paddleSound = new Audio("./sounds/BlipHighPitch.wav");
    const brickSound = new Audio("./sounds/BonkLowPitch.wav");
    // Game constants
    const rows = 6;
    const columns = 8;
    // Object setup
    var player = new Player();
    var paddle = new Paddle();
    var pongBall = new Ball(canvas.width/2, canvas.height/2);
    var ball_lock = false; // Disallow mid-game changing of ball's velocity
    var bricks = [];
    // Populate the bricks array
    for (var k = 0; k < 6/*rows*/; k++) {
	// Chance color for each row for breakout feel
	var rowcolor = "rgv(255," + (k/6)*255 + ",0)";
	for (var i = 0; i < 8/*columns*/; i++) {
	    // Relative width of the brick given the # of columns and width of canvas
	    var relativeWidth = canvas.width / 8;
	    var item = new Brick();
	    item.x = i*relativeWidth;
	    item.y = k*item.height;
	    item.color = rowcolor;
	    // Width - Minus one for differentiation of bricks
	    item.width = (canvas.width / 8)-1;
	    // Height - Minus one for differentiation of bricks 
	    item.height = item.height - 1;
	    // Push brick onto bricks array
	    bricks.push(item);
	}
    }
    // Drawing setup
    var palette = {
	canvas:canvas,
	ctx:canvas.getContext('2d')
    };
    // --- Game Action ---
    // Game Loop
    function update() {
	// move the ball (according to its velocity)
	pongBall.move();
	// detect the ball hitting the left/right of the playing area
	if(pongBall.x+pongBall.width >= canvas.width || 
	   pongBall.x <= 0) {
	    pongBall.vx *= -1;
	}
	// detect the ball hitting a brick / the back wall
	if(pongBall.y <= rows*bricks[0].height){
	    for(var i = 0; i < bricks.length; i++){
		if(pongBall.y <= bricks[i].y+bricks[i].height){
		    if(pongBall.x >= bricks[i].x && 
		       pongBall.x <= bricks[i].x+bricks[i].width){
			brickSound.play(); 	// Play ball hit brick sound
			bricks.splice(i, 1); 	// Remove affected brick
			player.awardPoints(50);	// Add 50 points to score
			pongBall.vy *= -1; 	// Reverse Y-velocity
		    }
		}
	    }
	    // Else pong ball hit the back wall
	    if(pongBall.y <= 0){
		pongBall.vy *= -1;
	    }
	}
	// detect the ball dropping past the player paddle
	if(pongBall.y+pongBall.height >= canvas.height){
	    player.kill();
	    ball_lock = false;
	    // Destroy Ball
	    if(!player.isDead()){
		pongBall = new Ball(canvas.width/2, canvas.height/2);
	    } else{
		// Reset Game
		window.location = "http://en.m.wikipedia.org/wiki/Failure";
		//player = new Game.Player();?
		//resetBall();?
	    }
	}
	// detect the ball hitting the paddle
	if(pongBall.x >= paddle.x && pongBall.x <= paddle.x+paddle.width){
	    if(pongBall.y+pongBall.height >= paddle.y){
		// Modify X-direction of Ball
		var ball_modifier = 1;
		// So that pongball doesn't get velocity X of Zero
		if(pongBall.x > (paddle.x+paddle.width)/2){
		    // Change ball X velocity depending on where it hits on paddle
		    ball_modifier = (pongBall.x - paddle.x)*.04;
		} else if(pongBall.x < (paddle.x+paddle.width)/2){
		    ball_modifier = -(pongBall.x - paddle.x)*.04;
		}
		paddleSound.play(); // Play ball hit paddle sound
		pongBall.vx *= ball_modifier;
		pongBall.vy *= -1;
	    }
	}
	// draw the game scene
	draw();
	// done; wait until next update
	requestAnimFrame(update, canvas);
    }
    // Drawing function
    function draw() {
	// clear the drawing surface
	palette.ctx.clearRect(0,0, canvas.width,canvas.height);
	// Draw Bricks
	for(var i = 0; i < bricks.length; i++){
	    palette.ctx.fillStyle = bricks[i].color;
	    palette.ctx.fillRect(bricks[i].x,bricks[i].y, 
				 bricks[i].width,bricks[i].height);
	}
	// Update textual data
	$('#score').html(player.getScore());
	$('#lives').html(player.getLives());
	// Draw Player Paddle
	palette.ctx.fillStyle = "#FFFFFF";
	palette.ctx.fillRect(paddle.x,paddle.y, paddle.width,paddle.height);
	// Draw the Ball Object
	palette.ctx.fillStyle = pongBall.color;
	palette.ctx.fillRect(pongBall.x,pongBall.y, pongBall.width,pongBall.height);
    }
    // --- User Input ---
    // On click
    $('canvas').click(function(){
	// begin moving ball
	if(!ball_lock){
	    ball_lock = true;
	    pongBall.vx = Math.random()*4-2; // X-velocity
	    pongBall.vy = 2; // Y-velocity
	}
    });
    // On mousemove
    canvas.addEventListener('mousemove', function(evt){
	// get the mouse position
	var mousePos = {}
	var obj = canvas;
	var top = 0, left = 0;
	while (obj && obj.tagName != 'BODY'){
		top += obj.offsetTop;
		left += obj.offsetLeft;
		obj = obj.offsetParent;
	}
	mousePos.x = evt.clientX - left + window.pageXOffset;
	mousePos.y = evt.clinetY - top + window.pageYOffset;

	// Set player x to mouse's x
	paddle.x = mousePos.x-paddle.width/2;
	
	// Check bounds with canvas size, correct if outside bounds
	if(paddle.x >= canvas.width-paddle.width){
	    paddle.x = canvas.width-paddle.width;
	} else if(paddle.x <= 0){
	    paddle.x = 0;
	}
    });
    // --- START ---
    function start() { update(); }
    start();
}


// Get DOM's Canvas Node named 'canvas'
var canvas = document.getElementById('canvas');

// Start the game
var game = new Game(canvas);
