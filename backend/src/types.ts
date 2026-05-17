export interface User {
  id: string;
  email: string;
  name: string;
  role: "newbie" | "hr" | "mentor" | "admin";
  position: string;
  avatar_url: string | null;
  department_id: string | null;
}

export interface PlanTask {
  task_id: string;
  user_task_id: string;
  title: string;
  description: string;
  type: string;
  status: "pending" | "in_progress" | "done" | "blocked";
  order_index: number;
}

export interface Plan extends Array<any> {
  plan_id: string;
  template_id: string;
  mentor_id: string;
  status: string;
  current_level: number;
  total_xp: number;
  tasks: PlanTask[];
}
