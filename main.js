const prompt = require('prompt-sync')({sigint: true});

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';

class Field {
  constructor(field) {
    this.field = field;
    this.playerLocationX;
    this.playerLocationY;
    this.mode;
  }

  setPlayerLocation() {
    this.field.forEach(line => {
      if (line.includes(pathCharacter)) {
        this.playerLocationX = line.indexOf(pathCharacter);
        this.playerLocationY = this.field.indexOf(line);
      }
    });
  }

  print() {
    this.field.forEach(line => {
      console.log(line.join(''));
    });
  }

  getDirection() {
    let direction = prompt('Which direction? u/d/r/l');
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
        console.log('Invalid entry');
    }
  }

  testForGameEnd() {
    const currentLocation = this.field[this.playerLocationY][this.playerLocationX];
    if (!currentLocation || currentLocation === hole) {
      console.log('Computer wins!');
      this.playAgain();
    } else if (currentLocation === hat) {
      console.log('You win!');
      this.playAgain();
    } else {
      this.field[this.playerLocationY].splice(this.playerLocationX, 1, pathCharacter);
      if (this.mode === 'hard') {
        this.addHoles();
      }
      this.playGame();
    }
  }

  playGame() {
    if (this.mode === undefined) {
      let answer = prompt('easy or hard mode? e/h');
      switch (answer) {
        case 'e':
          this.mode = 'easy';
          break;
        case 'h':
          this.mode = 'hard';
          break;
        default:
          console.log('Invalid entry');
          this.playGame();
      }
    }
    if (this.playerLocationX === undefined) {
      this.setPlayerLocation();
    }
    this.print();
    this.getDirection();
    this.testForGameEnd();
  }

  playAgain() {
    let answer = prompt('Play again? y/n');
    switch (answer) {
      case 'y':
        const newField = new Field(Field.generateField(10, 10, 30));
        newField.playGame();
        break;
      case 'n':
        console.log('OK');
        break;
      default:
        console.log('Invalid entry');
        this.playAgain();
    }
  }

  addHoles() {
    const pathRowNum = this.playerLocationY;
    const pathColumnNum = this.playerLocationX;

    let hatRowNum;
    let hatColumnNum;
    this.field.forEach(line => {
      if (line.includes(hat)) {
        hatColumnNum = line.indexOf(hat);
        hatRowNum = this.field.indexOf(line);
      }
    });

    let holeRowNum = Math.floor(Math.random() * this.field.length);
    let holeColumnNum = Math.floor(Math.random() * this.field[0].length);

    while ((holeRowNum === hatRowNum && holeColumnNum === hatColumnNum) || (holeRowNum === pathRowNum && holeColumnNum === pathColumnNum)) {
      holeRowNum = Math.floor(Math.random() * this.field.length);
      holeColunmNum = Math.floor(Math.random() * this.field[0].length);
    }

    this.field[holeRowNum].splice(holeColumnNum, 1, hole);
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

const myField = new Field(Field.generateField(10, 10, 30));

myField.playGame();
