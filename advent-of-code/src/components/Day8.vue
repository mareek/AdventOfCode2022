<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _ from "lodash";

const day = 8;

async function GetInput(fileName: string): Promise<string[]> {
    const response = await fetch(`day${day}/${fileName}`);
    const result = await response.text();
    return result.split("\n").map(l => l.trim()).filter(l => !!l.length);
}

const input = ref<string[]>();
onMounted(async () => input.value = await GetInput("input.txt"));

const map = computed(() => {
    const result: number[][] = [];
    if (!input.value)
        return result;

    for (const line of input.value) {
        const row: number[] = [];
        for (let i = 0; i < line.length; i++) {
            const treeHeight = line[i];
            row.push(parseInt(treeHeight));
        }
        result.push(row);
    }
    return result;
});

function treeIsVisible(map: number[][], x: number, y: number): boolean {
    const treeHeight = map[y][x];
    const row = map[y];
    let visibleFromTheLeft = true;
    for (let i = x - 1; i >= 0; i--) {
        if (treeHeight <= map[y][i]) {
            visibleFromTheLeft = false;
            break;
        }
    }

    let visibleFromTheRight = true;
    for (let i = x + 1; i < row.length; i++) {
        if (treeHeight <= map[y][i]) {
            visibleFromTheRight = false;
            break;
        }
    }

    let visibleFromTheTop = true;
    for (let i = 0; i < y; i++) {
        if (treeHeight <= map[i][x]) {
            visibleFromTheTop = false;
            break;
        }
    }

    let visibleFromTheBottom = true;
    for (let i = y + 1; i < map.length; i++) {
        if (treeHeight <= map[i][x]) {
            visibleFromTheBottom = false;
            break;
        }
    }

    return visibleFromTheLeft || visibleFromTheRight || visibleFromTheTop || visibleFromTheBottom;
}

function computeScenicScore(map: number[][], x: number, y: number): number {
    const treeHeight = map[y][x];
    const row = map[y];
    let leftViewingDistance = 0;
    for (let i = x - 1; i >= 0; i--) {
        leftViewingDistance += 1;
        if (treeHeight <= map[y][i]) {
            break;
        }
    }

    let rightViewingDistance = 0;
    for (let i = x + 1; i < row.length; i++) {
        rightViewingDistance += 1;
        if (treeHeight <= map[y][i]) {
            break;
        }
    }

    let topViewingDistance = 0;
    for (let i = y - 1; i >= 0; i--) {
        topViewingDistance += 1;
        if (treeHeight <= map[i][x]) {
            break;
        }
    }

    let bottomViewingDistance = 0;
    for (let i = y + 1; i < map.length; i++) {
        bottomViewingDistance += 1;
        if (treeHeight <= map[i][x]) {
            break;
        }
    }

    return leftViewingDistance * rightViewingDistance * topViewingDistance * bottomViewingDistance;

}

const part1 = computed(() => {
    if (!input.value)
        return 0;

    let visibleTrees = 0;
    for (let y = 0; y < map.value.length; y++) {
        const row = map.value[y];
        for (let x = 0; x < row.length; x++) {
            if (treeIsVisible(map.value, x, y)) {
                visibleTrees += 1;
            }
        }
    }
    return visibleTrees;
});

const part2 = computed(() => {
    if (!input.value)
        return 0;

    let bestScenicScore = 0;
    for (let y = 0; y < map.value.length; y++) {
        const row = map.value[y];
        for (let x = 0; x < row.length; x++) {
            const scenicScore = computeScenicScore(map.value, x, y);
            if (scenicScore > bestScenicScore) {
                bestScenicScore = scenicScore;
            }
        }
    }
    return bestScenicScore;
});

</script>

<template>
    <span>Day {{ day }} - Part 1: {{ part1 }} | Part 2: {{ part2 }}</span>
</template>
