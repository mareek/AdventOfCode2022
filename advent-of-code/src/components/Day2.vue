<script setup lang="ts">
import _ from "lodash";
import { ref, onMounted, computed } from "vue";

async function GetInput(): Promise<string[]> {
    const response = await fetch("day2/input.txt");
    const result = await response.text();
    return result.split("\n");
}

const input = ref<string[]>();
onMounted(async () => input.value = await GetInput());

const finalScorePart1 = computed(() => input.value && _.sum(input.value?.map(l => computeRoundScore(l, 1))));
const finalScorePart2 = computed(() => input.value && _.sum(input.value?.map(l => computeRoundScore(l, 2))));

enum hand {
    rock = 1,
    paper = 2,
    scissors = 3
}

enum outCome {
    win = 6,
    draw = 3,
    loss = 0
}

function computeRoundScore(roundLine: string, strategy: number): number {
    if (roundLine.length < 2)
        return 0;

    const elfHand = parseHand(roundLine[0]);
    const myHand = getMyHand(roundLine, strategy);
    const roundOutcome = computeOutcome(elfHand, myHand);
    return myHand + roundOutcome;
}

function getMyHand(roundLine: string, strategy: number): hand {
    switch (strategy) {
        case 1:
            return parseHand(roundLine[2]);
        case 2:
            const elfHand = parseHand(roundLine[0]);
            const expectedOutcome = parseOutcome(roundLine[2]);
            const allHands = [hand.rock, hand.paper, hand.scissors];
            return allHands.filter(h => expectedOutcome === computeOutcome(elfHand, h))[0];
        default:
            throw new Error("Unkown strategy :" + strategy);
    }
}

function computeOutcome(elfHand: hand, myHand: hand): outCome {
    if (elfHand === myHand) {
        return outCome.draw;
    } else if (elfHand === hand.rock && myHand === hand.scissors
        || elfHand === hand.paper && myHand === hand.rock
        || elfHand === hand.scissors && myHand === hand.paper) {
        return outCome.loss;
    } else {
        return outCome.win;
    }
}

function parseHand(strHand: string): hand {
    switch (strHand) {
        case "A":
        case "X":
            return hand.rock;
        case "B":
        case "Y":
            return hand.paper;
        case "C":
        case "Z":
            return hand.scissors;
        default:
            throw new Error("Unkown hand :" + strHand);
    }
}

function parseOutcome(strOutcome: string): outCome {
    switch (strOutcome) {
        case "X":
            return outCome.loss;
        case "Y":
            return outCome.draw;
        case "Z":
            return outCome.win;
        default:
            throw new Error("Unkown outcome :" + strOutcome);
    }
}
</script>

<template>
    <span>Day 2 - Part 1: {{ finalScorePart1 }} | Part 2: {{ finalScorePart2 }} </span>
</template>