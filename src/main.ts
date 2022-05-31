import { Component, MarkdownPostProcessorContext, Plugin } from "obsidian";
import { GanttSettingsTab } from "./setting/Setting";
import { DEFAULT_SETTINGS } from "./default-settings";
import { IGantt } from "src/types";
import { createApp } from "vue";
import { createPiniaApp } from "src/vue";
import Card from "src/components/Card.vue";
import { App } from "vue";
import { pinia } from "./vue/pinia";
import { useDefaultSettingStore } from "./store";

export default class Gantt extends Plugin implements IGantt {
  settingsTab!: GanttSettingsTab;
  settingsStore!: ReturnType<typeof useDefaultSettingStore>;
  dummyVueApp!: App;

  get settings() {
    return this.settingsStore.settings;
  }

  set settings(newSetting: any) {
    this.settingsStore.reset(newSetting);
  }

  async onload() {
    this.dummyVueApp = createPiniaApp(this);
    this.settingsStore = useDefaultSettingStore();

    await this.loadSettings();

    this.settingsTab = new GanttSettingsTab(this, {
      onSettingsChange: async (newSettings) => {
        this.settings = newSettings;
        await this.saveSettings();
      },
    });

    this.addSettingTab(this.settingsTab);

    this.registerPriorityCodeblockPostProcessor(
      "gantt",
      -100,
      async (source: string, el, ctx) =>
        this.gantt(source, el, ctx, ctx.sourcePath)
    );
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  /** Generate a gantt view running the given source in the given element. */
  public async gantt(
    source: string,
    el: HTMLElement,
    component: Component | MarkdownPostProcessorContext,
    sourcePath: string
  ) {
    const app = createApp(Card, {
      source,
      component,
      sourcePath,
    });
    app.use(pinia);
    app.mount(el);
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
    let registered = this.registerMarkdownCodeBlockProcessor(
      language,
      processor
    );
    registered.sortOrder = priority;
  }
}
