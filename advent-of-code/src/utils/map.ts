import _ from "lodash";
import type { point } from "./point";

export class map2d {
    private readonly emptyCell = ".";
    private readonly objects: string[][];
    public readonly offsetX: number;
    public readonly offsetY: number;

    constructor(points: point[]) {
        const minX = _.chain(points).map(p => p.x).min().value();
        const maxX = _.chain(points).map(p => p.x).max().value();
        const minY = _.chain(points).map(p => p.y).min().value();
        const maxY = _.chain(points).map(p => p.y).max().value();

        this.offsetX = minX;
        this.offsetY = minY;
        this.objects = [];
        for (let y = minY; y <= maxY; y++) {
            const row: string[] = [];
            for (let x = minX; x <= maxX; x++) {
                row.push(".");
            }
            this.objects.push(row);
        }
    }

    public get height(): number {
        return this.offsetY + this.objects.length;
    }

    public get width(): number {
        return this.objects ? this.offsetX + this.objects[0].length : 0;
    }

    private isOffLimit(point: point): boolean {
        const ajustedX = point.x - this.offsetX;
        const ajustedY = point.y - this.offsetY;
        return ajustedX < 0 || this.objects[0].length <= ajustedX
            || ajustedY < 0 || this.objects.length <= ajustedY
    }

    public isEmpty(point: point): boolean {
        return this.isOffLimit(point) || this.getObject(point) === this.emptyCell;
    }

    public setObject(point: point, val: string, overwrite: boolean = true): boolean {
        if (this.isOffLimit(point))
            return false;

        if (!overwrite && !this.isEmpty(point))
            return false;

        this.objects[point.y - this.offsetY][point.x - this.offsetX] = val;
        return true;
    }

    public getObject(point: point): string {
        return this.objects[point.y - this.offsetY][point.x - this.offsetX];
    }

    print(withLineNumber: boolean = false): string {
        return this.objects.map((r, i) => (withLineNumber ? `${i}\t ` : "") + r.join("")).join("\n");
    }
}
