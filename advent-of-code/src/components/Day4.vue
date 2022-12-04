<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _ from "lodash";
import { V_ON_WITH_MODIFIERS } from "@vue/compiler-dom";

const day = 4;

async function GetInput(): Promise<string[]> {
    const response = await fetch(`day${day}/input.txt`);
    const result = await response.text();
    return result.split("\n").filter(l => !!l.length);
}

const input = ref<string[]>();
onMounted(async () => input.value = await GetInput());

class range {
    start: number = 0;
    end: number = 0;

    constructor(start: number, end: number) {
        this.start = start;
        this.end = end;
    }

    contains(other: range): boolean {
        return this.start <= other.start && other.end <= this.end;
    }

    overlap(other: range): boolean {
        return this.start <= other.end && other.start <= this.end;

    }
}

function parsePair(inputLine: string): [range, range] {
    const splitedLine = inputLine.split(",")
    return [parseRange(splitedLine[0]), parseRange(splitedLine[1])]
}

function parseRange(inputRange: string): range {
    const splitedInput = inputRange.split("-");
    return new range(parseInt(splitedInput[0]), parseInt(splitedInput[1]));
}

const part1 = computed(() => {
    if (!input.value)
        return 0;

    return _.chain(input.value)
        .map(parsePair)
        .filter(p => p[0].contains(p[1]) || p[1].contains(p[0]))
        .value()
        .length;
});

const part2 = computed(() => {
    if (!input.value)
        return 0;

    return _.chain(input.value)
        .map(parsePair)
        .filter(p => p[0].overlap(p[1]))
        .value()
        .length;
});

</script>

<template>
    <span>Day {{ day }} - Part 1: {{ part1 }} | Part 2: {{ part2 }}</span>
</template>
