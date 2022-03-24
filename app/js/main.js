(function () {
  class Card {
    constructor(suit, point) {
      this.suit = suit;
      this.point = point;
    }
  }

  class Deck {
    constructor() {
      this.cards = [];
      this.create();
    }
    create() {
      const suits = ["diamonds", "clubs", "hearts", "spades"];
      for (let a = 0; a < 13; a++) // points (11 is Jack, 12 is Queen etc.)
        for (let b = 0; b < 4; b++)
          this.cards[b * 13 + a] = new Card(suits[b], a + 2);
    }
    shuffle() {
      for (let i = 0; i < 52; i++) {
        let r = random(0, 51);
        let t = this.cards[i];
        this.cards[i] = this.cards[r];
        this.cards[r] = t;
      }
    }
    getTopCard() {
      return this.cards.pop();
    }
    distribution() {
      for (let i = 0; i < 5; i++)
        player.cards[i] = deck.getTopCard();
    }
  }

  class Player {
    constructor(name, dollars) {
      this.name = name;
      this.dollars = dollars;
      this.currentBet = 10000;
      this.cards = [];
    }
  }

  async function delay(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  function random(min, max) {
    let r = min + Math.random() * (max + 1 - min);
    return Math.floor(r);
  }

  function setStartValues() {
    const startBalance = 50000;
    player = new Player("Player", startBalance);
    refresh();
    newDistribution = true;
    balance.innerHTML = startBalance;
    switchBetLine(1);
    prevSlideBtn.disabled = false;
    nextSlideBtn.disabled = false;
    for (let btn of holdButtons)
      btn.disabled = true;
  }

  function checkCombination() {
    sortByPoints();
    sortBySuits();

    let k = 0;
    let combination = { name: "nothing", id: 0 };

    // flush and royal flush check:
    while (k < 4 && player.cards[k].suit === player.cards[k + 1].suit)
      k++;
    if (k === 4) {
      combination.name = "flush";
      combination.id = 5;
      if (player.cards[4].point === 14 && player.cards[0].point === 10) {
        combination.name = "royal flush";
        combination.id = 9;
        return combination;
      }
    }

    // straight check:
    sortByPoints();
    k = 0;
    while (k < 4 && player.cards[k].point === player.cards[k + 1].point - 1)
      k++;
    if (k === 4) {
      if (combination.name === "flush") {
        combination.name = "straight flush";
        combination.id = 8;
        return combination;
      }
      else {
        combination.name = "straight";
        combination.id = 4;
        return combination;
      }
    }

    let countOfDuplicates = getCountOfDuplicates();
    let countOfDuplicatesValues = Object.values(countOfDuplicates);

    if (countOfDuplicatesValues.includes(4)) {
      combination.name = "four of a kind";
      combination.id = 7;
      return combination;
    }
    if (countOfDuplicatesValues.includes(3)) {
      if (countOfDuplicatesValues.includes(2)) {
        combination.name = "full house";
        combination.id = 6;
        return combination;
      }
      else {
        combination.name = "three of a kind";
        combination.id = 3;
        return combination;
      } // there is no situation when flush or straight exist with three, so we can return three value before the next check
    }
    if (combination.name === "flush" || combination.name === "straight")
      return combination;

    let valuesEqualToTwo = countOfDuplicatesValues.filter(item => item === 2);
    if (valuesEqualToTwo.length === 2) {
      combination.name = "two pairs";
      combination.id = 2;
      return combination;
    }
    for (let i = 4; i > 0; i--) {
      if (player.cards[i].point === player.cards[i - 1].point && player.cards[i].point > 10) {
        combination.name = "jacks or better";
        combination.id = 1;
        return combination;
      }
    }

    return combination;
  }

  function sortByPoints() {
    player.cards.sort((a, b) => (a.point - b.point));
  }

  function sortBySuits() {
    player.cards.sort((a, b) => (a.suit.localeCompare(b.suit)));
  }

  function getCountOfDuplicates() {
    let count = player.cards.reduce((acc, item) => {
      acc[item.point] = acc[item.point] ? acc[item.point] + 1 : 1;
      return acc;
    }, {});
    return count;
  }

  const cards = document.querySelectorAll('.card');

  function cardRender(i) {
    let points = cards[i].querySelectorAll('.point');
    let suits = cards[i].querySelectorAll('.suit');
    const HTMLpoint = getHTMLpoint(i);
    const HTMLsuit = getHTMLsuit(i);
    const color = getSuitColor(i);
    for (let point of points) {
      point.innerHTML = HTMLpoint;
      if (color === "red")
        point.classList.add("red");
      else point.classList.remove("red");
    }
    for (let suit of suits) {
      suit.setAttribute("src", "images/icons/" + HTMLsuit);
    }
  }

  function getHTMLsuit(index) {
    switch (player.cards[index].suit) {
      case "clubs":
        return "club.svg";
      case "diamonds":
        return "diamond.svg";
      case "hearts":
        return "heart.svg";
      case "spades":
        return "spade.svg";
    }
  }

  function getHTMLpoint(index) {
    switch (player.cards[index].point) {
      case 10:
        return "="; // 10 in card chars font (1-stroke symbol)
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      case 14:
        return "A";
      default:
        return player.cards[index].point;
    }
  }

  function getSuitColor(index) {
    if (player.cards[index].suit === "diamonds" || player.cards[index].suit === "hearts")
      return "red";
    else return "black";
  }

  async function changeCards() {
    if (holdingCards.length === 5)
      return;

    for (let i = 0; i < 5; i++)
      if (!holdingCards.includes(i))
        cards[i].classList.remove("flip");
    await delay(500);
    for (let i = 0; i < 5; i++) {
      if (!holdingCards.includes(i)) {
        player.cards[i] = deck.getTopCard();
        cardRender(i);
      }
    }
    await delay(200);
    for (let i = 0; i < 5; i++)
      flipCard(i);
  }

  function flipCard(index) {
    cards[index].classList.add("flip");
  }

  function flipCardsBack() {
    for (let i = 0; i < 5; i++)
      cards[i].classList.remove("flip");
  }

  const combinationTable = document.querySelector(".combinations");

  function highlightWinningCell(combination, coin) {
    if (combination.id === 0)
      return;
    combinationTable.rows[9 - combination.id].cells[coin].classList.add("winning");
  }

  function switchBetLine(index) {
    for (let row of combinationTable.rows)
      for (let cell of row.cells)
        cell.classList.remove("active-line");

    for (let row of combinationTable.rows)
      row.cells[index].classList.add("active-line");
  }

  function refreshControlButtons() {
    for (let btn of holdButtons)
      btn.classList.remove("active");
    holdingCards.length = 0;
  }

  function refreshCells() {
    for (let row of combinationTable.rows)
      for (let cell of row.cells)
        cell.classList.remove("winning");
  }

  function refresh() {
    refreshControlButtons();
    refreshCells();
    flipCardsBack();
  }

  const balance = document.querySelector(".balance");

  function calculateResult(combination, coin) {
    let result = 0;
    if (combination.id === 0) {
      result = -player.currentBet;
      player.dollars -= player.currentBet;
      while (betSlides[currentIndex].textContent > player.dollars && currentIndex > 0) {
        showBet(currentIndex - 1);
        switchBetLine(currentIndex + 1);
      }
    }
    else {
      let coeff = combinationTable.rows[9 - combination.id].cells[coin].textContent;
      result = player.currentBet * coeff - player.currentBet;
      player.dollars += result;
    }
    balance.innerHTML = player.dollars;
    showResult(result);
    checkBankruptcy();
  }

  async function checkBankruptcy() {
    if (player.dollars === 0) {
      await delay(1700);
      showModal();
    }
  }

  const restartModal = document.querySelector(".over-modal");
  const restartBtn = document.querySelector(".restart");

  restartBtn.addEventListener("click", () => {
    restartModal.classList.remove("active");
    startGame();
  });

  function showModal() {
    restartModal.classList.add("active")
  }

  const payout = document.querySelector(".payout");
  const payoutText = document.querySelector(".payout .text");
  const payoutNumber = document.querySelector(".payout .number");

  function showResult(result) {
    if (result >= 0)
      payoutText.innerHTML = "Payout:";
    else
      payoutText.innerHTML = "You lose:";
    payoutNumber.innerHTML = "$" + Math.abs(result);
    payout.classList.add("active");
    setTimeout(() => payout.classList.remove("active"), 1700);
  }

  const betSlides = document.querySelectorAll(".bet-item");
  let currentIndex = 0;

  function showBet(index) {
    betSlides[currentIndex].classList.remove("active");
    betSlides[index].classList.add("active");
    player.currentBet = betSlides[index].textContent;
    currentIndex = index;
  }

  let prevSlideBtn = document.querySelector(".bet-prev");
  let nextSlideBtn = document.querySelector(".bet-next");

  prevSlideBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
      showBet(currentIndex - 1);
      switchBetLine(currentIndex + 1);
    }
  });

  nextSlideBtn.addEventListener("click", () => {
    if (currentIndex < betSlides.length - 1 && player.dollars >= betSlides[currentIndex + 1].textContent) {
      showBet(currentIndex + 1);
      switchBetLine(currentIndex + 1);
    }
  });

  let holdingCards = [];
  let holdButtons = [...document.querySelectorAll('.hold-button')];

  for (let btn of holdButtons) {
    btn.addEventListener("click", function () {
      let cardNum = holdButtons.indexOf(this);
      this.classList.toggle("active");
      if (!holdingCards.includes(cardNum))
        holdingCards.push(cardNum);
      else
        holdingCards.splice(holdingCards.indexOf(cardNum), 1);
    });
  }

  const dealBtn = document.querySelector('.deal-button');
  let newDistribution = true;

  dealBtn.addEventListener("click", async function () {
    this.disabled = true;
    setTimeout(() => { this.disabled = false }, 2300);
    if (newDistribution) {
      refresh();
      await newRound();
      newDistribution = false;
    }
    else {
      await changeCards();
      let combination = checkCombination();
      await delay(600);
      highlightWinningCell(combination, currentIndex + 1);
      calculateResult(combination, currentIndex + 1);
      newDistribution = true;
    }
    for (let btn of holdButtons)
      btn.disabled = !btn.disabled;
    prevSlideBtn.disabled = !prevSlideBtn.disabled;
    nextSlideBtn.disabled = !nextSlideBtn.disabled;
  });

  let deck;
  let player;

  async function newRound() {
    deck = new Deck;
    deck.shuffle();
    deck.distribution();

    await delay(700);
    for (let i = 0; i < 5; i++) {
      cardRender(i);
      flipCard(i);
    }
  }

  function startGame() {
    setStartValues();
  }

  startGame();
})()