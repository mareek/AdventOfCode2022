<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _ from "lodash";

const day = 10;

async function GetInput(fileName: string): Promise<string[]> {
    const response = await fetch(`day${day}/${fileName}`);
    const result = await response.text();
    return result.split("\n").filter(l => !!l.length);
}

const input = ref<string[]>();
onMounted(async () => input.value = await GetInput("input.txt"));

function getRegisterValues(commands: string[]): number[] {
    const result = [1];
    for (const command of commands) {
        const tokenizedCommand = command.split(" ");
        const lastValue = result[result.length - 1];
        switch (tokenizedCommand[0]) {
            case "noop":
                result.push(lastValue)
                break;
            case "addx":
                result.push(lastValue)
                const increment = parseInt(tokenizedCommand[1]);
                result.push(lastValue + increment)
                break;
            default:
                throw new Error("Unkown command : " + command);
        }
    }

    return result;
}

function debugRegister(registerValues: number[]) {
    for (let i = 0; i < registerValues.length; i++) {
        const register = registerValues[i];
        console.log(`${i}\t: ${register}`);
    }
}

function computeSignlaStrength(registerValues: number[], waveLength: number = 40): number {
    let signalStrength = 0;
    for (let i = waveLength / 2; i <= registerValues.length; i += waveLength) {
        const register = registerValues[i - 1];
        signalStrength += register * (i);
    }
    return signalStrength;
}

function drawScreen(registerValues: number[], screenWidth: number = 40): string[] {
    const result: string[] = [];
    let line: string[] = [];
    let x = 0;
    for (const register of registerValues) {
        const spriteVisible = (register - 1) <= x && x <= (register + 1);
        const pixel = spriteVisible ? "#" : ".";

        line.push(pixel);
        x += 1;
        if (x === screenWidth) {
            x = 0;
            result.push(line.join(""));
            line = [];
        }
    }

    if (line.length) {
        result.push(line.join(""));
    }
    return result;
}

const part1 = computed(() => {
    if (!input.value)
        return 0;

    const registerValues = getRegisterValues(input.value);
    return computeSignlaStrength(registerValues);
});

const part2 = computed(() => {
    if (!input.value)
        return 0;

    const registerValues = getRegisterValues(input.value);
    return drawScreen(registerValues).join("\n");
});

</script>

<template>
    <span>Day {{ day }} - Part 1: {{ part1 }} | Part 2: </span>
    <pre>{{ part2 }}</pre>
</template>

<style scoped>
pre {
    display: inline-block;
    line-height: 60%;
    vertical-align: middle;
}
</style>
