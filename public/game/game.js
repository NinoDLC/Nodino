const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const SPRITE_SIZE = 150;

// Keep track of our socket connection
var socket;

var bounds; // Group
var ground; // Sprite for the ground

// Keep track of playerSprites throught their sprite
var playerSprites;

// Cache the user's sprite for performance
var mySprite;

// Informations about localtick
var tickCount = 0;

// Informations about servertick
var refreshCountProgress = 0;
var refreshCountFinal = null;

// Informations about FPS
var fpsCountProgress = 0;
var fpsCountFinal = null;

function setup() {
    createCanvas(GAME_WIDTH, GAME_HEIGHT);
    background(51);
    frameRate(60);

    setInterval(onTick, 100);

    playerSprites = new Group();

    ground = createSprite(width / 2, height, width, 2);
    ground.shapeColor = color(20, 200, 20);
    ground.immovable = true;

    bounds = new Group();
    bounds.add(ground);

    // Start a socket connection to the server
    // Some day we would run this server somewhere else
    socket = io.connect('http://localhost:8080');

    // Player connected : make it appear on screen
    socket.on('player_connected', onPlayerConnected);
    socket.on('player_disconnected', onPlayerDisconnected);
    socket.on('refresh', refresh);
}

function windowResized() {
    resizeCanvas(GAME_WIDTH, GAME_HEIGHT);
    background(51);
}

function draw() {
    fpsCountProgress++;
    background(51);
    drawSprites();

    playerSprites.bounce(bounds);

    if (refreshCountFinal !== null) {
        fill(255);
        text(refreshCountFinal + "tick/s", 2, 12);
        text(fpsCountFinal + "FPS", 2, 25);
    }
}

function keyPressed() {
    if (mySprite !== undefined) {
        if (keyCode === UP_ARROW) {
            mySprite.velocity.y = -1.5;
        } else if (keyCode === DOWN_ARROW) {
            mySprite.velocity.y = 1.5;
        } else if (keyCode === LEFT_ARROW) {
            mySprite.velocity.x = -1.5;
        } else if (keyCode === RIGHT_ARROW) {
            mySprite.velocity.x = 1.5;
        }
    }

    return 0;
}

function onTick() {
    tickCount++;

    // Refresh informations once a second
    if (tickCount % 10 === 0) {
        refreshCountFinal = refreshCountProgress;
        refreshCountProgress = 0;

        fpsCountFinal = fpsCountProgress;
        fpsCountProgress = 0;
    }

    update();
}

function update() {
    if (mySprite !== undefined) {
        var playerObject = {id: socket.id, xPos: mySprite.position.x, yPos: mySprite.position.y, xVelocity: mySprite.velocity.x, yVelocity: mySprite.velocity.y};
        socket.emit('update', playerObject);
    }
}

function onPlayerConnected(playerId) {
    console.log("Player ID connected=" + playerId);
}

function onPlayerDisconnected(playerId) {
    console.log("Player ID disconnected=" + playerId);
    var playerSprite = getSpriteForPlayerId(playerId);
    if (playerSprite !== undefined) {
        playerSprite.remove();
        redraw(); // Retarded, but needed to make the canvas disappear
    }
}

// TODO VOLKO OPTIMIZE THAT
function refresh(playerList) {
    refreshCountProgress++;
    for (var i = 0; i < playerList.length; i++) {
        var player = playerList[i];

        var found = false;
        for (var j = 0; j < playerSprites.length; j++) {
            var playerSprite = playerSprites[j];
            if (playerSprite.label === player.id) {
                // We found the sprite related to the player, move it !
                playerSprite.position.x = player.xPos;
                playerSprite.position.y = player.yPos;
                playerSprite.setVelocity(player.xVelocity, player.yVelocity);

                found = true;

                break;
            }
        }

        if (!found) {
            // Sprite not found, make it spawn !
            var sprite = createSprite(player.xPos, player.yPos, SPRITE_SIZE, SPRITE_SIZE);
            sprite.shapeColor = color(player.playerColor.r, player.playerColor.g, player.playerColor.b);
            sprite.label = player.id;

            // Store the sprite to use it after
            playerSprites.add(sprite);

            // Cache player own sprite for performance
            if (player.id === socket.id) {
                mySprite = sprite;
            }
        }
    }
}

function getSpriteForPlayerId(playerId) {
    var result = undefined;

    playerSprites.some(function (playerSprite) {
        if (playerSprite.label === playerId) {
            result = playerSprite;
            return true; // breaks loop
        }
    });

    return result;
}