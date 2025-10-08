
// Configuración del juego
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const gameOverElement = document.getElementById("game-over");
const startButton = document.getElementById("start-btn");
const restartButton = document.getElementById("restart-btn");
const instructionsButton = document.getElementById("instructions-btn");
const instructionsModal = document.getElementById("instructions-modal");
const secretMessageModal = document.getElementById("secret-message-modal");
const closeBtn = document.querySelector(".close-btn");
const secretCloseBtn = document.querySelector(".secret-close-btn");

const gridSize = 25;
const tileCount = 20;

// Variables del juego
let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let gameInterval;
let gameRunning = false;
let gameSpeed = 200; // Velocidad inicial más lenta (200ms en lugar de 100ms)
let secretMessageShown = false;
let highScore = 0; // Para guardar la puntuación máxima de la sesión

// Colores
const snakeHeadColor = "#3d74b3";
const snakeBodyColors = ["#0a0140ff", "#3d74b3", "#2a237bff", "#0c0334ff"];
const foodColor = "#f1c40f";
const gridColor = "rgba(255, 255, 255, 0.05)";

// Sonidos
const eatSound = new Audio(
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=="
);
const gameOverSound = new Audio(
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=="
);

// Modal de instrucciones
closeBtn.addEventListener("click", () => {
  instructionsModal.style.display = "none";
});

secretCloseBtn.addEventListener("click", () => {
  secretMessageModal.style.display = "none";
});

instructionsButton.addEventListener("click", () => {
  instructionsModal.style.display = "flex";
});

// Crear modal de resumen
const summaryModal = document.createElement("div");
summaryModal.id = "summary-modal";
summaryModal.className = "modal";
summaryModal.style.display = "none";
summaryModal.innerHTML = `
  <div class="modal-content summary-modal-content">
    <button class="close-btn summary-close-btn">&times;</button>
    <div class="summary-message">
      <h2>¡Fin del juego!</h2>
      <div class="score-summary">
        <p>Tu puntuación: <span id="final-score">0</span></p>
        <p>Mejor puntuación: <span id="high-score">0</span></p>
      </div>
      <button id="play-again-btn" class="play-again-btn">Volver a jugar</button>
    </div>
  </div>
`;
document.body.appendChild(summaryModal);

const summaryCloseBtn = document.querySelector(".summary-close-btn");
const playAgainBtn = document.getElementById("play-again-btn");

summaryCloseBtn.addEventListener("click", () => {
  summaryModal.style.display = "none";
});

playAgainBtn.addEventListener("click", () => {
  summaryModal.style.display = "none";
  startGame();
});

window.addEventListener("click", (event) => {
  if (event.target === instructionsModal) {
    instructionsModal.style.display = "none";
  }
  if (event.target === secretMessageModal) {
    secretMessageModal.style.display = "none";
  }
  if (event.target === summaryModal) {
    summaryModal.style.display = "none";
  }
});

// Función para mostrar el mensaje secreto
function showSecretMessage() {
  if (!secretMessageShown) {
    secretMessageShown = true;
    secretMessageModal.style.display = "flex";

    // Crear efecto de confeti
    createConfetti();

    // Pausar el juego mientras se muestra el mensaje
    const wasPaused = !gameRunning;
    clearInterval(gameInterval);
    gameRunning = false;

    // Al cerrar, reanudar el juego si estaba en marcha
    secretCloseBtn.onclick = function () {
      secretMessageModal.style.display = "none";
      if (!wasPaused) {
        gameRunning = true;
        gameInterval = setInterval(gameLoop, gameSpeed);
      }
    };
  }
}

// Función para crear confeti
function createConfetti() {
  const confettiColors = [
    "#f1c40f",
    "#e74c3c",
    "#3498db",
    "#2ecc71",
    "#09249dff",
    "#f39c12",
  ];
  const confettiCount = 100;

  for (let i = 0; i < confettiCount; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.backgroundColor =
      confettiColors[Math.floor(Math.random() * confettiColors.length)];
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.animationDuration = Math.random() * 3 + 2 + "s";
    confetti.style.animationDelay = Math.random() * 2 + "s";
    document.body.appendChild(confetti);

    // Limpiar confeti después de la animación
    setTimeout(() => {
      document.body.removeChild(confetti);
    }, 5000);
  }
}

// Inicialización
function initGame() {
  // Inicializar la serpiente en el centro
  snake = [{ x: 10, y: 10 }];

  // Posición inicial (sin moverse)
  dx = 0;
  dy = 0;

  // Reiniciar puntuación
  score = 0;
  scoreElement.textContent = score;

  // Ocultar mensaje de game over
  gameOverElement.style.display = "none";
  summaryModal.style.display = "none";

  // Reiniciar el flag del mensaje secreto
  secretMessageShown = false;

  // Generar comida inicial
  generateFood();
}

// Generar comida en posición aleatoria
function generateFood() {
  let validPosition = false;
  let newFood;

  // Buscar posición que no coincida con la serpiente
  while (!validPosition) {
    newFood = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };

    validPosition = true;

    // Comprobar que no esté sobre la serpiente
    for (let segment of snake) {
      if (segment.x === newFood.x && segment.y === newFood.y) {
        validPosition = false;
        break;
      }
    }
  }

  food = newFood;
}

// Dibujar la cuadrícula
function drawGrid() {
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 0.5;

  for (let i = 0; i <= tileCount; i++) {
    // Líneas verticales
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.stroke();

    // Líneas horizontales
    ctx.beginPath();
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }
}

// Dibujar la serpiente con efecto degradado
function drawSnake() {
  snake.forEach((segment, index) => {
    const colorIndex = index % snakeBodyColors.length;
    ctx.fillStyle = index === 0 ? snakeHeadColor : snakeBodyColors[colorIndex];

    // Dibujar segmento redondeado
    const x = segment.x * gridSize;
    const y = segment.y * gridSize;
    const size = gridSize - 4;
    const radius = 8;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + size, y, x + size, y + size, radius);
    ctx.arcTo(x + size, y + size, x, y + size, radius);
    ctx.arcTo(x, y + size, x, y, radius);
    ctx.arcTo(x, y, x + size, y, radius);
    ctx.closePath();
    ctx.fill();

    // Añadir brillo en la cabeza
    if (index === 0) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.beginPath();
      ctx.arc(x + size / 3, y + size / 3, radius / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

// Dibujar la comida (estrella)
function drawStar(x, y, size, color) {
  const centerX = x;
  const centerY = y;
  const spikes = 5;
  const outerRadius = size;
  const innerRadius = size / 2;

  ctx.beginPath();
  ctx.fillStyle = color;

  let rot = (Math.PI / 2) * 3;
  let step = Math.PI / spikes;

  ctx.moveTo(centerX, centerY - outerRadius);

  for (let i = 0; i < spikes; i++) {
    ctx.lineTo(
      centerX + Math.cos(rot) * outerRadius,
      centerY + Math.sin(rot) * outerRadius
    );
    rot += step;
    ctx.lineTo(
      centerX + Math.cos(rot) * innerRadius,
      centerY + Math.sin(rot) * innerRadius
    );
    rot += step;
  }

  ctx.lineTo(centerX, centerY - outerRadius);
  ctx.closePath();
  ctx.fill();

  // Añadir brillo
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.beginPath();
  ctx.arc(
    centerX - innerRadius / 3,
    centerY - innerRadius / 3,
    innerRadius / 3,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

// Dibujar la comida
function drawFood() {
  const centerX = food.x * gridSize + gridSize / 2;
  const centerY = food.y * gridSize + gridSize / 2;
  const starSize = gridSize / 2;

  // Efecto de pulsación
  const pulseSize = starSize * (1 + Math.sin(Date.now() / 200) * 0.1);

  drawStar(centerX, centerY, pulseSize, foodColor);
}

// Mover la serpiente
function moveSnake() {
  // Si no hay movimiento, no hacer nada
  if (dx === 0 && dy === 0) return;

  // Obtener la posición actual de la cabeza
  const head = { x: snake[0].x, y: snake[0].y };

  // Calcular nueva posición
  head.x += dx;
  head.y += dy;

  // Comprobar colisión con los bordes
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver();
    return;
  }

  // Comprobar colisión con la propia serpiente
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver();
      return;
    }
  }

  // Añadir nueva cabeza al principio
  snake.unshift(head);

  // Comprobar si ha comido la comida
  if (head.x === food.x && head.y === food.y) {
    // Reproducir sonido
    try {
      eatSound.play();
    } catch (e) {
      console.log("No se pudo reproducir el sonido");
    }

    // Añadir efectos visuales
    showScoreAnimation();

    // Incrementar puntuación
    score += 50;
    scoreElement.textContent = score;

    // Comprobar si se alcanzó la puntuación para el mensaje secreto
    if (score === 8500) {
      // Cambiado a 500 para pruebas, en producción cambiar a 5000
      showSecretMessage();
    }

    // Generar nueva comida
    generateFood();

    // Aumentar velocidad cada 200 puntos (en lugar de 50)
    if (score % 200 === 0 && score > 0) {
      increaseSpeed();
    }
  } else {
    // Si no ha comido, eliminar la cola
    snake.pop();
  }
}

// Mostrar animación de puntuación
function showScoreAnimation() {
  const scoreAnim = document.createElement("div");
  scoreAnim.textContent = "+50";
  scoreAnim.style.position = "absolute";
  scoreAnim.style.color = "#f1c40f";
  scoreAnim.style.fontSize = "24px";
  scoreAnim.style.fontWeight = "bold";
  scoreAnim.style.zIndex = "100";
  scoreAnim.style.top = `${food.y * gridSize + canvas.offsetTop}px`;
  scoreAnim.style.left = `${food.x * gridSize + canvas.offsetLeft}px`;
  scoreAnim.style.textShadow = "0 0 5px rgba(0,0,0,0.5)";
  scoreAnim.style.transition = "all 0.5s ease-out";

  document.body.appendChild(scoreAnim);

  setTimeout(() => {
    scoreAnim.style.transform = "translateY(-30px)";
    scoreAnim.style.opacity = "0";
  }, 50);

  setTimeout(() => {
    document.body.removeChild(scoreAnim);
  }, 500);
}

// Aumentar la velocidad del juego
function increaseSpeed() {
  clearInterval(gameInterval);
  gameSpeed = Math.max(50, gameSpeed - 10);
  if (gameRunning) {
    gameInterval = setInterval(gameLoop, gameSpeed);
  }
}

// Game Over
function gameOver() {
  clearInterval(gameInterval);
  gameRunning = false;
  gameOverElement.style.display = "block";

  // Actualizar la puntuación máxima si es necesario
  if (score > highScore) {
    highScore = score;
  }

  // Actualizar el modal de resumen
  document.getElementById("final-score").textContent = score;
  document.getElementById("high-score").textContent = highScore;

  // Mostrar el modal de resumen
  setTimeout(() => {
    summaryModal.style.display = "flex";
  }, 1000);

  // Reproducir sonido
  try {
    gameOverSound.play();
  } catch (e) {
    console.log("No se pudo reproducir el sonido");
  }

  // Efecto de desvanecimiento
  gameOverElement.style.opacity = "0";

  setTimeout(() => {
    gameOverElement.style.transition = "opacity 0.5s ease";
    gameOverElement.style.opacity = "1";
  }, 100);
}

// Bucle principal del juego
function gameLoop() {
  // Limpiar el canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Dibujar la cuadrícula
  drawGrid();

  // Actualizar la posición de la serpiente
  moveSnake();

  // Dibujar elementos
  drawFood();
  drawSnake();
}

// Iniciar el juego
function startGame() {
  if (gameRunning) return;

  initGame();
  gameRunning = true;
  gameSpeed = 200; // Velocidad inicial más lenta
  gameInterval = setInterval(gameLoop, gameSpeed);
}

// Control por teclado
document.addEventListener("keydown", (event) => {
  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
  }

  if (!gameRunning && event.key === " ") {
    startGame();
    return;
  }

  if (!gameRunning) return;

  switch (event.key) {
    case "ArrowUp":
      if (dy !== 1) {
        // Evitar que se mueva hacia atrás
        dx = 0;
        dy = -1;
      }
      break;
    case "ArrowDown":
      if (dy !== -1) {
        dx = 0;
        dy = 1;
      }
      break;
    case "ArrowLeft":
      if (dx !== 1) {
        dx = -1;
        dy = 0;
      }
      break;
    case "ArrowRight":
      if (dx !== -1) {
        dx = 1;
        dy = 0;
      }
      break;
  }
});

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

initGame();

// También necesitarás añadir los estilos CSS para el nuevo modal
const style = document.createElement("style");
style.textContent = `
  .summary-modal-content {
    background-color: rgba(30, 30, 50, 0.95);
    border: 2px solid #3d74b3;
    box-shadow: 0 0 20px rgba(61, 116, 179, 0.7);
  }
  
  .score-summary {
    margin: 20px 0;
    font-size: 18px;
  }
  
  .play-again-btn {
    background-color: #3d74b3;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .play-again-btn:hover {
    background-color: #5a91d0;
  }
`;
document.head.appendChild(style);
