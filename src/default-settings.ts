import { GanttSettings } from "src/types";

export const DEFAULT_SETTINGS: Partial<GanttSettings> = {
  // mapping settings
  startDate: "startDate",
  endDate: "endDate",
  progress: "progress",

  // frappe-gantt settings
  settings: {
    arrow_curve: 5,
    bar_corner_radius: 3,
    bar_height: 30,
    column_width: 30,
    date_format: "YYYY-MM-DD HH:mm",
    header_height: 50,
    language: "zh",
    padding: 18,
    popup_trigger: "click",
    step: 2,
    view_mode: "Day",
  },
};
