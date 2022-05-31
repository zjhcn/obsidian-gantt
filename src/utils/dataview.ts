import { DateTime } from "obsidian-dataview";
import { useObsidianStore } from "src/store";
import { ObsidianLinks } from "src/types";

const metaIgnore = <const>[
  "file",
  "position",
  "cday",
  "ctime",
  "ext",
  "folder",
  "link",
  "inlinks",
  "mday",
  "name",
  "",
];

type ObsidianKey = typeof metaIgnore[number];

export interface ObsidianDV extends Record<string, unknown> {
  _path: string;
  _name: string;
  _links: ObsidianLinks;
  _obsidian: {
    [key in ObsidianKey]: unknown;
  };
}

export function parseDataview(data: Record<string, any>): ObsidianDV {
  const ret: ObsidianDV = {
    _name: data.file.name,
    _path: data.file.path,
    _links: parseLinks(data.file),
    _obsidian: _.pick(data, metaIgnore),
  };

  _.forIn(_.omit(data, metaIgnore), (value: any, key: string) => {
    ret[key] = value;
  });

  return ret;
}

export function parseLinks(file: any): ObsidianLinks {
  const store = useObsidianStore();
  return store.app.metadataCache.resolvedLinks[file.path];
}

export function toFormat(
  time: DateTime | string | null,
  formatStr?: string
): string {
  if (!time) {
    return "";
  }

  // only DateTime.toMillis
  if (time.toMillis) {
    return moment(time.toMillis()).format(formatStr);
  }

  return moment(time).format(formatStr);
}
