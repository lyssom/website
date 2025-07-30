requestAnimationFrame(scrollAnimation);

const gear = document.getElementById("gear");
const skill = document.getElementById("skill-slider");

const skills = ["web", "css", "html", "javascript", "troubleshooting", "creative", "debugging", "training", "advertising"];

const characters = "abcdefghijklmnopqrstuvwxyz";

function scrollAnimation() {
  requestAnimationFrame(scrollAnimation);
  gear.style.transform = `rotate(${window.scrollY / 1000 * 360}deg)`;
}

let targetText = "web";
let currentText = "web";
const NEW_CHARACTER_RATE = 100; // milliseconds per character
const CHARACTER_CYCLE_RATE = 50;
const TIME_BETWEEN_TEXT_CHANGES = 2000;
let timeSinceLastNewCharacter = 0;
let timeSinceLastCycle = 0;
let timeSinceLastNewText = 1000;
let skillIndex = 0;

let lastFrameTime;
function textAnimation(time) {
  requestAnimationFrame(textAnimation);
  if(!lastFrameTime) {
    lastFrameTime = time;
  }
  
  let dt = time - lastFrameTime;
  
  if(currentText === targetText) {
    timeSinceLastNewText += dt;
    if(timeSinceLastNewText > TIME_BETWEEN_TEXT_CHANGES) {
      targetText = skills[(skillIndex++) % skills.length];
      timeSinceLastNewText = 0;
    }
  }
  
  
  if(currentText.length !== targetText.length) {
    timeSinceLastNewCharacter += dt;
    if(timeSinceLastNewCharacter > NEW_CHARACTER_RATE) {
      timeSinceLastNewCharacter = 0;
      if(currentText.length > targetText.length) {
        currentText = currentText.slice(0, -1);
      }
      else {
        currentText += characters[Math.floor(Math.random() * characters.length)];
      }
    }
  }
  
  if(timeSinceLastCycle > CHARACTER_CYCLE_RATE) {
    timeSinceLastCycle = 0;
    let letters = currentText.split("");
    letters.forEach((letter, index) => {
      if(letter !== targetText[index]) {
        let alphabetIndex = characters.indexOf(letter);
        let nextIndex = (alphabetIndex + 1) % characters.length;
        letters[index] = characters[nextIndex];
      }
    });
    currentText = letters.join("");
  }
  timeSinceLastCycle += dt;
  
  lastFrameTime = time;
  
  skill.innerHTML = currentText;
}

requestAnimationFrame(textAnimation);