<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _ from "lodash";
import { buildShortestPaths, link, type path } from "@/utils/dijkstra";

const day = 16;

async function GetInput(fileName: string): Promise<string[]> {
    const response = await fetch(`day${day}/${fileName}`);
    const result = await response.text();
    return result.replace("\r", "").split("\n").filter(l => !!l.length);
}

const input = ref<string[]>();
onMounted(async () => input.value = await GetInput("testInput.txt"));

class valve {
    readonly id: string;
    readonly flowRate: number;
    readonly links: link[];
    paths: path<valve>[] = [];

    constructor(id: string, flowRate: number, tunnels: string[]) {
        this.id = id;
        this.flowRate = flowRate;
        this.links = tunnels.map(t => new link(id, t, 1));
    }

    initPaths(valves: { [id: string]: valve; }) {
        this.paths = buildShortestPaths(valves, this).filter(p => p.destination.flowRate > 0);
    }
}

class step {
    readonly valve: valve;
    readonly action: string;
    constructor(valve: valve, action: string) {
        this.valve = valve;
        this.action = action;
    }
}

class pathCandidate {
    readonly steps: step[];
    constructor(steps: step[] = []) {
        this.steps = [...steps];
    }

    prepend = (steps: step[]): pathCandidate => new pathCandidate(_.concat(steps, this.steps));
    append = (steps: step[]): pathCandidate => new pathCandidate(_.concat(this.steps, steps));
}

function parseValve(strInput: string): valve {
    // Valve IZ has flow rate=20; tunnels lead to valves LY, XC
    const parseRegex = /^Valve (..) has flow rate=([0-9]*); tunnel.? lead.? to valve.? (.*)$/
    const regexResult = parseRegex.exec(strInput.trim());

    if (!regexResult)
        throw new Error(`Parsing error : [${strInput}]`);

    const namePart = regexResult[1];
    const flowRatePart = regexResult[2];
    const tunnelsPart = regexResult[3];
    return new valve(namePart, parseInt(flowRatePart), tunnelsPart.split(", "))
}

function computePressureReleased(path: pathCandidate): number {
    let result = 0;
    let minutesLeft = 30;
    const openValves: { [id: string]: boolean } = {};
    for (const step of path.steps) {
        minutesLeft -= 1;
        if (minutesLeft <= 0)
            break;

        const valve = step.valve;
        if (step.action === "open" && !openValves[valve.id] && valve.flowRate > 0) {
            result += minutesLeft * valve.flowRate;
            openValves[valve.id] = true;
        }
    }

    return result;
}

function enumerateAllCandidates(currentValve: valve, minutesLeft: number = 30, openValves: { [id: string]: boolean } = {}): pathCandidate[] {
    return [];// toot slow
    if (minutesLeft <= 0) {
        return [];
    } else if (currentValve.flowRate > 0 && !openValves[currentValve.id]) {
        const preSteps: step[] = [new step(currentValve, "open")];
        const newOpenValves = CopyDictionary(openValves);
        newOpenValves[currentValve.id] = true;
        return generateNextMoveSteps(minutesLeft - 1, newOpenValves).map(c => c.prepend(preSteps))
    } else {
        return generateNextMoveSteps(minutesLeft, openValves)
    }

    function generateNextMoveSteps(minutesLeft: number, openValves: { [id: string]: boolean }): pathCandidate[] {
        let result: pathCandidate[] = [];
        for (const path of currentValve.paths.filter(p => !openValves[p.destination.id])) {
            const starter = generatePathSteps(path);
            const candidateTails = enumerateAllCandidates(path.destination, minutesLeft - path.length, openValves);
            if (candidateTails.length) {
                const candidates = candidateTails.map(c => c.prepend(starter));
                result = _.concat(result, candidates);
            } else {
                result.push(new pathCandidate(starter));
            }
        }

        return result;
    }
}

function CopyDictionary(source: { [id: string]: boolean }): { [id: string]: boolean } {
    const result: { [id: string]: boolean } = {};
    for (const key in source) {
        result[key] = source[key];
    }
    return result;
}

function generatePathSteps(path: path<valve>): step[] {
    const result: step[] = [];
    for (const valve of path.steps) {
        result.push(new step(valve, "move"));
    }

    result.push(new step(path.destination, "move"));
    return result;
}

//the complexity of this solution is O(n!). that's right, factoarial(n) where n is the number of valve with a rate>0
function findBestStrategyExhaustive(startingValve: valve): pathCandidate {
    let bestOutcome = 0;
    let result: pathCandidate | undefined = undefined;

    const allCandidates = enumerateAllCandidates(startingValve);
    for (const attempt of allCandidates) {
        const currentOutcome = computePressureReleased(attempt);
        if (bestOutcome < currentOutcome) {
            bestOutcome = currentOutcome;
            result = attempt;
        }
    }

    if (!result)
        throw new Error("no path found");

    return result;
}

function computePart1(strInput: string[]) {
    const valves = strInput.map(parseValve);
    const valveByIds: { [id: string]: valve; } = {};
    valves.forEach(v => valveByIds[v.id] = v);

    for (const valve of valves) {
        valve.initPaths(valveByIds);
    }

    const exampleSteps = [{ action: "move", valve: "DD" }, { action: "open", valve: "DD" }, { action: "move", valve: "CC" }, { action: "move", valve: "BB" }, { action: "open", valve: "BB" }, { action: "move", valve: "AA" }, { action: "move", valve: "II" }, { action: "move", valve: "JJ" }, { action: "open", valve: "JJ" }, { action: "move", valve: "II" }, { action: "move", valve: "AA" }, { action: "move", valve: "DD" }, { action: "move", valve: "EE" }, { action: "move", valve: "FF" }, { action: "move", valve: "GG" }, { action: "move", valve: "HH" }, { action: "open", valve: "HH" }, { action: "move", valve: "GG" }, { action: "move", valve: "FF" }, { action: "move", valve: "EE" }, { action: "open", valve: "EE" }, { action: "move", valve: "DD" }, { action: "move", valve: "CC" }, { action: "open", valve: "CC" }];
    const steps: step[] = exampleSteps.map(s => ({ action: s.action, valve: valveByIds[s.valve] }));
    const exampleCandidate = new pathCandidate(steps);

    const bestCandidate = findBestStrategyExhaustive(valveByIds["AA"]);

    return computePressureReleased(bestCandidate);
}

function computePart2(strInput: string[]) {
    // Your code goes here
    return "not implemented yet";
}

function computedBoilerplate(part: number, partComputation: (strinput: string[]) => any) {
    if (!input.value)
        return "No Input";

    const logLabel = `Day ${day} - Part ${part}`;
    console.time(logLabel);
    const result = partComputation(input.value);
    console.timeEnd(logLabel);
    return result;
}

const part1 = computed(() => { return computedBoilerplate(1, computePart1); });
const part2 = computed(() => { return computedBoilerplate(2, computePart2); });
</script>

<template>
    <span>Day {{ day }} - Part 1: {{ part1 }} | Part 2: {{ part2 }}</span>
</template>
