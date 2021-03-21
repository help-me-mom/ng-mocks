export type FORMAT_SINGLE = string | HTMLElement | { nativeNode: any } | { nativeElement: any } | { debugElement: any };
export type FORMAT_SET =
  | string[]
  | HTMLElement[]
  | Array<{ nativeNode: any }>
  | Array<{ nativeElement: any }>
  | Array<{ debugElement: any }>;
