<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _ from "lodash";

async function GetInput(): Promise<string[]> {
    const response = await fetch("day1/input.txt");
    const result = await response.text();
    return result.split("\n");
}

const input = ref<string[]>();
onMounted(async () => input.value = await GetInput());

const calByElf = computed<number[]>(() => {
    if (!(input.value && input.value.length))
        return [];

    const calByElf: number[] = [];
    let currentCal = 0;
    for (let i = 0; i < input.value.length; i++) {
        const line = input.value[i];
        if (line === "") {
            calByElf.push(currentCal);
            currentCal = 0;
        } else {
            currentCal += parseInt(line);
        }
    }

    return calByElf;
});
const mostCal = computed(() => _.max(calByElf.value));
const threeMostCal = computed(() => {
    const sortedCalByElf: number[] = _.orderBy(calByElf.value, (e: number) => e);
    return _.sum(sortedCalByElf.slice(-3));
});
</script>

<template>
    <span>Day 1 - Part 1: {{ mostCal }} | Part 2: {{ threeMostCal }}</span>
</template>
