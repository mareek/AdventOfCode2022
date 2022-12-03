<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _ from "lodash";

const day = 3;

async function GetInput(): Promise<string[]> {
    const response = await fetch(`day${day}/input.txt`);
    const result = await response.text();
    return result.split("\n");
}

const input = ref<string[]>();
onMounted(async () => input.value = await GetInput());

function getCompartments(inputLine: string): [string, string] {
    const compartmentLength = inputLine.length / 2;
    return [inputLine.slice(0, compartmentLength), inputLine.slice(compartmentLength)];
}

function getDuplicate(compartments: [string, string]): string {
    for (let i = 0; i < compartments[0].length; i++) {
        const firstItem = compartments[0][i];
        for (let j = 0; j < compartments[1].length; j++) {
            const secondItem = compartments[1][j];
            if (firstItem === secondItem) {
                return firstItem;
            }
        }
    }

    throw new Error("Didn't found any duplicate");
}

function getPriority(item: string) {
    const asciiCode = item.charCodeAt(0);
    if (65 <= asciiCode && asciiCode <= 90) { // A-Z
        const priority = asciiCode - 64 + 26;
        return priority;
    } else if (97 <= asciiCode && asciiCode <= 122) { // a-z
        const priority = asciiCode - 96;
        return priority;
    } else {
        throw new Error("Unknown item : " + item);
    }
}

const part1 = computed(() => {
    return _.chain(input.value)
        .filter(l => !!(l?.length))
        .map(getCompartments)
        .map(getDuplicate)
        .map(getPriority)
        .sum()
        .value();
});

const part2 = computed(() => {
    return 0;
});

</script>

<template>
    <span>Day {{ day }} - Part 1: {{ part1 }} | Part 2: {{ part2 }}</span>
</template>
