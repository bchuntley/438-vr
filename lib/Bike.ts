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
        _.range(200).map(() => new BABYLON.Vector3(0, 0, 0)),
        _.range(200).map(() => new BABYLON.Vector3(0, 0, 0))
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
        const oldY = this.mesh.position.y;
        this.mesh.translate(BABYLON.Axis.X, this.velocity);
        this.mesh.position.y = oldY;
        // decelerate due to friction
        this.velocity = Utils.toZero(this.velocity, 0.001);
        this.prepareTrail();
    }

    normalRotation() {
        let degrees = (this.mesh.rotation.y * 180 / Math.PI) % 360;
        if (degrees < 0) degrees += 360;
        return degrees * Math.PI / 180;
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
        const trailPoint = this.getTireOffset(-4);
        if (Math.abs(BABYLON.Vector3.Distance(trailPoint, lastPoint)) < 0.25) return;
        this.trail.forEach(t => t.splice(0, 1));
        this.trail[0].push(trailPoint.add(new BABYLON.Vector3(0, -1, 0)));
        this.trail[1].push(trailPoint.add(new BABYLON.Vector3(0, 1, 0)));
        this.trailMesh = BABYLON.MeshBuilder.CreateRibbon("trail" + this.id, {
            pathArray: this.trail,
            instance: this.trailMesh
        }, this.game.scene);
    }

    getTireOffset(amount: number) {
        return this.mesh.position.add(new BABYLON.Vector3(
            Math.cos(-this.mesh.rotation.y) * amount,
            0,
            Math.sin(-this.mesh.rotation.y) * amount
        ));
    }

    protected checkCollision(): boolean {
        if (this.mesh.intersectsMesh(this.game.bounds) || this.mesh.intersectsMesh(this.game.enemy.trailMesh) || this.mesh.intersectsMesh(this.game.player.trailMesh)) return true;
    }
}
