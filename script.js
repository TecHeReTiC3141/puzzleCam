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

let SELECTED_SEGMENT = null;

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
        randomizePosition();
        addEventListeners();
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
        p.isCorrect = false;
    });
}

function getSelected(event) {
    for (let p of PIECES) {
        if (!p.isCorrect &&
            p.x <= event.x && event.x <= p.x + p.width
            && p.y <= event.y && event.y <= p.y + p.height) {
            return p;
        }
    }
    return null;
}

function mouseDownEvent(event) {
    SELECTED_SEGMENT = getSelected(event);
    if (SELECTED_SEGMENT != null) {
        SELECTED_SEGMENT.offset = {
            x: event.x - SELECTED_SEGMENT.x,
            y: event.y - SELECTED_SEGMENT.y,
        }
    }
}

function mouseMoveEvent(event) {
    if (SELECTED_SEGMENT != null) {
        SELECTED_SEGMENT.x = event.x - SELECTED_SEGMENT.offset.x;
        SELECTED_SEGMENT.y = event.y - SELECTED_SEGMENT.offset.y;
    }
}

function mouseUpEvent() {
    if (SELECTED_SEGMENT instanceof Piece && SELECTED_SEGMENT.isClose()) {
        SELECTED_SEGMENT.isCorrect = true;
    }
    SELECTED_SEGMENT = null;
}

function addEventListeners() {
    canvas.addEventListener('mousedown', mouseDownEvent);
    canvas.addEventListener('mousemove', mouseMoveEvent);
    canvas.addEventListener('mouseup', mouseUpEvent);
}


class Piece {
    errorRate = 25;

    constructor(rowInd, colInd) {
        this.rowInd = rowInd;
        this.colInd = colInd;
        this.isCorrect = false;
        this.getPosAndSize();
    }

    getPosAndSize() {
        this.width = SIZE.width / SIZE.columns;
        this.height = SIZE.height / SIZE.rows;
        if (this.isCorrect) {
            this.x = SIZE.x + this.colInd * this.width;
            this.y = SIZE.y + this.rowInd * this.height;
        }
    }

    isClose() {
        let correctLocX = SIZE.x + this.colInd * this.width;
        let correctLocY = SIZE.y + this.rowInd * this.height;
        if (Math.abs(correctLocX - this.x) <= this.errorRate
            && Math.abs(correctLocY - this.y) <= this.errorRate) {
            this.isCorrect = true;
            this.x = correctLocX;
            this.y = correctLocY;
            return true;
        }
        return false;
    }

    draw(context) {
        context.beginPath();

        this.getPosAndSize();

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
        if (this.isCorrect) {
            context.strokeStyle = 'green';
        }
        context.rect(this.x, this.y, this.width, this.height);
        context.stroke();
    }
}