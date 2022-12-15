export class point {
    readonly x: number;
    readonly y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    equals(point: point) {
        return point.x === this.x && point.y === this.y;
    }

    computeManathanDistance(point: point) {
        return Math.abs(this.x - point.x) + Math.abs(this.y - point.y)
    }
}
