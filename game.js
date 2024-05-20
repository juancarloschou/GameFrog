// Define global variables
let canvas, ctx;
let frogImg, logImg, splashImg;
let frog, logs;
let score = 0;
let startinglives = 3;
let lives = startinglives;
let gameStarted = false;
let yupiSnd, splashSnd, gameOverSnd;
const splashTime = 2500;


// Function to start the game
function startGame() {
	if (!gameStarted) 
	{
		console.log("startGame");

		gameStarted = true;
		// Disable the startButton
		document.getElementById("startButton").disabled = true;

		// Get the canvas element and its context
		canvas = document.getElementById("gameCanvas");
		ctx = canvas.getContext("2d");

		// Initialize frog
		frog = initializeFrog(frogImg);

		// Initialize logs
		logs = initializeLogs(logImg);

		// Start the game loop
		gameLoop();
	}
	else
	{
		if(lives <= 0)
		{
			console.log("startGame restart");
			
			// Initialize frog
			frog = initializeFrog(frogImg);

			// Initialize logs
			logs = initializeLogs(logImg);
			
			lives = startinglives;
			score = 0;
		}
	}
}

function initializeFrog() {
    return {
        x: canvas.width / 2 - 67, // Half of frog width
        y: canvas.height - 134,   // Bottom of canvas
        width: 134,
        height: 134,
        image: frogImg,
		isJumping: false,
		alive: true,
		goalUp: true,
		log: null // id of the log over the frog is
    };
}

function initializeLogs() {
    const logs = [];
    const logWidth = 215;
    const logHeight = 215;
    const logMarginX = 200; // Separation between columns
    const logMarginY = 0; // Separation between rows in the first row
    const numRows = Math.floor((canvas.height - 134) / (logHeight + logMarginY)); // Number of rows to fit logs
	const numCols = Math.ceil(canvas.width / (logWidth + logMarginX)); // Maximum number of columns
    //const offsetColX = -3000; // Starting x position for the first log column
    const offsetRowY = 134+18; // starting postion y

    // Loop through each row and column to place logs
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) 
		{
            // Determine direction based on row
            const direction = row % 2 === 0 ? -1 : 1; // Left or right direction for logs in even or odd rows

			const offsetColX = direction === -1 ? canvas.width : -logWidth;

            const logX = offsetColX + col * (logWidth + logMarginX); // Calculate log's x position
            let logY = offsetRowY + row * (logHeight + logMarginY); // Calculate log's y position
			
			const speedLog = direction === -1 ? 3 : 2; // first row speed 2, second speed 3

            // Create logs
            logs.push({ x: logX, y: logY, width: logWidth, height: logHeight, image: logImg, direction: direction, speed: speedLog });
        }
    }
    console.log("logs number: ", logs.length);
    return logs;
}

// Function to draw the background
function drawBackground() {
    // Ground
    ctx.fillStyle = "#9B5523"; // Brown light color
    ctx.fillRect(0, 0, canvas.width, 134);
    // Water
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 134, canvas.width, canvas.height - 134);
    // Ground
    ctx.fillStyle = "#8B4513"; // Brown color
    ctx.fillRect(0, canvas.height - 134, canvas.width, 134);
}

// Function to handle keydown events
function handleKeyDown(event) {
    const speedFrog = 10; // Speed of frog movement
    const jumpDistance = 215 - 15; // Distance for frog to jump (log height + margin)

    // Check if frog is currently jumping
    if (frog.isJumping || lives <= 0 || !frog.alive) {
        return; // Ignore key presses during jumping
    }

    // Get the key code of the pressed key
    const key = event.keyCode;

    // Move frog left (arrow left key)
    if (key === 37) {
        frog.x = Math.max(frog.x - speedFrog, 0); // Move frog left, but ensure it doesn't go beyond canvas left edge
    }
    // Move frog right (arrow right key)
    else if (key === 39) {
        frog.x = Math.min(frog.x + speedFrog, canvas.width - frog.width); // Move frog right, but ensure it doesn't go beyond canvas right edge
    }
    // Jump frog up (arrow up key)
    else if (key === 38) {
		console.log("jump up");
        // Check if frog can jump up
        if (frog.y > 134) {
			frog.jumpUp = true; // Set jumpUp to true for jumping up
            frog.isJumping = true; // Set frog to be jumping
            frog.jumpTargetY = frog.y - jumpDistance; // Calculate jump target position
			frog.log = null;
        }
    }
    // Jump frog down (arrow down key)
    else if (key === 40) {
		console.log("jump down");
        // Check if frog can jump down
        if (frog.y + frog.height < canvas.height - 134) {
			frog.jumpUp = false; // Set jumpUp to false for jumping down
            frog.isJumping = true; // Set frog to be jumping
            frog.jumpTargetY = frog.y + jumpDistance; // Calculate jump target position
			frog.log = null;
        }
    }
}

// Add event listener for keydown events
document.addEventListener("keydown", handleKeyDown);


// Function to update game state
function update() {
	// Update frog position, logs position, and check for collisions
	
	// update frog if jumping
	updateFrog();
	
	// update splash if frog drown
	updateSplash();

	// move logs by current river
	updateLogs();
	
	// check splash of frog by log movement and frog horizonal movement
	checkDeath();
}

function updateFrog()
{
    const speedJumpFrog = 5; // Speed of frog jump
	
	if (frog.isJumping) 
	{
		if(frog.jumpUp)
		{
			//console.log("updateFrog: y, jumpTargetY ", frog.y, frog.jumpTargetY);
			// Move frog towards jump target position (UP)
			if (frog.y > frog.jumpTargetY) 
			{
				// Jumping up
				frog.y = frog.y - speedJumpFrog;
				//console.log("updateFrog: y ", frog.y);
			}
			else 
			{
				console.log("updateFrog jump up finish, y ", frog.y);
				frog.isJumping = false; // Reset jumping flag when jump is complete
				frog.y = frog.jumpTargetY;
				checkGoalsOrDeath();
			}
		}
		else
		{
			// Move frog towards jump target position (DOWN)
			if (frog.y < frog.jumpTargetY) 
			{
				// Jumping up
				frog.y = frog.y + speedJumpFrog;
			}
			else 
			{
				console.log("updateFrog jump down finish, y ", frog.y);
				frog.isJumping = false; // Reset jumping flag when jump is complete
				frog.y = frog.jumpTargetY;
				checkGoalsOrDeath();
			}
		}	
	}
	else 
	{
		// frog not jumping, not splash and over a log
		if (frog.alive && frog.log !== null && lives > 0)
		{
			// move frog with the log speed in the same direction
			const speedMoveFrog = logs[frog.log].speed;
			const directionMoveFrog = logs[frog.log].direction;
			frog.x = frog.x + directionMoveFrog * speedMoveFrog;
			if (frog.x < 0)
			{
				frog.x = 0;
			}
			else if (frog.x + frog.width > canvas.width)
			{
				frog.x = canvas.width - frog.width;
			}
		}
	}
}

// check after jumping
function checkGoalsOrDeath()
{
	// check alive or death
	if (frog.y == 200 || frog.y == 400)
	{
		//water, check if is over a log
		const logIndex = isFrogOnLog();
		if (logIndex === null)
		{
			frog.alive = false; // draw splash
			// Set frog.splashTime to the current time plus 1 second
			frog.splashTime = Date.now() + splashTime; // 1000 milliseconds = 1 second
			playSoundEffectSplash();
		}
		else {
			frog.log = logIndex;
		}
	}
	else
	{
		frog.log = null;
	}
	
	if (frog.alive)
	{
		//console.log("check goal ", goalUp);
		// if alive, check goals
		if (frog.goalUp)
		{
			if (frog.y === 0)
			{
				playSoundEffectYupi();
				score++;
				frog.goalUp = false;
			}
		}
		else
		{
			if (frog.y === 600)
			{
				playSoundEffectYupi();
				score++;
				frog.goalUp = true;
			}
		}
	}
}

// check all the time
function checkDeath()
{
	// only if not splash and not game over
	if(frog.alive && lives > 0)
	{
		// water
		if (frog.y == 200 || frog.y == 400)
		{
			// check if is over a log
			const logIndex = isFrogOnLog();
			if (logIndex === null)
			{
				frog.alive = false; // draw splash
				// Set frog.splashTime to the current time plus 1 second
				frog.splashTime = Date.now() + splashTime; // 1000 milliseconds = 1 second
				playSoundEffectSplash();
			}
			else {
				frog.log = logIndex;
			}

		}
		else
		{
			// ground
			frog.log = null;
		}
	}
	else
	{
		// death
		frog.log = null;
	}
}

function isFrogOnLog() {
    // Check if frog is on a log
    for (let i = 0; i < logs.length; i++) {
        const log = logs[i];
        // Check if frog's bounding box overlaps with log's bounding box
        if (frog.x < log.x + log.width &&
            frog.x + frog.width > log.x &&
            frog.y < log.y + log.height &&
            frog.y + frog.height > log.y) 
		{
            return i; // Return index of the log
        }
    }
    return null; // Frog is not on any log
}

function updateLogs()
{
    //const speedLog = 2; // Speed of logs

    // Update logs position based on their direction
    logs.forEach(log => {
        // Move logs horizontally based on direction
        log.x += log.direction === 1 ? log.speed : -log.speed;

        // Reset logs position when they go out of bounds
        if (log.direction === 1 && log.x > canvas.width) {
            log.x = -log.width; // Move logs to the left side of canvas
        } else if (log.direction === -1 && log.x + log.width < 0) {
            log.x = canvas.width; // Move logs to the right side of canvas
        }
    });

    // Check if any part of the log is still on-screen
    const isAnyPartOfLogOnScreen = logs.some(log => log.x < canvas.width && log.x + log.width > 0);

    // If no part of any log is on-screen, reset their positions
    if (!isAnyPartOfLogOnScreen) {
        logs.forEach(log => {
            log.x = log.direction === 1 ? -log.width : canvas.width;
        });
    }
}

function updateSplash()
{
	if (!frog.alive)
	{
		// check if the time has reached frog.splashTime
		if (Date.now() >= frog.splashTime)
		{
			// kill the frog and initialize
			lives--;
			frog.alive = true;
			frog.x = canvas.width / 2 - 67; // Half of frog width
			frog.y = canvas.height - 134;   // Bottom of canvas
			frog.isJumping = false;
			frog.goalUp = true;
			if (lives <= 0 )
			{
				playSoundEffectGameOver();
			}
		}
	}
}

// Function to draw "GAME OVER" on the center of the canvas
function drawGameOver() {
    const gameOverText = "GAME OVER";
    const fontSize = 120;
    const textWidth = ctx.measureText(gameOverText).width;

    // Set font style
    ctx.fillStyle = "red";
    ctx.font = `${fontSize}px Arial Bold`;

    // Calculate text position
    const x = (canvas.width - textWidth) / 2;
    const y = canvas.height / 2 + 40;

    // Draw "GAME OVER" text
    ctx.fillText(gameOverText, x, y);
}

// Function to draw game objects
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Redraw background
    drawBackground();

    // Draw logs
    logs.forEach(log => {
        ctx.drawImage(log.image, log.x, log.y, log.width, log.height);
        //console.log("log x, y: ", log.x, log.y);
    });

    // Draw frog or splash
	if (frog.alive) {
		ctx.drawImage(frog.image, frog.x, frog.y, frog.width, frog.height);
	}
	else {
		ctx.drawImage(splashImg, frog.x, frog.y, frog.width, frog.height);
	}

    // Draw score
    document.getElementById("score").innerHTML = score;

    // Draw lives
    document.getElementById("lives").innerHTML = lives;
	
	if (lives <= 0)
	{
		// enabled startButton to play again
		document.getElementById("startButton").disabled = false;
		drawGameOver();
	}
}

// Function to handle game loop
function gameLoop() {
    //input();
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function playSoundEffectYupi() {
    // Reset the currentTime to start from the beginning
    yupiSnd.currentTime = 0;
    
    // Play the sound effect
    yupiSnd.play();
    
    // Pause the sound effect after 1.5 second
    setTimeout(function() {
        yupiSnd.pause();
    }, 1500);
}

function playSoundEffectSplash() {
    // Reset the currentTime to start from the beginning
    splashSnd.currentTime = 0;
    
    // Play the sound effect
    splashSnd.play();
    
    // Pause the sound effect after 3.5 second
    setTimeout(function() {
        splashSnd.pause();
    }, 3500);
}

function playSoundEffectGameOver() {
    // Reset the currentTime to start from the beginning
    gameOverSnd.currentTime = 0;
    
    // Play the sound effect
    gameOverSnd.play();
    
    // Pause the sound effect after 3.5 second
    setTimeout(function() {
        gameOverSnd.pause();
    }, 1500);
}



// Load images
frogImg = new Image();
frogImg.src = "img/frog.png";

logImg = new Image();
logImg.src = "img/log.png";

splashImg = new Image();
splashImg.src = "img/splash.png";

// Load sounds
yupiSnd = document.getElementById("yupi");
splashSnd = document.getElementById("splash");
gameOverSnd = document.getElementById("gameover");

// Event listener to handle start button click
document.getElementById("startButton").addEventListener("click", startGame);
