/*jshint esversion: 6*/

PlayState = {};

const Spider1_SPEED = 150; //Standartspinne
const Spider2_SPEED = 275; //schnell,pink
const Spider3_SPEED = 350; //sehr schnell,rot-schwarz
const Spider4_SPEED = 50; //Langsam,Blau
const Spider5_SPEED = 80; //Riesig
const Spider6_SPEED = 600; //winzig
const JUMP_SPEED = 550; //Normaler Sprung
const JUMP_SPEED2 = 400; //Doppelsprung
const JUMP_SPEED_TRAMP = 700; //Abprall des Trampolins
const NUMBERS_STR = '0123456789X ';
const SPEED = 300; //Geschwindigkeit des Hero's
const GRAVITY = 1200; //Erdanziehung
const Bounce_speed = 200; //Sprung nach Tötung der Spinne

//onload:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


window.onload = function() {
  let game = new Phaser.Game(960, 600, Phaser.AUTO, 'game');
  game.state.add('play', PlayState);
  game.state.start('play', true, false, {
    level: 0 // ändern um bei lvl.. zu starten
  });
};

//init:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


PlayState.init = function(data) {
  this.game.renderer.renderSession.roundPixels = true;

  this.keys = this.game.input.keyboard.addKeys({
    left: Phaser.KeyCode.LEFT,
    right: Phaser.KeyCode.RIGHT,
    up: Phaser.KeyCode.UP
  });
  this.keys.up.onDown.add(function() {
    let didJump = this.hero.jump(true);
    if (didJump) {
      this.sfx.jump.play();
    }
  }, this);
  this.coinPickupCount = 0;
  this.hasKey = false;
  this.level = data.level;
  this.levelAll = 6; //Alle lvl müssen angegeben werden
};


//preload::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


PlayState.preload = function() {
  //json
  this.game.load.json('level:0', 'data/level00.json');
  this.game.load.json('level:1', 'data/level01.json');
  this.game.load.json('level:2', 'data/level02.json');
  this.game.load.json('level:3', 'data/level03.json');
  this.game.load.json('level:4', 'data/level04.json');
  this.game.load.json('level:5', 'data/level05.json');
  //image
  this.game.load.image('red_Heart', 'images/red Heart.png');
  this.game.load.image('black_Heart', 'images/black Heart.png');
  this.game.load.image('key', 'images/key.png');
  this.game.load.image('Leiter', 'images/Leiter.png');
  this.game.load.image('LeiterOben', 'images/LeiterOben.png');
  this.game.load.image('font:numbers', 'images/numbers.png');
  this.game.load.image('font:LEVEL', 'images/LEVEL.png');
  this.game.load.image('icon:coin', 'images/coin_icon.png');
  this.game.load.image('background', 'images/background.png');
  this.game.load.image('background2', 'images/Hintergrund2.png');
  this.game.load.image('ground', 'images/ground.png');
  this.game.load.image('grass:8x1', 'images/grass_8x1.png');
  this.game.load.image('grass:6x1', 'images/grass_6x1.png');
  this.game.load.image('grass:4x1', 'images/grass_4x1.png');
  this.game.load.image('grass:2x1', 'images/grass_2x1.png');
  this.game.load.image('grass:1x1', 'images/grass_1x1.png');
  this.game.load.image('invisible-wall', 'images/invisible_wall.png');
  this.game.load.image('trampolin:1x1', 'images/trampolin_1x1.png');
  //spritesheet
  this.game.load.spritesheet('decoration', 'images/decor.png', 42, 42);
  this.game.load.spritesheet('door', 'images/door.png', 42, 66);
  this.game.load.spritesheet('hero', 'images/hero.png', 36, 42);
  this.game.load.spritesheet('coin', 'images/coin_animated.png', 22, 22);
  this.game.load.spritesheet('spider1', 'images/spider1.png', 42, 32);
  this.game.load.spritesheet('spider2', 'images/spider2.png', 42, 32);
  this.game.load.spritesheet('spider3', 'images/spider3.png', 42, 32);
  this.game.load.spritesheet('spider4', 'images/spider4.png', 42, 32);
  this.game.load.spritesheet('spider5', 'images/spider5.png', 168, 128);
  this.game.load.spritesheet('spider6', 'images/spider6.png', 21, 16);
  this.game.load.spritesheet('icon:key', 'images/key_icon.png', 34, 30);
  //audio
  this.game.load.audio('sfx:coin', 'audio/coin.wav');
  this.game.load.audio('sfx:stomp', 'audio/stomp.wav');
  this.game.load.audio('sfx:jump', 'audio/jump.wav');
  this.game.load.audio('sfx:key', 'audio/key.wav');
  this.game.load.audio('sfx:door', 'audio/door.wav');
};


//create:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

//createHud
PlayState._createHud = function() {
  this.keyIcon = this.game.make.image(0, 19, 'icon:key');
  this.keyIcon.anchor.set(0, 0.5);
  this.coinFont = this.game.add.retroFont('font:numbers', 20, 26,
    NUMBERS_STR, 6);
  this.levelAnzeigeFont = this.game.add.retroFont('font:numbers', 20, 26,
    NUMBERS_STR, 6);
  this.levelAnzeigeImg = this.game.make.image(800, 0, 'font:LEVEL');
  let coinIcon = this.game.make.image(this.keyIcon.width + 7, 0, 'icon:coin');
  let levelNumberImg = this.game.make.image(
    this.levelAnzeigeImg.x + this.levelAnzeigeImg.width,
    this.levelAnzeigeImg.height / 2, this.levelAnzeigeFont);
  let coinScoreImg = this.game.make.image(coinIcon.x + coinIcon.width,
    coinIcon.height / 2, this.coinFont);
  coinScoreImg.anchor.set(0, 0.5);
  levelNumberImg.anchor.set(0, 0.5);
  this.hud = this.game.add.group();
  this.hud.add(coinIcon);
  this.hud.position.set(10, 10);
  this.hud.add(coinScoreImg);
  this.hud.add(levelNumberImg);
  this.hud.add(this.keyIcon);
  this.hud.add(this.levelAnzeigeImg);
  this.black_HeartIcon0 = this.game.make.image(0, 60, 'black_Heart');
  this.black_HeartIcon1 = this.game.make.image(31, 60, 'black_Heart');
  this.black_HeartIcon2 = this.game.make.image(62, 60, 'black_Heart');
  this.black_HeartIcon0.anchor.set(0, 0.5);
  this.black_HeartIcon1.anchor.set(0, 0.5);
  this.black_HeartIcon2.anchor.set(0, 0.5);
  this.hud.add(this.black_HeartIcon0);
  this.hud.add(this.black_HeartIcon1);
  this.hud.add(this.black_HeartIcon2);
  this.black_HeartIcon0.scale.setTo(0.275, 0.275);
  this.black_HeartIcon1.scale.setTo(0.275, 0.275);
  this.black_HeartIcon2.scale.setTo(0.275, 0.275);
  this.red_HeartIcon0 = this.game.make.image(0, 60, 'red_Heart');
  this.red_HeartIcon1 = this.game.make.image(31, 60, 'red_Heart');
  this.red_HeartIcon2 = this.game.make.image(62, 60, 'red_Heart');
  this.red_HeartIcon0.anchor.set(0, 0.5);
  this.red_HeartIcon1.anchor.set(0, 0.5);
  this.red_HeartIcon2.anchor.set(0, 0.5);
  this.hud.add(this.red_HeartIcon0);
  this.hud.add(this.red_HeartIcon1);
  this.hud.add(this.red_HeartIcon2);
  this.red_HeartIcon0.scale.setTo(0.275, 0.275);
  this.red_HeartIcon1.scale.setTo(0.275, 0.275);
  this.red_HeartIcon2.scale.setTo(0.275, 0.275);
};

//create
PlayState.create = function() {
  this.sfx = {
    key: this.game.add.audio('sfx:key'),
    door: this.game.add.audio('sfx:door'),
    jump: this.game.add.audio('sfx:jump'),
    coin: this.game.add.audio('sfx:coin'),
    stomp: this.game.add.audio('sfx:stomp')
  };
  this.game.add.image(0, 0, 'background');
  this._loadLevel(this.game.cache.getJSON(`level:${this.level}`));
  this._createHud();
  this.levelAnzeigeFont.text = `${this.level+1}`;
};


//Update:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


PlayState.update = function() {
  this._handleCollisions();
  this._handleInput();
  this.coinFont.text = `x${this.coinPickupCount}`;
  this.keyIcon.frame = this.hasKey ? 1 : 0;
};


//Load level:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::


PlayState._loadLevel = function(data) {
  this.bgDecoration = this.game.add.group();
  this.platforms = this.game.add.group();
  this.trampolin = this.game.add.group();
  this.coins = this.game.add.group();
  this.spider1 = this.game.add.group();
  this.spider2 = this.game.add.group();
  this.spider3 = this.game.add.group();
  this.spider4 = this.game.add.group();
  this.spider5 = this.game.add.group();
  this.spider6 = this.game.add.group();
  this.enemyWalls = this.game.add.group();
  this.enemyWalls.visible = false;
  data.platforms.forEach(this._spawnPlatform, this);
  this._spawnCharacters({
    hero: data.hero,
    spider1: data.spider1,
    spider2: data.spider2,
    spider3: data.spider3,
    spider4: data.spider4,
    spider5: data.spider5,
    spider6: data.spider6

  });
  data.decoration.forEach(function(deco) {
    this.bgDecoration.add(
      this.game.add.image(deco.x, deco.y, 'decoration', deco.frame));
  }, this);
  data.coins.forEach(this._spawnCoin, this);
  data.trampolin.forEach(this._spawnTrampolin, this);
  this.hasAllCoins = data.coins.length * 10;
  this._spawnDoor(data.door.x, data.door.y);
  this._spawnKey(data.key.x, data.key.y);
  this.game.physics.arcade.gravity.y = GRAVITY;
};


//Handle:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

//handleInput
PlayState._handleInput = function() {
  if (this.keys.left.isDown) {
    this.hero.move(-1);
  } else if (this.keys.right.isDown) {
    this.hero.move(1);
  } else {
    this.hero.move(0);
    this.keys = this.game.input.keyboard.addKeys({
      left: Phaser.KeyCode.LEFT,
      right: Phaser.KeyCode.RIGHT,
      up: Phaser.KeyCode.UP
    });
  }
};

//HandleCollisions
PlayState._handleCollisions = function() {
  this.game.physics.arcade.collide(this.spider1, this.platforms);
  this.game.physics.arcade.collide(this.spider1, this.enemyWalls);
  this.game.physics.arcade.collide(this.spider2, this.platforms);
  this.game.physics.arcade.collide(this.spider2, this.enemyWalls);
  this.game.physics.arcade.collide(this.spider3, this.platforms);
  this.game.physics.arcade.collide(this.spider3, this.enemyWalls);
  this.game.physics.arcade.collide(this.spider4, this.platforms);
  this.game.physics.arcade.collide(this.spider4, this.enemyWalls);
  this.game.physics.arcade.collide(this.spider5, this.platforms);
  this.game.physics.arcade.collide(this.spider5, this.enemyWalls);
  this.game.physics.arcade.collide(this.spider6, this.platforms);
  this.game.physics.arcade.collide(this.spider6, this.enemyWalls);
  this.game.physics.arcade.collide(this.hero, this.platforms);
  this.game.physics.arcade.overlap(this.hero, this.trampolin, this._onHeroVsTrampolin,
    null, this);
  this.game.physics.arcade.overlap(this.hero, this.coins, this._onHeroVsCoin,
    null, this);
  this.game.physics.arcade.overlap(this.hero, this.spider1, this._onHeroVsSpider,
    null, this);
  this.game.physics.arcade.overlap(this.hero, this.spider2, this._onHeroVsSpider,
    null, this);
  this.game.physics.arcade.overlap(this.hero, this.spider3, this._onHeroVsSpider,
    null, this);
  this.game.physics.arcade.overlap(this.hero, this.spider4, this._onHeroVsSpider,
    null, this);
  this.game.physics.arcade.overlap(this.hero, this.spider5, this._onHeroVsSpider,
    null, this);
  this.game.physics.arcade.overlap(this.hero, this.spider6, this._onHeroVsSpider,
    null, this);
  this.game.physics.arcade.overlap(this.hero, this.key, this._onHeroVsKey,
    null, this);
  this.game.physics.arcade.overlap(this.hero, this.door, this._onHeroVsDoor,
    null, this);
};


//on...Vs...:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
var lastLifeLoss = 0;

//OnHeroVsSpider
PlayState._onHeroVsSpider = function(hero, spider) {
  this.sfx.stomp.play();
  //Zeit
  var d = new Date();
  var n = d.getTime();
  if (hero.body.velocity.y > 0) {
    spider.die();
    this.coinPickupCount = this.coinPickupCount + 20;
    hero.bounce();
  } else if (n > lastLifeLoss + 2000) {
    lastLifeLoss = n;
    hero.leben = hero.leben - 1;
    console.log(hero.leben);
    if (hero.leben == 0) {
      this.red_HeartIcon0.destroy();
      hero.animations.play('invinsible');
      this.game.state.restart(true, false, {
        level: this.level
      });
    } else if (hero.leben == 2) {
      this.red_HeartIcon2.destroy();
    } else if (hero.leben == 1) {
      this.red_HeartIcon1.destroy();
    }
  }
};

//OnHeroVsCoin
PlayState._onHeroVsCoin = function(hero, coin) {
  hero.canAnimate = false;
  this.sfx.coin.play();
  coin.kill();
  this.coinPickupCount = this.coinPickupCount + 10;
};

PlayState._onHeroVsTrampolin = function(hero, trampolin) {
  hero.canAnimate = false;
  hero.jump(false);
};

//OnHeroVsKey
PlayState._onHeroVsKey = function(hero, key) {
  hero.canAnimate = false;
  this.sfx.key.play();
  key.kill();
  this.hasKey = true;
};

//OnHeroVsDoor
PlayState._onHeroVsDoor = function(hero, door) {

  if (this.coinPickupCount >= this.hasAllCoins && this.hasKey) {
    hero.canAnimate = false;
    door.frame = 1;
    this.sfx.door.play();
    hero.freeze();
    this.game.add.tween(hero)
      .to({
        x: this.door.x,
        alpha: 0
      }, 500, null, true)
      .onComplete.addOnce(this._goToNextLevel, this);
  }
};

PlayState._goToNextLevel = function() {
  this.camera.fade('#000000');
  this.camera.onFadeComplete.addOnce(function() {
    var nextlevel = this.level + 1;
    if (nextlevel >= this.levelAll) {
      nextlevel = 0;
    }
    this.game.state.restart(true, false, {
      level: nextlevel
    });
  }, this);
};

//spawn irgendwas::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

//spawnCharacters
PlayState._spawnCharacters = function(data) {
  this.hero = new Hero(this.game, data.hero.x, data.hero.y, this.sfx.stomp);
  data.spider1.forEach(function(spider1) {
    let sprite = new Spider(this.game, spider1.x, spider1.y, 'spider1', Spider1_SPEED);
    this.spider1.add(sprite);
  }, this);
  data.spider2.forEach(function(spider2) {
    let sprite = new Spider(this.game, spider2.x, spider2.y, 'spider2', Spider2_SPEED);
    this.spider2.add(sprite);
  }, this);
  data.spider3.forEach(function(spider3) {
    let sprite = new Spider(this.game, spider3.x, spider3.y, 'spider3', Spider3_SPEED);
    this.spider3.add(sprite);
  }, this);
  data.spider4.forEach(function(spider4) {
    let sprite = new Spider(this.game, spider4.x, spider4.y, 'spider4', Spider4_SPEED);
    this.spider4.add(sprite);
  }, this);
  data.spider5.forEach(function(spider5) {
    let sprite = new Spider(this.game, spider5.x, spider5.y, 'spider5', Spider5_SPEED);
    this.spider5.add(sprite);
  }, this);
  data.spider6.forEach(function(spider6) {
    let sprite = new Spider(this.game, spider6.x, spider6.y, 'spider6', Spider6_SPEED);
    this.spider6.add(sprite);
  }, this);
  this.game.add.existing(this.hero);
};

//spawnCoin
PlayState._spawnCoin = function(coin) {
  let sprite = this.coins.create(coin.x, coin.y, 'coin');
  sprite.anchor.set(0.5, 0.5);
  sprite.animations.add('rotate', [0, 1, 2, 1], 6, true);
  sprite.animations.play('rotate');
  this.game.physics.enable(sprite);
  sprite.body.allowGravity = false;
};

//SpawnPlatform
PlayState._spawnPlatform = function(platform) {
  let sprite = this.platforms.create(
    platform.x, platform.y, platform.image);

  this.game.physics.enable(sprite);
  sprite.body.allowGravity = false;
  sprite.body.immovable = true;
  this._spawnEnemyWall(platform.x, platform.y, 'left');
  this._spawnEnemyWall(platform.x + sprite.width, platform.y, 'right');
};

//spawnEnemyWall
PlayState._spawnEnemyWall = function(platformX, platformY, direction) {
  let sprite = this.enemyWalls.create(platformX, platformY, 'invisible-wall');
  sprite.anchor.set(direction === 'left' ? 1 : 0, 1);
  this.game.physics.enable(sprite);
  sprite.body.immovable = true;
  sprite.body.allowGravity = false;
};

//spawnDoor
PlayState._spawnDoor = function(x, y) {
  this.door = this.bgDecoration.create(x, y, 'door');
  this.door.anchor.setTo(0.5, 1);
  this.game.physics.enable(this.door);
  this.door.body.allowGravity = false;
};

//spawnKey
PlayState._spawnKey = function(x, y) {
  this.key = this.bgDecoration.create(x, y, 'key');
  this.key.anchor.set(0.5, 0.5);
  this.game.physics.enable(this.key);
  this.key.body.allowGravity = false;
  this.key.y -= 3;
  this.game.add.tween(this.key)
    .to({
      y: this.key.y + 6
    }, 800, Phaser.Easing.Sinusoidal.InOut)
    .yoyo(true)
    .loop()
    .start();
};

//spawntrampolin
PlayState._spawnTrampolin = function(trampolin) {
  let sprite = this.trampolin.create(
    trampolin.x, trampolin.y, trampolin.image);
  this.game.physics.enable(sprite);
  sprite.body.allowGravity = false;
  sprite.body.immovable = true;
};

//Funktionen:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

//Hero
function Hero(game, x, y, touchDownSound) {
  Phaser.Sprite.call(this, game, x, y, 'hero');
  this.anchor.set(0.5, 0.5);
  this.game.physics.enable(this);
  this.body.collideWorldBounds = true;
  this.touchDownSound = touchDownSound;
  this.kannDoppelSprung = false;
  this.animations.add('stop', [0]);
  this.animations.add('run', [1, 2], 8, true);
  this.animations.add('jump', [3]);
  this.animations.add('fall', [4]);
  this.animations.add('invinsible', [0, 6, 0, 7, ], 30, true);
}

Hero.prototype = Object.create(Phaser.Sprite.prototype);
Hero.prototype.constructor = Hero;
Hero.prototype.leben = 3;

Hero.prototype.move = function(direction) {
  this.canAnimate = true;
  this.body.velocity.x = direction * SPEED;
  if (this.body.velocity.x < 0) {
    this.scale.x = -1;
  } else if (this.body.velocity.x > 0) {
    this.scale.x = 1;
  }
};

Hero.prototype._getAnimationName = function() {
  let name = 'stop';
  var d = new Date();
  var n = d.getTime();
  if (n < lastLifeLoss + 2000) {
    name = 'invinsible';
  } else if (this.body.velocity.y < 0) {
    name = 'jump';
  } else if (this.body.velocity.y >= 0 && !this.body.touching.down) {
    name = 'fall';
  } else if (this.body.velocity.x !== 0 && this.body.touching.down) {
    name = 'run';
  }

  return name;
};

Hero.prototype.jump = function(Boden) {

  let canJump = this.body.touching.down;
  if (canJump && this.kannDoppelSprung) {
    this.kannDoppelSprung = false;
  }

  if (!Boden) {
    this.body.velocity.y = -JUMP_SPEED_TRAMP;
  } else if (canJump) {
    this.body.velocity.y = -JUMP_SPEED;
    this.kannDoppelSprung = true;
  } else if (this.kannDoppelSprung) {
    this.body.velocity.y = -JUMP_SPEED2;
    this.kannDoppelSprung = false;
  }

  return canJump;
};

Hero.prototype.bounce = function() {
  this.kannDoppelSprung = true;
  this.body.velocity.y = -Bounce_speed;
};

Hero.prototype.update = function() {
  if (this.body.touching.down && this.kannDoppelSprung) {
    this.touchDownSound.play();
    this.kannDoppelSprung = false;
  }
  let animationName = this._getAnimationName();
  if (this.animations.name !== animationName) {
    if (this.canAnimate) {
      this.animations.play(animationName);
    }
  }
};

Hero.prototype.freeze = function() {
  this.body.enable = false;
  this.isFrozen = true;
};


//Spider
function Spider(game, x, y, bild, geschwindigkeit) {
  Phaser.Sprite.call(this, game, x, y, bild);
  this.geschwindigkeit = geschwindigkeit;

  this.anchor.set(0.5);

  this.animations.add('crawl', [0, 1, 2], 8, true);
  this.animations.add('die', [0, 4, 0, 4, 0, 4, 0, 4, 0, 4, 0, 4, 0, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], 12);
  this.animations.play('crawl');

  this.game.physics.enable(this);
  this.body.collideWorldBounds = true;
  this.body.velocity.x = this.geschwindigkeit;
}

Spider.prototype = Object.create(Phaser.Sprite.prototype);
Spider.prototype.constructor = Spider;
Spider.prototype.die = function() {
  this.body.enable = false;

  this.animations.play('die').onComplete.addOnce(function() {
    this.kill();
  }, this);
};


Spider.prototype.update = function() {
  if (this.body.touching.right || this.body.blocked.right) {
    this.body.velocity.x = -this.geschwindigkeit;
  } else if (this.body.touching.left || this.body.blocked.left) {
    this.body.velocity.x = this.geschwindigkeit;
  }
};
