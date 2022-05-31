import { GanttTask } from "frappe-gantt";
import { GanttMapping } from "src/types";
import { ObsidianDV, toFormat } from "src/utils/dataview";

export enum EGanttViewMode {
  Day = "Day",
  Week = "Week",
  Month = "Month",
  QuarterDay = "Quarter Day",
  HalfDay = "Half Day",
}

const formatDay = "YYYY-MM-DD HH:mm:ss";
const today = moment().format("YYYY-MM-DD");

export function parseObDataV(
  data: ObsidianDV,
  mapping: GanttMapping
): GanttTask {
  const startKey = mapping.startDate;
  const endKey = mapping.endDate;
  // maybe null
  let start = _.get(data, startKey, today);
  let end = _.get(data, endKey, today);

  return {
    id: _.get(data, mapping.id, data._path) as string,
    name: _.get(data, mapping.name, data._name) as string,
    start: start ? toFormat(start, formatDay) : today,
    end: end ? toFormat(end, formatDay) : today,
    progress: _.get(data, mapping.progress, 0) as number,
    dependencies: data.dependencies as string,
  };
}
