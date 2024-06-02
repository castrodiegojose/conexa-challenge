import { UserRole } from '../../../schemas/user.schema';

type ChangeUserRoleResponse = {
  email: string;
  newRole: UserRole;
};

export default ChangeUserRoleResponse;
