import './style.css'

interface Word {
  word: string;
  puzzleNumber: number;
}

const nodeList: NodeListOf<HTMLElement> = document.querySelectorAll('.letter-box');
const chars: HTMLElement[] = [...nodeList];
let currentIndex: number = 0; // used to erase letters
let userGuess: string = '';
let wordSize: number = 5;
let currentLetterRow: number = 0;

// break the nodeslist into smaller arrays
const chunkArray = <T>(array: T[], size: number): T[][] => {
  const result: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}

const letterRows: HTMLElement[][] = chunkArray(chars, 5);

const getSecretWord = async (): Promise<String> => {
  const wordFetch: Response = await fetch('https://words.dev-apis.com/word-of-the-day?random=1');
  const { word }: Word = await wordFetch.json();

  return word;
}

const checkValidGuess = async (guess: string): Promise<Boolean> => {
  const request: Response = await fetch('https://words.dev-apis.com/validate-word', {
    method: 'POST',
    body: JSON.stringify({ word: guess })
  });

  const { validWord } = await request.json();

  console.log(validWord);

  return validWord;
}

const stringMapper = (word: String): Map<string, number> => {
  const mappedObject = new Map<string, number>;

  for (let i = 0; i < word.length; i++) {
    const letter: string = word[i];

    if (mappedObject.get(letter)) {
      mappedObject.set(letter, (mappedObject.get(word[i]) || 0) + 1);
    } else {
      mappedObject.set(letter, 1);
    }
  }

  return mappedObject;
}

async function init() {
  const dailyWord: String = await getSecretWord();

  function handleInput(input: KeyboardEvent): void {
    const regex: RegExp = new RegExp('^[a-zA-Z]$');

    if (input.key === 'Enter' && userGuess.length === wordSize) {
      validateWord();
    } else if (input.key === 'Backspace') {
      eraseLetter();
    } else if (regex.test(input.key)) {
      writeLetter(input);
    }
  }

  const writeLetter = (input: KeyboardEvent): void => {
    for (let i = 0; i < chars.length; i++) {
      if (!chars[i].textContent && userGuess.length < wordSize) {
        chars[i].textContent = input.key.toUpperCase();
        userGuess += input.key;
        currentIndex = i;

        break;
      }
    }
  }

  const eraseLetter = (): void => {
    if (userGuess.length > 0) {
      const slicedWord: string = userGuess.slice(0, -1);
      userGuess = slicedWord;

      chars[currentIndex].textContent = '';
      currentIndex--;
    }
  }

  const validateWord = async () => {
    const mappedDailyWord: Map<string, number> = stringMapper(dailyWord);
    const isValid: Boolean = await checkValidGuess(userGuess);

    checkValidGuess(userGuess);

    if (userGuess === dailyWord) {
      console.log('You win!');
    }

    if (!isValid) {
      console.log(`${userGuess} is not a valid word`);

      for (let i = 0; i < dailyWord.length; i++) {
        letterRows[currentLetterRow][i].style.backgroundColor = 'black';
        letterRows[currentLetterRow][i].style.color = 'white';
      }

      userGuess = '';
      currentLetterRow++;

      return;
    }

    // Check for all correct letters first to make sure the letter
    // count will be right for the next loop
    for (let i = 0; i < dailyWord.length; i++) {
      const currentLetterQnt: number = mappedDailyWord.get(userGuess[i]) ?? 0;

      if (userGuess[i] === dailyWord[i]) {
        letterRows[currentLetterRow][i].style.backgroundColor = 'green';
        mappedDailyWord.set(userGuess[i], currentLetterQnt - 1);
      }
    }

    // After correct guesses are verified, validate the wrong and absent
    for (let i = 0; i < dailyWord.length; i++) {
      const currentLetterQnt: number = mappedDailyWord.get(userGuess[i]) ?? 0;

      if (userGuess[i] === dailyWord[i]) {
        // chill
      } else if (dailyWord.includes(userGuess[i]) && currentLetterQnt > 0) {
        letterRows[currentLetterRow][i].style.backgroundColor = 'yellow';
        mappedDailyWord.set(userGuess[i], currentLetterQnt - 1);
      } else {
        letterRows[currentLetterRow][i].style.backgroundColor = 'black';
        letterRows[currentLetterRow][i].style.color = 'white';
      }
    }

    userGuess = '';
    currentLetterRow++;
  }

  document.addEventListener('keyup', handleInput, false);
}

init();
