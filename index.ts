import Game from "./lib/Game";

$(document).ready(() => {
    const game = new Game();
    (<any>window).game = game;
    game.init().then(() => game.start())
        .catch(console.error);
});
