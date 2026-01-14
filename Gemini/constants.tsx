
import React from 'react';
import { Gamepad2, Code2, Smartphone, Monitor, Zap, Layout, Rocket, Bug } from 'lucide-react';
import { Project, Skill, Service } from './types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Neon Drift Racing',
    category: 'PC',
    description: 'High-octane arcade racer featuring realistic physics and procedural neon environments built in Unity HDRP.',
    image: 'https://picsum.photos/seed/racing/800/450',
    tags: ['Unity', 'C#', 'HDRP', 'Physics'],
    link: '#'
  },
  {
    id: '2',
    title: 'Shadow Archer VR',
    category: 'Console',
    description: 'Immersive VR combat experience with advanced projectile math and inverse kinematics for realistic bow movement.',
    image: 'https://picsum.photos/seed/vr/800/450',
    tags: ['Unity VR', 'Oculus SDK', 'Optimization'],
    link: '#'
  },
  {
    id: '3',
    title: 'Giga Blast Mobile',
    category: 'Mobile',
    description: 'Casual mobile shooter optimized for Android and iOS with complex particle systems and Unity Ads integration.',
    image: 'https://picsum.photos/seed/mobile/800/450',
    tags: ['Android', 'iOS', 'AdMob', 'Performance'],
    link: '#'
  },
  {
    id: '4',
    title: 'Medieval Siege',
    category: 'PC',
    description: 'Real-time strategy prototype showcasing custom pathfinding AI and massive unit crowd simulation.',
    image: 'https://picsum.photos/seed/strategy/800/450',
    tags: ['AI', 'ECS', 'C#', 'Pathfinding'],
    link: '#'
  }
];

export const SKILLS: Skill[] = [
  { name: 'Unity Engine', level: 95, icon: '🎮' },
  { name: 'C# Scripting', level: 90, icon: '💻' },
  { name: 'Shaders & VFX', level: 85, icon: '✨' },
  { name: 'Mobile Optimization', level: 88, icon: '📱' },
  { name: 'UI/UX Design', level: 80, icon: '🎨' },
  { name: 'Game Physics', level: 85, icon: '⚛️' },
  { name: 'Backend & APIs', level: 75, icon: '🌐' },
  { name: 'Multiplayer (Mirror)', level: 70, icon: '👥' },
];

export const SERVICES: Service[] = [
  {
    title: 'Full Game Development',
    description: 'End-to-end development from initial concept to final deployment on Steam, Google Play, or App Store.',
    icon: <Rocket className="w-6 h-6 text-purple-500" />
  },
  {
    title: 'Prototype Creation',
    description: 'Rapid prototyping of mechanics to test fun factors before committing to full-scale development.',
    icon: <Zap className="w-6 h-6 text-cyan-500" />
  },
  {
    title: 'Optimization & Porting',
    description: 'Improving frame rates and memory usage for smooth performance on low-end mobile devices.',
    icon: <Layout className="w-6 h-6 text-emerald-500" />
  },
  {
    title: 'Bug Fixing & Maintenance',
    description: 'Identifying and smashing persistent bugs and updating legacy code for modern Unity versions.',
    icon: <Bug className="w-6 h-6 text-red-500" />
  }
];
