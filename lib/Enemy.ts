import Bike from "./Bike";
import Game from "./Game";

export default class Enemy extends Bike {
    constructor(game: Game, mesh: BABYLON.AbstractMesh) {
        super(game, mesh);
    }
}
