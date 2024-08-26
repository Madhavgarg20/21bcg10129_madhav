const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

let players = [];
let gameState = {
    grid: Array(5).fill(null).map(() => Array(5).fill('')),
    currentPlayer: '',
    playerACharacters: [],
    playerBCharacters: [],
    gameOver: false
};

function resetGame() {
    gameState = {
        grid: Array(5).fill(null).map(() => Array(5).fill('')),
        currentPlayer: 'A',
        playerACharacters: [],
        playerBCharacters: [],
        gameOver: false
    };

    // Reset player ready status
    players.forEach(player => player.ready = false);

    io.emit('gameReset', gameState);
}

io.on('connection', (socket) => {
    
  console.log('A user connected', socket.id);

  if (players.length < 2) {
      const role = players.length === 0 ? 'A' : 'B';
      players.push({ id: socket.id, role: role, ready: false });
      console.log(`Assigned role ${role} to player with socket ID ${socket.id}`);
      socket.emit('playerRole', role);
  } else {
      console.log('Game is full');
      socket.emit('gameFull');
      return;
  }

    socket.on('playerReady', (data) => {
      console.log(`Player ${socket.id} is ready with characters: ${data.characters}`);
        const player = players.find(p => p.id === socket.id);
        if (player) {
            player.ready = true;
            player.characters = data.characters;

            if (players.length === 2 && players.every(p => p.ready)) {
              console.log('Both players are ready, starting game...');
                startGame();
            }
        }
    });
    socket.on('chatMessage', (message) => {
        const player = players.find(p => p.id === socket.id);
        if (player) {
            io.emit('chatMessage', {
                role: player.role,
                message: message
            });
        }
    });

    socket.on('makeMove', (data) => {
        const piece = gameState.grid[data.fromRow][data.fromCol];
        
        gameState.grid[data.toRow][data.toCol] = piece;
        gameState.grid[data.fromRow][data.fromCol] = '';
        gameState.currentPlayer = gameState.currentPlayer === 'A' ? 'B' : 'A';
      
        io.emit('moveMade', {
            ...data,
            nextPlayer: gameState.currentPlayer,
            piece: piece
        });
      
        // Check for win condition
        const playerAPieces = gameState.grid.flat().filter(cell => cell && cell.startsWith('A')).length;
        const playerBPieces = gameState.grid.flat().filter(cell => cell && cell.startsWith('B')).length;
      
        if (playerAPieces === 0 || playerBPieces === 0) {
            const winner = playerAPieces === 0 ? 'B' : 'A';
            io.emit('gameOver', winner);
            
            // Reset the game after a short delay
            setTimeout(() => {
                resetGame();
            }, 3000); // 3 seconds delay
        }
      });

      socket.on('disconnect', () => {
        console.log('A user disconnected');
        players = players.filter(p => p.id !== socket.id);
        // Handle player disconnect (e.g., end the game if in progress)
    });
});

function startGame() {
  console.log('Initializing game state...');
    gameState.playerACharacters = players[0].characters.map(c => `A-${c}`);
    gameState.playerBCharacters = players[1].characters.map(c => `B-${c}`);
    
    // Place characters on the grid
    for (let i = 0; i < 5; i++) {
        gameState.grid[0][i] = gameState.playerACharacters[i];
        gameState.grid[4][i] = gameState.playerBCharacters[i];
    }

    gameState.currentPlayer = 'A';
    gameState.gameOver = false;

    console.log('Game started, sending initial game state to clients...');
    io.emit('gameStart', {
        startingPlayer: gameState.currentPlayer,
        grid: gameState.grid
    });
}


const PORT = process.env.PORT || 3000;

http.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});