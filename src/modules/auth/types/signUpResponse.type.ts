import TokenObject from './tokenObject.type';

type SignUpInResponse = {
  firstName?: string;
  lastName?: string;
  email: string;
  tokens?: TokenObject;
};

export default SignUpInResponse;
