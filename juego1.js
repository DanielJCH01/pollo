const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const gameOverElement = document.getElementById('gameOver');
        const finalScoreElement = document.getElementById('finalScore');

        let gameRunning = false;
        let score = 0;
        let keys = {};

        // Objetos del juego
        let player = {
            x: canvas.width / 2,
            y: canvas.height - 50,
            width: 30,
            height: 30,
            speed: 5
        };

        let bullets = [];
        let asteroids = [];
        let stars = [];

        // Generar estrellas de fondo
        function generateStars() {
            stars = [];
            for (let i = 0; i < 100; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 2 + 1,
                    speed: Math.random() * 0.5 + 0.1
                });
            }
        }

        // Event listeners
        document.addEventListener('keydown', (e) => {
            keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                shoot();
            }
        });

        document.addEventListener('keyup', (e) => {
            keys[e.code] = false;
        });

        function shoot() {
            if (!gameRunning) return;
            bullets.push({
                x: player.x + player.width / 2,
                y: player.y,
                width: 3,
                height: 10,
                speed: 7
            });
        }

        function spawnAsteroid() {
            asteroids.push({
                x: Math.random() * (canvas.width - 40),
                y: -40,
                width: 40,
                height: 40,
                speed: Math.random() * 3 + 1,
                rotation: 0,
                rotationSpeed: Math.random() * 0.2 - 0.1
            });
        }

        function updatePlayer() {
            if (keys['ArrowLeft'] && player.x > 0) {
                player.x -= player.speed;
            }
            if (keys['ArrowRight'] && player.x < canvas.width - player.width) {
                player.x += player.speed;
            }
            if (keys['ArrowUp'] && player.y > 0) {
                player.y -= player.speed;
            }
            if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
                player.y += player.speed;
            }
        }

        function updateBullets() {
            for (let i = bullets.length - 1; i >= 0; i--) {
                bullets[i].y -= bullets[i].speed;
                if (bullets[i].y < 0) {
                    bullets.splice(i, 1);
                }
            }
        }

        function updateAsteroids() {
            for (let i = asteroids.length - 1; i >= 0; i--) {
                asteroids[i].y += asteroids[i].speed;
                asteroids[i].rotation += asteroids[i].rotationSpeed;
                
                if (asteroids[i].y > canvas.height) {
                    asteroids.splice(i, 1);
                }
            }
        }

        function updateStars() {
            for (let star of stars) {
                star.y += star.speed;
                if (star.y > canvas.height) {
                    star.y = 0;
                    star.x = Math.random() * canvas.width;
                }
            }
        }

        function checkCollisions() {
            // Balas vs asteroides
            for (let i = bullets.length - 1; i >= 0; i--) {
                for (let j = asteroids.length - 1; j >= 0; j--) {
                    if (bullets[i] && asteroids[j] &&
                        bullets[i].x < asteroids[j].x + asteroids[j].width &&
                        bullets[i].x + bullets[i].width > asteroids[j].x &&
                        bullets[i].y < asteroids[j].y + asteroids[j].height &&
                        bullets[i].y + bullets[i].height > asteroids[j].y) {
                        
                        bullets.splice(i, 1);
                        asteroids.splice(j, 1);
                        score += 10;
                        scoreElement.textContent = score;
                        break;
                    }
                }
            }

            // Jugador vs asteroides
            for (let asteroid of asteroids) {
                if (player.x < asteroid.x + asteroid.width &&
                    player.x + player.width > asteroid.x &&
                    player.y < asteroid.y + asteroid.height &&
                    player.y + player.height > asteroid.y) {
                    gameOver();
                }
            }
        }

        function drawStars() {
            ctx.fillStyle = 'white';
            for (let star of stars) {
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function drawPlayer() {
            ctx.save();
            ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
            
            // Nave espacial
            ctx.fillStyle = '#ffffffff';
            ctx.beginPath();
            ctx.moveTo(0, -15);
            ctx.lineTo(-15, 15);
            ctx.lineTo(0, 5);
            ctx.lineTo(15, 15);
            ctx.closePath();
            ctx.fill();
            
            // Motor
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(-5, 10, 10, 8);
            
            ctx.restore();
        }

        function drawBullets() {
            ctx.fillStyle = '#ffff00';
            for (let bullet of bullets) {
                ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            }
        }

        function drawAsteroids() {
            for (let asteroid of asteroids) {
                ctx.save();
                ctx.translate(asteroid.x + asteroid.width / 2, asteroid.y + asteroid.height / 2);
                ctx.rotate(asteroid.rotation);
                
                ctx.fillStyle = '#8B4513';
                ctx.strokeStyle = '#A0522D';
                ctx.lineWidth = 2;
                
                // Forma irregular del asteroide
                ctx.beginPath();
                ctx.moveTo(-15, -10);
                ctx.lineTo(-10, -18);
                ctx.lineTo(5, -20);
                ctx.lineTo(18, -8);
                ctx.lineTo(15, 10);
                ctx.lineTo(0, 18);
                ctx.lineTo(-18, 12);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                ctx.restore();
            }
        }

        function gameLoop() {
            if (!gameRunning) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            updateStars();
            updatePlayer();
            updateBullets();
            updateAsteroids();
            checkCollisions();

            drawStars();
            drawPlayer();
            drawBullets();
            drawAsteroids();

            // Spawn asteroides aleatoriamente
            if (Math.random() < 0.02) {
                spawnAsteroid();
            }

            requestAnimationFrame(gameLoop);
        }

        function startGame() {
            gameRunning = true;
            score = 0;
            scoreElement.textContent = score;
            gameOverElement.style.display = 'none';
            
            // Reset posiciones
            player.x = canvas.width / 2;
            player.y = canvas.height - 50;
            bullets = [];
            asteroids = [];
            
            generateStars();
            gameLoop();
        }

        function gameOver() {
            gameRunning = false;
            finalScoreElement.textContent = score;
            gameOverElement.style.display = 'block';
        }

        // Inicializar estrellas
        generateStars();