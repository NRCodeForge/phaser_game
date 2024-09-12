function loadTut(){
    return null;
}
function showScore(a){
    var bodydiv = document.getElementById('body');
    bodydiv.innerHTML = '<img src="assets/scoreboard-bg.jpg" alt=""><p id="tx">You win the Game with ' + a + ' points!<br>Refresh the page to retry!</p>';
}
function gameOver(a){
    var bodydiv = document.getElementById('body');
    bodydiv.innerHTML = '<img src="assets/scoreboard-bg.jpg" alt=""><p id="tx">You lose the Game with ' + a + ' points!<br>Refresh the page to retry!</p>';
}