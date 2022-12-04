<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import _ from "lodash";

const day = 0;

async function GetInput(): Promise<string[]> {
    const response = await fetch(`day${day}/input.txt`);
    const result = await response.text();
    return result.split("\n").filter(l => !!l.length);
}

const input = ref<string[]>();
onMounted(async () => input.value = await GetInput());

const part1 = computed(() => {
    return 0;
});

const part2 = computed(() => {
    return 0;
});

</script>

<template>
    <span>Day {{ day }} - Part 1: {{ part1 }} | Part 2: {{ part2 }}</span>
</template>
