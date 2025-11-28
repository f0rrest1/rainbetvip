type BonusCode = {
  id: string;
  code: string;
  description: string;
  category: "Casino" | "Sports" | "Crypto";
  createdAt: string;
  expiresAt?: string;
};

const bonusCodes: BonusCode[] = [
  {
    id: "1",
    code: "FROST20",
    description: "mock data mock data mock data",
    category: "Casino",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    code: "WELCOME100",
    description: "mock data mock data mock data",
    category: "Casino",
    createdAt: new Date().toISOString(),
  },
  {
    id: "3",
    code: "VIP250",
    description: "mock data mock data mock data",
    category: "Casino",
    createdAt: new Date().toISOString(),
  },
];

export default bonusCodes;



