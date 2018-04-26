import Bike from "./Bike";
import Game from "./Game";

export default class Enemy extends Bike {
    constructor(game: Game, mesh: BABYLON.AbstractMesh, color: BABYLON.Color3) {
        super(game, mesh, color);
    }
}
