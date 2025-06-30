// src/lib/utils.ts

export const cn = (...classes: (string | undefined | null | false)[]) =>
    classes.filter(Boolean).join(" ");
  