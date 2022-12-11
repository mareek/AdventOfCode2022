<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _ from "lodash";

const day = 11;

async function GetInput(fileName: string): Promise<string[]> {
    const response = await fetch(`day${day}/${fileName}`);
    const result = await response.text();
    return result.split("\n");
}

const input = ref<string[]>();
onMounted(async () => input.value = await GetInput("input.txt"));

interface monkey {
    number: number,
    startingItems: number[],
    items: number[],
    operation: (old: number) => number,
    operationText: string,
    test: (item: number) => boolean,
    testText: string,
    testNumber: number,
    monkeyIfTrue: number,
    monkeyIfFalse: number,
    itemInspectionCount: number,
}

function parseMonkey(sectionText: string[]): monkey {
    //Monkey 0:
    const monkeyNumberText = sectionText[0].split(" ")[1].replace(":", "");
    const monkeyNumber = parseInt(monkeyNumberText);

    //Starting items: 79, 98
    const startingItemsText = sectionText[1].split(":")[1].split(",");
    const getStartingItems = () => startingItemsText.map(t => parseInt(t.trim()));

    //Operation: new = old * 19
    const operationText = sectionText[2].split(":")[1].trim();
    const operation = parseOperation(operationText);

    //  Test: divisible by 23
    const testText = _.last(sectionText[3].split(" ")) ?? "";
    const testNumber = parseInt(testText);
    const test = (item: number) => item % testNumber === 0;

    //    If true: throw to monkey 2
    const monkeyIfTrueText = _.last(sectionText[4].split(" ")) ?? "";
    const monkeyIfTrue = parseInt(monkeyIfTrueText);

    //    If false: throw to monkey 3
    const monkeyIfFalseText = _.last(sectionText[5].split(" ")) ?? "";
    const monkeyIfFalse = parseInt(monkeyIfFalseText);

    return {
        number: monkeyNumber,
        startingItems: getStartingItems(),
        items: getStartingItems(),
        operation: operation,
        operationText: operationText,
        test: test,
        testText: testText,
        testNumber: testNumber,
        monkeyIfTrue: monkeyIfTrue,
        monkeyIfFalse: monkeyIfFalse,
        itemInspectionCount: 0
    };
}

function parseOperation(operationText: string): (old: number) => number {
    //new = old * 19
    const tokens = operationText.split(" ");
    const operator = parseOperator(tokens[3])
    if (tokens[4] === "old") {
        return (old) => operator(old, old);
    }

    return (old) => operator(old, parseInt(tokens[4]));
}

function parseOperator(operatorText: string): (a: number, b: number) => number {
    switch (operatorText) {
        case "+":
            return (a: number, b: number) => a + b;
        case "-":
            return (a: number, b: number) => a - b;
        case "*":
            return (a: number, b: number) => a * b;
        case "/":
            return (a: number, b: number) => a / b;
        default:
            throw new Error("Unknown operator : " + operatorText);
    }
}

function parseMonkeys(inputText: string[]): monkey[] {
    const result: monkey[] = [];
    for (let i = 0; i < inputText.length; i += 7) {
        const section = parseMonkey(inputText.slice(i, i + 6));
        result.push(section);
    }
    return result;
}

function debugMonkeyItems(monkeys: monkey[]) {
    return debugMonkeys(monkeys, (monkey) => monkey.items.join(", "));
}

function debugMonkeyInteractions(monkeys: monkey[]) {
    return debugMonkeys(monkeys, (monkey) => monkey.itemInspectionCount.toString());
}

function debugMonkeys(monkeys: monkey[], valueGetter: (monkey: monkey) => string) {
    for (const monkey of monkeys) {
        console.log(`Monkey ${monkey.number}: ${valueGetter(monkey)}`)
    }
}

function computeRound(monkeys: monkey[], relief: (item: number) => number) {
    for (const monkey of monkeys) {
        for (const item of monkey.items) {
            let worryiedItem = monkey.operation(item);
            worryiedItem = relief(worryiedItem);
            const targetMonkey = monkey.test(worryiedItem) ? monkey.monkeyIfTrue : monkey.monkeyIfFalse;
            monkeys[targetMonkey].items.push(worryiedItem);
            monkey.itemInspectionCount += 1;
        }

        monkey.items = [];
    }
}

const part1 = computed(() => {
    if (!input.value)
        return 0;

    const monkeys = parseMonkeys(input.value);

    for (let round = 1; round <= 20; round++) {
        computeRound(monkeys, i => Math.floor(i / 3));
    }

    monkeys.sort((a, b) => b.itemInspectionCount - a.itemInspectionCount);
    return monkeys[0].itemInspectionCount * monkeys[1].itemInspectionCount;
});

const part2 = computed(() => {
    if (!input.value)
        return 0;

    const monkeys = parseMonkeys(input.value);
    const inspectedRounds = [1, 20, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000];
    // I had to seek help on reddit for this one :(
    let maxWorry = 1;
    monkeys.forEach(monkey => maxWorry *= monkey.testNumber);

    for (let round = 1; round <= 10000; round++) {
        computeRound(monkeys, i => i % maxWorry);
//        if (inspectedRounds.indexOf(round) >= 0) {
//            console.log(`After round ${round}:`);
//            debugMonkeyInteractions(monkeys);
//        }
    }

    monkeys.sort((a, b) => b.itemInspectionCount - a.itemInspectionCount);
    return monkeys[0].itemInspectionCount * monkeys[1].itemInspectionCount;
});

</script>

<template>
    <span>Day {{ day }} - Part 1: {{ part1 }} | Part 2: {{ part2 }}</span>
</template>
