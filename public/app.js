var game = new Phaser.Game(27*62,15*62, Phaser.AUTO, '', {
	preload: preload,
	create: create,
	update: update,
	render: render
});

var socket = io();

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
var map, layer, jumpTimer = 0, jumpHoldTimer = 0;
var tileScoreData = {
	total: 0,
	score: 0
};
var colorHash = {
	'blue': 11,
	'yellow': 12,
	'green': 13,
	'pink': 14
};


function create() {
	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.stage.backgroundColor = "#676a70";

	map = game.add.tilemap('map_basic');
	map.addTilesetImage("map_basic", "tiles");
	layer = map.createLayer("ground");
	map.setCollisionBetween(1,25);

	layer.resizeWorld();

	//game.scale.setGameSize(game.world.width, game.world.height);

	player = game.add.sprite(500, 500, 'dude');
	//layer.debug = true;
	player.color = "green";
	game.physics.enable(player);
	player.body.bounce.y = 0.08;
	player.body.gravity.y = 1000;
	player.body.collideWorldBounds = true;
	player.body.maxVelocity.x = 500;
	player.body.maxVelocity.y = 900;
	player.animations.add('left', [0, 1, 2, 3], 10, true);
	player.animations.add('right', [5, 6, 7, 8], 10, true);

	map.forEach(function(tile) {
		if(tile.index == 1) tileScoreData.total++;	
	});

	 map.setTileIndexCallback(1, function(player, tile) {
		if(tile.dirty !== player.color) {
			map.putTile(colorHash[player.color],tile.x,tile.y);
			tileScoreData.score++;
			scoreText.text = "SCORE: " + tileScoreData.score;
		}
		tile.dirty = player.color;
		layer.dirty = true;
		return true;
	 }, this);

	 scoreText = game.add.text(16, 16, 'SCORE: 0', { fontSize: '32px', fill: '#000' });
	 cursors = game.input.keyboard.createCursorKeys();
}

function update() {
	game.physics.arcade.collide(player, layer);
	player.body.acceleration.x = 0;
	if (cursors.left.isDown) {
			player.body.acceleration.x = -1100;
			// player.body.velocity.x -= 1;
			player.animations.play('left');
	} else if (cursors.right.isDown) {
			player.body.acceleration.x = 1100;
			// player.body.velocity.x = 500;
			player.animations.play('right');
	} else {
		//  Stand still
		var movingLeft = player.body.velocity.x < 0;
		var still = Math.abs(player.body.velocity.x) < 50;
		if(!still) {
			if(movingLeft) {
				player.body.acceleration.x = 1800;
			} else {
				player.body.acceleration.x = -1800;
			}
		} else {
			player.body.velocity.x = 0;
			player.body.acceleration.x = 0;
		}
		player.animations.stop();
		player.frame = 4;
	}

	if(player.body.blocked.left) {
		if(cursors.right.isDown) {
			player.body.velocity.y -= 300;
			player.body.velocity.x += 450;
		}
	}

	if(player.body.blocked.right && cursors.left.isDown){
		player.body.velocity.y -= 300;
		player.body.velocity.x -= 450;
	}

	//  Allow the player to jump if they are touching the ground.
	if (cursors.up.isDown) {
		if(player.body.onFloor()) {
			player.body.velocity.y = -500;
			jumpHoldTimer = 0;
		} else {
			jumpHoldTimer++;
			if(jumpHoldTimer >= 9 && jumpHoldTimer <= 12) {
				player.body.velocity.y -= 50;
			}
		}
	}
	if (cursors.down.isDown) {
		player.body.velocity.y += 50;
	}
}

function render() {
	game.debug.bodyInfo(player,140,100);
}
