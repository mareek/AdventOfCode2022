<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _, { floor } from "lodash";

const day = 14;

async function GetInput(fileName: string): Promise<string[]> {
    const response = await fetch(`day${day}/${fileName}`);
    const result = await response.text();
    return result.replace("\r", "").split("\n").filter(l => !!l.length);
}

const input = ref<string[]>();
onMounted(async () => input.value = await GetInput("testInput.txt"));

interface point {
    x: number,
    y: number,
}

class map {
    private readonly emptyCell = ".";
    private objects: string[][];
    private offsetX: number;
    private offsetY: number;

    constructor(minX: number, maxX: number, minY: number, maxY: number) {
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

    fillRock(rockPath: point[]) {
        for (let point = 1; point < rockPath.length; point++) {
            const origin = rockPath[point - 1];
            const destination = rockPath[point];
            const minX = Math.min(origin.x, destination.x);
            const maxX = Math.max(origin.x, destination.x);
            const minY = Math.min(origin.y, destination.y);
            const maxY = Math.max(origin.y, destination.y);
            for (let x = minX; x <= maxX; x++) {
                for (let y = minY; y <= maxY; y++) {
                    this.setObject(x, y, "#");
                }
            }
        }
    }

    dropSand(x: number): boolean {
        let i = 0;
        const maxIteration = 20000;
        let y = 0;
        for (let i = 0; i < maxIteration; i++) {
            if (this.isOffLimit(x, y) || !this.isEmpty(x, y))
                return false;

            if (this.isEmpty(x, y + 1)) {
                y += 1;
            } else if (this.isEmpty(x - 1, y + 1)) {
                x -= 1;
                y += 1;
            } else if (this.isEmpty(x + 1, y + 1)) {
                x += 1;
                y += 1;
            }
            else {
                this.setObject(x, y, "o");
                return true;
            }
        }

        throw new Error("Computing to infinity");
    }

    private isOffLimit(x: number, y: number): boolean {
        const ajustedX = x - this.offsetX;
        const ajustedY = y - this.offsetY;
        return ajustedX < 0 || this.objects[0].length <= ajustedX
            || ajustedY < 0 || this.objects.length <= ajustedY
    }

    private isEmpty(x: number, y: number): boolean {
        return this.isOffLimit(x, y) || this.getObject(x, y) === this.emptyCell;
    }

    private setObject(x: number, y: number, val: string) {
        this.objects[y - this.offsetY][x - this.offsetX] = val;
    }

    private getObject(x: number, y: number): string {
        return this.objects[y - this.offsetY][x - this.offsetX];
    }

    print(): string {
        return this.objects.map(r => r.join("")).join("\n");
    }
}

function parseRockPath(inputLine: string): point[] {
    const result: point[] = [];
    const strPoints = inputLine.split("->");
    for (const strPoint of strPoints) {
        const tokenizedPoint = strPoint.trim().split(",");
        const point = {
            x: parseInt(tokenizedPoint[0]),
            y: parseInt(tokenizedPoint[1])
        };
        result.push(point);
    }
    return result;
}

function buildMap(rockPaths: point[][], withFloor: boolean): map {
    const allY = _.flatMap(rockPaths, ps => ps.map(p => p.y));
    let maxY = _.max(allY)!;
    if (withFloor) {
        maxY += 2;
        const floorWidth = maxY * 2.5;
        const leftX = 500 - Math.floor(floorWidth / 2);
        const rightX = 500 + Math.floor(floorWidth / 2);
        rockPaths.push([{ x: leftX, y: maxY }, { x: rightX, y: maxY }])
    }
    const allX = _.flatMap(rockPaths, ps => ps.map(p => p.x));

    const result = new map(_.min(allX)!, _.max(allX)!, 0, maxY);
    for (const rockPath of rockPaths) {
        result.fillRock(rockPath);
    }
    return result;
}

const caveMap = ref<string>("");

function simulateSandDrop(strRockPaths: string[], withFloor: boolean) {
    const paths = strRockPaths.map(parseRockPath);
    const map = buildMap(paths, withFloor);
    caveMap.value = map.print();

    const maxDrops = 200000;
    let sandDroped = 0;
    while (sandDroped < maxDrops && map.dropSand(500)) {
        sandDroped += 1;
    }
    caveMap.value = map.print();

    return sandDroped;
}

const part1 = computed(() => {
    if (!input.value)
        return 0;

    console.time(`Day ${day} - Part 1`);
    let sandDroped = simulateSandDrop(input.value, false);
    console.timeEnd(`Day ${day} - Part 1`);
    return sandDroped;
});

const part2 = computed(() => {
    if (!input.value)
        return 0;

    console.time(`Day ${day} - Part 2`);
    let sandDroped = simulateSandDrop(input.value, true);
    console.timeEnd(`Day ${day} - Part 2`);
    return sandDroped;
});
</script>

<template>
    <span>Day {{ day }} - Part 1: {{ part1 }} | Part 2: {{ part2 }}</span>
    <pre v-if="false">{{ caveMap }}</pre>
</template>
<style scoped>
pre {
    line-height: 60%;
}
</style>
