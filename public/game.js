const socket = io();
let currentPlayer = '';
let playerRole = '';
let gameOver = false;
let grid = Array(5).fill(null).map(() => Array(5).fill(''));
let moveHistory = [];
socket.on('connect', () => {
    console.log('Connected to server with ID:', socket.id);
});

socket.on('playerRole', (role) => {

    console.log(`Assigned role: ${role}`);
    updatePlayerName(role);
    playerRole = role;
    document.getElementById('player-input').style.display = 'block';
    document.getElementById('ready-button').style.display = 'block';
});

function playerReady() {
    const playerInput = document.getElementById('player-input-field').value.split(',');
    if (validateInput(playerInput)) {
        socket.emit('playerReady', {
            characters: playerInput
        });
        document.getElementById('player-input').style.display = 'none';
        document.getElementById('ready-button').style.display = 'none';
        document.getElementById('current-player').textContent = 'Waiting for other player...';
    } else {
        alert("Invalid character list! Please enter 5 valid characters (P1, P2, P3, P4, P5, H1, H2, H3).");
    }
}
socket.on('gameFull', () => {
    updatePlayerName("sorry Game Full");
    alert('The game is already full. Please try again later.');
});

function updatePlayerName(name) {
    document.getElementById('player-name-display').textContent = name;
}
socket.on('gameStart', (data) => {
    currentPlayer = data.startingPlayer;
    grid = data.grid;
    renderBoard();
    document.getElementById('current-player').textContent = `Current Player: ${currentPlayer}`;
});

function validateInput(input) {
    const validCharacters = ['P1', 'P2', 'P3', 'P4', 'P5', 'H1', 'H2', 'H3'];
    return input.length === 5 && input.every(c => validCharacters.includes(c));
}

function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    if (message) {
        socket.emit('chatMessage', message);
        chatInput.value = '';
    }
}

socket.on('chatMessage', (data) => {
    const chatMessages = document.getElementById('chat-messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = `Player ${data.role}: ${data.message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

function renderBoard() {
    const boardElement = document.getElementById('game-board');
    boardElement.innerHTML = '';

    grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            cellElement.dataset.row = rowIndex;
            cellElement.dataset.col = colIndex;

            if (cell) {
                const pieceRole = cell.charAt(0); // Get the role (A or B)
                const pieceType = cell.slice(1); // Get the piece type (e.g., -P4, -H1)

                if (cell.startsWith(playerRole)) {
                    cellElement.textContent = `${pieceRole}${pieceType}`; // Display "A-P4" or "B-H1"
                    cellElement.classList.add('player-piece');
                    cellElement.addEventListener('click', () => selectPiece(rowIndex, colIndex));
                } else {
                    // Show opponent's piece with role
                    cellElement.textContent = `${pieceRole}${pieceType}`; // Display "A-P4" or "B-H1" for opponent
                    cellElement.classList.add('opponent-piece');
                }
            }
            boardElement.appendChild(cellElement);
        });
    });
}

function selectPiece(row, col) {
    if (currentPlayer !== playerRole || gameOver) return;

    // Clear previous selections and available move highlights
    document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('selected', 'available-move'));

    const cellElement = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    cellElement.classList.add('selected');

    const availableMoves = getAvailableMoves(row, col);
    highlightAvailableMoves(availableMoves, row, col);
}

function highlightAvailableMoves(moves, fromRow, fromCol) {
    moves.forEach(move => {
        const moveCell = document.querySelector(`.cell[data-row="${move.row}"][data-col="${move.col}"]`);
        if (moveCell) {
            moveCell.classList.add('available-move');
            moveCell.addEventListener('click', () => makeMove(fromRow, fromCol, move.row, move.col));
        }
    });
}

function getAvailableMoves(row, col) {
    const piece = grid[row][col];
    const moves = [];
    const directions = {
        'P1': ['L', 'R', 'F', 'B'],
        'P2': ['L', 'R', 'F', 'B'],
        'P3': ['L', 'R', 'F', 'B'],
        'P4': ['L', 'R', 'F', 'B'],
        'P5': ['L', 'R', 'F', 'B'],
        'H1': ['L', 'R', 'F', 'B'],
        'H2': ['FL', 'BR', 'FR', 'BL'],
        'H3': ['2FL', '2BR', '2FR', '2BL', '2RF', '2RB', '2LF', '2LB'],
    };

    const pieceType = piece.slice(2);
    const playerIsA = currentPlayer === 'A';

    directions[pieceType].forEach(dir => {
        let newRow = row;
        let newCol = col;

        switch (dir) {
            case 'L':
                newCol -= 1;
                break;
            case 'R':
                newCol += 1;
                break;
            case 'F':
                newRow += (playerIsA ? 1 : -1);
                break;
            case 'B':
                newRow += (playerIsA ? -1 : 1);
                break;

            case 'FL':
                newRow += (playerIsA ? 2 : -2);
                newCol -= 2;
                break;
            case 'FR':
                newRow += (playerIsA ? 2 : -2);
                newCol += 2;
                break;
            case 'BL':
                newRow += (playerIsA ? -2 : 2);
                newCol -= 2;
                break;
            case 'BR':
                newRow += (playerIsA ? -2 : 2);
                newCol += 2;
                break;

            case '2FL':
                newRow += (playerIsA ? 2 : -2);
                newCol -= 1;
                break;
            case '2FR':
                newRow += (playerIsA ? 2 : -2);
                newCol += 1;
                break;
            case '2BL':
                newRow += (playerIsA ? -2 : 2);
                newCol -= 1;
                break;
            case '2BR':
                newRow += (playerIsA ? -2 : 2);
                newCol += 1;
                break;
            case '2LF':
                newRow += (playerIsA ? 1 : -1);
                newCol -= 2;
                break;
            case '2RF':
                newRow += (playerIsA ? 1 : -1);
                newCol += 2;
                break;
            case '2LB':
                newRow += (playerIsA ? -1 : 1);
                newCol -= 2;
                break;
            case '2RB':
                newRow += (playerIsA ? -1 : 1);
                newCol += 2;
                break;
        }


        if (newRow >= 0 && newRow < 5 && newCol >= 0 && newCol < 5) {
            const targetCell = grid[newRow][newCol];
            // if (!grid[newRow][newCol] || !grid[newRow][newCol].startsWith(playerRole)) {
            //     moves.push({ row: newRow, col: newCol });
            // }
            if (piece.includes('H1')) {
                const directionMoves = {
                    'L': [{
                        row: newRow,
                        col: newCol
                    }, {
                        row: newRow,
                        col: newCol - 1
                    }],
                    'R': [{
                        row: newRow,
                        col: newCol
                    }, {
                        row: newRow,
                        col: newCol + 1
                    }],
                    'F': [{
                        row: newRow,
                        col: newCol
                    }, {
                        row: newRow + (playerIsA ? 1 : -1),
                        col: newCol
                    }],
                    'B': [{
                        row: newRow,
                        col: newCol
                    }, {
                        row: newRow + (playerIsA ? -1 : 1),
                        col: newCol
                    }]
                };

                const path = directionMoves[dir];

                if (path) {
                    const validPath = path.every(pos => {
                        return pos.row >= 0 && pos.row < 5 && pos.col >= 0 && pos.col < 5 &&
                            (!grid[pos.row][pos.col] || !grid[pos.row][pos.col].includes(currentPlayer));
                    });

                    if (validPath) {
                        moves.push({
                            row: path[1].row,
                            col: path[1].col,
                            type: dir
                        });
                    }
                }
            } else if (piece.includes('H2')) {
                const directionMoves = {
                    'FL': [{
                        row: row + (playerIsA ? 1 : -1),
                        col: col - 1
                    }, {
                        row: newRow,
                        col: newCol
                    }],
                    'FR': [{
                        row: row + (playerIsA ? 1 : -1),
                        col: col + 1
                    }, {
                        row: newRow,
                        col: newCol
                    }],
                    'BL': [{
                        row: row + (playerIsA ? -1 : 1),
                        col: col - 1
                    }, {
                        row: newRow,
                        col: newCol
                    }],
                    'BR': [{
                        row: row + (playerIsA ? -1 : 1),
                        col: col + 1
                    }, {
                        row: newRow,
                        col: newCol
                    }]
                };

                const path = directionMoves[dir];

                if (path) {
                    const validPath = path.every(pos => {
                        return pos.row >= 0 && pos.row < 5 && pos.col >= 0 && pos.col < 5 &&
                            (!grid[pos.row][pos.col] || !grid[pos.row][pos.col].includes(currentPlayer));
                    });

                    if (validPath) {
                        moves.push({
                            row: path[1].row,
                            col: path[1].col,
                            type: dir
                        });
                    }
                }
            } else {
                // Normal move handling for other pieces
                if (!targetCell || !targetCell.includes(currentPlayer)) {
                    moves.push({
                        row: newRow,
                        col: newCol,
                        type: dir
                    });
                }
            }

        }
    });

    return moves;
}

function removeOpponentPieceIfInBetween(character, fromRow, fromCol, toRow, toCol) {
    const isH1 = character.includes('H1');
    const isH2 = character.includes('H2');
    // console.log("h1 hai kya ",isH1);
    // console.log("player",currentPlayer);
    if (isH1) {
        // H1 moves two spaces in any direction
        const midRow = (fromRow + toRow) / 2;
        const midCol = (fromCol + toCol) / 2;

        // Check if there's an opponent's piece in the middle and remove it
        if (grid[midRow][midCol] && grid[midRow][midCol].includes(currentPlayer)) {
            grid[midRow][midCol] = ''; // Remove opponent's piece
        }
    } else if (isH2) {
        // H2 moves diagonally
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);

        // Check diagonally for opponent's piece
        if (rowDiff === 2 && colDiff === 2) {
            const midRow = (fromRow + toRow) / 2;
            const midCol = (fromCol + toCol) / 2;

            if (grid[midRow][midCol] && grid[midRow][midCol].includes(currentPlayer)) {
                grid[midRow][midCol] = ''; // Remove opponent's piece
            }
        }
    }
}

function makeMove(fromRow, fromCol, toRow, toCol) {
    document.querySelectorAll('.cell').forEach(cell => cell.classList.remove('selected', 'available-move'));
    socket.emit('makeMove', {
        fromRow,
        fromCol,
        toRow,
        toCol
    });
}
let playerAScore = 0;
let playerBScore = 0;

function checkWin() {
    const playerAPieces = grid.flat().filter(cell => cell && cell.startsWith('A')).length;
    const playerBPieces = grid.flat().filter(cell => cell && cell.startsWith('B')).length;
    // console.log(playerBPieces);
    // console.log(playerAPieces);
    if (playerAPieces === 0 || playerBPieces === 0) {
        gameOver = true;
        const winner = playerAPieces === 0 ? 'B' : 'A';

        // Update the score
        if (winner === 'A') {
            playerAScore++;
            document.getElementById('player-a-score').textContent = playerAScore;
        } else {
            playerBScore++;
            document.getElementById('player-b-score').textContent = playerBScore;
        }

        alert(`Player ${winner} wins!`);
        // Show restart button
    }
}

socket.on('moveMade', (data) => {
    const {
        fromRow,
        fromCol,
        toRow,
        toCol,
        nextPlayer,
        piece
    } = data;

    // Update the local grid
    grid[toRow][toCol] = grid[fromRow][fromCol];
    grid[fromRow][fromCol] = '';

    currentPlayer = nextPlayer;
    document.getElementById('current-player').textContent = `Current Player: ${currentPlayer}`;

    // Clear available moves
    // document.getElementById('available-moves').innerHTML = '';
    checkWin();
    // Log the move
    logMove(piece, fromRow, fromCol, toRow, toCol);
    removeOpponentPieceIfInBetween(piece, fromRow, fromCol, toRow, toCol);

    renderBoard();
});

function logMove(character, fromRow, fromCol, toRow, toCol) {
    // Determine direction
    let direction = '';
    if (fromRow === toRow) {
        if (fromCol < toCol) direction = '→'; // Right
        else if (fromCol > toCol) direction = '←'; // Left
    } else if (fromCol === toCol) {
        if (fromRow < toRow) direction = '↓'; // Down
        else if (fromRow > toRow) direction = '↑'; // Up
    }

    // Create move log entry
    const move = `${character} moved ${direction} from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol})`;
    moveHistory.push(move);

    // Update the move history in HTML
    const moveList = document.getElementById('move-list');
    const listItem = document.createElement('li');
    listItem.textContent = move;
    moveList.appendChild(listItem);
}

socket.on('gameOver', (winner) => {
    gameOver = true;
    alert(`Game Over! Player ${winner} wins!`);
    document.getElementById('restart-button').style.display = 'block';
});

function requestRestart() {
    socket.emit('restartRequest');
}
socket.on('gameRestarted', () => {
    gameOver = false;
    document.getElementById('restart-button').style.display = 'none';
    document.getElementById('player-input').style.display = 'block';
    document.getElementById('ready-button').style.display = 'block';
    document.getElementById('current-player').textContent = 'Waiting for players...';
    grid = Array(5).fill(null).map(() => Array(5).fill(''));
    renderBoard();
});
socket.on('gameReset', (newGameState) => {
    grid = newGameState.grid;
    currentPlayer = newGameState.currentPlayer;
    gameOver = newGameState.gameOver;

    renderBoard();
    document.getElementById('current-player').textContent = `Current Player: ${currentPlayer}`;
    document.getElementById('player-input').style.display = 'block';
    document.getElementById('ready-button').style.display = 'block';

    // Clear move history
    document.getElementById('move-list').innerHTML = '';
    moveHistory = [];

    alert('Game has been reset. Please select your characters again.');
});

// Initial board render
renderBoard();