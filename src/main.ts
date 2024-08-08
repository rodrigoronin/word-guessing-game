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

const getWord = async (): Promise<Word> => {
  const wordFetch: Response = await fetch('https://words.dev-apis.com/word-of-the-day');
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
        chars[i].textContent = input.key;
        wordBuffer += input.key;
        currentIndex = i;
        console.log(currentIndex);

        break;
      }
    }
  }
}

const validateWord = () => {
  if (wordBuffer === word.word) {
    console.log('You win!');
  }
  console.log(wordBuffer);
  wordBuffer = '';
}

const eraseChar = (): void => {
  if (wordBuffer.length > 0) {
    const slicedWord: string = wordBuffer.slice(0, -1);
    wordBuffer = slicedWord;

    chars[currentIndex].textContent = '';
    currentIndex--;
    console.log(wordBuffer);
  }
}

document.addEventListener('keyup', handleInput, false);
