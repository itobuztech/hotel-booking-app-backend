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
}

export type PrivilegesListType = {
    [key in UserPermissionNames]: {
        LABEL: string;
        ORDER: number;
        CAPABILITIES: Partial<
            {
                [key2 in UserCapabilities]: number;
            }
        >;
    };
};

const PrivilegesList: PrivilegesListType = {
    PROFILE: {
        LABEL: "Profile",
        ORDER: 1,
        CAPABILITIES: {
            VIEW: 101,
            EDIT: 102
        }
    },
    USER_MANAGEMENT: {
        LABEL: "User Management",
        ORDER: 2,
        CAPABILITIES: {
            VIEW: 201,
            CREATE: 202,
            EDIT: 203,
            DELETE: 204,
        },
    },
    USER_PERMISSION: {
        LABEL: "User Permissions",
        ORDER: 3,
        CAPABILITIES: {
            VIEW: 301,
            CREATE: 302,
            EDIT: 303,
            DELETE: 304,
        },
    },
}

export { PrivilegesList };