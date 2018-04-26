import Constants from "./Constants";
import Game from "./Game";
import Utils from "./Utils";
import _ from "lodash";

export default abstract class Bike {
    static lastId = 0;
    game: Game;
    id: number;
    mesh: BABYLON.AbstractMesh;
    /** 0 is bottom points, 1 is top points */
    trail: BABYLON.Vector3[][] = [
        // trail mesh can't update with different pointarray lengths
        _.range(500).map(() => new BABYLON.Vector3(NaN, NaN, NaN)),
        _.range(500).map(() => new BABYLON.Vector3(NaN, NaN, NaN))
    ];
    trailMesh: BABYLON.Mesh;
    velocity = 0;
    alive = true;
    abstract get trailColor(): BABYLON.Color3;

    constructor(game: Game, mesh: BABYLON.AbstractMesh) {
        this.id = ++Bike.lastId;
        this.game = game;
        this.mesh = mesh;
        this.trailMesh = BABYLON.MeshBuilder.CreateRibbon("trail" + this.id, {
            pathArray: this.trail,
            updatable: true,
            offset: 1,
            sideOrientation: BABYLON.Mesh.BACKSIDE,
            closePath: false,
            closeArray: false
        }, this.game.scene);
        const trailMaterial = new BABYLON.StandardMaterial("trail" + this.id, this.game.scene);
        trailMaterial.alpha = 0.75;
        trailMaterial.diffuseColor = this.trailColor;
        trailMaterial.backFaceCulling = false;
        this.trailMesh.material = trailMaterial;
    }

    update() {
        const oldY = this.mesh.position.y; // correct Y axis
        this.mesh.translate(BABYLON.Axis.X, this.velocity);
        this.mesh.position.y = oldY;
        // decelerate due to friction
        this.velocity = Utils.toZero(this.velocity, 0.001);
        this.prepareTrail();
        if (this.checkCollision()) this.game.stop();
    }

    accelerate(amount: number) {
        this.velocity = Math.max(0, Math.min(Constants.MAXIMUM_VELOCITY, this.velocity + amount));
    }

    rotate(direction: "left" | "right", amount: number) {
        const directionComponent = direction === "left" ? 1 : -1;
        this.mesh.rotation.addInPlace(new BABYLON.Vector3(
            amount * directionComponent,
            amount * -directionComponent / 2,
            0
        ));
        this.fixRotation();
    }

    fixRotation() {
        // avoid tipping over
        this.mesh.rotation.x = Math.max(-Constants.MAXIMUM_ROTATION, Math.min(Constants.MAXIMUM_ROTATION, this.mesh.rotation.x));
    }

    prepareTrail() {
        const lastPoint = this.trail[0][this.trail[0].length - 1];
        const trailPoint = this.getTireOffset(-4); // 4 behind the front tire
        if (Math.abs(BABYLON.Vector3.Distance(trailPoint, lastPoint)) < 0.01) return;
        this.trail.forEach(t => t.splice(0, 1)); // remove first element of each trail point array
        this.trail[0].push(trailPoint.add(new BABYLON.Vector3(0, -1, 0)));
        this.trail[1].push(trailPoint.add(new BABYLON.Vector3(0, 1, 0)));
        const oldTrailMesh = this.trailMesh;
        this.trailMesh = BABYLON.MeshBuilder.CreateRibbon("trail" + this.id, {
            pathArray: this.trail,
            instance: this.trailMesh.clone("trail" + this.id)
        }, this.game.scene);
        oldTrailMesh.dispose(true, false);
    }

    /** returns a position offset from the front tire along the body of the bike */
    getTireOffset(amount: number) {
        return this.mesh.position.add(new BABYLON.Vector3(
            Math.cos(-this.mesh.rotation.y) * amount,
            0,
            Math.sin(-this.mesh.rotation.y) * amount
        ));
    }

    protected abstract checkCollision(): boolean;

    intersectsTrail(other: Bike): boolean {
        return other.trail[1].some(v => this.mesh.intersectsPoint(v) && !isNaN(v.x));
    }
}
