///////declare variable what will be the screen of the game
var gameProperties = {
    screenWidth: 1300,/////gamewidth
    screenHeight: 600,/////screenheight

    delayToStartLevel: 3,///// 3 second delay before level begins
  };
////////declare game state variable
var states = {
  main: "main",//////main screen state
  game: "game",////entire game state

};
////////// declare variable that creates relative path to graphics from assets folder
var graphicAssets = {//////pulls graphics from assets folder so each one can be called
  ship:{URL: 'assets/blueshipsmall', name:'ship' },
  bullet:{URL:'assets/fireball2.png', name:'bullet'},

  asteroidLarge:{URL:'assets/alien.png', name:'asteroidLarge'},
  asteroidMedium:{URL:'assets/2ndalien.png', name:'asteroidMedium'},
  asteroidSmall:{URL:'assets/egg', name:'asteroidSmall'},
background:{URL:'assets/background.png', name:'background'}

};
///////// select ships starting point on x and y variables
var shipProperties = {//////physics, location, and properties of ship when shipProperties variable iss called
  startX: gameProperties.screenWidth * 0.5, ////50% on x axis
  startY: gameProperties.screenHeight * 0.5,/////50% on y axis
  ///////// set physics body everything is in phaserr
  acceleration: 300,
  drag: 150,
  maxVelocity: 300,
  angularVelocity: 200,
  startingLives: 3,///////show 5 lives
  timeToReset: 3, ///3 seconds to reset
  blinkDelay: 0.2,//////sets blink every .2 seconds
};

var bulletProperties = {//////physics of bullet when variable is called everything in phaser
  speed: 800,//velocity of bullet
  interval: 250,/////firing rate 1 round every.25 seconds
  lifespan: 2000,/// how long bullet will remain in game
  maxCount: 30,///// max amount of bullets that can appear
}

var asteroidProperties = {/////////sets physics and pieces of different asteroids when variable is called
  startingAsteroids: 4, ////asteroids that appear starting a new game
  maxAsteroids: 20, ///max asteroids that will appear
  incrementAsteroids: 2, ///after each round how many asteroids are added

  asteroidLarge:{minVelocity: 50, maxVelocity: 150, minAngularVelocity: 0, maxAngularVelocity:150, score:20, nextSize: graphicAssets.asteroidMedium.name, pieces:4},
  asteroidMedium:{minVelocity: 50, maxVelocity: 200, minAngularVelocity: 0, maxAngularVelocity:150, score:50, nextSize: graphicAssets.asteroidSmall.name, pieces:1},
  asteroidSmall:{minVelocity: 50, maxVelocity: 250, minAngularVelocity: 0, maxAngularVelocity:150, score:100},
};

var fontAssets = {
  counterFontStyle:{font: '20px Arial', fill: '#FFFFFF', align:'center'},/////creates variable for text properties
};
var gameState = function(game){////////everything that exists in the state of our game
  this.shipSprite;
  this.shipIsInvulnerable;
  //////set keys
  this.key_left;
  this.key_right;
  this.key_thrust;
  this.key_fire;

  this.bulletGroup;


  this.asteroidGroup;


  this.shipLives = shipProperties.startingLives;/////keeps track of hi=ow many lives are left
  this.tf_lives; ///// displays live3es counter


  this.tf_score; ///our text field to display score

  this.backgroundSprite;
};

///////// preload graphis into our gameState
gameState.prototype = {
////preload functions without executing them
  preload: function (){ /////////////preload from phaser : a continuous loop that runs until all our assets are loaded
    //////game.load method is used to load all external content// load.image requires 2 arguments
    game.load.image(graphicAssets.asteroidLarge.name, graphicAssets.asteroidLarge.URL);
    game.load.image(graphicAssets.asteroidMedium.name, graphicAssets.asteroidMedium.URL);
    game.load.image(graphicAssets.asteroidSmall.name, graphicAssets.asteroidSmall.URL);

    game.load.image(graphicAssets.bullet.name, graphicAssets.bullet.URL);
    game.load.image(graphicAssets.ship.name, graphicAssets.ship.URL);


    game.load.image(graphicAssets.background.name, graphicAssets.background.URL);

  },
///////////////////////////////////////////////////////////////
  init:function(){
    this.bulletInterval = 0;
    this.asteroidsCount = asteroidProperties.startingAsteroids;
    this.shipLives = shipProperties.startingLives;/////keeps track of hi=ow many lives are left
    this.score = 0; //// keep track of our score

  },

  create:function(){////////create is in phaser and is called once after loader completes
      this.initGraphics();
      this.initPhysics();
      this.initKeyboard();
      this.resetAsteroids();
    },
/////////////////////////////////////////////////////////////////////////////////
  update: function(){ /////update is a continuous loop in phaser after the create function has completed
    this.checkPlayerInput();////in this case checks keypresses
    this.checkBoundaries(this.shipSprite);/////checks if ship is off background
    this.bulletGroup.forEachExists(this.checkBoundaries, this);///wraps bullets around
    this.asteroidGroup.forEachExists(this.checkBoundaries, this);/////wraps asteroids around

    game.physics.arcade.overlap(this.bulletGroup, this.asteroidGroup, this.asteroidCollision, null, this);//////calls asteroidCollision funtion when bullet and asteroids overlap
    game.physics.arcade.overlap(this.shipSprite, this.asteroidGroup, this.asteroidCollision, null, this);////calls asteroid collision when shipsprite and asteroid group overlap

    if(!this.shipIsInvulnerable){
      game.physics.arcade.overlap(this.shipSprite, this.asteroidGroup, this.asteroidCollision, null, this);///// starts overlap invulnerability when ship restarts
    }
  },
/////////////// 3 parameters xcoord, ycoord, the image/////////////////////////////////////
  initGraphics: function(){
    this.backgroundSprite = game.add.sprite(0, 0, graphicAssets.background.name);/////background

    this.shipSprite = game.add.sprite(shipProperties.startX, shipProperties.startY, graphicAssets.ship.name);
    this.shipSprite.angle = -90;///////point ship up
    this.shipSprite.anchor.set(0.5, 0.5);///anchor ship to 50% height an width so ship rotates on correct centre point


    this.bulletGroup = game.add.group();////create bulletGroup
    this.asteroidGroup = game.add.group();///create asteroidGroup

    this.tf_lives = game.add.text(20, 10, shipProperties.startingLives, fontAssets.counterFontStyle);
    //////arguments 20/10 x and y co-ords shipProperties.startingLives is text string fontAssets.fontstyle sets style

    this.tf_score = game.add.text(gameProperties.screenWidth - 20, 10, "0", fontAssets.counterFontStyle);///add score text field on right side of screen
    this.tf_score.align = 'right'; //////move anchor text to right of screen
    this.tf_score.anchor.set(1, 0);//// move anchor text to top right block of screen


  },
////////// set function to add physics from Phaser////////////////////////////////////////
initPhysics: function(){
  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.physics.enable(this.shipSprite, Phaser.Physics.ARCADE);
  this.shipSprite.body.drag.set(shipProperties.drag);
  this.shipSprite.body.maxVelocity.set(shipProperties.maxVelocity);

  this.bulletGroup.enableBody = true;/////enable physics body
  this.bulletGroup.physicsBodyType = Phaser.Physics.ARCADE;////set to arcade physics
  this.bulletGroup.createMultiple(bulletProperties.maxCount, graphicAssets.bullet.name);////createMultiple creates multiple sprite objects and adds them to bulletgroup
  this.bulletGroup.setAll('anchor.x', 0.5);///////makes bullet come out 50%height of shipSprite
  this.bulletGroup.setAll('anchor.y', 0.5);/////makes bullet come out 50% width of shipSprite
  this.bulletGroup.setAll('lifespan', bulletProperties.lifespan);////removes bullet sprite after 2 seconds

  this.asteroidGroup.enableBody = true;//////enables physics body to asteroidGroup
  this.asteroidGroup.physicsBodyType = Phaser.Physics.ARCADE; /////assigns default physics system to use
},
////////////////////////////////////////////////////////////////////////////////////////////////
initKeyboard: function(){
  /////use phaser to call key codes
  this.key_left = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
  this.key_right = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
  this.key_thrust = game.input.keyboard.addKey(Phaser.Keyboard.UP);
  this.key_fire = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
},
/////////// add listeners for keypress//////////////////////////////////////////////////////////////////////
checkPlayerInput: function(){
  if (this.key_left.isDown){ //////set function if left key pressed
    this.shipSprite.body.angularVelocity = -shipProperties.angularVelocity;
  } else if (this.key_right.isDown)
  { this.shipSprite.body.angularVelocity = shipProperties.angularVelocity;
    } else {
      this.shipSprite.body.angularVelocity = 0;
    } if (this.key_thrust.isDown) {
      game.physics.arcade.accelerationFromRotation(this.shipSprite.rotation, shipProperties.acceleration, this.shipSprite.body.acceleration);
    } else{
      this.shipSprite.body.acceleration.set(0);
    }

    if (this.key_fire.isDown){
      this.fire();
    }
},
/////////////make game objects wrap around game world (objects reappear on other side of screen)/////////
checkBoundaries: function(sprite){/////pass argument sprite which can be any sprite in game
  if(sprite.x < 0){/////detects if anchor point goes beyond left boundary
    sprite.x = game.width; ///moves sprite to far right side of game world once anchor is detected outside boundary
  } else if (sprite.x > game.width){////detects if anchor point goes beyond right boundary
    sprite.x = 0; /////moves sprite to far left side of game world once anchor is detected outside boundary
  }
  if (sprite.y < 0){
    sprite.y = game.height;
} else if (sprite.y > game.height){
    sprite.y = 0;
  }
},

fire: function (){
  if (!this.shipSprite.alive){/////so you cant fire when dead
      return;
  }
  if (game.time.now > this.bulletInterval){   ////check if bullet interval internal clock has passed
    var bullet = this.bulletGroup.getFirstExists(false);////////retrieves an object that doesnt currently exist in our game world

    if(bullet) {   //////see if we successfully retrieved a bullet sprite from the group
      var length = this.shipSprite.width * 0.5;/////gets half the size of the ship sprite which is used to position bullet in front of ship sprite
      var x = this.shipSprite.x + (Math.cos(this.shipSprite.rotation) * length); ////calculates exact coordinates of bullet based on length and rotation of ship sprite
      var y = this.shipSprite.y + (Math.sin(this.shipSprite.rotation) * length); ////calculates exact coordinates of bullet based on length and rotation of ship sprite

      bullet.reset(x, y);  ///makes bullet sprite alive and visible
      bullet.lifespan = bulletProperties.lifespan;/////bullet sprite exists for a certain amount of time
      bullet.rotation = this.shipSprite.rotation; ////rotates our bullet sprite based on angle of ship sprite location

      game.physics.arcade.velocityFromRotation(this.shipSprite.rotation, bulletProperties.speed, bullet.body.velocity);//// calculates how fast our bullet sprite should move
      this.bulletInterval = game.time.now + bulletProperties.interval; ///// tells game when we can fire next round of bullets
    }
  }

},

createAsteroid: function(x, y, size, pieces) { ///add pieces parameter
  if (pieces === undefined) {pieces = 1; } /////if there is no argument for pieces it is defaulted to 1

  for (var i=0; i<pieces; i++) {//////if value of pieces is less than value of i the loop repeats itself //1 is added to i evertime it goes through the for loop
  var asteroid = this.asteroidGroup.create(x, y, size); ///creates new sprite and adds it to asteroidGroup
  asteroid.anchor.set(0.5, 0.5);////sets anchor for sprite
  asteroid.body.angularVelocity = game.rnd.integerInRange(asteroidProperties[size].minAngularVelocity, asteroidProperties[size].maxAngularVelocity);
  ///////////value of size is passed into createAsteroid function. This argument is  a string and is the name of the asteroid taken from graphic assets

  var randomAngle = game.math.degToRad(game.rnd.angle()); ///uses phasers random data generator to return-180to180
  var randomVelocity = game.rnd.integerInRange(asteroidProperties[size].minVelocity, asteroidProperties[size].maxVelocity);///sets asteroid random velocity

  game.physics.arcade.velocityFromRotation(randomAngle, randomVelocity, asteroid.body.velocity);
  }
},

//////create for loop that will create asteroids and position them randomly
resetAsteroids: function(){
  for(var i=0; i < this.asteroidsCount; i++){
    var side = Math.round(Math.random());//////// random number between 0 and one then round rounds it to 0 or 1
////////var that will be passed to createAsteroid function
    var x;
    var y;

    if(side){
      x = Math.round(Math.random()) * gameProperties.screenWidth;
      y = Math.random() * gameProperties.screenHeight;
    } else {
      x = Math.random() * gameProperties.screenWidth;
      y = Math.round(Math.random()) * gameProperties.screenHeight;
    }

    this.createAsteroid(x, y, graphicAssets.asteroidLarge.name);
  }
},

  asteroidCollision: function(target,asteroid){
    target.kill();
    asteroid.kill(); /////  kills both on collision

    if (target.key == graphicAssets.ship.name){ //////check if our target is the player ship
      this.destroyShip();//////if target is player ship trigger destroyship function
    }

    this.splitAsteroid(asteroid);//////split asteroid
    this.updateScore(asteroidProperties[asteroid.key].score);

    if (!this.asteroidGroup.countLiving()){ /////checks if number of living asteroids is 0
      game.time.events.add(Phaser.Timer.SECOND * gameProperties.delayToStartLevel, this.nextLevel, this);
///////starts next level after a 3 seconnd delay
    }
  },

  destroyShip: function (){
    this.shipLives --; //////////subtracts one from ship llives
    this.tf_lives.text = this.shipLives; ////adjusts number in display

    if (this.shipLives){ /////makes sure ship lives is not zero
      game.time.events.add(Phaser.Timer.SECOND * shipProperties.timeToReset, this.resetShip, this);////call reset event after timer is up
    } else {
            game.time.events.add(Phaser.Timer.SECOND * shipProperties.timeToReset, this.endGame, this);
        }
  },

  resetShip: function(){
    this.shipIsInvulnerable = true;/////////// call invulnerable function
    this.shipSprite.reset(shipProperties.startX, shipProperties.startY); ////reset ship so that it is visible and placed at starting coordinates of shipproperties
    this.shipSprite.angle = -90;////////make shipsprite face upwards

    game.time.events.add(Phaser.Timer.SECOND * shipProperties.timeToReset, this.shipReady, this); ///ship invulenerability is triggered when ship is reset
    game.time.events.repeat(Phaser.Timer.SECOND * shipProperties.blinkDelay, shipProperties.timeToReset / shipProperties.blinkDelay, this.shipBlink, this);///delay for 2 seconds
  },

  shipReady: function(){/////will be called when ship resets
    this.shipIsInvulnerable = false;
    this.shipSprite.visible = true;/////// make ure ship is visible despite delay
  },

  shipBlink: function(){
    this.shipSprite.visible = !this.shipSprite.visible;
  },

  splitAsteroid: function (asteroid){
    if (asteroidProperties[asteroid.key].nextSize){
      this.createAsteroid(asteroid.x, asteroid.y, asteroidProperties[asteroid.key].nextSize, asteroidProperties[asteroid.key].pieces);
    }
  },

  updateScore: function(score){
    this.score += score;
    this.tf_score.text = this.score; //////updates score counter after every asteroid is destroyed
  },
 nextLevel: function(){
   this.asteroidGroup.removeAll(true);///removes asteroids at end of game//they'll already be gone but keeping them there uses memory

   if (this.asteroidsCount < asteroidProperties.maxAsteroids){////
     this.asteroidsCount += asteroidProperties.incrementAsteroids; //////increments asteroids fro max
   }
   this.resetAsteroids(); ////repopulates asteroids for next level
 },

 endGame: function () {
       game.state.start(states.main);
   },

};

var mainState = function(game){
  this.tf_start;

};

mainState.prototype = {
  create: function (){

    var startInstructions = 'Click to Start -\n\nUP arrow key for thrust.\n\nLEFT and RIGHT arrow keys to turn.\n\nSPACE key to fire.';

    this.tf_start = game.add.text(game.world.centerX, game.world.centerY, startInstructions, fontAssets.counterFontStyle);
    this.tf_start.align = 'center';
    this.tf_start.anchor.set(0.5, 0.5);

    game.input.onDown.addOnce(this.startGame, this);
  },

  startGame: function () {
      game.state.start(states.game);
  },
};
//////////////////////////////////////////////////////////////////////////////////
var game = new Phaser.Game(gameProperties.screenWidth, gameProperties.screenHeight, Phaser.AUTO, 'gameDiv');
game.state.add(states.main, mainState);
game.state.add(states.game, gameState);

game.state.start(states.game);
