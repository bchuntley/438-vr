export default class Utils {
    static toZero(value: number, threshold: number) {
        if (Math.abs(value) <= threshold) return value;
        return value + (threshold * (value > 0 ? -1 : 1));
    }

    static GetAngleBetweenVectors(vector0: BABYLON.Vector3, vector1: BABYLON.Vector3, normal: BABYLON.Vector3): number {
        const v0: BABYLON.Vector3 = vector0.clone().normalize();
        const v1: BABYLON.Vector3 = vector1.clone().normalize();
        const dot: number = BABYLON.Vector3.Dot(v0, v1);
        const n = BABYLON.Vector3.Cross(v0, v1);
        if (BABYLON.Vector3.Dot(n, normal) > 0) {
            return Math.acos(dot);
        }
        return -Math.acos(dot);
    }
}
