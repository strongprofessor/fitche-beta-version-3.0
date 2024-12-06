interface User {
  uuid: string;
  username: string;
  password: string;  // hashed
  tapPattern: string;  // hashed
  colorChoice: {
    color: string;
    number: number;
  };
  createdAt: Date;
} 