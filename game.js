var config = {
    type: Phaser.AUTO,
        width: 12000,
        heigth: 900,
        physics: {
            default: 'arcade',
            arcade:{
                gravity:{y:300},
                debug:false
            }
        },
    backgroundColor: 0x000000,
    scene: [Scene1, Scene2]
}
function loadGame(){
    var div = document.getElementById("menü");
    div.innerHTML = "";
    var cursors;
    var game = new Phaser.Game(config);
}

