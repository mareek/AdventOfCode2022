<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _ from "lodash";
import { point } from "@/utils/point";

const day = 15;

async function GetInput(fileName: string): Promise<string[]> {
    const response = await fetch(`day${day}/${fileName}`);
    const result = await response.text();
    return result.replace("\r", "").split("\n").filter(l => !!l.length);
}

const input = ref<string[]>();
onMounted(async () => input.value = await GetInput("testInput.txt"));

class sensor {
    readonly position: point;
    readonly nearestBeacon: point;
    readonly coveredRange: number;
    constructor(position: point, nearestBeacon: point) {
        this.position = position;
        this.nearestBeacon = nearestBeacon;
        this.coveredRange = position.computeManathanDistance(nearestBeacon);
    }

    pointInRange(pt: point): boolean {
        return this.position.computeManathanDistance(pt) <= this.coveredRange;
    }
}

function parseSensor(line: string): sensor {
    //Sensor at x=2, y=18: closest beacon is at x=-2, y=15
    const splittedLine = line.split(":");

    return new sensor(parsePosition(splittedLine[0]), parsePosition(splittedLine[1]));

    function parsePosition(strPosition: string): point {
        //closest beacon is at x=-2, y=15
        const splittedPosition = strPosition.split(",");
        return new point(parseComponent(splittedPosition[0]), parseComponent(splittedPosition[1]))
        function parseComponent(strComponent: string): number {
            return parseInt(strComponent.split("=")[1]);
        }
    }
}

function countFilledSlotOnLine(sensors: sensor[], y: number): number {
    const sensorsOnLine = sensors.filter(s => s.position.y === y).length;
    const beaconsOnLine = _.chain(sensors).filter(s => s.nearestBeacon.y === y).map(b => b.nearestBeacon.x).uniq().value().length;
    const xMin = _.chain(sensors).map(s => s.position.x - s.coveredRange).min().value();
    const xMax = _.chain(sensors).map(s => s.position.x + s.coveredRange).max().value();
    let pointsCovered = 0;
    for (let x = xMin; x <= xMax; x++) {
        const pt = new point(x, y);
        if (_.some(sensors, s => s.pointInRange(pt))) {
            pointsCovered += 1;
        }
    }
    return pointsCovered - beaconsOnLine - sensorsOnLine;
}

function findBlindSpot(sensors: sensor[], maxPos: number): point {
    const candidates = _.chain(sensors)
        .flatMap(getSensorOuterLimit)
        .filter(p => 0 <= p.x && p.x <= maxPos && 0 <= p.y && p.y <= maxPos)
        .value();

    for (const candidate of candidates) {
        if (_.every(sensors, s => !s.pointInRange(candidate))) {
            return candidate;
        }
    }

    throw new Error("Blind spot not found");
}

function getSensorOuterLimit(sensor: sensor): point[] {
    const result: point[] = [];
    result.push(new point(sensor.position.x, sensor.position.y - sensor.coveredRange - 1))
    for (let deltaY = -sensor.coveredRange; deltaY <= sensor.coveredRange; deltaY++) {
        const y = sensor.position.y + deltaY;
        const xRange = sensor.coveredRange - Math.abs(deltaY) + 1;
        result.push(new point(sensor.position.x - xRange, y));
        result.push(new point(sensor.position.x + xRange, y));
    }
    result.push(new point(sensor.position.x, sensor.position.y + sensor.coveredRange + 1))

    return result;
}

const caveMap = ref<string>("");

function computePart1(strInput: string[]) {
    const sensors = strInput.map(parseSensor);
    return countFilledSlotOnLine(sensors, 10);
}

function computePart2(strInput: string[]) {
    const sensors = strInput.map(parseSensor);
    const blindSpot = findBlindSpot(sensors, 20);
    return 4000000 * blindSpot.x + blindSpot.y
}

function computedBoilerplate(part: number, partComputation: (strinput: string[]) => any) {
    if (!input.value)
        return "No Input";

    const logLabel = `Day ${day} - Part ${part}`;
    console.time(logLabel);
    const result = partComputation(input.value);
    console.timeEnd(logLabel);
    return result;
}

const part1 = computed(() => { return computedBoilerplate(1, computePart1); });
const part2 = computed(() => { return computedBoilerplate(2, computePart2); });
</script>

<template>
    <span>Day {{ day }} - Part 1: {{ part1 }} | Part 2: {{ part2 }}</span>
    <pre v-if="caveMap.length">{{ caveMap }}</pre>
</template>

<style scoped>
pre {
    line-height: 60%;
}
</style>
