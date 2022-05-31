import { defineStore } from "pinia";
import {
  App,
  CachedMetadata,
  DataWriteOptions,
  FrontMatterCache,
  Plugin,
  TAbstractFile,
  TFile,
} from "obsidian";
import { GanttMapping, GanttPlugin, GanttSettings } from "src/types";
import { getAPI } from "obsidian-dataview";
import { ObsidianDV, parseDataview } from "src/utils/dataview";
import { parseObDataV } from "src/utils/frappe-gantt";
import { GanttTask } from "frappe-gantt";
import * as yaml from "yaml";
import { DataArray } from "obsidian-dataview/lib/api/data-array";
import { useDefaultSettingStore } from "src/store";

export interface ObsidianState {
  app: App;
  plugin: GanttPlugin;
}

type StringOrFile = string | TFile | TAbstractFile;

export const useObsidianStore = defineStore("obsidian", {
  state: () =>
    ({
      app: null as any,
      plugin: null as any,
    } as ObsidianState),
  actions: {
    init(plugin: GanttPlugin) {
      if (plugin === this.$state.plugin) {
        return;
      }

      this.plugin = plugin;
      this.app = plugin.app;
    },

    pages(query: string) {
      return getAPI(this.$state.app as App)?.pages(query);
    },

    tasks(query: string, settings: GanttSettings): GanttTask[] {
      const pages = this.pages(query)?.sort((a, b) => a.file.name);
      let data = pages?.map(parseDataview);
      if (!data) {
        return [];
      }

      const settingStore = useDefaultSettingStore();
      data = genDependencies(data, settingStore.getMapping(settings));
      return data.map((v) => parseObDataV(v, settingStore.getMapping(settings)))
        .values as GanttTask[];
    },

    getFile(path: StringOrFile): TFile {
      if (path instanceof TFile || path instanceof TAbstractFile) {
        return path as TFile;
      }
      const file = this.app.vault.getAbstractFileByPath(path);
      if (!file) {
        throw new Error("File not found");
      }

      return file as TFile;
    },

    getFileCache(path: StringOrFile): CachedMetadata {
      const cachedMetadata = this.app.metadataCache.getFileCache(
        this.getFile(path)
      );
      if (!cachedMetadata) {
        throw new Error("cachedMetadata not found");
      }

      return cachedMetadata;
    },

    getFM(path: StringOrFile): FrontMatterCache {
      return this.getFileCache(path).frontmatter ?? ({} as FrontMatterCache);
    },

    async readFile(file: StringOrFile): Promise<string> {
      if (_.isString(file)) {
        file = this.getFile(file);
      }

      const content = await this.app.vault.read(file as any);
      return content;
    },

    async writeMetaByObj(file: StringOrFile, obj: Record<string, any>) {
      const fm = this.getFM(file);
      const meta = _.omit(fm, "position");

      return this.writeMeta(file, _.merge(meta, obj));
    },

    async writeMeta(file: StringOrFile, meta: Record<string, any>) {
      const content = await this.readFile(file);
      const fm = this.getFM(file);

      return this.writeFile(
        this.getFile(file),
        addFm(trimFm(content, fm), meta)
      );
    },

    writeFile(file: StringOrFile, data: string, options?: DataWriteOptions) {
      return this.app.vault.adapter.write(this.getFile(file).path, data);
    },
  },
});

function trimFm(content: string, fm: FrontMatterCache) {
  const ret = content.split("\n");
  let startLine = fm && fm.position ? fm.position.end.line + 1 : 0;
  return ret.slice(startLine).join("\n");
}

function addFm(content: string, meta: Record<string, any>) {
  return `---
${yaml.stringify(_.omit(meta, "position"), {
  nullStr: "",
})}---
${content}`;
}

function genDependencies(
  data: DataArray<ObsidianDV>,
  mapping: GanttMapping
): DataArray<ObsidianDV> {
  if (mapping.dependencies) {
    return data.map((v) => ({
      ...v,
      dependencies: v[mapping.dependencies],
    }));
  }
  const dependenciesMap = new Map<string, Set<string>>();
  data.forEach((item) => {
    const links = item?._links;
    if (links) {
      _.forIn(links, (v, key) => {
        let set = dependenciesMap.get(key);
        if (!set) {
          set = new Set();
          dependenciesMap.set(key, set);
        }
        set.add(item._path);
      });
    }
  });

  return data.map((item) => {
    let dependencies = "";
    if (dependenciesMap.has(item._path)) {
      dependencies = [...(dependenciesMap.get(item._path) ?? [])].join(",");
    }
    return {
      ...item,
      dependencies,
    } as ObsidianDV;
  });
}
