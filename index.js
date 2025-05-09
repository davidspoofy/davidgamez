var lazyLoad = new LazyLoad();

var gamesJson = [];
var searchedGamesJson = [];
var currentPage = 0;

var gamesDiv = document.getElementById("games-container")

const pageSize = 50;

const REPO = "https://cdn.jsdelivr.net/gh/BradleyLikesCoding/thingy@main/";

function showLoading() {
  document.getElementsByClassName("loading-cover")[0].style.display = "flex";
}

function hideLoading() {
  document.getElementsByClassName("loading-cover")[0].style.display = "none";
}

async function generateGameCode(gameID) {
  var res = await fetch(REPO + "semag/" + gameID + "/index.html");
  if (res.ok) {
    return (modifyHTML(await res.text(), gameID));
  } else {
    throw new Error("Error Fetching Game - Error Code " + res.status);
  }
}

function modifyHTML(code, gameID) {
  var code = code.replace('<head>', `<head><base href="${REPO + "semag/" + gameID}/">`);
  code = code.replace(/(href|src)="\/([^"]*)"/g, (match, attr, path) => {
    return `${attr}="${REPO + path}"`;
  });
  return code;
}

function throwError(error) {
  alert(error);
}

async function openGame(gameID) {
  showLoading();
  try {
    var htmlCode = await generateGameCode(gameID);
    var win = window.open("about:blank");
    win.document.open();
    win.document.write(htmlCode);
    win.document.close();
  } catch (err) {
    throwError("Error Opening Game: " + err.message);
  }
  hideLoading();
}

async function loadGames() {
  //try {
  const res = await fetch(REPO + "data/games.json");
  if (!res.ok) throw new Error("Failed to fetch games list");
  const games = await res.json();
  gamesJson = games;
  searchedGamesJson = gamesJson;
  currentPage = 0;
  setPageArrows();
  setGames(0);
  /*const gameList = document.createElement("ul");
  games.forEach(game => {
    const listItem = document.createElement("li");
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = game.name;
    link.onclick = () => openGame(game.directory);
    listItem.appendChild(link);
    gameList.appendChild(listItem);
  });

  document.getElementById("loading").remove();
  document.body.appendChild(gameList);*/
  //} catch (err) {
  //  throwError("Error Loading Games: " + err.message);
  //}
}

function getGameHTML(game) {
  return (`
  <div class="game" onclick="openGame('${game["directory"]}')">
    <div class="game-image-container">
      <img class="game-image lazy" src="${REPO + "semag/" + game["directory"] + "/" + game["image"]}">
    </div>
    <p class="game-title">
      ${game["name"]}
    </p>
  </div>
  `);
}

function setGames(page) {
  var html = '<div class="game-row">';
  for (var i = page * pageSize; i < searchedGamesJson.length; i++) {
    html += getGameHTML(searchedGamesJson[i]);
    if (((1 + i) - (page * pageSize)) % 5 == 0) html += '</div><div class="game-row">';
    if (i - (page * pageSize) == pageSize - 1) break;
  }
  gamesDiv.innerHTML = html + '</div>';
  if (!gamesDiv.childNodes[gamesDiv.childNodes.length - 1].hasChildNodes()) gamesDiv.childNodes[gamesDiv.childNodes.length - 1].remove();
  lazyLoad.update();
}

function searchGames(e) {
  currentPage = 0;
  setPageArrows();
  games = []
  for (var i = 0; i < gamesJson.length; i++) {
    if (gamesJson[i]["name"].toLowerCase().search(e.value.toLowerCase()) != -1) games.push(gamesJson[i]);
  }
  searchedGamesJson = games;
  setPageArrows();
  setGames(currentPage);
}

function setPageArrows() {
  var maxPage = getPageCount() - 1;
  if (currentPage < 0) currentPage = 0;
  if (currentPage > maxPage) currentPage = maxPage;
  var pageNumbers = document.getElementsByClassName("page-number");
  pageNumbers[0].innerHTML = currentPage + 1;
  pageNumbers[1].innerHTML = currentPage + 1;
  var btns = document.getElementsByClassName("switch-page");
  if (currentPage == 0) { btns[0].style.visibility = "hidden"; btns[2].style.visibility = "hidden" } else { btns[0].style.visibility = "visible"; btns[2].style.visibility = "visible" };
  if (currentPage == maxPage) { btns[1].style.visibility = "hidden"; btns[3].style.visibility = "hidden" } else { btns[1].style.visibility = "visible"; btns[3].style.visibility = "visible" };
}

function getPageCount() {
  return Math.ceil(searchedGamesJson.length / pageSize);
}

function scrollToTopOfGames() {
  document.getElementsByClassName("main-div")[0].scroll({ top: 0, left: 0, behavior: "instant" });
}

loadGames();
