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

var players = {};

var platforms;
var cursors;
var stars;
var score = 0;
var scoreText;
var map, layer;
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

	var socket = io();

	socket.on("new_player", function(inplayers) {
		for(var p in inplayers) {
			if(!players[p]) {
				players[p] = new Player(inplayers[p].x, inplayers[p].y, inplayers[p].color, inplayers[p].id);
				players[p].init(game);
			}
			if(socket.id == p) {
				player = players[p];
			}
		}
		console.log('New Player(s)!', inplayers);
	});

	socket.on("lost_player", function(id) {
		console.log("LOST PLAYER! Was color", players[id].color);
		players[id].sprite.kill();
		delete players[id];
	});

	// for(var i=0; i<players.length; i++) {
	// 	players[i] = new Player((i+1) * 100, 300, Object.keys(colorHash)[i], Math.random());
	// 	players[i].init(game);
	// }

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

	 map.setTileIndexCallback([1,11,12,13,14], function(player, tile) {
 		if(tile.dirty !== player.data.color) {
			map.putTile(colorHash[player.data.color].num,tile.x,tile.y);
			socket.emit("tile jawn", {x: tile.x, y: tile.y, color: player.data.color});
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
	for(var p in players) {
		game.physics.arcade.collide(players[p].sprite, layer);
		players[p].update(game, cursors);
	}
}

function render() {
	if(player) game.debug.bodyInfo(player.sprite,140,100);
}
