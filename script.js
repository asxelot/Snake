var q = document.querySelector.bind(document),
    canvas = q('canvas'),
    w = canvas.width  = 400,
    h = canvas.height = 400,
    c = canvas.getContext('2d'),
    cw = 10;        // cell width

function equal(o1, o2) {
    return JSON.stringify(o1) == JSON.stringify(o2);
}

var Snake = {
    init: function() {
        this.body = [];
        this.head = {x: 3, y: 0};
        this.dir = 2;              // 0: left, 1: up, 2: right, 3: down
        this.isTurned = false;
        this.turnQueue = null;

        c.beginPath();
        for (var x = 4; x--;) {
            this.body.push({x: x, y: 0});
            c.rect(x*cw, 0, cw, cw);
        }
        c.fillStyle = 'blue';
        c.strokeStyle = 'white';
        c.fill();
        c.stroke();
    },
    turn: function(dir) {
        if ( Math.abs(this.dir - dir) == 2 ) return;    // ignore if press back
        if ( !this.isTurned ) this.dir = dir;
        if ( this.isTurned && !this.turnQueue ) this.turnQueue = dir;
        this.isTurned = true;
    },
    move: function() {
        this.dir % 2 ? this.head.y += this.dir - 2 : this.head.x += this.dir - 1;

        if ( this.head.x < 0 || this.head.x >= w/cw ||
             this.head.y < 0 || this.head.y >= h/cw ||
             this.contains(this.head) ) {
            Game.over();
            return;
        }

        this.body.unshift({x: this.head.x, y: this.head.y});

        if ( equal(this.head, Apple) ) {
            UI.score.textContent = ++Game.score;
            Apple.create();
        } else {
            var tail = this.body.pop();
            // c.clearRect(tail.x*cw, tail.y*cw, cw, cw);
        }
        this.isTurned = false;
    },
    contains: function(target) {
        return this.body.some(function(cell) {
            return equal(cell, target);
        });
    }
};

var Apple = {
    create: function() {
        do {
            this.x = ~~(Math.random()*w/cw);
            this.y = ~~(Math.random()*h/cw);
        } while ( Snake.contains(Apple) );
    }
};

var UI = {
    score: q('#score'),
    highscore: q('#highscore'),
    restart: q('#restart')
};

var Game = {
    score: 0,
    highscore: 0,
    isPause: false,
    isOver: false,
    start: function() {
        Snake.init();
        Apple.create();
        this.draw();
        this.getHighscore();
        this.loop();

        UI.restart.onclick = function() {
            Game.restart();
        };
        document.onkeydown = function(e) {
            if ( e.keyCode > 36 && e.keyCode < 41 && !Game.isPause )
                Snake.turn(e.keyCode - 37);
            if ( e.keyCode == 32 ) Game.pause();
        };
    },
    restart: function() {
        this.draw();
        c.clearRect(0, 0, w, h);
        UI.restart.style.display = 'none';
        UI.score.textContent = this.score = 0 ;
        Snake.init();
        Apple.create();
        this.loop();
        this.isOver = false;
    },
    draw: function() {
        c.beginPath();
        c.clearRect(0, 0, w, h);
        Snake.body.concat(Apple).forEach(function(cell) {
            c.rect(cell.x*cw, cell.y*cw, cw, cw);
        });
        c.fillStyle = 'blue';
        c.strokeStyle = 'white';
        c.fill();
        c.stroke();
    },
    getHighscore: function() {
        var cookie = document.cookie;
        if ( /highscore/.test(cookie) ) {
            this.highscore = +cookie.match(/highscore=(\d+)/)[1];
        } else {
            this.setHighscore(0);
        }
        UI.highscore.textContent = this.highscore;
    },
    setHighscore: function(score) {
        var date = new Date;
        date.setDate( date.getDate() + 365 );
        document.cookie = 'highscore=' + score + '; expires=' + date.toUTCString();
        UI.highscore.textContent = score;
    },
    loop: function() {
        this.interval = setInterval(function() {
            Snake.move();
            Game.draw();
            if ( Snake.turnQueue ) {
                Snake.turn(Snake.turnQueue);
                Snake.turnQueue = null;
            }
        }, 60);
    },
    pause: function() {
        if ( this.isOver ) return;
        if ( !this.isPause ) {
            clearInterval(this.interval);
            this.isPause = true;
        } else {
            this.loop();
            this.isPause = false;
        }
    },
    over: function() {
        clearInterval(this.interval);
        UI.restart.style.display = 'inline';
        UI.restart.querySelector('button').focus();
        if ( this.score > this.highscore ) this.setHighscore(this.score);
        this.isOver = true;
    }
};

Game.start();
