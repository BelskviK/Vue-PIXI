import { Application, Container, Graphics, Text, BlurFilter } from "pixi.js";

class GameUI {
  constructor() {
    this.balance = document.getElementById("balance");
    this.bet = document.getElementById("bet");
    this.multiplier = document.getElementById("multiplier");
    this.startButton = document.getElementById("start");
  }

  getBetAmount() {
    return parseInt(this.bet.value);
  }

  updateBalance(balance) {
    this.balance.textContent = balance;
  }

  updateMultiplier(multiplier) {
    this.multiplier.textContent = `${multiplier.toFixed(2)}x`;
  }

  onStartClick(callback) {
    this.startButton.onclick = callback;
  }
}

class GameCard extends Graphics {
  constructor(index, x, y, size, onFlipCallback) {
    super();
    this.index = index;
    this.isFlipped = false;
    this.onFlipCallback = onFlipCallback;
    this.initCard(x, y, size);
  }

  initCard(x, y, size) {
    this.beginFill(0x2196f3);
    this.drawRoundedRect(0, 0, size, size, 10);
    this.endFill();

    this.x = x;
    this.y = y;
    this.interactive = true;
    this.cursor = "pointer";

    this.label = new Text("?", {
      fontFamily: "Arial",
      fontSize: 32,
      fill: 0xffffff,
      align: "center",
    });
    this.label.anchor.set(0.5);
    this.label.x = size / 2;
    this.label.y = size / 2;
    this.addChild(this.label);

    this.on("pointertap", () => this.flip());
  }

  flip() {
    if (this.isFlipped || !this.onFlipCallback) return;
    this.isFlipped = true;
    this.interactive = false;
    this.onFlipCallback(this);
  }

  revealBomb() {
    this.label.text = "💣";
    this.label.style.fill = 0xff0000;
    this.tint = 0xff5252;
    this.shake();
  }

  revealSafe(multiplier) {
    this.label.text = `${multiplier.toFixed(2)}x`;
    this.label.style.fill = 0xffffff;
    this.tint = 0x4caf50;
    this.pulse();
  }

  shake() {
    const startTime = Date.now();
    const duration = 500;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        this.position.set(this.x, this.y);
        return;
      }

      const progress = elapsed / duration;
      const shakeIntensity = 10 * (1 - progress);
      const offsetX = Math.sin(progress * 20) * shakeIntensity;
      const offsetY = Math.cos(progress * 20) * shakeIntensity;

      this.position.set(this.x + offsetX, this.y + offsetY);
      requestAnimationFrame(animate);
    };

    animate();
  }

  pulse() {
    const startScale = this.scale.x;
    const targetScale = 1.2;
    const duration = 300;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed >= duration) {
        this.scale.set(1, 1);
        return;
      }

      const progress = elapsed / duration;
      const scaleProgress =
        progress < 0.5 ? progress * 2 : 1 - (progress - 0.5) * 2;

      const currentScale =
        startScale + (targetScale - startScale) * scaleProgress;
      this.scale.set(currentScale, currentScale);
      requestAnimationFrame(animate);
    };

    animate();
  }
}

class GameBoard {
  constructor(app, gridSize, spacing, cardSize, onCardFlip) {
    this.app = app;
    this.gridSize = gridSize;
    this.spacing = spacing;
    this.cardSize = cardSize;
    this.onCardFlip = onCardFlip;
    this.container = new Container();
    this.app.stage.addChild(this.container);
    this.cards = [];
    this.bombIndex = -1;
    this.blurFilter = new BlurFilter();
    this.blurred = true; // Track blur state
  }

  generate(shouldApplyBlur = true) {
    this.container.removeChildren();
    this.cards = [];
    this.bombIndex = Math.floor(Math.random() * this.gridSize ** 2);

    const totalSize =
      this.gridSize * this.cardSize + (this.gridSize - 1) * this.spacing;
    const startX = (this.app.screen.width - totalSize) / 2;
    const startY = (this.app.screen.height - totalSize) / 2;

    for (let i = 0; i < this.gridSize ** 2; i++) {
      const row = Math.floor(i / this.gridSize);
      const col = i % this.gridSize;
      const x = startX + col * (this.cardSize + this.spacing);
      const y = startY + row * (this.cardSize + this.spacing);

      const card = new GameCard(i, x, y, this.cardSize, this.onCardFlip);
      this.container.addChild(card);
      this.cards.push(card);
    }

    if (shouldApplyBlur) {
      this.applyBlur();
    } else {
      this.clearBlur();
    }
  }

  applyBlur(amount = 3, alpha = 0.3) {
    this.blurFilter.blur = amount;
    this.container.filters = [this.blurFilter];
    this.container.alpha = alpha;
    this.blurred = true;
  }

  clearBlur() {
    this.container.filters = [];
    this.container.alpha = 1;
    this.blurred = false;
  }

  revealCard(index, isBomb, multiplier) {
    const card = this.cards[index];
    if (isBomb) {
      card.revealBomb();
    } else {
      card.revealSafe(multiplier);
    }
  }

  reset(shouldApplyBlur = false) {
    this.generate(shouldApplyBlur);
  }
}

class ParticleSystem {
  constructor() {
    this.particleCanvas = document.createElement("canvas");
    this.particleCtx = this.particleCanvas.getContext("2d");
    this.particleCanvas.style.position = "absolute";
    this.particleCanvas.style.top = "0";
    this.particleCanvas.style.left = "0";
    this.particleCanvas.style.pointerEvents = "none";
    this.particleCanvas.style.zIndex = "100";
    document.body.appendChild(this.particleCanvas);

    this.resize();
    window.addEventListener("resize", () => this.resize());

    this.particles = [];
  }

  resize() {
    this.particleCanvas.width = window.innerWidth;
    this.particleCanvas.height = window.innerHeight;
  }

  createParticles(x, y, color, count = 30) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        size: Math.random() * 5 + 2,
        speedX: Math.random() * 6 - 3,
        speedY: Math.random() * -10 - 5,
        color: color || `hsl(${Math.random() * 60 + 10}, 100%, 50%)`,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.01,
      });
    }

    if (!this.animating) {
      this.animating = true;
      this.animateParticles();
    }
  }

  animateParticles() {
    this.particleCtx.clearRect(
      0,
      0,
      this.particleCanvas.width,
      this.particleCanvas.height
    );

    let aliveParticles = 0;

    this.particles.forEach((particle, index) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.speedY += 0.1; // gravity
      particle.alpha -= particle.decay;

      if (particle.y < this.particleCanvas.height && particle.alpha > 0) {
        aliveParticles++;

        this.particleCtx.globalAlpha = particle.alpha;
        this.particleCtx.beginPath();
        this.particleCtx.arc(
          particle.x,
          particle.y,
          particle.size,
          0,
          Math.PI * 2
        );
        this.particleCtx.fillStyle = particle.color;
        this.particleCtx.fill();
      } else {
        this.particles.splice(index, 1);
      }
    });

    if (aliveParticles > 0) {
      requestAnimationFrame(() => this.animateParticles());
    } else {
      this.animating = false;
    }
  }
}

class Game {
  constructor() {
    this.gridSize = 5;
    this.spacing = 10;
    this.cardSize = Math.min(window.innerWidth, window.innerHeight) / 7;

    this.balance = 1000;
    this.currentBet = 0;
    this.multiplier = 1;
    this.flippedCount = 0;
    this.gameStarted = false;

    this.ui = new GameUI();
    this.app = new Application();
    this.board = null;
    this.particles = new ParticleSystem();
  }

  async init() {
    await this.app.init({
      resizeTo: window,
      backgroundColor: 0x0f172a,
    });

    document.body.appendChild(this.app.canvas);

    this.board = new GameBoard(
      this.app,
      this.gridSize,
      this.spacing,
      this.cardSize,
      this.handleCardFlip.bind(this)
    );

    this.board.generate(true); // Start with blurred grid
    this.updateUI();

    this.ui.onStartClick(() => this.startGame());
  }

  updateUI() {
    this.ui.updateBalance(this.balance);
    this.ui.updateMultiplier(this.multiplier);
  }

  startGame() {
    const bet = this.ui.getBetAmount();
    if (this.gameStarted || isNaN(bet) || bet <= 0 || bet > this.balance)
      return;

    this.currentBet = bet;
    this.balance -= bet;
    this.multiplier = 1;
    this.flippedCount = 0;
    this.gameStarted = true;

    this.updateUI();
    this.board.clearBlur();
    this.board.reset(false); // Reset without blur
  }

  handleCardFlip(card) {
    if (!this.gameStarted) return;

    const isBomb = card.index === this.board.bombIndex;
    if (isBomb) {
      this.board.revealCard(card.index, true);
      this.endGame(false);
    } else {
      this.flippedCount++;
      this.multiplier += 0.25;
      this.board.revealCard(card.index, false, this.multiplier);
      this.updateUI();

      // Create particles for safe card
      const cardCenterX = card.x + card.width / 2;
      const cardCenterY = card.y + card.height / 2;
      this.particles.createParticles(cardCenterX, cardCenterY, "#4CAF50");

      if (this.flippedCount === this.gridSize ** 2 - 1) {
        this.endGame(true);
      }
    }
  }

  async endGame(won) {
    this.gameStarted = false;
    if (won) {
      const winnings = Math.floor(this.currentBet * this.multiplier);
      this.balance += winnings;

      // Create celebration particles
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * this.app.screen.width;
        const y = Math.random() * this.app.screen.height;
        this.particles.createParticles(x, y, "#4CAF50", 5);
      }
    } else {
      // Create explosion particles
      const bombCard = this.board.cards[this.board.bombIndex];
      const cardCenterX = bombCard.x + bombCard.width / 2;
      const cardCenterY = bombCard.y + bombCard.height / 2;
      this.particles.createParticles(cardCenterX, cardCenterY, "#FF5252", 50);
    }

    this.updateUI();

    // Show result message
    await this.showResultMessage(won ? "🎉 You Win!" : "💥 Bomb Exploded!");

    // Reset the game with blur
    this.board.applyBlur();
    this.board.reset(true); // Reset with blur
  }

  showResultMessage(message) {
    return new Promise((resolve) => {
      const messageEl = document.createElement("div");
      messageEl.textContent = message;
      messageEl.style.position = "fixed";
      messageEl.style.top = "50%";
      messageEl.style.left = "50%";
      messageEl.style.transform = "translate(-50%, -50%)";
      messageEl.style.fontSize = "3rem";
      messageEl.style.fontWeight = "bold";
      messageEl.style.color = message.includes("Win") ? "#4CAF50" : "#FF5252";
      messageEl.style.textShadow = "0 0 20px currentColor";
      messageEl.style.opacity = "0";
      messageEl.style.zIndex = "1000";
      messageEl.style.transition = "all 0.5s ease";
      document.body.appendChild(messageEl);

      setTimeout(() => {
        messageEl.style.opacity = "1";
        messageEl.style.transform = "translate(-50%, -50%) scale(1.2)";
      }, 10);

      setTimeout(() => {
        messageEl.style.opacity = "0";
        messageEl.style.transform = "translate(-50%, -50%) scale(0.8)";
        setTimeout(() => {
          document.body.removeChild(messageEl);
          resolve();
        }, 500);
      }, 2000);
    });
  }
}

const game = new Game();
await game.init();
