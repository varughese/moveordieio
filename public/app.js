(function (Phaser) {

var game = new Phaser.Game(27*62,15*62, Phaser.AUTO, '', {
	preload: preload,
	create: create,
	update: update
});

function preload() {
	game.load.image('sky', 'assets/sky.png');
	game.load.image('ground', 'assets/platform.png');
	game.load.image('star', 'assets/star.png');
	game.load.spritesheet('dude', 'assets/dude.png', 32, 48);

	game.load.tilemap('map_basic', 'assets/maps/map_01.json', null, Phaser.Tilemap.TILED_JSON);
	game.load.image('tiles', 'assets/sprites/tilelistspritesheet.png');
}

var player;
var platforms;
var cursors;
var stars;
var score = 0;
var scoreText;
var map, layer;

function create() {
	//  We're going to be using physics, so enable the Arcade Physics system

	map = game.add.tilemap('map_basic');
	map.addTilesetImage("map_basic", "tiles");
	layer = map.createLayer("ground");
	layer.resizeWorld();
	layer.scale.set(0.5);
	game.physics.startSystem(Phaser.Physics.ARCADE);
	layer.resizeWorld();

	game.scale.setGameSize(game.world.width, game.world.height);
	starThings();

console.log(game.world);
}

function update() {
	//  Collide the player and the stars with the platforms
	//  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
	//  Reset the players velocity (movement)
	player.body.velocity.x = 0;
	if (cursors.left.isDown) {
		//  Move to the left
		player.body.velocity.x = -300;
		player.animations.play('left');
	} else if (cursors.right.isDown) {
		//  Move to the right
		player.body.velocity.x = 300;
		player.animations.play('right');
	} else {
		//  Stand still
		player.animations.stop();
		player.frame = 4;
	}

	//  Allow the player to jump if they are touching the ground.
	if (cursors.up.isDown && player.body.touching.down) {
		player.body.velocity.y = -350;
	}
}

function starThings() {
//  The platforms group contains the ground and the 2 ledges we can jump on
	platforms = game.add.group();
	//  We will enable physics for any object that is created in this group
	platforms.enableBody = true;
	// Here we create the ground.
	player = game.add.sprite(10, game.world.height - 150, 'dude');
	//  We need to enable physics on the player
	game.physics.arcade.enable(player);
	//  Player physics properties. Give the little guy a slight bounce.
	player.body.bounce.y = 0.08;
	player.body.gravity.y = 310;
	player.body.collideWorldBounds = true;
	//  Our two animations, walking left and right.
	player.animations.add('left', [0, 1, 2, 3], 10, true);
	player.animations.add('right', [5, 6, 7, 8], 10, true);
	//  Finally some stars to collect
	stars = game.add.group();
	//  We will enable physics for any star that is created in this group
	stars.enableBody = true;
	//  Here we'll create 12 of them evenly spaced apart
	for (var i = 0; i < 120; i++) {
		//  Create a star inside of the 'stars' group
		var star = stars.create(i * 70, 0, 'star');
		//  Let gravity do its thing
		star.body.gravity.y = 300;
		//  This just gives each star a slightly random bounce value
		star.body.bounce.y = 0.7 + Math.random() * 0.2;
	}
	//  The score
	scoreText = game.add.text(16, 16, 'SCORE: 0', {
		fontSize: '32px',
		fill: 'yellow'
	});
	//  Our controls.
	cursors = game.input.keyboard.createCursorKeys();
}

function collectStar(player, star) {

	// Removes the star from the screen
	star.kill();
	//  Add and update the score
	score += 10;
	scoreText.text = 'Score: ' + score;
}

})(Phaser);