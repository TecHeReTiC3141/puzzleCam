let canvas = document.getElementById('mainCanvas');
let context = canvas.getContext('2d');

let VIDEO;
let camPromise = navigator.mediaDevices.getUserMedia(
    {video: true});
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let SIZE = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rows: 3,
    columns: 3,
}
let PIECES = [];
const SCALER = .8;

function getPosAndSize() {
    let resizer = SCALER * Math.min(
        window.innerWidth / VIDEO.videoWidth,
        window.innerHeight / VIDEO.videoHeight,
    );
    SIZE.width = resizer * VIDEO.videoWidth;
    SIZE.height = resizer * VIDEO.videoHeight;
    SIZE.x = window.innerWidth / 2 - SIZE.width / 2;
    SIZE.y = window.innerHeight / 2 - SIZE.height / 2;
}

camPromise.then(signal => {
    VIDEO = document.createElement('video');
    VIDEO.classList.add('web-cam')
    VIDEO.srcObject = signal;
    VIDEO.play();
    VIDEO.addEventListener('loadeddata', () => {
        getPosAndSize();
        initiatePieces(SIZE.rows, SIZE.columns);
        console.log(PIECES);
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            getPosAndSize()
        });
        updateCanvas();

    });

}).catch(err => {
    console.log(`Camera error: ${err}`);
})

function updateCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = .5;
    context.drawImage(VIDEO, SIZE.x, SIZE.y, SIZE.width, SIZE.height);
    context.globalAlpha = 1;
    PIECES.forEach(p => {
        p.draw(context);
    })
    window.requestAnimationFrame(updateCanvas);

}

function initiatePieces(rows, cols) {
    PIECES = [];
    SIZE.rows = rows;
    SIZE.columns = cols;
    for (let i = 0; i < SIZE.rows; ++i) {
        for (let j = 0; j < SIZE.columns; ++j) {
            PIECES.push(new Piece(i, j));
        }
    }
}

function randomizePosition() {
    PIECES.forEach(p => {
        p.x = Math.random() * (canvas.width - p.width);
        p.y = Math.random() * (canvas.height - p.height);
    });
}


class Piece {
    constructor(rowInd, colInd) {
        this.rowInd = rowInd;
        this.colInd = colInd;
        this.getPosAndSize();
    }

    getPosAndSize() {
        this.width = SIZE.width / SIZE.columns;
        this.height = SIZE.height / SIZE.rows;
        this.x = SIZE.x + this.colInd * this.width;
        this.y = SIZE.y + this.rowInd * this.height;
    }

    draw(context) {
        context.beginPath();
        // this.getPosAndSize();

        context.drawImage(VIDEO,
            VIDEO.videoWidth * this.colInd / SIZE.columns,
            VIDEO.videoHeight * this.rowInd / SIZE.rows,
            VIDEO.videoWidth / SIZE.columns,
            VIDEO.videoHeight / SIZE.rows,
            this.x,
            this.y,
            this.width,
            this.height,
        );
        context.rect(this.x, this.y, this.width, this.height);
        context.stroke();
    }
}