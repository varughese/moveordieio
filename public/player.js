 /*
 TODO: MIGHT MAKE THIS A PROTOTYPE OF PHASER SPRITE LIKE SO
 Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;
*/

function Player(x, y, color, id) {
    var self = this;


    this.data = {
        x: x,
        y: y,
        color: color,
        id: id
    };

    this.input = {
        left: false,
        right: false,
        down: false,
        jump: false
    };

    this.cursor = {
        left: false,
        right: false,
        down: false, 
        jump: false,
        stop: false
    };

    this.physicsInfo = {
        RIGHTWARD_ACC: 2100,
        LEFTWARD_ACC: -2100,
        STILLNESS_ERR_BOUND: 50,
        STILLNESS_LEFT_SLOWDOWNACC: 1800,
        STILLNESS_RIGHT_SLOWDOWNACC: -1800,
        X_MAX_VELOCITY: 500,
        Y_MAX_VELOCITY: 900,
        GRAVITY: 1000,
        walljump: {
            Y_VELOCITY: 300,
            X_VELOCITY: 450
        },
        jump: {
            Y_VELOCITY: -500,
            JUMP_HOLDTIMER_MIN: 9,
            JUMP_HOLDTIMER_MAX: 12,
            ADDITIONAL_JUMP_VELOCITY: 50,
            DOWN_VELOCITY: 50
        }
    };

    var player;

    this.init = function(game) {
        self.sprite = game.add.sprite(self.data.x, self.data.y, 'dude');
        player = self.sprite;
        player.data = self.data;
        self.data.lastTimestamp = game.time.now;
        game.physics.enable(player);
        player.body.bounce.y = 0.08;
        player.tint = colorHash[self.data.color].tint;
        player.body.gravity.y = self.physicsInfo.GRAVITY;
        player.body.collideWorldBounds = true;
        player.body.maxVelocity.x = self.physicsInfo.X_MAX_VELOCITY;
        player.body.maxVelocity.y = self.physicsInfo.Y_MAX_VELOCITY;
        player.animations.add('left', [0, 1, 2, 3], 10, true);
        player.animations.add('right', [5, 6, 7, 8], 10, true);
    };

    this.jumpTimer = 0;
    this.jumpHoldTimer = 0;


}

Player.prototype.update = function(game) {
    var player = this.sprite;
    var self = this;
    var inputChanged = (
        this.cursor.left != this.input.left ||
        this.cursor.right != this.input.right ||
        this.cursor.jump != this.input.jump ||
        this.cursor.down != this.input.down
    );
    if(inputChanged) {
        if(this.data.id === socket.id) {
            this.input.x = this.sprite.x;
            this.input.y = this.sprite.y;
            this.cursor.left = this.input.left; 
            this.cursor.right = this.input.right; 
            this.cursor.jump = this.input.jump; 
            this.cursor.down = this.input.down;
            this.input.timestamp = game.time.now;
            var transport = this.input;
            setTimeout(function() {
                socket.emit('update_moves', transport);
            }, 500)
        }
    }

        player.body.acceleration.x = 0;
        if (this.cursor.left) {
                player.body.acceleration.x = self.physicsInfo.LEFTWARD_ACC;
                // player.body.velocity.x -= 1;
                player.animations.play('left');
        } else if (this.cursor.right) {
                player.body.acceleration.x = self.physicsInfo.RIGHTWARD_ACC;
                player.animations.play('right');
        } else {
            //  Stand still
            var movingLeft = player.body.velocity.x < 0;
            var still = Math.abs(player.body.velocity.x) < self.physicsInfo.STILLNESS_ERR_BOUND;
            if(!still) {
                if(movingLeft) {
                    player.body.acceleration.x = self.physicsInfo.STILLNESS_LEFT_SLOWDOWNACC;
                } else {
                    player.body.acceleration.x = self.physicsInfo.STILLNESS_RIGHT_SLOWDOWNACC;
                }
            } else {
                player.body.velocity.x = 0;
                player.body.acceleration.x = 0;
            }
            player.animations.stop();
            player.frame = 4;
        }

        if(player.body.blocked.left) {
            if(this.cursor.right) {
                player.body.velocity.y -= self.physicsInfo.walljump.Y_VELOCITY;
                player.body.velocity.x += self.physicsInfo.walljump.X_VELOCITY;
            }
        }

        if(player.body.blocked.right && this.cursor.left){
            player.body.velocity.y -= self.physicsInfo.walljump.Y_VELOCITY;
            player.body.velocity.x -= self.physicsInfo.walljump.X_VELOCITY;
        }

        //  Allow the player to jump if they are touching the ground.
        // https://gamemechanicexplorer.com/# has good tutorials
        if (this.cursor.jump) {
            if(player.body.onFloor()) {
                player.body.velocity.y = self.physicsInfo.jump.Y_VELOCITY;
                self.jumpHoldTimer = 0;
            } else {
                self.jumpHoldTimer++;
                if(self.jumpHoldTimer >= self.physicsInfo.jump.JUMP_HOLDTIMER_MIN && self.jumpHoldTimer <= self.physicsInfo.jump.JUMP_HOLDTIMER_MAX) {
                    player.body.velocity.y -= self.physicsInfo.jump.ADDITIONAL_JUMP_VELOCITY;
                }
            }
        }
        if (this.cursor.down) {
            player.body.velocity.y += self.physicsInfo.jump.DOWN_VELOCITY;
        }

    function _controlUpdate(game, cursors) {
        player.body.acceleration.x = 0;
        if (cursors.left.isDown) {
                player.body.acceleration.x = -1100;
                // player.body.velocity.x -= 1;
                player.animations.play('left');
        } else if (cursors.right.isDown) {
                player.body.acceleration.x = 1100;
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
                self.jumpHoldTimer = 0;
            } else {
                self.jumpHoldTimer++;
                if(self.jumpHoldTimer >= 9 && self.jumpHoldTimer <= 12) {
                    player.body.velocity.y -= 50;
                }
            }
        }
        if (cursors.down.isDown) {
            player.body.velocity.y += 50;
        }
    }


};