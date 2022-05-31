import { inject, InjectionKey, provide } from "vue";
import { Component, MarkdownPostProcessorContext } from "obsidian";

export interface ViewContext {
  source: string;
  component: Component;
  sourcePath: string;
}

export const ctxKey = Symbol("ViewContext") as InjectionKey<ViewContext>;

export const useViewContextProvider = (value: ViewContext) => {
  provide(ctxKey, value);
};

export const useViewContext = () => {
  const ctx = inject(ctxKey);
  if (!ctx) {
    throw new Error("No ViewContext found");
  }
  return ctx;
};
