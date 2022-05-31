import { GanttOptions } from "frappe-gantt";
import { Plugin } from "obsidian";

export interface TapMap {}

export const ganttMappingKeys = <const>[
  "startDate",
  "endDate",
  "progress",
  "name",
  "id",
  "dependencies",
];

export type GanttMappingKeys = typeof ganttMappingKeys[number];

export interface GanttMapping extends Record<GanttMappingKeys, string> {}

export interface GanttSettings extends GanttMapping {
  query: string;
  settings?: GanttOptions;
}

export interface IGantt {
  settings: GanttSettings;

  loadSettings: () => any;
  saveSettings: () => any;
}

export type GanttPlugin = Plugin & IGantt;

export type ObsidianLinks = Record<string, number>;
