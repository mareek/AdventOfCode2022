<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _, { tail } from "lodash";

const day = 9;

async function GetInput(fileName: string): Promise<string[]> {
    const response = await fetch(`day${day}/${fileName}`);
    const result = await response.text();
    return result.split("\n").filter(l => !!l.length);
}

const input = ref<string[]>();
onMounted(async () => input.value = await GetInput("input.txt"));

interface point { x: number, y: number };

function moveHead(headPosition: point, direction: string): point {
    switch (direction) {
        case "U":
            return { x: headPosition.x, y: headPosition.y + 1 };
        case "D":
            return { x: headPosition.x, y: headPosition.y - 1 };
        case "L":
            return { x: headPosition.x - 1, y: headPosition.y };
        case "R":
            return { x: headPosition.x + 1, y: headPosition.y };
        default:
            throw new Error("Unknown direction: " + direction);
    }
}

function getNewTailPosition(headPosition: point, tailPosition: point): point {
    const xDiff = headPosition.x - tailPosition.x;
    const yDiff = headPosition.y - tailPosition.y;
    if (Math.abs(xDiff) <= 1 && Math.abs(yDiff) <= 1) {
        return { x: tailPosition.x, y: tailPosition.y }
    }

    let x = headPosition.x;
    let y = headPosition.y;
    if (xDiff > 1) {
        x -= 1;
    } else if (xDiff < -1) {
        x += 1;
    }

    if (yDiff > 1) {
        y -= 1;
    } else if (yDiff < -1) {
        y += 1;
    }

    return { x: x, y: y };
}

function getAllTailPositions(startingPoint: point, headMoves: string[], knotCount: number = 2): point[] {
    const tailPositions = [startingPoint];
    const knots: point[] = [];
    for (let i = 0; i < knotCount; i++) {
        knots.push(startingPoint);
    }

    for (const move of headMoves) {
        const tokenizedMove = move.split(" ");
        const direction = tokenizedMove[0];
        const moveCount = parseInt(tokenizedMove[1]);
        for (let i = 0; i < moveCount; i++) {
            knots[0] = moveHead(knots[0], direction);
            for (let j = 1; j < knots.length; j++) {
                knots[j] = getNewTailPosition(knots[j - 1], knots[j]);
            }
            tailPositions.push(knots[knotCount - 1]);
        }
    }

    return tailPositions;
}

const part1 = computed(() => {
    if (!input.value)
        return 0;
    const allTaimPositions = getAllTailPositions({ x: 0, y: 0 }, input.value)
    return _.chain(allTaimPositions)
        .map(p => JSON.stringify(p))
        .uniq()
        .value()
        .length;
});

const part2 = computed(() => {
    if (!input.value)
        return 0;

    const allTaimPositions = getAllTailPositions({ x: 0, y: 0 }, input.value, 10)
    return _.chain(allTaimPositions)
        .map(p => JSON.stringify(p))
        .uniq()
        .value()
        .length;
});

</script>

<template>
    <span>Day {{ day }} - Part 1: {{ part1 }} | Part 2: {{ part2 }}</span>
</template>
