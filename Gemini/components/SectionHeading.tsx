
import React from 'react';

interface Props {
  title: string;
  subtitle?: string;
  center?: boolean;
}

const SectionHeading: React.FC<Props> = ({ title, subtitle, center = true }) => {
  return (
    <div className={`mb-12 ${center ? 'text-center' : ''}`}>
      <h2 className="text-4xl md:text-5xl font-extrabold font-gaming mb-4 uppercase tracking-tighter">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-400 neon-glow">
          {title}
        </span>
      </h2>
      {subtitle && <p className="text-gray-400 max-w-2xl mx-auto text-lg">{subtitle}</p>}
      <div className={`h-1 w-24 bg-gradient-to-r from-purple-500 to-cyan-400 mt-4 rounded-full ${center ? 'mx-auto' : ''}`}></div>
    </div>
  );
};

export default SectionHeading;
