export enum UserCapabilities {
  VIEW = "VIEW",
  EDIT = "EDIT",
  CREATE = "CREATE",
  EXECUTE = "EXECUTE",
  DELETE = "DELETE",
  DETAILS = "DETAILS",
}

export enum UserPermissionNames {
  PROFILE = "PROFILE",
  USER_MANAGEMENT = "USER_MANAGEMENT",
  USER_PERMISSION = "USER_PERMISSION",
  FILE_MANAGEMENT = "FILE_MANAGEMENT",
}

export type PrivilegesListType = {
  [key in UserPermissionNames]: {
    LABEL: string;
    ORDER: number;
    CAPABILITIES: Partial<{
      [key2 in UserCapabilities]: number;
    }>;
  };
};

const PrivilegesList: PrivilegesListType = {
  PROFILE: {
    LABEL: "Profile",
    ORDER: 1,
    CAPABILITIES: {
      VIEW: 101,
      EDIT: 102,
    },
  },
  USER_MANAGEMENT: {
    LABEL: "User Management",
    ORDER: 2,
    CAPABILITIES: {
      VIEW: 111,
      CREATE: 112,
      EDIT: 113,
      DELETE: 114,
    },
  },
  USER_PERMISSION: {
    LABEL: "User Permissions",
    ORDER: 3,
    CAPABILITIES: {
      VIEW: 121,
      CREATE: 122,
      EDIT: 123,
      DELETE: 124,
    },
  },
  FILE_MANAGEMENT: {
    LABEL: "File Permissions",
    ORDER: 4,
    CAPABILITIES: {
      VIEW: 131,
      CREATE: 132,
      EDIT: 133,
      DELETE: 134,
    },
  },
};

export { PrivilegesList };
