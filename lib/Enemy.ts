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
        const target = this.game.player.getTireOffset(1).subtract(this.mesh.position);
        const angle = -Math.atan2(target.z, target.x) - Math.PI / 2;
        this.mesh.rotation.y = angle;
        this.accelerate(Constants.ACCELERATION);
        super.update();
    }

    checkCollision() {
        super.checkCollision();
        return this.mesh.intersectsMesh(this.game.player.mesh)
            // || this.mesh.intersectsMesh(this.game.player.trailMesh, true);
            || this.intersectsTrail(this.game.player);
    }
}
