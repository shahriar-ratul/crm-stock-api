import { PermissionEntity } from "../entities/Permission.entity";
import { RoleEntity } from "../entities/Role.entity";

export interface AdminResponse {
  id: number;
  username: string;
  email: string;
  phone: string;

  permissions?: PermissionEntity[] | null;
  roles?: RoleEntity[] | null;
}
