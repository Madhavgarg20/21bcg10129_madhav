# Grid Warriors

Grid Warriors is a web application that allows two users to connect and play a custom 5x5 chess game. Developed using HTML, CSS, and JavaScript, the app features a turn-based grid system with dynamic character movement and custom rules. The game is designed to provide an engaging and strategic chess experience on a unique 5x5 grid.

## Game Rules

### Game Setup
- The game is played between two players on a 5x5 grid.
- Each player controls a team of 5 characters, which can include Pawns, Hero1, and Hero2.
- Players arrange their characters on their respective starting rows at the beginning of the game.

### Characters and Movement
There are three types of characters available:

1. **Pawn:**
   - Moves one block in any direction (Left, Right, Forward, or Backward).
   - Move commands: `L` (Left), `R` (Right), `F` (Forward), `B` (Backward).

2. **Hero1:**
   - Moves two blocks straight in any direction.
   - Kills any opponent's character in its path.
   - Move commands: `L` (Left), `R` (Right), `F` (Forward), `B` (Backward).

3. **Hero2:**
   - Moves two blocks diagonally in any direction.
   - Kills any opponent's character in its path.
   - Move commands: `FL` (Forward-Left), `FR` (Forward-Right), `BL` (Backward-Left), `BR` (Backward-Right).

4. **Hero3:**
   - Moves 2 steps straight and one to the side in a single turn.
   - Kills only the character at its final landing position (if occupied by an opponent).
   - Move commands:
     - `FL`: 2 steps Forward, 1 step Left
     - `FR`: 2 steps Forward, 1 step Right
     - `BL`: 2 steps Backward, 1 step Left
     - `BR`: 2 steps Backward, 1 step Right
     - `RF`: 2 steps Right, 1 step Forward
     - `RB`: 2 steps Right, 1 step Backward
     - `LF`: 2 steps Left, 1 step Forward
     - `LB`: 2 steps Left, 1 step Backward

   - Example moves: `H3:FR` (2 front, 1 right), `H3:RF` (2 right, 1 front).

All moves are relative to the player's perspective.

### Game Flow

#### Initial Setup:
- Players deploy all 5 characters on their starting row in any order.
- Character positions are input as a list of character names, placed from left to right.
- Players can choose any combination of Pawns, Hero1, Hero2, and Hero3 for their team.

#### Turns:
- Players alternate turns, making one move per turn.

#### Combat:
- If a character moves to a space occupied by an opponent's character, the opponent's character is removed from the game.
- For Hero1 and Hero2, any opponent's character in their path is removed, not just the final destination.

#### Invalid Moves:
Moves are considered invalid if:
- The specified character doesn't exist.
- The move would take the character out of bounds.
- The move is not valid for the given character type.
- The move targets a friendly character.
  
Players must retry their turn if they input an invalid move.


### Winning the Game:
- The game ends when one player eliminates all of their opponent's characters.
- The winning player is announced, and players can choose to start a new game.

## Technical Requirements

### Server
- Implement the core game logic as described in the original rules.
- Set up a WebSocket server to handle client connections and game events.
- Process move commands received from clients and update the game state accordingly.
- Broadcast updated game state to all connected clients after each valid move.

### WebSocket Communication
Implement the following event types:
- Game initialization
- Player move
- Game state update
- Invalid move notification
- Game over notification

### Web Client
Create a responsive web page that displays:
- A 5x5 grid representing the game board
- Current game state with characters positioned on the board
- Player turn indication
- Move history (Optional)

Implement interactive features:
- Clickable character pieces for the current player
- Display valid moves as buttons when a character is selected below the grid
- Send move commands to the server when a valid move is chosen
- Handle and display server responses, including invalid move notifications and game over states

### User Interface Requirements
- Display the 5x5 game board with clear differentiation between empty cells and character positions.
- Use distinct visual representations for each player's characters (e.g., different colors or prefixes as in the original requirements).
- When a player selects their character, highlight valid move options as clickable buttons below the game board.
- Show the current player's turn prominently.
- Display a move history or log.
- Implement a game over screen showing the winner and offering an option to start a new game.


## Installation

Follow these steps to set up and run the project locally:

1. Clone the repository:

    ```bash
    git clone https://github.com/Madhavgarg20/GridWarriors.git
    cd GridWarriors
    ```

2. Install the necessary dependencies:

    ```bash
    npm install socket.io
    ```

3. Make sure `server.js` is in the root directory and contains the necessary server setup for Socket.io.

4. Start the server:

    ```bash
    npm start
    ```

## How to Play

- **Player Assignment:** The first two players who connect will be assigned names "A" and "B."
- **Game Objective:** Players take turns moving their pieces on the 5x5 grid according to the game rules.
- **Winning:** The objective is to strategize and outmaneuver the opponent on the custom grid layout.

## Technologies Used

- **HTML** - Structure of the web pages.
- **CSS** - Styling of the application.
- **JavaScript** - Game logic and interactivity.
- **Node.js** - Backend server.
- **Socket.io** - Real-time communication between players.

## Contributing

If you'd like to contribute to this project, feel free to fork the repository and submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any inquiries, feel free to reach out at:

- **Madhav Garg**
- **Email:** madhavgargjan20@gmail.com
- **GitHub:** [Madhavgarg20](https://github.com/Madhavgarg20)

---

Happy Gaming!
