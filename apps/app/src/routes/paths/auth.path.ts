const defaultPath = "/auth";

export const authPath = {
  default: defaultPath,
  login: `${defaultPath}/login`,
  register: `${defaultPath}/register`,
} as const;
