var game = new Phaser.Game(27*62,15*62, Phaser.AUTO, '', {
	preload: preload,
	create: create,
	update: update,
	render: render
});

function preload() {
	game.load.tilemap('map_basic', 'assets/maps/map_01.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.image('tiles', 'assets/sprites/tilelistspritesheet.png');
	game.load.image('ground', 'assets/platform.png');
	game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
	game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	game.scale.pageAlignVertically = true;
	game.scale.pageAlignHorizontally = true;
}

var player;
var platforms;
var cursors;
var stars;
var score = 0;
var scoreText;
var map, layer;

function create() {
	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.stage.backgroundColor = "#676a70";

	map = game.add.tilemap('map_basic');
	map.addTilesetImage("map_basic", "tiles");
	layer = map.createLayer("ground");
	map.setCollisionBetween(1,5);

	layer.resizeWorld();

	//game.scale.setGameSize(game.world.width, game.world.height);

	player = game.add.sprite(500, 500, 'dude');
	//layer.debug = true;

	game.physics.enable(player);
	player.body.bounce.y = 0.08;
	player.body.gravity.y = 800;
	player.body.collideWorldBounds = true;

	player.animations.add('left', [0, 1, 2, 3], 10, true);
	player.animations.add('right', [5, 6, 7, 8], 10, true);

	cursors = game.input.keyboard.createCursorKeys();
}

function update() {
	game.physics.arcade.collide(player, layer);
	player.body.acceleration.x = 0;
	if (cursors.left.isDown) {
		if(player.body.velocity.x > -500) {
			player.body.acceleration.x = -1100;
			// player.body.velocity.x -= 1;
			player.animations.play('left');
		}
	} else if (cursors.right.isDown) {
		if(player.body.velocity.x < 500) {
			player.body.acceleration.x = 1100;
			// player.body.velocity.x = 500;
			player.animations.play('right');
		}
	} else {
		//  Stand still
		var movingLeft = player.body.velocity.x < 0;
		var still = Math.abs(player.body.velocity.x) < 50;
		if(!still) {
			if(movingLeft) {
				player.body.acceleration.x = 1100;
			} else {
				player.body.acceleration.x = -1100;
			}
		} else {
			player.body.velocity.x = 0;
			player.body.acceleration.x = 0;
		}
		player.animations.stop();
		player.frame = 4;
	}

	//  Allow the player to jump if they are touching the ground.
	if (cursors.up.isDown && player.body.onFloor()) {
		player.body.velocity.y = -500;
	}
	if (cursors.down.isDown) {
		player.body.velocity.y += 50;
	}
}

function render() {
	game.debug.bodyInfo(player,140,100);
}
