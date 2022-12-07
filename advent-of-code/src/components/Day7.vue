<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _ from "lodash";

const day = 7;

async function GetInput(fileName: string): Promise<string[]> {
    const response = await fetch(`day${day}/${fileName}`);
    const result = await response.text();
    return result.split("\n").filter(l => !!l.length);
}

const input = ref<string[]>();
onMounted(async () => input.value = await GetInput("input.txt"));

interface file {
    name: string,
    size: number
}

class directory {
    name: string;
    subDirectories: directory[] = [];
    files: file[] = [];
    parent: directory | undefined;

    constructor(name: string, parent: directory | undefined) {
        this.name = name;
        this.parent = parent;
    }

    addFile(name: string, size: number) {
        if (_.every(this.files, f => f.name != name)) {
            this.files.push({ name: name, size: size });
        }
    }

    addDirectory(name: string) {
        if (_.every(this.subDirectories, d => d.name != name)) {
            this.subDirectories.push(new directory(name, this));
        }
    }

    getSize(): number {
        const fileSize = _.sum(this.files.map(f => f.size));
        const subDirSize = _.sum(this.subDirectories.map(d => d.getSize()));
        return fileSize + subDirSize;
    }
}

interface dirSize { dir: directory, size: number };

function listDirSizes(dir: directory): dirSize[] {
    const result: dirSize[] = [];
    result.push({ dir: dir, size: dir.getSize() });
    for (const subDir of dir.subDirectories) {
        result.push(...listDirSizes(subDir));
    }

    return result;
}

function parseCommands(commands: string[]): directory {
    const root = new directory("/", undefined);
    if (!commands.length || commands[0] !== "$ cd /")
        throw new Error("incorrect command stream");

    let currentDir = root;
    for (const command of commands) {
        const tokenizeCommand = command.split(" ");
        if (command === "$ cd /") {
            currentDir = root;
        } else if (command === "$ cd ..") {
            if (!currentDir.parent)
                throw new Error("Can't move to parent");

            currentDir = currentDir.parent;
        } else if (command.startsWith("$ cd ")) {
            const destDirName = tokenizeCommand[2];
            const destDir = currentDir.subDirectories.find(d => d.name === destDirName);
            if (!destDir)
                throw new Error("Can't move to " + destDirName);

            currentDir = destDir;
        } else if (tokenizeCommand[0] === "dir") {
            currentDir.addDirectory(tokenizeCommand[1]);
        } else if (!isNaN(parseInt(tokenizeCommand[0]))) {
            currentDir.addFile(tokenizeCommand[1], parseInt(tokenizeCommand[0]));
        }
    }

    return root;
}

const part1 = computed(() => {
    if (!input.value)
        return 0;

    const maxSize = 100000;
    const root = parseCommands(input.value);
    const allDirSizes = listDirSizes(root);

    return _.chain(allDirSizes)
        .filter(d => d.size <= maxSize)
        .map(d => d.size)
        .sum()
        .value();
});

const part2 = computed(() => {
    if (!input.value)
        return 0;

    const diskSize = 70000000;
    const neededFreeSpace = 30000000;

    const root = parseCommands(input.value);
    const actualFreeSpace = diskSize - root.getSize();
    const sizeToDelete = neededFreeSpace - actualFreeSpace;

    const candidates = listDirSizes(root).filter(d => d.size >= sizeToDelete);
    return _.orderBy(candidates, d=>d.size)[0].size;
});

</script>

<template>
    <span>Day {{ day }} - Part 1: {{ part1 }} | Part 2: {{ part2 }}</span>
</template>
