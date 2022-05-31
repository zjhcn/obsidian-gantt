declare module "frappe-gantt" {
  export interface GanttTask {
    id: string;
    name: string;
    start: string;
    end: string;
    progress: number;
    dependencies: string;
  }

  export type GanttViewMode =
    | "Day"
    | "Week"
    | "Month"
    | "Quarter Day"
    | "Half Day";

  export type GanttLanguage = "en" | "es" | "ru" | "ptBr" | "fr" | "tr" | "zh";

  export interface GanttOptions
    extends Partial<{
      header_height: number;
      column_width: number;
      step: number;
      view_mode: GanttViewMode;
      bar_height: number;
      bar_corner_radius: number;
      arrow_curve: number;
      padding: number;
      date_format: string;
      popup_trigger: "click" | "hover";
      language: GanttLanguage;
      on_click?: (task: GanttTask) => void;
      on_date_change?: (task: GanttTask, start: Date, end: Date) => void;
      on_progress_change?: (task: GanttTask, progress: number) => void;
      on_view_change?: (mode: GanttTask) => void;
      /**
       * can be a function that returns html
       * or a simple html string */
      custom_popup_html?: (task: GanttTask) => string;
    }> {}
  export default class Gantt {
    constructor(
      element: SVGElement | string,
      tasks: GanttTask[],
      options?: GanttOptions
    );

    refresh(tasks: GanttTask[]): void;
    change_view_mode(mode: GanttViewMode): void;
  }
}
