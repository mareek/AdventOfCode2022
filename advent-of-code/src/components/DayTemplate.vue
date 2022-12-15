<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _ from "lodash";

const day = 0;

async function GetInput(fileName: string): Promise<string[]> {
    const response = await fetch(`day${day}/${fileName}`);
    const result = await response.text();
    return result.replace("\r", "").split("\n").filter(l => !!l.length);
}

const input = ref<string[]>();
onMounted(async () => input.value = await GetInput("testInput.txt"));

function computePart1(strInput: string[]) {
    // Your code goes here
    return "not implemented yet";
}

function computePart2(strInput: string[]) {
    // Your code goes here
    return "not implemented yet";
}

function computedBoilerplate(part: number, partComputation: (strinput: string[]) => any) {
    if (!input.value)
        return "No Input";

    const logLabel = `Day ${day} - Part ${part}`;
    console.time(logLabel);
    const result = partComputation(input.value);
    console.timeLog(logLabel);
    console.timeEnd(logLabel);
    return result;
}

const part1 = computed(() => { return computedBoilerplate(1, computePart1); });
const part2 = computed(() => { return computedBoilerplate(2, computePart2); });
</script>

<template>
    <span>Day {{ day }} - Part 1: {{ part1 }} | Part 2: {{ part2 }}</span>
</template>
