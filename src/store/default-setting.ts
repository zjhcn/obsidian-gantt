import { defineStore } from "pinia";
import { GanttMapping, ganttMappingKeys, GanttSettings } from "src/types";
import { GanttOptions } from "frappe-gantt";

export interface DefaultSettingState {
  settings: GanttSettings;
}

export const useDefaultSettingStore = defineStore("defaultSetting", {
  state: () =>
    ({
      settings: null as any,
    } as DefaultSettingState),

  getters: {
    mapping(): GanttMapping {
      return _.pick(this.settings, ganttMappingKeys) as GanttMapping;
    },
  },
  actions: {
    reset(settings: GanttSettings) {
      this.settings = settings;
    },
    getSettings(settings: GanttOptions): GanttOptions {
      return {
        ...this.settings.settings,
        ...settings,
      } as GanttOptions;
    },
    getMapping(settings: GanttSettings): GanttMapping {
      return {
        ...this.mapping,
        ..._.pick(settings, ganttMappingKeys),
      } as GanttMapping;
    },
  },
});
