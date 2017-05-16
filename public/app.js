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

var players = [1];

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
	'blue': {
		num: 11,
		tint: 0x5dc9d6
	},
	'yellow': {
		num: 12,
		tint: 0xcac34a
	},
	'green': {
		num: 13,
		tint: 0x87d65b
	},
	'pink': {
		num: 14,
		tint: 0xcd45ca
	}
};


function create() {
	game.physics.startSystem(Phaser.Physics.ARCADE);
	game.stage.backgroundColor = "#676a70";

	map = game.add.tilemap('map_basic');
	map.addTilesetImage("map_basic", "tiles");
	layer = map.createLayer("ground");
	map.setCollisionBetween(1,25);

	layer.resizeWorld();



	for(var i=0; i<players.length; i++) {
		players[i] = new Player((i+1) * 100, 300, Object.keys(colorHash)[i], Math.random());
		players[i].init(game);
	}

	//player = new Player(500,500, 'yellow', 3434);
	//player.init(game);
	//layer.debug = true;
	// player.color = "green";
	// game.physics.enable(player);
	// player.body.bounce.y = 0.08;
	// player.body.gravity.y = 1000;
	// player.body.collideWorldBounds = true;
	// player.body.maxVelocity.x = 500;
	// player.body.maxVelocity.y = 900;
	// player.animations.add('left', [0, 1, 2, 3], 10, true);
	// player.animations.add('right', [5, 6, 7, 8], 10, true);

	map.forEach(function(tile) {
		if(tile.index == 1) tileScoreData.total++;	
	});

	 map.setTileIndexCallback(1, function(player, tile) {
		 console.log(player.data.color);
		if(tile.dirty !== player.data.color) {
			map.putTile(colorHash[player.data.color].num,tile.x,tile.y);
			tileScoreData.score++;
			scoreText.text = "SCORE: " + tileScoreData.score;
		}
		tile.dirty = player.data.color;
		layer.dirty = true;
		return true;
	 }, this);

	 scoreText = game.add.text(16, 16, 'SCORE: 0', { fontSize: '32px', fill: '#000' });
	 cursors = game.input.keyboard.createCursorKeys();
}

function update() {
	for(var i=0; i<players.length; i++) {
		game.physics.arcade.collide(players[i].sprite, layer);
		players[i].update(game, cursors);
	}
}

function render() {
	game.debug.bodyInfo(players[0].sprite,140,100);
}
