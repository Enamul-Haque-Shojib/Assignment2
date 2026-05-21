export const USER_ROLE = {
  contributor: "contributor",
  maintainer: "maintainer",
} as const;

export type ROLES = typeof USER_ROLE[keyof typeof USER_ROLE];

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role?: ROLES;
};

export type GetIssuesQuery = {
  sort?: "newest" | "oldest";
  type?: "bug" | "feature_request";
  status?: "open" | "in_progress" | "resolved";
};


export type UpdateIssuePayload = {
  title?: string;
  description?: string;
  type?: "bug" | "feature_request";
};

export type CurrentUser = {
  id: number;
  role: ROLES;
};
