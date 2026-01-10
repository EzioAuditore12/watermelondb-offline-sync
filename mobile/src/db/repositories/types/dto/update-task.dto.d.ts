export type UpdateTaskDto = {
  id: string;
} & Partial<{
  name: string;
  isCompleted: boolean;
}>;
