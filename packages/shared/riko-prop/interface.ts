export interface IOption {
  label: string;
  value: any;
  category?: string;
  children?: IOption[];
  reserved?: Record<string, unknown>;
}
