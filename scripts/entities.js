var bullets = [];
function Player(x, y) {
    this.sprite = PIXI.Sprite.fromImage("assets/images/player.png");
    this.sprite.anchor.set(0.5);
    this.sprite.x = x;
    this.sprite.y = y;
    this.ticksLived = 0;
    this.speed = 1;
    this.xVel = 0;
    this.yVel = 0;
    this.drag = 0.05;
    this.damping = 5;
    this.firing = false;
    this.health = 3
    this.lastFire = 0;
    this.invincible = false;
    this.applyForce = function(x, y) {
        this.xVel += x;
        this.yVel += y || 0; //Y is optional
    }
    this.update = function(delta) {
        this.ticksLived++;
        this.xVel = shift(this.xVel, 0, this.drag * delta)
        this.yVel = shift(this.yVel, 0, this.drag * delta)
        this.xVel = Math.max(Math.min(this.xVel, TERMINAL_VELOCITY), -TERMINAL_VELOCITY)
        this.yVel = Math.max(Math.min(this.yVel, TERMINAL_VELOCITY), -TERMINAL_VELOCITY)
        //this.rotation = shift(this.rotation, 0, Math.toRadians(this.damping));
        this.sprite.x += this.xVel * delta;
        this.sprite.y += this.yVel * delta;
        if(this.getX() < 0) {
            this.sprite.x = width - 30;
        } else if(this.getX() > width) {
            this.sprite.x = 30
        }
        if(this.getY() < 0) {
            this.sprite.y = height - 30;
        } else if(this.getY() > height) {
            this.sprite.y = 30
        }
        this.sprite.rotation = this.getLookAt(mouseX, mouseY);
        if(this.firing && new Date().getTime() - this.lastFire >= 150) {
            this.fire();
            this.lastFire = new Date().getTime();
        }
        if(this.ticksLived % 20 == 0 && this.invincible) {
            this.sprite.visible = !this.sprite.visible
        }
    }

    this.damage = function(amount) {
        if(!this.invincible) {
            this.health -= amount;
            if(this.health == 0) {
                return;
            }
            console.log(healthSprites[healthSprites.length - 1]);
            application.stage.removeChild(healthSprites[healthSprites.length - 1])
            healthSprites.splice(healthSprites.length - 1, healthSprites.length)
        }
    }

    this.fire = function() {
        var forward = getForwardVector(this.sprite.rotation);
        bullets.push(new Bullet(this, forward.x * 9, forward.y * 9))
    }

    this.moveForward = function(speed) {
        var forward = getForwardVector(this.sprite.rotation);
        this.applyForce(forward.x * speed, forward.y * speed)
    }

    this.getLookAt = function(x, y) {
        var dX = x - this.getX();
        var dY = y - this.getY();
        var angle = Math.atan2(dX, -dY);// * (180 / Math.PI);
        return angle;
    }

    this.getX = function() {
        return this.sprite.x;
    }

    this.getY = function() {
        return this.sprite.y;
    }

}



function Enemy(variant, x, y, player) {
    this.sprite = PIXI.Sprite.fromImage("assets/images/enemies/" + variant + ".png")
    this.sprite.x = x;
    this.sprite.y = y;
    this.xVel = 0;
    this.yVel = 0;
    this.targetAngle = 0;
    this.turnSpeed = variant == "speeder" ? 0.5 : 0.2;
    this.speed = variant == "speeder" ? 0.8 : 0.5;
    this.maxSpeed = variant == "speeder" ? 4 : 1;
    this.health = variant == "speeder" ? 2 : 5
    this.targetX = player.getX();
    this.targetY = player.getY();
    this.sprite.anchor.set(0.5);
    application.stage.addChild(this.sprite);
    this.update = function(delta) {
        this.sprite.rotation = shift(this.sprite.rotation, this.getLookAt(this.targetX, this.targetY), this.turnSpeed);
        this.xVel = Math.max(Math.min(this.xVel, this.maxSpeed), -this.maxSpeed)
        this.yVel = Math.max(Math.min(this.yVel, this.maxSpeed), -this.maxSpeed)
        this.moveForward(this.speed);
        this.sprite.x += this.xVel;
        this.sprite.y += this.yVel;
        this.targetX = player.sprite.x;
        this.targetY = player.sprite.y;
    }
    this.moveForward = function(speed) {
        var forward = getForwardVector(this.sprite.rotation);
        this.applyForce(forward.x * speed, forward.y * speed)
    }
    this.applyForce = function(x, y) {
        this.xVel += x;
        this.yVel += y || 0; //Y is optional
    }
    this.getLookAt = function(x, y) {
        var dX = x - this.sprite.x;
        var dY = y - this.sprite.y;
        var angle = Math.atan2(dX, -dY);// * (180 / Math.PI);
        return angle;
    }

}

function Bullet(shooter, xVel, yVel) {
    this.sprite = PIXI.Sprite.fromImage("assets/images/playerBullet.png")
    this.sprite.x = shooter.sprite.x;
    this.sprite.y = shooter.sprite.y;
    this.sprite.anchor.set(0.5);
    this.sprite.rotation = shooter.sprite.rotation;
    application.stage.addChild(this.sprite);
    this.xVel = xVel;
    this.yVel = yVel;
    this.flagForKill = false;
    this.update = function() {
        this.sprite.x += this.xVel;
        this.sprite.y += this.yVel;
        if(!isOnScreen(this.sprite.x, this.sprite.y)) {
            this.flagForKill = true;
        }
    }
}
