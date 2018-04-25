import Game from "./Game";

export default class Enemy {
    static lastId = 0;
    static baseMesh: BABYLON.AbstractMesh;
    game: Game;
    mesh: BABYLON.InstancedMesh;

    constructor(game: Game) {
        this.game = game;
        this.mesh = new BABYLON.InstancedMesh("enemy" + ++Enemy.lastId, <any>Enemy.baseMesh);
        this.mesh.isVisible = true;
    }
}
