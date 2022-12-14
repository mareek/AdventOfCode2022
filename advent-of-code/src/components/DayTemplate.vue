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

const part1 = computed(() => {
    if (!input.value)
        return 0;

    const logLabel = `Day ${day} - Part 1`;
    console.time(logLabel);
    // Your code goes here
    const result = "not implemented yet";
    console.timeLog(logLabel);
    console.timeEnd(logLabel);
    return result;
});

const part2 = computed(() => {
    if (!input.value)
        return 0;

        const logLabel = `Day ${day} - Part 2`;
    console.time(logLabel);
    // Your code goes here
    const result = "not implemented yet";
    console.timeLog(logLabel);
    console.timeEnd(logLabel);
    return result;
});
</script>

<template>
    <span>Day {{ day }} - Part 1: {{ part1 }} | Part 2: {{ part2 }}</span>
</template>
