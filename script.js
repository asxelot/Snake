var q = document.querySelector.bind(document),
    canvas = q('canvas'),
    w = canvas.width = 400,
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

        for (var x = 4; x--;) this.body.push({x: x, y: 0});
    },
    turn: function(dir) {
        if ( Math.abs(this.dir - dir) == 2 ) return;    // ignore if press back
        if ( !this.isTurned ) this.dir = dir;
        if ( this.isTurned && !this.turnQueue ) this.turnQueue = dir;
        this.isTurned = true;
    },
    move: function() {
        var tail;

        this.dir % 2 ? this.head.y += this.dir - 2 : this.head.x += this.dir - 1;

        if ( this.head.x < 0 || this.head.x >= w/cw ||
             this.head.y < 0 || this.head.y >= h/cw ||
             this.body.some(function(cell) {
                return equal(cell, Snake.head);
             }) ) {
            Game.over();
            return;
        }

        this.body.unshift({x: this.head.x, y: this.head.y});

        if ( equal(this.head, Apple) ) {
            Game.qScore.textContent = ++Game.score;
            Apple.create();
        } else {
            tail = this.body.pop();
            c.clearRect(tail.x*cw, tail.y*cw, cw, cw);
        }
        this.isTurned = false;
    }
};

var Apple = {
    create: function() {
        do {
            this.x = ~~(Math.random()*(w/cw));
            this.y = ~~(Math.random()*(h/cw));
        } while ( Snake.body.some(function(cell) {
            return equal(cell, Apple);
        }) );
    }
};

var Game = {
    score: 0,
    highscore: 0,
    isPause: false,
    isOver: false,
    qScore: q('#score'),
    qHighscore: q('#highscore'),
    qRestart: q('#restart'),
    start: function() {
        Snake.init();
        Apple.create();
        this.draw();
        this.getHighscore();
        this.loop();

        this.qRestart.onclick = function() {
            Game.restart();
        };

        document.onkeydown = function(e) {
            var key = e.keyCode - 37;
            if ( key >= 0 && key < 4 && !Game.isPause ) Snake.turn(key);
            if ( e.keyCode == 32 ) Game.pause();
        };
    },
    restart: function() {
        this.draw();
        c.clearRect(0, 0, w, h);
        this.qRestart.style.display = 'none';
        this.qScore.textContent = this.score = 0 ;
        Snake.init();
        Apple.create();
        this.loop();
        this.isOver = false;
    },
    draw: function() {
        c.beginPath();
        Snake.body.forEach(function(cell) {
            c.rect(cell.x*cw, cell.y*cw, cw, cw);
        });
        c.rect(Apple.x*cw, Apple.y*cw, cw, cw);
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
        this.qHighscore.textContent = this.highscore;
    },
    setHighscore: function(score) {
        var date = new Date;
        date.setDate( date.getDate() + 365 );
        document.cookie = 'highscore=' + score + '; expires=' + date.toUTCString();
        this.qHighscore.textContent = score;
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
        this.qRestart.style.display = 'inline';
        this.qRestart.querySelector('button').focus();
        if ( this.score > this.highscore ) this.setHighscore(this.score);
        this.isOver = true;
    }
};

Game.start();
