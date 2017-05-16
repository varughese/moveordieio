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
        jump: false,
        stop: false
    };

    this.cursor = {
        left: false,
        right: false,
        down: false, 
        jump: false,
        stop: false
    };

    var player;

    this.init = function(game) {
        self.sprite = game.add.sprite(self.data.x, self.data.y, 'dude');
        player = self.sprite;
        player.data = self.data;
        game.physics.enable(player);
        player.body.bounce.y = 0.08;
        player.tint = colorHash[self.data.color].tint;
        player.body.gravity.y = 1000;
        player.body.collideWorldBounds = true;
        player.body.maxVelocity.x = 500;
        player.body.maxVelocity.y = 900;
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
            socket.emit('update_moves', this.input);
        }
    }

    if(!this.cursor.stop) {
        player.body.acceleration.x = 0;
        if (this.cursor.left) {
                player.body.acceleration.x = -1100;
                // player.body.velocity.x -= 1;
                player.animations.play('left');
        } else if (this.cursor.right) {
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
            if(this.cursor.right) {
                player.body.velocity.y -= 300;
                player.body.velocity.x += 450;
            }
        }

        if(player.body.blocked.right && this.cursor.left){
            player.body.velocity.y -= 300;
            player.body.velocity.x -= 450;
        }

        //  Allow the player to jump if they are touching the ground.
        if (this.cursor.up) {
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
        if (this.cursor.down) {
            player.body.velocity.y += 50;
        }
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