export interface UserJwtPayload {
    userId: string;
    email: string;
    type: "access" | "refresh";
}