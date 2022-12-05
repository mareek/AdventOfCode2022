<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _ from "lodash";

const day = 5;

async function GetInput(fileName: string): Promise<string[]> {
    const response = await fetch(`day${day}/${fileName}`);
    const result = await response.text();
    return result.split("\n").filter(l => !!l.length);
}

const input = ref<string[]>();
const initialState = ref<string[]>();
onMounted(async () => {
    input.value = await GetInput("input.txt");
    initialState.value = await GetInput("initial-state.txt");
});

function parseInitialState(initialState: string[]): string[][] {
    function enumerateLineValues(line: string): string[] {
        const result: string[] = [];
        for (let i = 1; i < line.length; i += 4) {
            result.push(line[i]);
        }
        return result;
    }

    const stackValues = initialState.slice(0, initialState.length - 1).map(enumerateLineValues);
    const stackCount = _.max(stackValues.map(v => v.length))!;
    const stacks: string[][] = [];
    for (let stackIndex = 0; stackIndex < stackCount; stackIndex++) {
        const stack: string[] = [];
        for (let i = stackValues.length - 1; i >= 0; i--) {
            const value = stackValues[i][stackIndex];
            if (value !== " ")
                stack.push(value);
        }
        stacks.push(stack);
    }

    return stacks;
}

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
    const originStack = stacks[command.origin - 1];
    const destinationStack = stacks[command.destination - 1];

    for (let i = 0; i < command.count; i++) {
        destinationStack.push(originStack.pop()!);
    }
}

function applyAdvancedCommand(stacks: string[][], command: moveCommand) {
    const originStack = stacks[command.origin - 1];
    const destinationStack = stacks[command.destination - 1];

    const movingStack: string[] = [];
    for (let i = 0; i < command.count; i++) {
        movingStack.push(originStack.pop()!);
    }

    for (let i = 0; i < command.count; i++) {
        destinationStack.push(movingStack.pop()!);
    }
}

const part1 = computed(() => {
    if (!input.value || !initialState.value)
        return "";

    const stacks = parseInitialState(initialState.value);
    allCommands.value.forEach(command => applyCommand(stacks, command));
    const result = stacks.map(s => s.length ? s[s.length - 1] : " ").join("");
    return result;
});

const part2 = computed(() => {
    if (!input.value || !initialState.value)
        return "";

    const stacks = parseInitialState(initialState.value);
    allCommands.value.forEach(command => applyAdvancedCommand(stacks, command));
    const result = stacks.map(s => s.length ? s[s.length - 1] : " ").join("");
    return result;
});

</script>

<template>
    <span>Day {{ day }} - Part 1: {{ part1 }} | Part 2: {{ part2 }}</span>
</template>
