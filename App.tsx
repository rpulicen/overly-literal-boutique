import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

function App() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // The strict 3-second boutique delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_bottom,#1a1a1a_0%,#000000_50%)] pointer-events-none" />
      
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6">
        {/* Branding */}
        <header className="text-center mb-16">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-2 leading-none">
            OVERLY<br/>LITERAL
          </h1>
          <div className="h-px w-12 bg-[#007AFF] mx-auto mt-8" />
        </header>

        {/* Form Container */}
        <div className="w-full max-w-md">
          {!isSubmitted ? (
            !isSubmitting ? (
              /* State 1: Default Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENTER EMAIL ADDRESS" 
                  className="w-full bg-transparent border-b border-white/20 py-3 focus:outline-none focus:border-[#007AFF] transition-colors font-mono text-sm tracking-widest uppercase"
                  required 
                />
                <button className="w-full border border-white/30 py-4 font-mono text-[11px] tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300 uppercase">
                  Request Access
                </button>
              </form>
            ) : (
              /* State 2: Progress Animation */
              <div className="text-center space-y-6">
                <p className="font-mono text-[10px] tracking-[0.4em] text-white/60 uppercase">
                  Calculating Molecular Requirements...
                </p>
                <div className="w-full h-[1px] bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#007AFF] animate-progress-boutique" />
                </div>
              </div>
            )
          ) : (
            /* State 3: Success message */
            <div className="text-center space-y-4">
              <CheckCircle2 className="mx-auto text-[#007AFF] mb-6" size={32} strokeWidth={1} />
              <p className="font-mono text-[11px] tracking-[0.3em] leading-relaxed uppercase">
                Access Requested.<br/>
                We will contact you shortly.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="absolute bottom-12 w-full text-center opacity-20">
          <p className="font-mono text-[9px] tracking-[0.5em] uppercase">
            © 2026 OVERLY LITERAL. STATED CLEARLY.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
