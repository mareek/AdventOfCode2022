<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _ from "lodash";

const day = 5;

async function GetInput(): Promise<string[]> {
    const response = await fetch(`day${day}/input.txt`);
    const result = await response.text();
    return result.split("\n").filter(l => !!l.length);
}

const input = ref<string[]>();
onMounted(async () => input.value = await GetInput());

/*
                [B] [L]     [J]    
            [B] [Q] [R]     [D] [T]
            [G] [H] [H] [M] [N] [F]
        [J] [N] [D] [F] [J] [H] [B]
    [Q] [F] [W] [S] [V] [N] [F] [N]
[W] [N] [H] [M] [L] [B] [R] [T] [Q]
[L] [T] [C] [R] [R] [J] [W] [Z] [L]
[S] [J] [S] [T] [T] [M] [D] [B] [H]
 1   2   3   4   5   6   7   8   9  */

const getInitialStack = () => [
    ["S", "L", "W"],
    ["J", "T", "N", "Q",],
    ["S", "C", "H", "F", "J"],
    ["T", "R", "M", "W", "N", "G", "B"],
    ["T", "R", "L", "S", "D", "H", "Q", "B"],
    ["M", "J", "B", "V", "F", "H", "R", "L"],
    ["D", "W", "R", "N", "J", "M"],
    ["B", "Z", "T", "F", "H", "N", "D", "J"],
    ["H", "L", "Q", "N", "B", "F", "T"],
];

interface moveCommand {
    count: number,
    origin: number,
    destination: number
}

function parseCommand(inputLine: string): moveCommand {
    // move 8 from 5 to 8
    const tokens = inputLine.split(" ");
    return {
        count: parseInt(tokens[1]),
        origin: parseInt(tokens[3]),
        destination: parseInt(tokens[5]),
    };
}

const allCommands = computed(() => {
    if (!input.value)
        return [];

    return input.value.map(parseCommand);
});

function applyCommand(stacks: string[][], command: moveCommand) {
    for (let i = 0; i < command.count; i++) {
        const crate = stacks[command.origin - 1].pop() ?? "";
        stacks[command.destination - 1].push(crate);
    }
}

function applyAdvancedCommand(stacks: string[][], command: moveCommand) {
    const originStack = stacks[command.origin - 1];
    const movingStack = originStack.slice(originStack.length - command.count);
    for (let i = 0; i < movingStack.length; i++) {
        const crate = movingStack[i];
        stacks[command.destination - 1].push(crate);
    }

    stacks[command.origin - 1] = originStack.slice(0, originStack.length - command.count);
}

const part1 = computed(() => {
    if (!input.value)
        return 0;

    const stacks = getInitialStack();
    allCommands.value.forEach(command => applyCommand(stacks, command));
    const result = stacks.map(s => s.length ? s[s.length - 1] : " ").join("");
    return result;
});

const part2 = computed(() => {
    if (!input.value)
        return 0;

    const stacks = getInitialStack();
    allCommands.value.forEach(command => applyAdvancedCommand(stacks, command));
    const result = stacks.map(s => s.length ? s[s.length - 1] : " ").join("");
    return result;
});

</script>

<template>
    <span>Day {{ day }} - Part 1: {{ part1 }} | Part 2: {{ part2 }}</span>
</template>
