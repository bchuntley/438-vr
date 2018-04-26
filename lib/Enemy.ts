import Bike from "./Bike";
import Game from "./Game";

export default class Enemy extends Bike {
    static baseMesh: BABYLON.AbstractMesh;
    mesh: BABYLON.InstancedMesh;

    constructor(game: Game) {
        super(game, new BABYLON.InstancedMesh("enemy" + (Bike.lastId + 1), <any>Enemy.baseMesh));
        this.mesh.isVisible = true;
    }
}
