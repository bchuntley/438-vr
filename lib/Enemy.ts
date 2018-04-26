import Bike from "./Bike";
import Constants from "./Constants";
import Game from "./Game";
import Utils from "./Utils";

export default class Enemy extends Bike {
    get trailColor() { return BABYLON.Color3.Red(); }

    constructor(game: Game, mesh: BABYLON.AbstractMesh) {
        super(game, mesh);
    }

    update() {
        // target just in front of the player
        const target = this.game.player.getTireOffset(1).subtract(this.mesh.position);
        const angle = -Math.atan2(target.z, target.x) - Math.PI / 2;
        this.mesh.rotation.y = angle; // rotate towards player
        this.accelerate(Constants.ACCELERATION);
        super.update();
    }

    checkCollision() {
        return this.mesh.intersectsMesh(this.game.player.mesh)
            || this.intersectsTrail(this.game.player);
    }
}
