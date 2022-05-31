<template>
    <div>
        <div ref="md"></div>
        <div class="gt-gantt-ctrl" v-show="isShow">
            <button class="gt-gantt-ctrl--btn" @click="toggleMode(m.value)" :class="{
                active: m.value === viewMode,
            }" v-for="m in viewModes" :key="m.value">
                {{ m.label }}
            </button>
        </div>
        <svg v-show="isShow" ref="el"></svg>
    </div>
</template>

<script lang="ts">
export default {
    name: "FrappeGantt",
};
</script>

<script lang="ts" setup>
// import { Component, MarkdownRenderer } from "obsidian";
import { computed, onMounted, onUnmounted, ref, toRefs } from "vue";
import "frappe-gantt/dist/frappe-gantt.css";
import Gantt, { GanttOptions, GanttTask } from "frappe-gantt";
import { EGanttViewMode } from "src/utils/frappe-gantt";
import { useViewContext } from "./useContext";

const intervalMaxTimes = 10;
const md = ref<HTMLDivElement>(null as any);

const ctx = useViewContext();

const props = withDefaults(defineProps<{
    tasks: GanttTask[],
    settings?: GanttOptions,
}>(), {
    tasks: () => [],
    options: () => ({} as GanttOptions),
});
const emit = defineEmits(['click', 'date', 'progress', 'view']);
const { tasks } = toRefs(props);

const viewMode = ref(props.settings?.view_mode);

const viewModes = [
    { label: EGanttViewMode.HalfDay, value: EGanttViewMode.HalfDay },
    { label: EGanttViewMode.Day, value: EGanttViewMode.Day },
    { label: EGanttViewMode.Week, value: EGanttViewMode.Week },
    { label: EGanttViewMode.Month, value: EGanttViewMode.Month },
    { label: EGanttViewMode.QuarterDay, value: EGanttViewMode.QuarterDay },
];

const isShow = computed(() => {
    return tasks.value && tasks.value.length > 0;
});

const el = ref<SVGElement>();
const instance = ref<Gantt>();
const events: GanttOptions = {
    on_click: function (task) {
        emit('click', task);
    },
    on_date_change: function (task, start, end) {
        emit("date", task, start, end);
    },
    on_progress_change: function (task, progress) {
        emit("progress", task, progress);
    },
    on_view_change: function (mode) {
        emit("view", mode);
    }
};

function toggleMode(mode: EGanttViewMode) {
    instance.value?.change_view_mode(mode);
    viewMode.value = mode;
}

function onClick() {
    console.log("arguments", arguments);
}

onMounted(async () => {
    // MarkdownRenderer.renderMarkdown(`[[A]]`, md.value, ctx.sourcePath, ctx.component);
    if (!el.value) return;
    if (_.isEmpty(props.tasks)) {
        return;
    }
    const gantt = await init(props.tasks);
    if (!gantt) return;
    instance.value = gantt;
}); // end onMounted
const initTimer = ref<number>();
function init(tasks: GanttTask[]): any {
    let intervalTimes = 10;
    return new Promise<Gantt>((resolve, reject) => {
        if (instance.value) {
            instance.value.refresh(tasks);
            return resolve(instance.value);
        }
        if (el.value == null) {
            initTimer.value = setInterval(() => {
                if (intervalTimes >= intervalMaxTimes) {
                    clearInterval(initTimer.value);
                    reject();
                    return;
                }
                intervalTimes++;
                if (!el.value) return;
                instance.value = new Gantt(el.value, tasks, {
                    ...events,
                    ...props.settings,
                });
            }, 200);
            return;
        }

        instance.value = new Gantt(el.value, tasks, {
            ...events,
            ...props.settings,
        });
        resolve(instance.value);
    });
}

onUnmounted(() => {
    if (initTimer.value) {
        clearInterval(initTimer.value);
    }
});

defineExpose({
    instance,
    init
});
</script>

<style lang="scss">
:root {
    --background-button-active: #f5f5f5;
}

.gt-gantt-ctrl {
    margin-top: 0.2em;
    margin-bottom: 0.7em;

    &--btn {
        background-color: var(--background-button);
        color: var(--text-normal);
        border: 1px solid var(--background-modifier-border);
        box-shadow: 0 1px 1px 0px rgb(0 0 0 / 5%);
        cursor: var(--cursor);
        height: var(--input-height);
        line-height: 0;
        white-space: nowrap;

        &.active {
            background-color: var(--background-button-active);
        }
    }
}
</style>

