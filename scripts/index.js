var width = window.innerWidth;
var height = window.innerHeight;
var application = new PIXI.Application(width, height, {backgroundColor : 0x000000});
const TERMINAL_VELOCITY = 5;
var scoreVal = 0;
var mouseX = 0;
var mouseY = 0;
var score = new PIXI.Text("SCORE: 0", {font: "Bold " + (width / 30) + "px Arial", fill: "white"});
var background = new PIXI.TilingSprite(PIXI.Texture.fromImage("assets/images/darkPurple.png"), width, height);
var player;
var healthSprites = [];
var enemies = [];
var noInput = true;

score.x = width / 2 - score.width / 2;
score.y = 10;

document.body.appendChild(application.view);
restart();
function restart() {
    clear();
    noInput = false;
    player = new Player(width / 2, height / 2);
    application.stage.addChild(background);
    application.stage.addChild(player.sprite);
    application.stage.addChild(score);
    for(var i = 0; i < player.health; i++) {
        var sprite = PIXI.Sprite.fromImage("assets/images/life.png");
        sprite.y = sprite.height + 30
        sprite.x = 50 * (i + 1)
        healthSprites.push(sprite);
        application.stage.addChild(sprite);
    }
}
function clear() {
    noInput = true;
    while(application.stage.children[0]) { application.stage.removeChild(application.stage.children[0]); }
    enemies = [];
    healthSprites = [];
    scoreVal = 0;
    score.setText("SCORE: " + scoreVal);
}

function displayGameOver() {
    var text = new PIXI.Text("GAME OVER", {font: "Bold " + (width / 10) + "px Arial", fill: "red"})
    var restart = new PIXI.Text("Press 'R' to Restart.", {font: "Bold " + (width / 20) + "px Arial", fill: "red"})
    text.anchor.set(0.5);
    text.x = width / 2;
    text.y = text.height;
    restart.anchor.set(0.5);
    restart.x = width / 2;
    restart.y = text.height * 2 + 3;
    application.stage.addChild(text);
    application.stage.addChild(restart);
}


function isOnScreen(x, y) {
    return isWithinBounds(0, 0, width, height, x, y);
}

function isWithinBounds(x1, y1, x2, y2, px, py) {
    if(px < x1 || px > x2) {
        return false;
    }
    if(py < y1 || py > y2) {
        return false;
    }
    return true;
}

function getBounds(sprite) {
    var x = sprite.x + (sprite.width * sprite.anchor.x);
    var y = sprite.y + (sprite.height * sprite.anchor.y);
    var width = sprite.width;
    var height = sprite.height;
    return {x: x, y: y, width: width, height: height};
}

var ticks = 0;
application.ticker.add(function(delta) {
    player.update(delta)
    if(player.health == 0) {
        clear();
        displayGameOver();
    }

    for(var i = enemies.length - 1; i >= 0; i--) {
        var enemy = enemies[i];
        enemy.update(delta);
        for(var j = 0; j < bullets.length; j++) {
            if(hitTestRectangle(bullets[j].sprite, enemy.sprite)) {
                bullets[j].flagForKill = true;
                enemy.health--;
            }
        }
        if(!player.invincible && hitTestRectangle(player.sprite, enemy.sprite)) {
            player.damage(1);
            player.invincible = true;
            setTimeout(function() {
                player.invincible = false;
                player.sprite.visible = true;
            }, 3000);
            enemy.health = 0;
        }
        if(enemy.health == 0) {
            enemies.splice(i, 1);
            application.stage.removeChild(enemy.sprite);
            scoreVal++
            score.setText("SCORE: " + scoreVal);
            score.x = width / 2 - score.width / 2;
        }
    }

    for(var i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update();
        if(bullets[i].flagForKill) {
            application.stage.removeChild(bullets[i].sprite);
            bullets.splice(i, 1);
        }
    }
    ticks++;
    if(ticks % Math.max(10, 100 - scoreVal) == 0 && Math.random() * 100 <= 60) {
        spawnEnemy(Math.random() * 100 <= 20 ? "speeder" : "ufo")
    }
})

function spawnEnemy(type) {
    var side = Math.round(Math.random() * 4);
    var x;
    var y;
    switch(side) {
        case 0:
            x = Math.random() * width;
            y = -80;
            break;
        case 1:
            x = width + 80;
            y = Math.random() * height;
            break;
        case 2:
            x = Math.random() * width;
            y = height + 80
        case 3:
            x = -80;
            y = Math.random() * height;
    }
    enemies.push(new Enemy(type, x, y, player));
}

window.onmousedown = function(e) {
    if(noInput) {
        return;
    }
    player.firing = true;
}
window.onmouseup = function(e) {
    if(noInput) {
        return;
    }
    player.firing = false;
}

window.onmousemove = function(e) {
    if(noInput) {
        return;
    }
    mouseX = e.pageX;
    mouseY = e.pageY;
}

window.onkeydown = function(e) {
    if(noInput) {
        if(e.which == 82) { //'R'
            restart();
        }
        return;
    }
    switch(e.which) {
        case 87:
            player.moveForward(player.speed);
            break;
        case 83:
            player.moveForward(-player.speed);
    }
}
