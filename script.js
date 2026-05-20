let currentUser = null;
let userData = {};
let fishCount = 0;

// Authentification
document.getElementById("registerForm").addEventListener("submit", function(e) {
  e.preventDefault();
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;
  let msg = document.getElementById("message");

  if(localStorage.getItem(username)) {
    msg.style.color = "red";
    msg.innerText = "⚠️ Ce nom d'utilisateur est déjà utilisé. Choisis-en un autre.";
    return;
  }

  localStorage.setItem(username, JSON.stringify({
    password: password,
    coins: 0,
    history: []
  }));

  msg.style.color = "green";
  msg.innerText = "✅ Inscription réussie ! Tu peux maintenant te connecter.";
});

document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();
  let username = document.getElementById("loginUsername").value;
  let password = document.getElementById("loginPassword").value;

  let data = JSON.parse(localStorage.getItem(username));
  if(data && data.password === password) {
    currentUser = username;
    userData = data;

    // Synchronisation immédiate
    localStorage.setItem(currentUser, JSON.stringify(userData));

    document.getElementById("authBox").style.display = "none";
    document.getElementById("welcomeBox").style.display = "block";
    document.getElementById("welcomeText").innerText = "Bienvenue " + username;
    updateInfo();
    loadHistory();
  } else {
    document.getElementById("message").style.color = "red";
    document.getElementById("message").innerText = "Nom d'utilisateur ou mot de passe incorrect.";
  }
});

document.getElementById("btnLogout").addEventListener("click", function() {
  currentUser = null;
  document.getElementById("welcomeBox").style.display = "none";
  document.getElementById("authBox").style.display = "block";
});

// Jeu
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
let scratchy = {x: 200, y: 150, size: 40, img: new Image()};
scratchy.img.src = "https://i.imgur.com/2y6Yz.png"; // sprite Scratchy
let fishes = [];
let fishImg = new Image();
fishImg.src = "https://i.imgur.com/3y6Yz.png"; // sprite poisson

function spawnFish() {
  fishes.push({
    x: Math.random() * 360,
    y: Math.random() * 260,
    size: 20
  });
}

function draw() {
  ctx.clearRect(0,0,400,300);
  ctx.drawImage(scratchy.img, scratchy.x, scratchy.y, scratchy.size, scratchy.size);
  fishes.forEach(f => {
    ctx.drawImage(fishImg, f.x, f.y, f.size, f.size);
  });
  document.getElementById("fishCount").innerText = fishCount;
}

document.addEventListener("keydown", function(e) {
  if(e.key === "ArrowUp") scratchy.y -= 10;
  if(e.key === "ArrowDown") scratchy.y += 10;
  if(e.key === "ArrowLeft") scratchy.x -= 10;
  if(e.key === "ArrowRight") scratchy.x += 10;
});

// Collision avec synchro active
function checkCollision() {
  fishes = fishes.filter(f => {
    if(Math.abs(scratchy.x - f.x) < 20 && Math.abs(scratchy.y - f.y) < 20) {
      fishCount++;
      document.getElementById("fishCount").innerText = fishCount;

      // Sauvegarde immédiate
      userData.coins = (userData.coins || 0) + 1;
      localStorage.setItem(currentUser, JSON.stringify(userData));

      return false;
    }
    return true;
  });
}

let gameInterval;

document.getElementById("btnPlay").addEventListener("click", function() {
  document.getElementById("welcomeBox").style.display = "none";
  document.getElementById("gameBox").style.display = "block";
  fishCount = 0;
  document.getElementById("fishCount").innerText = fishCount;
  document.getElementById("bgMusic").play();
  gameInterval = setInterval(() => {
    if(Math.random() < 0.05) spawnFish();
    checkCollision();
    draw();
  }, 200);
});

document.getElementById("btnExitGame").addEventListener("click", function() {
  clearInterval(gameInterval);
  document.getElementById("gameBox").style.display = "none";
  document.getElementById("welcomeBox").style.display = "block";

  // Historique sauvegardé
  userData.history.push("Poissons récoltés : " + fishCount);
  localStorage.setItem(currentUser, JSON.stringify(userData));

  updateInfo();
  loadHistory();
  document.getElementById("bgMusic").pause();
});

// Paramètres
document.getElementById("volumeControl").addEventListener("input", function() {
  document.getElementById("bgMusic").volume = this.value;
});

document.getElementById("mobileMode").addEventListener("change", function() {
  if(this.checked) {
    alert("Mode téléphone activé !");
  }
});

// Mise à jour infos
function updateInfo() {
  document.getElementById("infoCoins").innerText = "Total poissons : " + (userData.coins || 0);
}

function loadHistory() {
  let historyBox = document.getElementById("history");
  historyBox.innerHTML = "";
  (userData.history || []).forEach(item => {
    let p = document.createElement("p");
    p.innerText = item;
    historyBox.appendChild(p);
  });
}