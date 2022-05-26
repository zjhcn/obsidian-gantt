<template>
    <div ref="el">Hello Obsidian！</div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import "frappe-gantt/dist/frappe-gantt.css";
import Gantt, { GanttOptions } from "frappe-gantt";
import * as yaml from 'js-yaml';

export interface Props {
}

export default defineComponent({
    name: "pair",

    props: {
    }, // end props

    setup(props, { attrs, slots, emit }) {
        console.log("yaml", yaml);
        const el = ref<HTMLDivElement>();
        var names: [string, number[]][] = [
            ["Redesign website", [0, 7]],
            ["Write new content", [1, 4]],
            ["Apply new styles", [3, 6]],
            ["Review", [7, 7]],
            ["Deploy", [8, 9]],
            ["Go Live!", [10, 10]]
        ];

        var tasks: any[] = names.map(function (name, i) {
            var today = new Date();
            var start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            var end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            start.setDate(Number(today.getDate()) + name[1][0]);
            end.setDate(Number(today.getDate()) + name[1][1]);
            return {
                start: start,
                end: end,
                name: name[0],
                id: "Task " + i,
                progress: parseInt(String(Math.random() * 100), 10)
            };
        });
        tasks[1].dependencies = "Task 0";
        tasks[2].dependencies = "Task 1";
        tasks[3].dependencies = "Task 2";
        tasks[5].dependencies = "Task 4";
        onMounted(() => {
            if (!el.value) return;
            const options: GanttOptions = {
                on_click: function (task) {
                    console.log(task);
                },
                on_date_change: function (task, start, end) {
                    console.log(task, start, end);
                },
                on_progress_change: function (task, progress) {
                    console.log(task, progress);
                },
                on_view_change: function (mode) {
                    console.log(mode);
                }
            };
            new Gantt(el.value, tasks, options);

        });

        return {
            el
        };
    } // end setup
}); // end defineComponent

</script>

<style>
</style>

