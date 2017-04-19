const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const SPRITE_SIZE = 150;

// Keep track of our socket connection
var socket;

var bounds; // Sprite for the ground

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

    var ground = createSprite(width / 2, height, width, 20);
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
    socket.on('down', refreshUiWithServerInformations);
}

function windowResized() {
    resizeCanvas(GAME_WIDTH, GAME_HEIGHT);
    background(51);
}

function draw() {
    fpsCountProgress++;
    background(51);

    if (refreshCountFinal !== null) {
        fill(255);
        text(refreshCountFinal + "tick/s", 2, 12);
        text(fpsCountFinal + "FPS", 2, 25);
    }

    manageKeyEvents();

    playerSprites.collide(bounds);

    drawSprites();
}

function manageKeyEvents() {
    if (mySprite !== undefined) {
        if (keyWentDown(KEY.UP)) {
            mySprite.velocity.y = -1.5;
        }

        if (keyWentDown(KEY.DOWN)) {
            mySprite.velocity.y = 1.5;
        }

        if (keyWentDown(KEY.LEFT)) {
            mySprite.velocity.x = -1.5;
        }

        if (keyWentDown(KEY.RIGHT)) {
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

    sendInformationsToServer();
}

function sendInformationsToServer() {
    if (mySprite !== undefined) {
        var playerObject = {id: socket.id, xPos: mySprite.position.x, yPos: mySprite.position.y, xVelocity: mySprite.velocity.x, yVelocity: mySprite.velocity.y, timestamp: tickCount};

        console.log(playerObject);

        socket.emit('up', playerObject);
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

function refreshUiWithServerInformations(playerList) {
    refreshCountProgress++;

    for (var i = 0; i < playerList.length; i++) {
        var player = playerList[i];

        var found = false;
        for (var j = 0; j < playerSprites.length; j++) {
            var playerSprite = playerSprites[j];

            if (playerSprite.label === player.id) {
                // We found the sprite related to that player, move it !
                if (playerSprite.label !== socket.id || tickCount - player.timestamp > 1) { // Receive other's player data immediately but allow 100ms interpolation for our sprite
                    // X
                    if (playerSprite.velocity.x > 0) {
                        if ((playerSprite.position.x + (playerSprite.velocity.x * 10) < player.xPos // We walk to the right but the internet tells us to go even further (more than expected)
                            || playerSprite.position.x > player.xPos + (playerSprite.velocity.x * 10))) { // We walk to the right but the internet tells us we go too fast
                            playerSprite.position.x = player.xPos;
                        }
                    } else if (playerSprite.velocity.x < 0) {
                        if ((playerSprite.position.x + (playerSprite.velocity.x * 10) > player.xPos // We walk to the left but the internet tells us to go even further (more than expected)
                            || playerSprite.position.x < player.xPos + (playerSprite.velocity.x * 10))) { // We walk to the left but the internet tells us we go too fast
                            playerSprite.position.x = player.xPos;
                        }
                    } else {
                        playerSprite.position.x = player.xPos;
                    }

                    // Y
                    if (playerSprite.velocity.y < 0) {
                        if ((playerSprite.position.y + (playerSprite.velocity.y * 10) > player.yPos // We are jumping but the internet tells us to go even further (more than expected)
                            || playerSprite.position.y < player.yPos + (playerSprite.velocity.y * 10))) { // We are jumping but the internet tells us we go too fast
                            playerSprite.position.y = player.yPos;
                        }
                    } else if (playerSprite.velocity.y > 0) {
                        if ((playerSprite.position.y + (playerSprite.velocity.y * 10) < player.yPos // We are falling down but the internet tells us to go even further (more than expected)
                            || playerSprite.position.y > player.yPos + (playerSprite.velocity.y * 10))) { // We are falling down but the internet tells us we go too fast
                            playerSprite.position.y = player.yPos;
                        }
                    } else {
                        playerSprite.position.y = player.yPos;
                    }

                    playerSprite.setVelocity(player.xVelocity, player.yVelocity);
                }

                found = true;

                break;
            }
        }

        if (!found) {
            // Sprite not found, make it spawn !
            var sprite = createSprite(player.xPos, player.yPos, SPRITE_SIZE, SPRITE_SIZE);
            sprite.shapeColor = color(player.playerColor.r, player.playerColor.g, player.playerColor.b);
            sprite.velocity.x = player.xVelocity;
            sprite.velocity.y = player.yVelocity;
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
    for (var i = 0; i < playerSprites.length; i++) {
        if (playerSprites[i].label === playerId) {
            return playerSprites[i];
        }
    }

    return undefined;
}