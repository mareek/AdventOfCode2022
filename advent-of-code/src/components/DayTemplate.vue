<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _ from "lodash";

const day = 0;

async function GetInput(fileName: string): Promise<string[]> {
    const response = await fetch(`day${day}/${fileName}`);
    const result = await response.text();
    return result.split("\n").filter(l => !!l.length);
}

const input = ref<string[]>();
onMounted(async () => input.value = await GetInput("input.txt"));

const part1 = computed(() => {
    if (!input.value)
        return 0;

    return _.chain(input.value)
        .map(l => 0)
        .sum()
        .value();
});

const part2 = computed(() => {
    if (!input.value)
        return 0;

    return _.chain(input.value)
        .map(l => 0)
        .sum()
        .value();
});

</script>

<template>
    <span>Day {{ day }} - Part 1: {{ part1 }} | Part 2: {{ part2 }}</span>
</template>
