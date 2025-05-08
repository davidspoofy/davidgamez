const REPO = "https://cdn.jsdelivr.net/gh/BradleyLikesCoding/thingy/"

async function generateGameCode(gameID) {
  try {
    var res = await fetch(REPO + "semag/" + gameID + "/index.html");
    if (res.ok) {
    	return(modifyHTML(await res.text(), gameID));
    } else {
    	throwError("Error Fetching Game - Error Code " + res.status);
    }
  } catch (err) {
    ThrowError("Error Fetching Game: " + err.message)
  }
}

function modifyHTML(code, gameID) {
	var code = code.replace('<head>', `<head><base href="${ REPO + "semag/" + gameID }/">`);
  code = code.replace(/(href|src)="\/([^"]*)"/g, (match, attr, path) => {
    return `${attr}="${ REPO + path }"`;
  });
	return code;
}

function throwError(error) {
	alert(error);
}

async function openGame(gameID) {
var htmlCode = await generateGameCode(gameID);
var win = window.open("about:blank");
win.document.open();
win.document.write(htmlCode);
win.document.close();
}

async function loadGames() {
  try {
    const res = await fetch(REPO + "data/games.json");
    if (!res.ok) throw new Error("Failed to fetch games list");
    const games = await res.json();

    const gameList = document.createElement("ul");
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
    document.body.appendChild(gameList);
  } catch (err) {
    throwError("Error Loading Games: " + err.message);
  }
}
loadGames();
