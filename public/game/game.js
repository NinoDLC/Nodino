const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const SPRITE_SIZE = 150;

// Keep track of our socket connection
var socket;

var bounds; // Group
var ground; // Sprite for the ground

// Keep track of playerSprites throught their sprite
var playerSprites;

function setup() {
    createCanvas(GAME_WIDTH, GAME_HEIGHT);
    background(51);
    frameRate(60);

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
    socket.on('player_moved', onPlayerMoved);
    socket.on('refresh', refresh);
}

function windowResized() {
    resizeCanvas(GAME_WIDTH, GAME_HEIGHT);
    background(51);
}

function draw() {
    background(51);
    drawSprites();

    playerSprites.bounce(bounds);
}

function keyPressed() {
    if (keyCode === UP_ARROW || keyCode === DOWN_ARROW || keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
        socket.emit("player_moved", keyCode);
        return true;
    } else {
        return false; // ???
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

function onPlayerMoved(data) {
    var playerSprite = getSpriteForPlayerId(data.id);
    if (playerSprite !== undefined) {
        playerSprite.velocity.y = 1.5;
        redraw();
    }
}

// TODO VOLKO OPTIMIZE THAT
function refresh(playerList) {
    for (var i = 0; i < playerList.length; i++) {
        var player = playerList[i];

        var found = false;
        for (var j = 0; j < playerSprites.length; j++) {
            var playerSprite = playerSprites[j];
            if (playerSprite.label === player.id) {
                // We found the sprite related to the player, move it !
                playerSprite.x = player.xPos;
                playerSprite.y = player.yPos;

                found = true;

                break;
            }
        }

        if (!found) {
            // Sprite not found, make it spawn !
            var sprite = createSprite(Math.floor(Math.min(Math.max(SPRITE_SIZE, player.xPos * GAME_WIDTH), GAME_WIDTH - SPRITE_SIZE)), SPRITE_SIZE, SPRITE_SIZE, SPRITE_SIZE);
            sprite.shapeColor = color(player.playerColor.r, player.playerColor.g, player.playerColor.b);
            sprite.label = player.id;

            // Store the sprite to use it after
            playerSprites.add(sprite);
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