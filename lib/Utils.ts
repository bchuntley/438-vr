export default class Utils {
    static toZero(value: number, threshold: number) {
        if (Math.abs(value) <= threshold) return value;
        return value + (threshold * (value > 0 ? -1 : 1));
    }
}
