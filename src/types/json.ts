export interface IJson {
  externalUrl?: string;
  internalUrl?: string;
  internalChildUrl?: string;
  list: {
    name: string;
    label: string;
    type: string;
    value?: string;
    id?: string;
  }[][];
  title: string;
  single: {
    name: string;
    label: string;
    type: string;
    format?: string;
    value?: string;
    singleLine?: boolean;
  }[][];
  create: {
    name: string;
    label: string;
    type: string;
    required?: boolean;
  }[];
  main?: {
    name: string;
    label: string;
    type: string;
  }[][];
  idKey?: string;
  titleKeyName?: string;
}
