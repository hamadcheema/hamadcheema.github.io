let turn = "X";
let gameOver = false;


const changeTurn = () => {
  return turn === "X" ? "0" : "X";
}

// check the win
const checkWin = () => {
  let boxText = document.getElementsByClassName("boxtext");
  let wins = [
    [0, 1, 2, 0.9, 7, 0, 30],
    [3, 4, 5, 0.9, 117, 0, 30],
    [6, 7, 8, 0.9, 27, 0, 30],
    [0, 3, 6, -9, 16.6, 90, 30],
    [1, 4, 7, 1, 16.6, 90, 30],
    [2, 5, 8, 11, 16.6, 90, 30],
    [0, 4, 8, -5, 16.7, 45, 42],
    [2, 4, 6, -5, 16.7, 315, 42]
  ]
  wins.forEach(e => {

    if (boxText[e[0]].innerHTML === boxText[e[1]].innerHTML && boxText[e[0]].innerHTML === boxText[e[2]].innerHTML && boxText[e[0]].innerHTML !== "") {
      gameOver = true;
      document.getElementsByClassName("info")[0].innerHTML = boxText[e[0]].innerHTML + " won";
      document.getElementsByClassName("line")[0].style.width = `${e[6]}vw`
      document.getElementsByClassName("line")[0].style.transform = `translate(${e[3]}vw,${e[4]}vw) rotate(${e[5]}deg)`
      document.getElementsByClassName("info")[0].classList.add("font-large")
    }
  })
  if (gameOver) {
    turn = "";
  }
}


// Game logic
let boxes = document.getElementsByClassName("box");
Array.from(boxes).forEach(element => {

  let boxText = element.querySelector(".boxtext");
  element.addEventListener("click", () => {
    if (boxText.innerHTML == "") {
      boxText.innerHTML = turn;
      turn = changeTurn();
      changeTurn()
      if (!gameOver) {
        document.getElementsByClassName("info")[0].innerHTML = "Turn for " + turn;
      }
      checkWin();
    }
  })

})

reset.addEventListener("click", () => {
  if (gameOver) {
    resetGame();

  } else {
    if (confirm("do you really want to reset the game")) {
      resetGame();
    }
  }
})
function resetGame() {
  let boxtext = document.getElementsByClassName("boxtext");
  Array.from(boxtext).forEach(element => {
    element.innerHTML = "";
    turn = "X"
    gameOver = false
    document.getElementsByClassName("line")[0].style.width = "0vw";
    document.getElementsByClassName('info')[0].innerHTML = "Turn for " + turn;

  })
}