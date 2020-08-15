const prompt = require('prompt-sync')({sigint: true});
const term = require( 'terminal-kit' ).terminal ;

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';
let playerScore = 0;
let computerScore = 0;

class Field {
  constructor(field) {
    this.field = field;
    this.playerLocationX;
    this.playerLocationY;
    this.mode;
  }
  //determine player starting location
  setPlayerLocation() {
    this.field.forEach(line => {
      if (line.includes(pathCharacter)) {
        this.playerLocationX = line.indexOf(pathCharacter);
        this.playerLocationY = this.field.indexOf(line);
      }
    });
  }
  //print field
  print() {
    this.field.forEach(line => {
      term.black();
      term.bgBrightCyan();
      console.log(line.join(''));
      term.styleReset();
    });
  }
  //prompt player for their next move
  getDirection() {
    let direction = prompt('Which direction? [u/d/r/l]');
    switch (direction) {
      case 'u':
        this.playerLocationY -= 1;
        break;
      case 'd':
        this.playerLocationY += 1;
        break;
      case 'l':
        this.playerLocationX -= 1;
        break;
      case 'r':
        this.playerLocationX += 1;
        break;
      default:
        term.red();
        console.log('Invalid entry');
        term.defaultColor();
    }
  }

  testForGameEnd() {
    //get current location of player
    const currentLocation = this.playerLocationY !== this.field.length && this.playerLocationY >= 0 && this.playerLocationX !== this.field[0].length && this.playerLocationX >= 0 ? this.field[this.playerLocationY][this.playerLocationX] : undefined;
    //determine if game is over; if so, update and score and notify player
    if (currentLocation === hole) {
      computerScore += 1;
      term.yellow();
      console.log('You fell into a hole. Computer wins!');
      console.log(`Score: Computer - ${computerScore}, You - ${playerScore}`);
      term.defaultColor();
      this.playAgain();
    } else if (currentLocation === undefined) {
      computerScore += 1;
      term.yellow();
      console.log('You fell off a cliff. Computer wins!');
      console.log(`Score: Computer - ${computerScore}, You - ${playerScore}`);
      term.defaultColor();
      this.playAgain();
    } else if (currentLocation === hat) {
      playerScore += 1;
      term.green();
      console.log('Hat found. You win!');
      console.log(`Score: Computer - ${computerScore}, You - ${playerScore}`);
      term.defaultColor();
      this.playAgain();
    } else {
      //game isn't over so update field
      this.field[this.playerLocationY].splice(this.playerLocationX, 1, pathCharacter);
      //add hole if the game is set to hard mode
      if (this.mode === 'hard') {
        this.addHoles();
      }
      //start next turn
      this.playGame();
    }
  }

  async playGame() {
    //if new game, ask player for their preferred mode
    if (this.mode === undefined) {
      let answer = prompt('easy or hard mode? [e/h]');
      switch (answer) {
        case 'e':
          this.mode = 'easy';
          break;
        case 'h':
          this.mode = 'hard';
          break;
        default:
          term.red();
          console.log('Invalid entry');
          term.defaultColor();
          this.playGame();
      }
    }
    //if new game, get player starting location
    if (this.playerLocationX === undefined) {
      this.setPlayerLocation();
    }
    //print field
    this.print();
    //prompt player for their next move
    this.getDirection();
    //check for game resolution
    this.testForGameEnd();
  }

  playAgain() {
    //ask player if they would like to play again; if so, start a new game
    let answer = prompt('Play again? [y/n]');
    switch (answer) {
      case 'y':
        const newField = new Field(Field.generateField(10, 10, 30));
        newField.playGame();
        break;
      case 'n':
        term.yellow();
        console.log('OK. Goodbye!');
        term.defaultColor();
        break;
      default:
        term.red();
        console.log('Invalid entry');
        term.defaultColor();
        this.playAgain();
    }
  }

  addHoles() {
    //get path location
    const pathRowNum = this.playerLocationY;
    const pathColumnNum = this.playerLocationX;
    //get hat location
    let hatRowNum;
    let hatColumnNum;
    this.field.forEach(line => {
      if (line.includes(hat)) {
        hatColumnNum = line.indexOf(hat);
        hatRowNum = this.field.indexOf(line);
      }
    });
    //determine random location for new hole
    let holeRowNum = Math.floor(Math.random() * this.field.length);
    let holeColumnNum = Math.floor(Math.random() * this.field[0].length);
    //make sure hole location is not a path or hat; if so, get new location
    while ((holeRowNum === hatRowNum && holeColumnNum === hatColumnNum) || (holeRowNum === pathRowNum && holeColumnNum === pathColumnNum)) {
      holeRowNum = Math.floor(Math.random() * this.field.length);
      holeColumnNum = Math.floor(Math.random() * this.field[0].length);
    }
    //add new hole to field
    this.field[holeRowNum].splice(holeColumnNum, 1, hole);
  }

  isValidField() {
    let field = this.field;
    //set up field to mark 'visited' locations
    let visited = [];
    for (let row = 0; row < field.length; row++) {
      let newLine = [];
      for (let col = 0; col < field[0].length; col++) {
        newLine.push(false);
      }
      visited.push(newLine);
    }
    //determine player starting location
    this.setPlayerLocation();
    let x = this.playerLocationX;
    let y = this.playerLocationY;
    const xMax = field[0].length - 1;
    const yMax = field.length - 1;
    // determine if location is a hat or hole - return true for hat, false for hole
    const findPath = (x, y) => {
      if (field[y][x] === hat) {
        return true;
      }
      if (field[y][x] === hole || visited[y][x]) {
        return false;
      }
      //mark location as visited
      visited[y][x] = true;
      //check nearby paths, continue looping findPath function until all paths are exhausted
      if (y !== 0) {
        if (findPath(x, y-1)) {
          return true;
        }
      }
      if (y !== yMax) {
        if (findPath(x, y+1)) {
          return true;
        }
      }
      if (x !== 0) {
        if (findPath(x-1, y)) {
          return true;
        }
      }
      if (x !== xMax) {
        if (findPath(x+1, y)) {
          return true;
        }
      }
      //if no paths are found, return false
      return false;
    }
    //start findPath function loop here
    return findPath(x, y);
  }


  static generateField(height, width, holePercentage) {
    const field = [];
    //set locations for hole and field characters
    for (let i = 0; i < height; i++) {
      const line = [];
      for (let i = 0; i < width; i++) {
        let randomNumber = Math.floor(Math.random() * 100) + 1;
        if (randomNumber > holePercentage) {
          line.push(fieldCharacter);
        } else {
          line.push(hole);
        }
      }
      field.push(line);
    }
    //set location for path character
    const pathRowNum = Math.floor(Math.random() * height);
    const pathColumnNum = Math.floor(Math.random() * width);
    //set location for hat
    let hatRowNum = Math.floor(Math.random() * height);
    let hatColumnNum = Math.floor(Math.random() * width);
    //make sure hat location is different from path location
    while (pathRowNum === hatRowNum && pathColumnNum === hatColumnNum) {
      hatRowNum = Math.floor(Math.random() * height);
      hatColumnNum = Math.floor(Math.random() * width);
    }
    //add path and hat characters to field
    field[pathRowNum].splice(pathColumnNum, 1, pathCharacter);
    field[hatRowNum].splice(hatColumnNum, 1, hat);
    return field;
  }

}

//set up new field
let myField = new Field(Field.generateField(10, 10, 30))
//make sure field is solvable
while (!myField.isValidField()) {
  let myField = new Field(Field.generateField(10, 10, 30));
}
//start game
myField.playGame();
