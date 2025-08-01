const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const distanceElement = document.getElementById('distance');
        const speedElement = document.getElementById('speed');
        const gameOverElement = document.getElementById('gameOver');
        const finalScoreElement = document.getElementById('finalScore');
        const finalDistanceElement = document.getElementById('finalDistance');

        let gameRunning = false;
        let score = 0;
        let distance = 0;
        let gameSpeed = 2;
        let keys = {};

        // Objetos del juego
        let player = {
            x: 100,
            y: canvas.height / 2,
            width: 40,
            height: 25,
            speed: 6
        };

        let obstacles = [];
        let particles = [];
        let stars = [];
        let powerUps = [];

        // Generar estrellas de fondo
        function generateStars() {
            stars = [];
            for (let i = 0; i < 150; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 3 + 1,
                    speed: Math.random() * 2 + 0.5,
                    opacity: Math.random() * 0.8 + 0.2
                });
            }
        }

        // Event listeners
        document.addEventListener('keydown', (e) => {
            keys[e.code] = true;
            e.preventDefault();
        });

        document.addEventListener('keyup', (e) => {
            keys[e.code] = false;
        });

        function spawnObstacle() {
            const types = ['asteroid', 'laser', 'mine'];
            const type = types[Math.floor(Math.random() * types.length)];
            
            let obstacle = {
                x: canvas.width,
                type: type,
                speed: gameSpeed
            };

            switch(type) {
                case 'asteroid':
                    obstacle.y = Math.random() * (canvas.height - 60);
                    obstacle.width = 50 + Math.random() * 30;
                    obstacle.height = 50 + Math.random() * 30;
                    obstacle.rotation = 0;
                    obstacle.rotationSpeed = (Math.random() - 0.5) * 0.2;
                    break;
                    
                case 'laser':
                    obstacle.y = Math.random() * (canvas.height - 200);
                    obstacle.width = 20;
                    obstacle.height = 200;
                    obstacle.pulse = 0;
                    break;
                    
                case 'mine':
                    obstacle.y = Math.random() * (canvas.height - 40);
                    obstacle.width = 40;
                    obstacle.height = 40;
                    obstacle.pulse = 0;
                    break;
            }

            obstacles.push(obstacle);
        }

        function spawnPowerUp() {
            if (Math.random() < 0.005) {
                powerUps.push({
                    x: canvas.width,
                    y: Math.random() * (canvas.height - 30),
                    width: 30,
                    height: 30,
                    type: 'points',
                    pulse: 0,
                    speed: gameSpeed
                });
            }
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

        function updateObstacles() {
            for (let i = obstacles.length - 1; i >= 0; i--) {
                let obstacle = obstacles[i];
                obstacle.x -= obstacle.speed;
                
                if (obstacle.type === 'asteroid') {
                    obstacle.rotation += obstacle.rotationSpeed;
                } else if (obstacle.type === 'laser' || obstacle.type === 'mine') {
                    obstacle.pulse += 0.2;
                }
                
                if (obstacle.x + obstacle.width < 0) {
                    obstacles.splice(i, 1);
                    score += 5;
                }
            }
        }

        function updatePowerUps() {
            for (let i = powerUps.length - 1; i >= 0; i--) {
                let powerUp = powerUps[i];
                powerUp.x -= powerUp.speed;
                powerUp.pulse += 0.3;
                
                if (powerUp.x + powerUp.width < 0) {
                    powerUps.splice(i, 1);
                }
            }
        }

        function updateStars() {
            for (let star of stars) {
                star.x -= star.speed * gameSpeed;
                if (star.x < 0) {
                    star.x = canvas.width;
                    star.y = Math.random() * canvas.height;
                }
            }
        }

        function updateParticles() {
            for (let i = particles.length - 1; i >= 0; i--) {
                let p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 2;
                
                if (p.life <= 0) {
                    particles.splice(i, 1);
                }
            }
        }

        function checkCollisions() {
            // Jugador vs obstáculos
            for (let obstacle of obstacles) {
                if (player.x < obstacle.x + obstacle.width &&
                    player.x + player.width > obstacle.x &&
                    player.y < obstacle.y + obstacle.height &&
                    player.y + player.height > obstacle.y) {
                    
                    // Crear partículas de explosión
                    for (let i = 0; i < 15; i++) {
                        particles.push({
                            x: player.x + player.width / 2,
                            y: player.y + player.height / 2,
                            vx: (Math.random() - 0.5) * 10,
                            vy: (Math.random() - 0.5) * 10,
                            life: 50,
                            color: `hsl(${Math.random() * 60}, 100%, 50%)`
                        });
                    }
                    
                    gameOver();
                    return;
                }
            }

            // Jugador vs power-ups
            for (let i = powerUps.length - 1; i >= 0; i--) {
                let powerUp = powerUps[i];
                if (player.x < powerUp.x + powerUp.width &&
                    player.x + player.width > powerUp.x &&
                    player.y < powerUp.y + powerUp.height &&
                    player.y + player.height > powerUp.y) {
                    
                    score += 50;
                    powerUps.splice(i, 1);
                    
                    // Partículas de recolección
                    for (let j = 0; j < 8; j++) {
                        particles.push({
                            x: powerUp.x + powerUp.width / 2,
                            y: powerUp.y + powerUp.height / 2,
                            vx: (Math.random() - 0.5) * 6,
                            vy: (Math.random() - 0.5) * 6,
                            life: 30,
                            color: '#00ff88'
                        });
                    }
                }
            }
        }

        function drawStars() {
            for (let star of stars) {
                ctx.globalAlpha = star.opacity;
                ctx.fillStyle = 'white';
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
        }

        function drawPlayer() {
            ctx.save();
            ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
            
            // Nave espacial futurista
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.moveTo(15, 0);
            ctx.lineTo(-15, -12);
            ctx.lineTo(-10, -5);
            ctx.lineTo(-10, 5);
            ctx.lineTo(-15, 12);
            ctx.closePath();
            ctx.fill();
            
            // Detalles de la nave
            ctx.fillStyle = '#0088ff';
            ctx.fillRect(-8, -3, 8, 6);
            
            // Propulsores
            ctx.fillStyle = '#ff4400';
            ctx.fillRect(-15, -8, 3, 4);
            ctx.fillRect(-15, 4, 3, 4);
            
            ctx.restore();
        }

        function drawObstacles() {
            for (let obstacle of obstacles) {
                ctx.save();
                ctx.translate(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2);
                
                switch(obstacle.type) {
                    case 'asteroid':
                        ctx.rotate(obstacle.rotation);
                        ctx.fillStyle = '#8B4513';
                        ctx.strokeStyle = '#CD853F';
                        ctx.lineWidth = 2;
                        
                        ctx.beginPath();
                        ctx.moveTo(-20, -15);
                        ctx.lineTo(-5, -25);
                        ctx.lineTo(15, -20);
                        ctx.lineTo(25, -5);
                        ctx.lineTo(20, 15);
                        ctx.lineTo(5, 25);
                        ctx.lineTo(-15, 20);
                        ctx.lineTo(-25, 5);
                        ctx.closePath();
                        ctx.fill();
                        ctx.stroke();
                        break;
                        
                    case 'laser':
                        ctx.fillStyle = `rgba(255, 0, 0, ${0.3 + Math.sin(obstacle.pulse) * 0.3})`;
                        ctx.fillRect(-obstacle.width/2, -obstacle.height/2, obstacle.width, obstacle.height);
                        
                        ctx.strokeStyle = '#ff0000';
                        ctx.lineWidth = 2;
                        ctx.strokeRect(-obstacle.width/2, -obstacle.height/2, obstacle.width, obstacle.height);
                        break;
                        
                    case 'mine':
                        ctx.fillStyle = `rgba(255, 165, 0, ${0.7 + Math.sin(obstacle.pulse) * 0.3})`;
                        ctx.beginPath();
                        ctx.arc(0, 0, obstacle.width/2, 0, Math.PI * 2);
                        ctx.fill();
                        
                        ctx.strokeStyle = '#ff8800';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                        
                        // Picos de la mina
                        for (let i = 0; i < 8; i++) {
                            ctx.rotate(Math.PI / 4);
                            ctx.fillRect(-2, -obstacle.width/2 - 5, 4, 8);
                        }
                        break;
                }
                
                ctx.restore();
            }
        }

        function drawPowerUps() {
            for (let powerUp of powerUps) {
                ctx.save();
                ctx.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
                
                const scale = 1 + Math.sin(powerUp.pulse) * 0.2;
                ctx.scale(scale, scale);
                
                ctx.fillStyle = '#00ff88';
                ctx.beginPath();
                ctx.arc(0, 0, powerUp.width/2, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('+', 0, 4);
                
                ctx.restore();
            }
        }

        function drawParticles() {
            for (let p of particles) {
                ctx.globalAlpha = p.life / 50;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, 3, 3);
            }
            ctx.globalAlpha = 1;
        }

        function gameLoop() {
            if (!gameRunning) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Actualizar juego
            distance += gameSpeed;
            gameSpeed = Math.min(2 + distance / 1000, 8); // Aumentar velocidad gradualmente
            
            updateStars();
            updatePlayer();
            updateObstacles();
            updatePowerUps();
            updateParticles();
            checkCollisions();

            // Dibujar todo
            drawStars();
            drawPlayer();
            drawObstacles();
            drawPowerUps();
            drawParticles();

            // Spawn elementos
            if (Math.random() < 0.02 + distance / 50000) {
                spawnObstacle();
            }
            spawnPowerUp();

            // Actualizar HUD
            scoreElement.textContent = score;
            distanceElement.textContent = Math.floor(distance);
            speedElement.textContent = (gameSpeed / 2).toFixed(1);

            requestAnimationFrame(gameLoop);
        }

        function startGame() {
            gameRunning = true;
            score = 0;
            distance = 0;
            gameSpeed = 2;
            gameOverElement.style.display = 'none';
            
            // Reset posiciones
            player.x = 100;
            player.y = canvas.height / 2;
            obstacles = [];
            powerUps = [];
            particles = [];
            
            generateStars();
            gameLoop();
        }

        function gameOver() {
            gameRunning = false;
            finalScoreElement.textContent = score;
            finalDistanceElement.textContent = Math.floor(distance);
            gameOverElement.style.display = 'block';
        }

        // Inicializar
        generateStars();