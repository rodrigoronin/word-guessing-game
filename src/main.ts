import './style.css'

const nodeList: NodeListOf<HTMLElement> = document.querySelectorAll('.letter-box');
const chars: HTMLElement[] = [...nodeList];
let counter: number = 0;
let wordBuffer: string = '';
let wordSize: number = 5;

const handleInput = (input: KeyboardEvent): void => {
  writeChar(input);

  if (input.key === 'Enter' && wordBuffer.length === wordSize) {
    validateWord();
  }
}

const writeChar = (input: KeyboardEvent) => {
  const regex: RegExp = new RegExp('^[a-zA-Z]+$');

  if (input.key.length === 1 && regex.test(input.key)) {
    for (let i = 0; i < chars.length; i++) {
      if (!chars[i].textContent && wordBuffer.length < wordSize) {
        chars[i].textContent = input.key;
        wordBuffer += input.key;
        counter++;

        break;
      }
    }
  }
}

const validateWord = () => {
  console.log(wordBuffer);
  wordBuffer = '';
}

document.addEventListener('keyup', handleInput, false);
