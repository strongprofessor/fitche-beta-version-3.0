import * as bcrypt from 'bcrypt';

class AuthService {
  async verifyUsernamePassword(username: string, password: string) {
    const user = await findUserByUsername(username);
    if (!user) throw new Error('User not found');
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid;
  }

  async verifyTapPattern(username: string, pattern: string) {
    const user = await findUserByUsername(username);
    return await bcrypt.compare(pattern, user.tapPattern);
  }

  async verifyColorNumber(
    username: string, 
    color: string, 
    number: number
  ) {
    const user = await findUserByUsername(username);
    return user.colorChoice.color === color && 
           user.colorChoice.number === number;
  }

  isAuthenticationComplete(verifiedMethods: AuthMethod[]): boolean {
    return verifiedMethods.length >= 2;
  }
} 