const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const SPRITE_WIDTH = 50;
const SPRITE_HEIGHT = 100;
const LOCAL_TICK = 30;
const PLAYER_GRAVITY = 1;
const PLAYER_MAX_SPEED = 10;
const PLAYER_SPEED_X = 5;
const PLAYER_JUMP_VELOCITY = 10;
const PLAYER_JUMP_MAXHEIGHT = 30;
const PLAYER_CANNONBALL_ROTATION_SPEED = 12;
const PLAYER_CANNONBALL_SPEED = 3 * PLAYER_MAX_SPEED;
const PLAYER_CANNONBALL_X_SLOWDOWN = 25; // percentage of current speed
const PLAYER_CANNONBALL_MAXIMUM_ATTEMPT = 2; // if the player starts cannonball animation but doesn't land it, how many more can he tries ? 0 will disable cannonball

// Informations about localtick
var tickCount = 0;

// Informations about servertick
var refreshCountProgress = 0;
var refreshCountFinal = null;

// Informations about FPS
var fpsCountProgress = 0;
var fpsCountFinal = null;

// Keep track of our socket connection
var socket;

// Sprite group for the ground
var grounds;

// Keep track of playerSprites throught their sprite
var playerSprites;

// Cache the user's sprite for performance
var mySprite;

// Jump like super mario ! (And double jumps too !)
var jumpState; // 0 = not jumping, 1 = single jumping (still pressing), 2 = single jump done (released), 3 = double jumping (still pressing),  4 = double jumping done (released)
var jumpFpsCount;

// Cannonball ! Rotate in air then cannonball !
var cannonBallState; // 0 = ok, 1 = rotating, 2 = cannonball , 3 = landed but didn't release the key
var cannonBallAttempt = 0;

function setup() {
    createCanvas(GAME_WIDTH, GAME_HEIGHT);
    background(51);
    frameRate(60);

    setInterval(onTick, 1000 / LOCAL_TICK);

    playerSprites = new Group();
    grounds = new Group();

    createWorldBounds();

    // Start a socket connection to the server
    // TODO VOLKO PROD / DEV !
    socket = io.connect('http://localhost:8080');

    // Player connected : make it appear on screen
    socket.on('player_connected', onPlayerConnected);
    socket.on('player_disconnected', onPlayerDisconnected);
    socket.on('down', refreshUiWithServerInformations);
}

function createWorldBounds() {
    var ground = createSprite(width / 2, height - 10, width, 20);
    ground.shapeColor = color(102, 51, 0);
    ground.immovable = true;

    var middleGround = createSprite(width / 2, 2 * (height / 3), width / 3, 20);
    middleGround.shapeColor = color(130, 66, 0);
    middleGround.immovable = true;

    var highGround = createSprite(width / 2, height / 3, width / 6, 20);
    highGround.shapeColor = color(180, 89, 0);
    highGround.immovable = true;

    var leftWall = createSprite(-SPRITE_WIDTH, 0, 2 * SPRITE_WIDTH, height * 2);
    leftWall.shapeColor = color(0);
    leftWall.immovable = true;

    var rightWall = createSprite(width + SPRITE_WIDTH, 0, 2 * SPRITE_WIDTH, height * 2);
    rightWall.shapeColor = color(0);
    rightWall.immovable = true;

    grounds.add(ground);
    grounds.add(middleGround);
    grounds.add(highGround);
    grounds.add(leftWall);
    grounds.add(rightWall);
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
        text(LOCAL_TICK + " uptick/s", 2, 12);
        text(refreshCountFinal + " downtick/s", 2, 24);
        text(fpsCountFinal + " FPS", 2, 36);
    }

    if (jumpFpsCount !== undefined) {
        jumpFpsCount++;
    }

    manageBoundsColisionAndGravity();

    manageKeyEvents();

    playerSprites.collide(grounds);

    drawSprites();
}


function manageBoundsColisionAndGravity() {
    if (mySprite !== undefined) {
        if (mySprite.touching.top) { // Player just smashed its face against the ceiling xD
            mySprite.velocity.y = 0;
        }

        if (mySprite.touching.bottom) {
            mySprite.velocity.y = 0.1;
            mySprite.maxSpeed = PLAYER_MAX_SPEED;
            mySprite.rotation = 0;

            // Player just landed, reset jump state
            jumpState = 0;
            jumpFpsCount = 0;
            cannonBallAttempt = 0;

            // Player smashed his cannonball !
            if (!keyIsDown(KEY.DOWN)) {
                cannonBallState = 0;
            } else {
                cannonBallState = 3;
            }
        } else {
            mySprite.addSpeed(PLAYER_GRAVITY, 90);
        }
    }
}

function manageKeyEvents() {
    if (mySprite !== undefined) {
        if (keyIsDown(KEY.UP)) {
            switch (jumpState) {
                case 0:
                    if (mySprite.touching.bottom) {
                        jumpState = 1;

                        cannonBallState = 0;   // Player didn't release its BOTTOM arrow after its cannonball and before jumping
                        cannonBallAttempt = 0; // so be kind and reset its cannonball protections
                    } else {
                        jumpState = 3; // if player is falling from a border, only one jump is allowed
                    }
                    mySprite.velocity.y = -PLAYER_JUMP_VELOCITY;
                    jumpFpsCount = 0;
                    break;

                case 1:
                    if (jumpFpsCount < PLAYER_JUMP_MAXHEIGHT) {
                        mySprite.velocity.y = -PLAYER_JUMP_VELOCITY;
                    }
                    break;

                case 3:
                    if (jumpFpsCount < PLAYER_JUMP_MAXHEIGHT) {
                        mySprite.velocity.y = -PLAYER_JUMP_VELOCITY;
                    } else {
                        jumpState = 4;
                    }
                    break;

                case 2:
                    jumpState = 3;
                    jumpFpsCount = 0;

                    mySprite.velocity.y = -PLAYER_JUMP_VELOCITY;
                    break;

                case 4:
                    // Don't do anything, player jumped twice !
                    break;
            }

            jumpFpsCount++;
        }

        if (keyWentUp(KEY.UP)) {
            if (jumpState === 1) {
                jumpState = 2;
            } else if (jumpState === 3) {
                jumpState = 4;
            }
        }

        if (keyIsDown(KEY.DOWN)) {
            switch (cannonBallState) {
                case 0:
                case 3:
                    if (!mySprite.touching.bottom && cannonBallAttempt < PLAYER_CANNONBALL_MAXIMUM_ATTEMPT) {
                        cannonBallState = 1;

                        mySprite.velocity.x = 0;
                        mySprite.velocity.y = 0;

                        mySprite.rotation += PLAYER_CANNONBALL_ROTATION_SPEED;
                    }
                    break;

                case 1:
                    mySprite.velocity.x = 0;
                    mySprite.velocity.y = 0;

                    mySprite.rotation += PLAYER_CANNONBALL_ROTATION_SPEED;

                    if (mySprite.rotation >= 360) {
                        mySprite.rotation = 0;
                        mySprite.maxSpeed = PLAYER_CANNONBALL_SPEED;
                        mySprite.velocity.y = PLAYER_CANNONBALL_SPEED;
                        cannonBallState = 2;
                    }

                    break;
            }
        }

        if (keyWentUp(KEY.DOWN)) {
            mySprite.rotation = 0;

            if (cannonBallState === 1) {
                cannonBallState = 0;
                cannonBallAttempt++;
            }
        }

        if (keyIsDown(KEY.LEFT)) {
            // Can't move while rotating for ground smash
            if (cannonBallState === 1) {
                mySprite.velocity.x = 0;
            } else if (cannonBallState === 2) { // Slowed down X axis moves during cannonball !
                mySprite.velocity.x = -(PLAYER_SPEED_X * PLAYER_CANNONBALL_X_SLOWDOWN / 100);
            } else {
                mySprite.velocity.x = -PLAYER_SPEED_X;
            }
        }

        if (keyWentUp(KEY.LEFT)) {
            mySprite.velocity.x = 0;
        }

        if (keyIsDown(KEY.RIGHT)) {
            // Can't move while rotating for ground smash
            if (cannonBallState === 1) {
                mySprite.velocity.x = 0;
            } else if (cannonBallState === 2) { // Slowed down X axis moves during cannonball !
                mySprite.velocity.x = (PLAYER_SPEED_X * PLAYER_CANNONBALL_X_SLOWDOWN / 100);
            } else {
                mySprite.velocity.x = PLAYER_SPEED_X;
            }
        }

        if (keyWentUp(KEY.RIGHT)) {
            mySprite.velocity.x = 0;
        }
    }

    return 0;
}

function onTick() {
    tickCount++;

    // Refresh informations once a second
    if (tickCount % LOCAL_TICK === 0) {
        refreshCountFinal = refreshCountProgress;
        refreshCountProgress = 0;

        fpsCountFinal = fpsCountProgress;
        fpsCountProgress = 0;
    }

    sendSpriteInformationsToServer();
}

function sendSpriteInformationsToServer() {
    if (mySprite !== undefined) {
        var playerObject = {
            id: socket.id,
            xPos: mySprite.position.x,
            yPos: mySprite.position.y,
            xVelocity: mySprite.velocity.x,
            yVelocity: mySprite.velocity.y,
            rotation: mySprite.rotation,
            maxSpeed: mySprite.maxSpeed
        };

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
                movePlayerSpriteAccordingToTheInternet(playerSprite, player);

                found = true;

                break;
            }
        }

        // Sprite not found, make it spawn !
        if (!found) {
            createPlayerSprite(player);
        }
    }
}

function movePlayerSpriteAccordingToTheInternet(playerSprite, player) {
    if (playerSprite.label !== socket.id) { // Receive other's player data immediately but allow 100ms interpolation for our sprite
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

        playerSprite.rotation = player.rotation;
        playerSprite.maxSpeed = player.maxSpeed;
        playerSprite.setVelocity(player.xVelocity, player.yVelocity);
    }
}

function createPlayerSprite(player) {
    var sprite = createSprite(player.xPos, player.yPos, SPRITE_WIDTH, SPRITE_HEIGHT);
    sprite.shapeColor = color(player.playerColor.r, player.playerColor.g, player.playerColor.b);
    sprite.velocity.x = player.xVelocity;
    sprite.velocity.y = player.yVelocity;
    sprite.label = player.id;
    sprite.maxSpeed = PLAYER_MAX_SPEED;

    // Store the sprite to use it after
    playerSprites.add(sprite);

    // Cache player own sprite for performance
    if (player.id === socket.id) {
        mySprite = sprite;
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