import './style.css'

interface Word {
  word: string;
  puzzleNumber: number;
}

const nodeList: NodeListOf<HTMLElement> = document.querySelectorAll('.letter-box');
const chars: HTMLElement[] = [...nodeList];
let currentIndex: number = 0;
let wordBuffer: string = '';
let wordSize: number = 5;
let letterBoxIndex: number = 0;

// break the nodeslist into smaller arrays
const chunkArray = <T>(array: T[], size: number): T[][] => {
  const result: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}

const letterBoxes: HTMLElement[][] = chunkArray(chars, 5);

const getWord = async (): Promise<Word> => {
  const wordFetch: Response = await fetch('https://words.dev-apis.com/word-of-the-day?puzzle=10');
  const word: Word = await wordFetch.json();

  return word;
}

const word: Word = await getWord();

console.log(word);

const handleInput = (input: KeyboardEvent): void => {
  writeChar(input);

  if (input.key === 'Enter' && wordBuffer.length === wordSize) {
    validateWord();
  }

  if (input.key === 'Backspace') {
    eraseChar();
  }
}

const writeChar = (input: KeyboardEvent): void => {
  const regex: RegExp = new RegExp('^[a-zA-Z]+$');

  if (input.key.length === 1 && regex.test(input.key)) {
    for (let i = 0; i < chars.length; i++) {
      if (!chars[i].textContent && wordBuffer.length < wordSize) {
        chars[i].textContent = input.key.toUpperCase();
        wordBuffer += input.key;
        currentIndex = i;

        break;
      }
    }
  }
}

const validateWord = () => {
  if (wordBuffer === word.word) {
    console.log('You win!');
  }

  for (let i = 0; i < word.word.length; i++) {
    const letter = word.word[i];

    for (let j = 0; j < wordBuffer.length; j++) {
      const guess = wordBuffer[j];

      if (word.word.indexOf(guess) === -1) {
        console.log(guess, ' absent');
      }

      if (guess === letter && i === j) {
        letterBoxes[letterBoxIndex][j].style.backgroundColor = 'green';
        console.log(guess, ' correct');
      }

      if (guess === letter && i !== j) {
        console.log(guess, ' misplaced');
      }
    }
  }

  wordBuffer = '';
  letterBoxIndex++;
}

const eraseChar = (): void => {
  if (wordBuffer.length > 0) {
    const slicedWord: string = wordBuffer.slice(0, -1);
    wordBuffer = slicedWord;

    chars[currentIndex].textContent = '';
    currentIndex--;
  }
}

document.addEventListener('keyup', handleInput, false);
