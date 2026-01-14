
import React, { useState, useEffect } from 'react';
import { 
  Gamepad2, 
  Github, 
  Linkedin, 
  Mail, 
  ChevronRight, 
  Code2, 
  ExternalLink,
  MessageCircle,
  Menu,
  X,
  Monitor
} from 'lucide-react';
import { PROJECTS, SKILLS, SERVICES } from './constants';
import SectionHeading from './components/SectionHeading';
import ChatBot from './components/ChatBot';

const App: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Portfolio', href: '#portfolio' },
    { name: 'Skills', href: '#skills' },
    { name: 'Services', href: '#services' },
    { name: 'Contact', href: '#contact' }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md py-4 border-b border-purple-500/20' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-gradient-to-br from-purple-600 to-cyan-500 p-2 rounded-lg rotate-3 group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Gamepad2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-gaming text-2xl font-bold tracking-tighter uppercase">Alex<span className="text-cyan-400">Dev</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href} 
                className="text-sm font-medium uppercase tracking-widest text-gray-400 hover:text-purple-400 transition-colors"
              >
                {link.name}
              </a>
            ))}
            <a 
              href="#contact" 
              className="bg-gradient-to-r from-purple-600 to-cyan-500 px-6 py-2 rounded-full font-bold uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-lg neon-border"
            >
              Hire Me
            </a>
          </div>

          <button className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-black/95 backdrop-blur-xl border-b border-purple-500/20 py-8 animate-in slide-in-from-top duration-300">
            <div className="flex flex-col items-center gap-6">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg uppercase tracking-widest text-gray-400 hover:text-white"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/60 to-black z-10"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px]"></div>
          <img 
            src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-30 scale-110" 
            alt="Gaming Background"
          />
        </div>

        <div className="container mx-auto px-6 relative z-20 text-center lg:text-left flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-block px-4 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-xs font-bold uppercase tracking-[0.2em] mb-6 animate-pulse">
              Level 99 Unity Developer
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-gaming font-extrabold uppercase leading-none tracking-tighter mb-6">
              Professional <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-cyan-400 neon-glow">Unity Game</span> <br />
              Developer
            </h1>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mb-10 mx-auto lg:mx-0 leading-relaxed">
              Specializing in high-performance 2D & 3D Unity games for Mobile & PC. From racing simulators to casual mobile hits, I bring immersive worlds to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a href="#portfolio" className="group bg-gradient-to-r from-purple-600 to-cyan-500 px-8 py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl neon-border">
                View Portfolio
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a href="#contact" className="px-8 py-4 rounded-xl font-bold uppercase tracking-widest border border-gray-700 hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                Get a Quote
              </a>
            </div>
          </div>
          <div className="flex-1 relative hidden lg:block">
             <div className="relative z-10 p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm rotate-3 shadow-2xl">
               <img src="https://picsum.photos/seed/gameplay/600/400" alt="Unity Scene" className="rounded-2xl grayscale hover:grayscale-0 transition-all duration-700" />
               <div className="absolute -bottom-6 -left-6 bg-cyan-500 p-4 rounded-2xl shadow-lg -rotate-6">
                 <Code2 className="w-8 h-8 text-black" />
               </div>
               <div className="absolute -top-6 -right-6 bg-purple-500 p-4 rounded-2xl shadow-lg rotate-12">
                 <Gamepad2 className="w-8 h-8 text-white" />
               </div>
             </div>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section id="about" className="py-24 bg-black relative">
        <div className="container mx-auto px-6">
          <SectionHeading 
            title="Beyond The Code" 
            subtitle="I build more than just games; I create experiences that resonate."
          />
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 text-gray-400 text-lg leading-relaxed">
              <p>
                With over 6 years of experience in the <span className="text-white font-bold">Unity Engine</span>, I've mastered the art of blending robust C# logic with stunning visuals. My focus is on <span className="text-cyan-400 underline decoration-cyan-400/30">optimization</span> and <span className="text-purple-400 underline decoration-purple-400/30">gameplay systems</span>.
              </p>
              <p>
                Whether it's implementing complex AI pathfinding, designing reactive UI systems, or fine-tuning physics-based movement, I ensure every line of code serves the player experience.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="p-4 glass-panel rounded-xl">
                  <div className="text-3xl font-bold text-white mb-1">20+</div>
                  <div className="text-sm uppercase tracking-widest text-gray-500">Games Delivered</div>
                </div>
                <div className="p-4 glass-panel rounded-xl">
                  <div className="text-3xl font-bold text-white mb-1">5M+</div>
                  <div className="text-sm uppercase tracking-widest text-gray-500">Total Downloads</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="h-64 bg-gradient-to-br from-purple-900/40 to-black rounded-3xl border border-purple-500/20 flex items-center justify-center">
                   <Monitor className="w-16 h-16 text-purple-400 opacity-40" />
                </div>
                <div className="h-48 bg-gradient-to-br from-cyan-900/40 to-black rounded-3xl border border-cyan-500/20 p-6 flex flex-col justify-end">
                  <h4 className="text-white font-bold uppercase tracking-widest">PC Master</h4>
                  <p className="text-xs text-gray-400 mt-2">HDRP & Pro-Physics</p>
                </div>
              </div>
              <div className="space-y-6 pt-12">
                <div className="h-48 bg-gradient-to-br from-emerald-900/40 to-black rounded-3xl border border-emerald-500/20 p-6 flex flex-col justify-end">
                  <h4 className="text-white font-bold uppercase tracking-widest">Mobile Expert</h4>
                  <p className="text-xs text-gray-400 mt-2">URP & Optimization</p>
                </div>
                <div className="h-64 bg-gradient-to-br from-pink-900/40 to-black rounded-3xl border border-pink-500/20 flex items-center justify-center">
                   <Code2 className="w-16 h-16 text-pink-400 opacity-40" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <SectionHeading 
            title="Selected Projects" 
            subtitle="A showcase of digital worlds and mechanics I've built from the ground up."
          />
          <div className="grid md:grid-cols-2 gap-8">
            {PROJECTS.map((project) => (
              <div key={project.id} className="group relative overflow-hidden rounded-3xl glass-panel border border-white/5 hover:border-purple-500/50 transition-all duration-500">
                <div className="aspect-video overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                  />
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">{project.category}</span>
                      <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-purple-400 transition-colors">{project.title}</h3>
                    </div>
                    <a href={project.link} className="p-2 bg-white/5 rounded-full hover:bg-purple-600 transition-colors">
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                  <p className="text-gray-400 mb-6 line-clamp-2">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-16 text-center">
             <button className="px-10 py-4 bg-white/5 rounded-2xl font-bold uppercase tracking-widest border border-white/10 hover:border-cyan-500 transition-all">
                Load More Projects
             </button>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-24 bg-black overflow-hidden">
        <div className="container mx-auto px-6">
          <SectionHeading title="Technical Stack" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {SKILLS.map((skill) => (
              <div key={skill.name} className="p-6 glass-panel rounded-2xl border border-white/5 hover:neon-border transition-all group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform inline-block">{skill.icon}</div>
                <h4 className="text-white font-bold uppercase tracking-tighter mb-2">{skill.name}</h4>
                <div className="w-full bg-gray-900 h-1 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-cyan-400" 
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-right text-[10px] text-gray-500 font-bold uppercase tracking-widest">{skill.level}%</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-[#0a0a0a]">
        <div className="container mx-auto px-6">
          <SectionHeading title="Forge Your Vision" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {SERVICES.map((service, idx) => (
              <div key={idx} className="p-8 glass-panel rounded-3xl border border-white/5 hover:-translate-y-2 transition-all group">
                <div className="mb-6 p-4 bg-white/5 w-fit rounded-2xl group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:to-cyan-500 transition-all">
                  {service.icon}
                </div>
                <h4 className="text-xl font-bold text-white uppercase tracking-widest mb-4 group-hover:text-cyan-400 transition-colors">{service.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 bg-black relative">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="glass-panel rounded-[40px] p-8 md:p-16 border border-white/5 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 blur-[100px] -mr-32 -mt-32"></div>
            <div className="grid md:grid-cols-2 gap-16 relative z-10">
              <div>
                <SectionHeading title="Initiate Contact" center={false} />
                <p className="text-gray-400 mb-10 text-lg">
                  Ready to launch your next gaming masterpiece? I'm available for freelance projects and long-term collaborations.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 group">
                    <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-purple-600 transition-colors">
                      <Mail className="w-6 h-6 text-purple-400 group-hover:text-white" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-gray-500">Email Me</div>
                      <div className="text-white font-bold">alex@unitydev.pro</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="p-4 bg-white/5 rounded-2xl group-hover:bg-cyan-600 transition-colors">
                      <MessageCircle className="w-6 h-6 text-cyan-400 group-hover:text-white" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-widest text-gray-500">WhatsApp / Telegram</div>
                      <div className="text-white font-bold">+1 (555) 0123 4567</div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 mt-12">
                  <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-gray-800 border border-white/10"><Github /></a>
                  <a href="#" className="p-3 bg-white/5 rounded-full hover:bg-blue-600 border border-white/10"><Linkedin /></a>
                </div>
              </div>
              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Name</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" placeholder="Your Name" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Project Type</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 appearance-none">
                      <option className="bg-black">Mobile Game</option>
                      <option className="bg-black">PC Game</option>
                      <option className="bg-black">VR/AR</option>
                      <option className="bg-black">Prototype</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Email</label>
                  <input type="email" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2 font-bold">Project Details</label>
                  <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500" placeholder="Tell me about your game idea..."></textarea>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-cyan-500 py-4 rounded-xl font-bold uppercase tracking-[0.2em] shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
                  Send Command
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black border-t border-white/5">
        <div className="container mx-auto px-6 text-center">
           <div className="flex items-center justify-center gap-2 mb-6">
            <div className="bg-white/10 p-2 rounded-lg">
              <Gamepad2 className="w-5 h-5 text-purple-400" />
            </div>
            <span className="font-gaming text-xl font-bold tracking-tighter uppercase">Alex<span className="text-cyan-400">Dev</span></span>
          </div>
          <p className="text-gray-600 text-sm max-w-lg mx-auto mb-8">
            Building digital dreams and high-performance realities since 2018. All rights reserved.
          </p>
          <div className="text-gray-500 text-[10px] uppercase tracking-widest">
            © 2024 AlexDev Portfolio | Built with Unity Spirit & React
          </div>
        </div>
      </footer>

      <ChatBot />
    </div>
  );
};

export default App;
