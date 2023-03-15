document.addEventListener('DOMContentLoaded', () => {
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
        VIDEO.addEventListener('loadeddata', e => {
            getPosAndSize();
            initiatePieces();
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
        context.drawImage(VIDEO, SIZE.x, SIZE.y, SIZE.width, SIZE.height);
        PIECES.forEach(p => {
            p.draw(context);
        })
        window.requestAnimationFrame(updateCanvas);

    }

    function initiatePieces() {
        for (let i = 0; i < SIZE.rows; ++i) {
            for (let j = 0; j < SIZE.columns; ++j) {
                PIECES.push(new Piece(i, j));
            }
        }
    }

    class Piece {
        constructor(rowInd, colInd) {
            this.rowInd = rowInd;
            this.colInd = colInd;
        }

        draw(context) {
            context.beginPath();
            let pieceWidth = SIZE.width / SIZE.columns,
                pieceHeight = SIZE.height / SIZE.rows;
            let pieceLocX = SIZE.x + this.colInd * pieceWidth,
                pieceLocY = SIZE.y + this.rowInd * pieceHeight;
            console.log([this.rowInd, this.colInd, pieceLocX, pieceLocX, pieceWidth, pieceHeight]);
            context.rect(pieceLocX, pieceLocY, pieceWidth, pieceHeight);
            context.stroke();
        }
    }

});

