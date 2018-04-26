import Constants from "./Constants";
import Game from "./Game";
import _ from "lodash";

export default class Bike {
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
        trailMaterial.diffuseColor = new BABYLON.Color3(0, 0, 1);
        trailMaterial.backFaceCulling = false;
        this.trailMesh.material = trailMaterial;
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
        const trailPoint = this.getTireOffset();
        if (Math.abs(BABYLON.Vector3.Distance(trailPoint, lastPoint)) < 0.25) return;
        this.trail.forEach(t => t.splice(0, 1));
        this.trail[0].push(trailPoint.add(new BABYLON.Vector3(0, -1, 0)));
        this.trail[1].push(trailPoint.add(new BABYLON.Vector3(0, 1, 0)));
        this.trailMesh = BABYLON.MeshBuilder.CreateRibbon("trail" + this.id, {
            pathArray: this.trail,
            instance: this.trailMesh
        }, this.game.scene);
    }

    protected getTireOffset() {
        return this.mesh.position.add(new BABYLON.Vector3(
            Math.cos(-this.mesh.rotation.y) * -4,
            0,
            Math.sin(-this.mesh.rotation.y) * -4
        ));
    }
}
