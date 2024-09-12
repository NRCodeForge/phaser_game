var cursors;
var playerHealth;
var curentScene = 0;
class Scene1 extends Phaser.Scene {
    constructor(){
        super("bootGame");
    }
    create() {
        this.add.text(20,20, "Error Loading Game...")
        cursors = this.input.keyboard.createCursorKeys();
        playerHealth = 100;
    }
    update() {
        if(curentScene == 0){
            this.scene.start("Scene2");
        }else if(curentScene == 1){
            this.scene.stop("Scene2");
            this.scene.start("Scene3");
        }
    }
    
}