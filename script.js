var q = document.querySelector.bind(document);
var Field = {
    q: q('#field'),
    draw: function() {
        this.h = 40;
        this.w = this.h;

        this.q.innerHTML = '<table>' + Array(this.h + 1).join('<tr>' +
            Array(this.w + 1).join('<td></td>') + '</tr>') + '</table>';
    },
    getCell: function(x, y) {
        return this.q.querySelector('tbody').children[y].children[x];
    },
    createApple: function() {
        var x, y;
        do {
            x = ~~(Math.random() * this.w);
            y = ~~(Math.random() * this.h);
        } while ( this.getCell(x, y).className == 'snake' );
        this.getCell(x, y).className = 'apple';
    }
};

var Snake = {
    init: function() {
        // write in init for reset on restart
        this.body = [];
        this.head = {x: 3, y: 0};
        this.dir = 2;               // 0: left, 1: up, 2: right, 3: down
        this.isTurned = false;
        this.turnQueue = null;

        for (var x = 4; x--;) this.body.push( Field.getCell(x, 0) );
        this.body.forEach(function(cell) {
            cell.className = 'snake';
        });
    },
    turn: function(dir) {
        if ( Math.abs(this.dir - dir) == 2 ) return;    // ignore if press back
        if ( !this.isTurned ) this.dir = dir;
        if ( this.isTurned && !this.turnQueue ) this.turnQueue = dir;
        this.isTurned = true;
    },
    move: function() {
        var headCell;

        this.dir % 2 ? this.head.y += this.dir - 2 : this.head.x += this.dir - 1;

        if ( this.head.x < 0 || this.head.x >= Field.w ||
             this.head.y < 0 || this.head.y >= Field.h ||
             (headCell=Field.getCell(this.head.x, this.head.y)).className=='snake' ) {
            Game.over();
            return;
        }

        this.body.unshift( headCell );

        if ( headCell.className == 'apple' ) {
            Game.qScore.textContent = ++Game.score ;
            Field.createApple();
        } else {
            ( this.body.pop() ).className = '';
        }
        headCell.className = 'snake';
        this.isTurned = false;
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
        this.qRestart.onclick = function() {
            Game.restart();
        };
        Field.draw();
        Snake.init();
        Field.createApple();
        this.getHighscore();
        this.loop();

        document.onkeydown = function(e) {
            var key = e.keyCode - 37;
            if ( key >= 0 && key < 4 && !Game.isPause ) Snake.turn(key);
            if ( e.keyCode == 32 ) Game.pause();
        };
    },
    restart: function() {
        Field.draw();
        this.qRestart.style.display = 'none';
        this.qScore.textContent = this.score = 0 ;
        Snake.init();
        Field.createApple();
        this.loop();
        this.isOver = false;
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