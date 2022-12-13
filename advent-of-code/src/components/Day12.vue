<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _ from "lodash";

const day = 12;

async function GetInput(fileName: string): Promise<string[]> {
    const response = await fetch(`day${day}/${fileName}`);
    const result = await response.text();
    return result.split("\n").filter(l => !!l.length);
}

const canvasElement = ref<any>();
const input = ref<string[]>();
onMounted(async () => {
    canvasElement.value = document.getElementById("day-twelve-canvas");
    input.value = await GetInput("input.txt");
});

interface road {
    origin: point,
    destination: point,
    distance: number
}

interface point {
    id: string,
    x: number,
    y: number,
    elevation: number,
    roads: road[]
}

interface map {
    width: number,
    height: number,
    points: point[][],
    start: point,
    end: point
}

function parseMap(inputString: string[]): map {
    const points: point[][] = [];
    let start: point | undefined;
    let end: point | undefined;

    for (let y = 0; y < inputString.length; y++) {
        const rowString = inputString[y];
        const row: point[] = [];
        for (let x = 0; x < rowString.length; x++) {
            const pointString = rowString[x];
            const point: point = {
                id: `${x}-${y}`,
                x: x,
                y: y,
                elevation: getElevation(pointString),
                roads: []
            };

            if (pointString === "S") start = point;
            if (pointString === "E") end = point;

            row.push(point);
        }

        points.push(row);
    }

    if (!start) {
        throw new Error("Start undefined");
    }

    if (!end) {
        throw new Error("End undefined");
    }

    setRoads(points);

    return {
        height: points.length,
        width: points[0].length,
        points: points,
        start: start,
        end: end
    };
}

function setRoads(points: point[][]) {
    for (let y = 0; y < points.length; y++) {
        const previousRow = points[y - 1];
        const row = points[y];
        for (let x = 0; x < row.length; x++) {
            const point = row[x];

            if (x > 0) {
                const leftPoint = row[x - 1];
                point.roads.push({ origin: point, destination: leftPoint, distance: leftPoint.elevation - point.elevation });
                leftPoint.roads.push({ origin: leftPoint, destination: point, distance: point.elevation - leftPoint.elevation });
            }

            if (y > 0) {
                const upPoint = previousRow[x];
                point.roads.push({ origin: point, destination: upPoint, distance: upPoint.elevation - point.elevation });
                upPoint.roads.push({ origin: upPoint, destination: point, distance: point.elevation - upPoint.elevation });
            }
        }
    }
}

function getElevation(char: string): number {
    switch (char) {
        case "S":
            return 0;
        case "E":
            return 25;
        default:
            return char.charCodeAt(0) - 97;
    }
}

function drawMap(map: map) {
    const canvasContext = canvasElement.value.getContext("2d");

    for (let y = 0; y < map.points.length; y++) {
        const row = map.points[y];
        for (let x = 0; x < row.length; x++) {
            const point = row[x];
            const color = getColor(point);
            drawPoint(canvasContext, color, x, y);
        }
    }

    drawPoint(canvasContext, "chartreuse", map.start.x, map.start.y);
    drawPoint(canvasContext, "crimson", map.end.x, map.end.y);
}

function drawPoint(canvasContext: any, color: string, x: number, y: number) {
    const sizeFactor = 10;
    canvasContext.fillStyle = color;
    canvasContext.fillRect(x * sizeFactor, y * sizeFactor, sizeFactor, sizeFactor);
}

function getColor(point: point) {
    const val = 255 - 5 * point.elevation;
    return `rgb(${val}, ${val}, ${val})`;
}

function drawPath(points: point[]) {
    const canvasContext = canvasElement.value.getContext("2d");
    for (const point of points) {
        drawPoint(canvasContext, "orange", point.x, point.y);
    }

    const lastPoint = points[points.length - 1];
    drawPoint(canvasContext, "crimson", lastPoint.x, lastPoint.y);
}

function computeShortestPath(map: map, startingPoint: point, abortDistance: number = Number.MAX_SAFE_INTEGER): point[] | undefined {
    const maxPossibleDistance = Number.MAX_SAFE_INTEGER;
    const allPaths: { [id: string]: road } = {};
    let allPoints: point[] = [];
    for (const row of map.points) {
        for (const point of row) {
            allPoints.push(point);
            const distance = point.id === startingPoint.id ? 0 : maxPossibleDistance;
            allPaths[point.id] = { destination: point, distance: distance, origin: point };
        }
    }

    while (allPoints.length > 0) {
        const closestPoint: point = findClosestPoint(allPoints);
        const baseDistance = allPaths[closestPoint.id].distance;
        if (closestPoint.id === map.end.id || baseDistance > abortDistance)
            break;

        for (const road of closestPoint.roads) {
            updatePath(closestPoint, road, baseDistance);
        }

        _.remove(allPoints, p => p.id === closestPoint.id)
    }

    function findClosestPoint(points: point[]): point {
        let result: point = points[0];
        let min = maxPossibleDistance;
        for (const point of points) {
            const distance = allPaths[point.id].distance;
            if (distance < min) {
                min = distance;
                result = point;
            }
        }
        return result;
    }

    function updatePath(point: point, road: road, baseDistance: number) {
        if (road.distance <= 1) {
            const existingPath = allPaths[road.destination.id];
            const newDistance = baseDistance + 1;
            if (newDistance < existingPath.distance) {
                allPaths[road.destination.id] = { destination: road.destination, distance: newDistance, origin: point }
            }
        }
    }

    let endRoad = allPaths[map.end.id];
    if (!endRoad || endRoad.distance === maxPossibleDistance) {
        return;
    }

    const pathSteps: point[] = [map.end];

    while (endRoad.origin.id !== startingPoint.id) {
        pathSteps.push(endRoad.origin);
        endRoad = allPaths[endRoad.origin.id];
    }

    return _.reverse(pathSteps);
}

const part1 = computed(() => {
    if (!input.value)
        return 0;

    const map = parseMap(input.value);
    return "Computation too slow";
    drawMap(map);
    
    console.time("Dijkstra");
    const shortestPath = computeShortestPath(map, map.start)!;
    console.timeLog("Dijkstra");
    
    drawPath(shortestPath);

    return shortestPath?.length ?? 0;
});

const part2 = computed(() => {
    if (!input.value)
        return 0;

    const map = parseMap(input.value);

    return "Computation too slow";

    const candidates: point[] = [];
    for (const row of map.points) {
        for (const point of row) {
            if (point.elevation === 0) {
                candidates.push(point);
            }
        }
    }

    let selectedPath: point[] = computeShortestPath(map, map.start)!;
    for (const candidate of candidates) {
        const path = computeShortestPath(map, candidate, selectedPath.length) ?? [];
        if (0 < path.length && path.length < selectedPath.length) {
            selectedPath = path;
        }
    }

    drawPath(selectedPath);

    return selectedPath.length;
});

</script>

<template>
    <span>Day {{ day }} - Part 1: {{ part1 }} | Part 2: {{ part2 }}</span>
    <div style="display: none;">
        <canvas id="day-twelve-canvas" width="1320" height="410"></canvas>
    </div>
</template>
