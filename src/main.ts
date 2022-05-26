import { Component, MarkdownPostProcessorContext, Plugin } from "obsidian";
import { exampleCommand } from "./command/example";
import { exampleComplexCommand } from "./command/example-complex";
import { exampleEditorCommand } from "./command/example-editor";
import { exampleRibbon } from "./ribbon/example";
import { GanttSettingsTab } from "./setting/Setting";
import { DEFAULT_SETTINGS } from "./default-settings";
import { exampleStatusBar } from "./status-bar/example";
import { GanttSettings, IGantt } from "./gantt.type";
import { createApp } from "vue";
import Hello from "src/components/Hello.vue";

export default class Gantt extends Plugin implements IGantt {
  settingsTab!: GanttSettingsTab;
  settings!: GanttSettings;

  async onload() {
    await this.loadSettings();

    exampleRibbon(this);
    exampleStatusBar(this);

    exampleCommand(this);
    exampleComplexCommand(this);
    exampleEditorCommand(this);

    this.settingsTab = new GanttSettingsTab(this, {
      onSettingsChange: async (newSettings) => {
        this.settings = newSettings;
        await this.saveSettings();
      },
    });

    this.addSettingTab(this.settingsTab);

    // DataviewJS codeblocks.
    this.registerPriorityCodeblockPostProcessor(
      "gantt",
      -100,
      async (source: string, el, ctx) =>
        this.dataviewjs(source, el, ctx, ctx.sourcePath)
    );
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  /** Generate a DataviewJS view running the given source in the given element. */
  public async dataviewjs(
    source: string,
    el: HTMLElement,
    component: Component | MarkdownPostProcessorContext,
    sourcePath: string
  ) {
    console.log("source", source);
    console.log("component", component);
    console.log("sourcePath", sourcePath);

    createApp(Hello, {
      source,
    }).mount(el);
  }

  /** Register a markdown codeblock post processor with the given priority. */
  public registerPriorityCodeblockPostProcessor(
    language: string,
    priority: number,
    processor: (
      source: string,
      el: HTMLElement,
      ctx: MarkdownPostProcessorContext
    ) => Promise<void>
  ) {
    console.log("language", language);
    let registered = this.registerMarkdownCodeBlockProcessor(
      language,
      processor
    );
    registered.sortOrder = priority;
  }
}
