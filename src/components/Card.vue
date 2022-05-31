parseDV<template>
    <div>
        <FrappeGantt ref="gantt" :tasks="tasks" :settings="settings" @progress="onProgress" @click="onClick"
            @date="onDate">
        </FrappeGantt>
    </div>
</template>

<script lang="ts">
export default {
    name: "Card",
};
</script>

<script lang="ts" setup>
import * as yaml from "yaml";
import { GanttOptions, GanttTask } from "frappe-gantt";
import { GanttSettings } from "src/types";
import FrappeGantt from "./FrappeGantt.vue";
import { useDefaultSettingStore, useObsidianStore } from "src/store";
import { Component, onUnmounted, ref } from "vue";
import { ViewContext, useViewContextProvider } from "./useContext";
import { Component as ObComponent } from "obsidian";

const gantt = ref<InstanceType<typeof FrappeGantt>>(null as any);

const store = useObsidianStore();
const settingStore = useDefaultSettingStore();

const props: Readonly<ViewContext> = defineProps<{
    source: string,
    component: ObComponent;
    sourcePath: string;
}>();
useViewContextProvider(props);

const yamlSetting: GanttSettings = props.source
    ? yaml.parse(props.source)
    : {} as any;
const settings: GanttOptions = settingStore.getSettings(yamlSetting.settings as GanttOptions);
const mapping = settingStore.getMapping(yamlSetting);

const tasks = ref<GanttTask[]>([]);

function onClick(task: GanttTask) {
    console.log("Clicked on task: ", task);
}

function onProgress(task: GanttTask, progress: number) {
    store.writeMetaByObj(task.id, {
        [mapping.progress]: progress
    });
}

function onDate(task: GanttTask, start: Date, end: Date) {
    store.writeMetaByObj(task.id, {
        [mapping.startDate]: moment(start).format(settings!.date_format),
        [mapping.endDate]: moment(end).format(settings!.date_format),
    });
}

function queryTasks() {
    if (!yamlSetting.query) {
        return;
    }

    const res = store.tasks(yamlSetting.query, yamlSetting);
    tasks.value = res;
    gantt.value?.init(tasks.value);
}

const throttleQueryTasks = _.throttle(queryTasks, 200);
store.app.metadataCache.on("resolved", throttleQueryTasks);
queryTasks();

onUnmounted(() => {
    store.app.metadataCache.off("resolved", throttleQueryTasks);
});

</script>

<style>
</style>

