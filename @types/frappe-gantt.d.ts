declare module "frappe-gantt" {
  export interface GanttTask {
    id: string;
    name: string;
    start: string;
    end: string;
    progress: number;
    dependencies: string;
    header_height: number;
    column_width: number;
    step: number;
    view_modes: string[];
    bar_height: number;
    bar_corner_radius: number;
    arrow_curve: number;
    padding: number;
    view_mode: "Quarter Day" | "Half Day" | "Day" | "Week" | "Month";
    date_format: string;
  }

  export interface GanttOptions {
    on_click?: (task: GanttTask) => void;
    on_date_change?: (task: GanttTask, start: Date, end: Date) => void;
    on_progress_change?: (task: GanttTask, progress: number) => void;
    on_view_change?: (mode: GanttTask) => void;
    /**
     * can be a function that returns html
     * or a simple html string */
    custom_popup_html?: (task: GanttTask) => string;
  }
  export default class Gantt {
    constructor(
      element: HTMLElement | string,
      tasks: GanttTask[],
      options?: GanttOptions
    );
  }
}
