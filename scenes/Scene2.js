// Declare game variables
var isAnimating = false; // Used to track if an animation is currently playing
var bg; // Background sprite
var elevator; // Elevator sprite
var platforms; // Platform group for static objects
var player; // Player character sprite
var qKey; // Key for punch action
var wKey; // Key for jump action
var eKey; // Key for throw action
var aKey; // Key for moving left
var dKey; // Key for moving right
var fKey; // Key for ending the game at the elevator
var hKey; // Key for toggling help text
var enemys; // Group for enemy sprites
var playerHealth = 100; // Player's health
var playerHealthText;// Text object for Player's health
var help = true; // Flag to determine help text visibility
var helpText = ""; // Text object for help instructions
var secHelpText = "";// Text object for help instructions
var floortext; // Text object to display floor information
var score = 0; // Player's score
var scoretext; // Text object to display score
var playerload = false; // Flag to check if the player is loaded
var zombie_attack; // Sound for zombie attack
var zombie_die; // Sound for zombie death
var zombie_run; // Placeholder for zombie running sound
var punch; // Sound for punch action
var throwKnife; // Sound for knife throw action

// Define the Scene2 class, extending Phaser.Scene
class Scene2 extends Phaser.Scene {
    constructor() {
        // Call the parent class constructor with the scene key "Scene2"
        super("Scene2");
    }

    // Preload assets for the scene
    preload() {
        // Load background image
        this.load.image('bg', 'assets/background.png');
        // Load Scoreboard background image
        this.load.image('score-bg', 'assets/scoreboard-bg.jpg');
        // Load ground platform image
        this.load.image('ground', 'assets/floor.png');
        // Load door image
        this.load.image('door', 'assets/door.png');
        // Load elevator sprite atlas and JSON data
        this.load.atlas('elevator', 'assets/elevator.jpg', 'assets/elevator.json');
        // Load player sprite atlas and JSON data
        this.load.atlas('player', 'assets/Character.jpg', 'assets/player.json');
        // Load enemy sprite atlas and JSON data
        this.load.atlas('enemy_001', 'assets/Enemy_001.jpg', 'assets/enemy_001.json');
        // Load knife image used for throwing action
        this.load.image('thr', 'assets/knife.jpg');
        // Load background music and sound effects
        this.load.audio('ingameSound', 'assets/ingameMusic.mp3');
        this.load.audio('punch', 'assets/punch.mp3');
        this.load.audio('thrownknife', 'assets/throwKnife.mp3');
        this.load.audio('zombie_attack', 'assets/zombie-bite.mp3');
        this.load.audio('zombie_die', 'assets/zombie-die.mp3');
    }

    // Create the game scene
    create() {
        // Add and configure background music
        var ingamesSound = this.sound.add('ingameSound');
        ingamesSound.loop = true; // Enable looping for background music
        ingamesSound.volume = 0.5; // Set volume level
        ingamesSound.play(); // Play background music

        // Add sound effects and set volume
        punch = this.sound.add('punch');
        punch.volume = 0.5;
        throwKnife = this.sound.add('thrownknife');
        throwKnife.volume = 0.5;
        zombie_attack = this.sound.add('zombie_attack');
        zombie_attack.volume = 0.5;
        zombie_die = this.sound.add('zombie_die');
        zombie_die.volume = 0.5;

        // Create keyboard key listeners
        qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q); // Punch key
        wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W); // Jump key
        eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E); // Throw key
        aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A); // Move left key
        dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D); // Move right key
        fKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F); // End game key
        hKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H); // Help key

        // Add the background image as a tile sprite
        this.bg = this.add.tileSprite(0, 0, 12000, 900, 'bg').setOrigin(0);

        // Add text objects for floor information and score
        floortext = this.add.text(20, 20, "Floor 101", { font: "25px Arial", fill: "yellow" });
        scoretext = this.add.text(20, 50, "Score: " + score, { font: "25px Arial", fill: "yellow" });
        playerHealthText = this.add.text(400, 20, "Health: " + playerHealth, { font: "25px Arial", fill: "yellow" });
        this.add.text(135, 400, "Floor 101", { font: "30px Arial", fill: "Black", fontStyle: 'strong' });

        // Create a static group for platforms
        platforms = this.physics.add.staticGroup();

        // Add doors and platforms to the scene
        this.addDoors(1240, 640, 500); // Add doors at specified position
        this.addPlatforms(0, 830, 12000); // Add platforms along the scene

        // Create a group for enemies and enable physics collisions with platforms
        enemys = this.physics.add.group();
        this.physics.add.collider(platforms, enemys);

        // Create elevator animations
        this.anims.create({
            key: 'open',
            frames: this.anims.generateFrameNames('elevator', { prefix: 'open', end: 2, zeroPad: 4 }),
            frameRate: 3, // Frame rate for the animation
            repeat: 0 // Play the animation once
        });

        this.anims.create({
            key: 'close',
            frames: this.anims.generateFrameNames('elevator', { prefix: 'close', end: 2, zeroPad: 4 }),
            frameRate: 3, // Frame rate for the animation
            repeat: 0 // Play the animation once
        });

        // Set world boundaries for physics
        this.physics.world.setBounds(0, 0, 12000, 900);

        // Add elevator sprite and scale it
        elevator = this.add.sprite(200, 560, 'elevator').setScale(1.5);

        // Play elevator opening animation and handle completion
        isAnimating = true;
        elevator.play('open').once('animationcomplete', () => {
            isAnimating = false; // Animation is complete

            // Create the player sprite with physics and scaling
            player = this.physics.add.sprite(200, 625, 'player').setScale(2).refreshBody();

            // Load player animations
            this.loadPlayerAnims();

            // Set player load flag to true
            playerload = true;

            // Add collision between player and platforms
            this.physics.add.collider(platforms, player);

            // Play idle animation for player
            player.play('idle');

            // Set player physics properties
            player.setBounce(0.2); // Add bounce effect
            player.setCollideWorldBounds(true); // Prevent player from leaving the world bounds

            // Create cursor keys for movement
            cursors = this.input.keyboard.createCursorKeys();

            // Set camera bounds and follow the player
            this.cameras.main.setSize(1880, 1150);
            this.cameras.main.setBounds(0, 0, 12000, 900);
            this.cameras.main.startFollow(player, false, 0.05, 0.05).setFollowOffset(-600, 225);

            // Add enemies to the scene
            this.addEnemies();

            // Load enemy animations
            this.loadEnemyAnims();

            // Add collision detection between player and enemies
            this.physics.add.collider(player, enemys, this.hitByEnemy, null, this);
        });

        // Add help text instructions
        helpText = this.add.text(20, 690, "Press H for Help", { font: "25px Arial", fill: "white" });
        secHelpText = this.add.text(20, 720, "", { font: "25px Arial", fill: "white" });
        

    }

    // Update function called every frame
    update() {
        // Check player controls and animations
        this.checkPlayer();

        // Update enemy behavior and animations
        this.updateEnemies();

        // Update UI elements based on player position
        if (playerload) {
            scoretext.x = player.x; // Move score text with the player
            scoretext.text = "Score: " + score; // Update score display
            playerHealthText.x = player.x + 400 // Move player heatlth with player
            playerHealthText.text = "Health: " + playerHealth; // Update player health display 
            helpText.x = player.x; // Move help text with the player
            secHelpText.x = player.x;// Move help text with the player
            floortext.x = player.x; // Move floor text with the playerwd
        }

        // Handle help text toggling
        if (hKey.isDown) {
            if (help) {
                // Toggle help text off
                helpText.text = "Press H for Help";
                secHelpText.text = "";
                help = false;
            } else {
                // Display help instructions
                helpText.text = "A = Move left | D = Move Right | W = Jump | Q = Punch(+ 30 Health agains enemies)";
                secHelpText.text = "E = Throw a Knife(+ 10 Health agains enemies) | F = Win game (Only available at the Elevator)";
                help = true;
            }
        }
    }

    // Function to add platforms to the scene
    addPlatforms(x, y, width) {
        for (var i = 0; i < width / 64; i++) {
            platforms.create(x + (i * 64), y, 'ground').refreshBody();
        }
    }
    

    // Function to add doors to the scene
    addDoors(startX, y, count) {
        for (var i = 0; i < count; i++) {
            this.add.image(startX + (i * 500), y - 75, 'door').setScale(1.25); // Adjust door position as needed
        }
    }

    // Function to add enemies to the scene
    addEnemies() {
        for (let i = 0; i < 20; i++) { // Add 20 enemy loads
            for (let e = 0; e < i; e++){
                let enemy = enemys.create((1000 + (i * (400*(i/3)))+(e*40)), 600, 'enemy_001').setScale(2); // Create enemy sprite
                enemy.health = 1; // Set enemy health
                enemy.flipX = true; // Flip enemy sprite horizontally
    
                enemy.isAttacking = false; // Initialize attacking state
    
                enemy.play('enemyIdle'); // Play idle animation
                this.physics.add.collider(enemy, player, this.hitByEnemy); // Collider added between enemy and player
                enemy.setGravityY(6000); // Set gravity for enemy
            }
            
        }
    }

    // Function to load player animations
    loadPlayerAnims() {
        this.anims.create({
            key: 'punch',
            frames: this.anims.generateFrameNames('player', { prefix: 'punch', end: 5, zeroPad: 4 }),
            frameRate: 12, // Frame rate for punch animation
            repeat: 0 // Play the animation once
        });
        this.anims.create({
            key: 'throw',
            frames: this.anims.generateFrameNames('player', { prefix: 'throw', end: 5, zeroPad: 4 }),
            frameRate: 12, // Frame rate for throw animation
            repeat: 0 // Play the animation once
        });
        this.anims.create({
            key: 'thr',
            frames: [{ key: 'thr' }], // Single frame animation for throw
            frameRate: 12, // Frame rate for throw animation
            repeat: 0 // Play the animation once
        });
        this.anims.create({
            key: 'death',
            frames: this.anims.generateFrameNames('player', { prefix: 'death', end: 5, zeroPad: 4 }),
            frameRate: 3, // Frame rate for death animation
            repeat: 0 // Play the animation once
        });
        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNames('player', { prefix: 'jump', end: 3, zeroPad: 4 }),
            frameRate: 6, // Frame rate for jump animation
            repeat: -1 // Loop the animation
        });
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNames('player', { prefix: 'run', end: 1, zeroPad: 4 }),
            frameRate: 6, // Frame rate for run animation
            repeat: -1 // Loop the animation
        });
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNames('player', { prefix: 'idle', end: 2, zeroPad: 4 }),
            frameRate: 6, // Frame rate for idle animation
            repeat: -1 // Loop the animation
        });
    }

    // Function to load enemy animations
   
loadEnemyAnims() {
    this.anims.create({
        key: 'enemyIdle',
        frames: this.anims.generateFrameNames('enemy_001', { prefix: 'idle', end: 7, zeroPad: 4 }),
        frameRate: 6,
        repeat: -1
    });

    this.anims.create({
        key: 'enemyRun',
        frames: this.anims.generateFrameNames('enemy_001', { prefix: 'run', end: 7, zeroPad: 4 }),
        frameRate: 12,
        repeat: -1
    });

    this.anims.create({
        key: 'enemyAttack',
        frames: this.anims.generateFrameNames('enemy_001', { prefix: 'attack', end: 4, zeroPad: 4 }),
        frameRate: 6,
        repeat: 0
    });
}


    // Check player controls and animations
    checkPlayer() {
        // Utility function to wait for an animation to complete
        function playAnimationAndWait(animation) {
            return new Promise(resolve => {
                player.play(animation);
                player.once('animationcomplete', resolve);
            });
        }

        // Check if any animation is currently playing
        if (!isAnimating) {
            if (aKey.isDown) { // Check if move left key is pressed
                player.setVelocityX(-360); // Set horizontal velocity for moving left
                player.flipX = true; // Flip player sprite horizontally
                if (player.body.touching.down) {
                    player.anims.play('run', true); // Play run animation if player is on the ground
                }
            } else if (dKey.isDown) { // Check if move right key is pressed
                player.setVelocityX(360); // Set horizontal velocity for moving right
                player.flipX = false; // Ensure player sprite is not flipped
                if (player.body.touching.down) {
                    player.anims.play('run', true); // Play run animation if player is on the ground
                }
            } else {
                player.setVelocityX(0); // Stop horizontal movement
                if (player.body.touching.down) {
                    player.anims.play('idle', true); // Play idle animation if player is on the ground
                }
            }

            if (wKey.isDown && player.body.touching.down) { // Check if jump key is pressed and player is on the ground
                player.setVelocityY(-360); // Set vertical velocity for jumping
                player.anims.play('jump', true); // Play jump animation
            }

            if (qKey.isDown) { // Check if punch key is pressed
                isAnimating = true; // Set animation flag
                playAnimationAndWait('punch').then(() => {
                    isAnimating = false; // Reset animation flag
                    this.hitEnemyWithPunch(); // Execute punch action
                });
            } else if (eKey.isDown) { // Check if throw key is pressed
                isAnimating = true; // Set animation flag
                playAnimationAndWait('throw').then(() => {
                    isAnimating = false; // Reset animation flag
                    this.hitEnemyWithThrow(); // Execute throw action
                });
            } else if (fKey.isDown) { // Check if end game key is pressed
                if ((elevator.x + 50 >= player.x) && (elevator.x - 50 <= player.x)) { // Check if player is near the elevator
                    isAnimating = true; // Set animation flag
                    player.destroy(); // Remove player sprite
                    elevator.play('close').once('animationcomplete', () => {
                        showScore(score);
                        isAnimating = false; // Reset animation flag
                    });
                }
            }
        }
    }

    // Function to update enemies
    updateEnemies() {
        enemys.children.iterate((enemy) => {
            if (enemy) {
                // Maintain enemy physics properties
                enemy.setCollideWorldBounds(true);
                enemy.setGravityY(600);
    
                if (!enemy.isAttacking) {
                    const distance = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
                    
                    if (distance < 50) { // If within attack range
                        enemy.isAttacking = true;
                        enemy.setVelocityX(0); // Stop movement during attack
                        enemy.anims.play('enemyAttack', true);
    
                        // Attach event listeners to the animation on this enemy
                        enemy.once('animationcomplete', () => {
                            enemy.isAttacking = false; // Reset state after attack
                            if (Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y) < 50) {
                                this.hitByEnemy(player, enemy); // Attack logic
                            }
                        });
    
                    } else if (distance < 800) { // If within chase range
                        enemy.anims.play('enemyRun', true);
                        this.physics.moveToObject(enemy, player, 300);
                    } else { // Idle behavior
                        enemy.anims.play('enemyIdle', true);
                        enemy.setVelocityX(0);
                        enemy.setVelocityY(0);
                    }
                }
            }
        });
    }
    
    
    

    // Function to handle player being hit by enemy
    hitByEnemy(player, enemy) {
        zombie_attack.play(); // Play zombie attack sound
        playerHealth -= 1; // Reduce player health on attack
        console.log(playerHealth); // Log player health
        if (playerHealth <= 0) {
            gameOver(score); // Log game over message
        }
    }

    // Function to handle enemy being hit by player's punch
    hitEnemyWithPunch() {
        punch.play(); // Play punch sound
        enemys.children.iterate(enemy => {
            if (Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y) < 100) { // Check if enemy is within punch range
                zombie_die.play(); // Play zombie die sound
                enemy.destroy(); // Remove enemy sprite
                score += 10; // Increase score
                playerHealth += 30; // Increase player's health by 30
                console.log('Enemy punched'); // Log punch action
            }
        });
    }

    // Function to handle enemy being hit by player's throw
    hitEnemyWithThrow() {
        throwKnife.play(); // Play throw sound
        let thr = this.physics.add.sprite(player.x + 15, player.y - 25, 'thr').setScale(0.2); // Create throw projectile
        if (player.flipX) { thr.flipX = true; } else { thr.flipX = false; } // Adjust projectile direction
        thr.setVelocityX(player.flipX ? -1500 : 1500); // Set projectile velocity
        // Set a maximum range for the throw
        this.physics.add.overlap(thr, enemys, (thr, enemy) => {
            zombie_die.play(); // Play zombie die sound
            enemy.destroy(); // Remove enemy sprite
            score += 10; // Increase score
            playerHealth += 10; // Increase player's health by 10
            thr.destroy(); // Destroy projectile
            console.log('Enemy hit by throw'); // Log throw action
        });
        this.physics.add.overlap(thr, platforms, (thr, platforms) => {
            thr.destroy(); // Destroy projectile on collision with platform
            console.log('Platform hit by throw'); // Log platform hit
        });
    }
}
