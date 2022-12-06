<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _ from "lodash";

const day = 6;

async function GetInput(fileName: string): Promise<string> {
    const response = await fetch(`day${day}/${fileName}`);
    const result = await response.text();
    return result;
}

const input = ref<string>();
onMounted(async () => input.value = await GetInput("input.txt"));

function findMarkerPosition(bufferLength: number): number {
    if (!input.value)
        return 0;

    for (let i = bufferLength - 1; i < input.value.length; i++) {
        const buffer: string[] = [];
        for (let j = 0; j < bufferLength; j++) {
            buffer.push(input.value[i - j]);
        }
        
        if (_.every(buffer, e => buffer.filter(b => b === e).length === 1)) {
            return i + 1;
        }
    }

    return 0;
}

const part1 = computed(() => {
    if (!input.value)
        return 0;

    return findMarkerPosition(4);
});

const part2 = computed(() => {
    if (!input.value)
        return 0;

    return findMarkerPosition(14);
});

</script>

<template>
    <span>Day {{ day }} - Part 1: {{ part1 }} | Part 2: {{ part2 }}</span>
</template>
