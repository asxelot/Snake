var Field = {
    $: $('#field'),
    draw: function() {
        this.h = 20;
        this.w = this.h;

        this.$.html('<table>' + Array(this.h + 1).join('<tr>' +
            Array(this.w + 1).join('<td></td>') + '</tr>') + '</table>');
    },
    getCell: function(x, y) {
        return this.$.find('tr').eq(y).find('td').eq(x);
    },
    createApple: function() {
        var x, y;
        do {
            x = ~~(Math.random() * this.w);
            y = ~~(Math.random() * this.h);
        } while ( this.getCell(x, y).hasClass('snake') );
        this.getCell(x, y).addClass('apple');
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

        for (var x = 4; x--;) this.body.push(Field.getCell(x, 0)[0]);
        $(this.body).addClass('snake');
    },
    turn: function(dir) {
        if ( Math.abs(this.dir - dir) == 2 ) return;    // if press back
        if ( !this.isTurned ) this.dir = dir;
        if ( this.isTurned && !this.turnQueue ) this.turnQueue = dir;
        this.isTurned = true;
    },
    move: function() {
        this.dir % 2 ? this.head.y += this.dir - 2 : this.head.x += this.dir - 1;

        var $headCell = Field.getCell(this.head.x, this.head.y);

        if ( this.head.x < 0 || this.head.x >= Field.w ||
             this.head.y < 0 || this.head.y >= Field.h ||
             $headCell.hasClass('snake') ) {
            Game.over();
            return;
        }
        this.body.unshift( $headCell.addClass('snake')[0] );

        if ( $headCell.hasClass('apple') ) {
            $headCell.removeClass('apple');
            Game.$score.text( ++Game.score );
            Field.createApple();
        } else {
            $( this.body.pop() ).removeClass('snake');
        }
        this.isTurned = false;
    }
};

var Game = {
    score: 0,
    highscore: 0,
    $score: $('#score'),
    $highscore: $('#highscore'),
    $restart: $('#restart').on('click', 'button', function() {
        Game.restart();
    }),
    start: function() {
        Field.draw();
        Snake.init();
        Field.createApple();
        this.getHighscore();

        $(document).on('keydown', function(e) {
            var key = e.keyCode - 37;
            if ( key >= 0 && key < 4 ) Snake.turn(key);
        });

        this.loop();
    },
    restart: function() {
        Field.$.find('td').removeClass();
        this.$restart.hide();
        this.$score.text( this.score = 0 );
        Snake.init();
        Field.createApple();

        this.loop();
    },
    getHighscore: function() {
        var cookie = document.cookie;
        if ( /highscore/.test(cookie) ) {
            this.highscore = +cookie.match(/highscore=(\d+)/)[1];
        } else {
            this.setHighscore(0);
        }
        this.$highscore.text(this.highscore);
    },
    setHighscore: function(score) {
        var date = new Date;
        date.setDate( date.getDate() + 365 );
        document.cookie = 'highscore=' + score + '; expires=' + date.toUTCString();
        this.$highscore.text(score);
    },
    loop: function() {
        this.interval = setInterval(function() {
            Snake.move();
            if ( Snake.turnQueue ) {
                Snake.turn(Snake.turnQueue);
                Snake.turnQueue = null;
            }
        }, 150);
    },
    over: function() {
        clearInterval(this.interval);
        this.$restart.show().find('button').focus();
        if ( this.score > this.highscore ) this.setHighscore(this.score);
    }
};

Game.start();