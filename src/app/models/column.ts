export interface Column {
  id: number;
  name: string;
  position: number;
  // Optional CSS color string (hex, rgb, named) used by the UI to tint the column
  color?: string;
}
