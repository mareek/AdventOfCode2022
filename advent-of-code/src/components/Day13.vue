<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _ from "lodash";

const day = 13;

async function GetInput(fileName: string): Promise<string[]> {
    const response = await fetch(`day${day}/${fileName}`);
    const result = await response.text();
    return result.replace("\r", "").split("\n");
}

const input = ref<string[]>();
onMounted(async () => input.value = await GetInput("input.txt"));

interface pair {
    first: any[],
    second: any[],
}

function parsePairs(inputStr: string[]): pair[] {
    const result: pair[] = [];
    for (let i = 0; i < inputStr.length; i += 3) {
        const pair = {
            first: JSON.parse(inputStr[i]),
            second: JSON.parse(inputStr[i + 1]),
        };
        result.push(pair);
    }

    return result;
}

function compareItems(item1: any, item2: any): number {
    if (isNumber(item1) && isNumber(item2))
        return compareNumbers(item1, item2);

    return compareArrays(listify(item1), listify(item2))

    function listify(item: any): any[] {
        return isNumber(item) ? [item] : item;
    }
}

function compareArrays(list1: any[], list2: any[]): number {
    for (let i = 0; i < list1.length && i < list2.length; i++) {
        const compareResult = compareItems(list1[i], list2[i]);
        if (compareResult !== 0)
            return compareResult;
    }

    if (list1.length < list2.length)
        return -1;

    if (list2.length < list1.length)
        return 1;

    return 0;
}

function compareNumbers(item1: number, item2: number): number {
    if (item1 < item2)
        return -1;

    if (item2 < item1)
        return 1;

    return 0;
}

function isNumber(value: any): boolean {
    return typeof (value) === "number";
}

const part1 = computed(() => {
    if (!input.value)
        return 0;

    const pairs = parsePairs(input.value);
    let result = 0;
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        if (compareArrays(pair.first, pair.second) === -1) {
            result += i + 1;
        }
    }

    return result;
});

const part2 = computed(() => {
    if (!input.value)
        return 0;

    const packets: any[][] = _.chain(input.value)
        .map(l => l.trim())
        .filter(l => !!l.length)
        .map((l): any[] => JSON.parse(l))
        .value();

    const firstDivider = "[[2]]";
    const secondDivider = "[[6]]";
    packets.push(JSON.parse(firstDivider));
    packets.push(JSON.parse(secondDivider));

    packets.sort(compareArrays);

    const strPackets = packets.map(p => JSON.stringify(p));
    const firstDividerPos = strPackets.indexOf(firstDivider) + 1;
    const secondDividerPos = strPackets.indexOf(secondDivider) + 1;
    return firstDividerPos * secondDividerPos;
});
</script>

<template>
    <span>Day {{ day }} - Part 1: {{ part1 }} | Part 2: {{ part2 }}</span>
</template>
