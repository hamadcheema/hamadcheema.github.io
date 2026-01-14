
export interface Project {
  id: string;
  title: string;
  category: 'Mobile' | 'PC' | 'Console';
  description: string;
  image: string;
  tags: string[];
  link?: string;
}

export interface Skill {
  name: string;
  level: number;
  icon: string;
}

export interface Service {
  title: string;
  description: string;
  icon: React.ReactNode;
}
