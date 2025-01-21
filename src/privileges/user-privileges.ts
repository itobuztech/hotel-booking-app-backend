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
  FILE_MANAGEMENT = "FILE_MANAGEMENT",
  ITEM_MANAGEMENT = "ITEM_MANAGEMENT",
  BRANCH_MANAGEMENT = "BRANCH_MANAGEMENT",
  ROOM_MANAGEMENT = "ROOM_MANAGEMENT",
  BOOKING_MANAGEMENT = "BOOKING_MANAGEMENT",
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
  ITEM_MANAGEMENT: {
    LABEL: "Item Management",
    ORDER: 5,
    CAPABILITIES: {
      VIEW: 141,
      CREATE: 142,
      EDIT: 143,
      DELETE: 144,
    },
  },
  BRANCH_MANAGEMENT: {
    LABEL: "Branch Management",
    ORDER: 6,
    CAPABILITIES: {
      VIEW: 151,
      CREATE: 152,
      EDIT: 153,
      DELETE: 154,
    },
  },
  ROOM_MANAGEMENT: {
    LABEL: "Room Management",
    ORDER: 7,
    CAPABILITIES: {
      VIEW: 161,
      CREATE: 162,
      EDIT: 163,
      DELETE: 164,
    },
  },
  BOOKING_MANAGEMENT: {
    LABEL: "Booking Management",
    ORDER: 8,
    CAPABILITIES: {
      VIEW: 171,
      CREATE: 172,
      EDIT: 173,
      DELETE: 174,
    },
  },
};

export { PrivilegesList };
