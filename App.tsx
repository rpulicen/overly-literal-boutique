import { useState, useEffect } from 'react';
import { CheckCircle2, Trash2, Share2, Bell, Lock } from 'lucide-react';
import { supabase } from './src/supabase';

interface Task {
  id: string;
  original_task: string;
  translation_mode: string;
  translated_text: string;
  completed: boolean;
}

const taskTranslations: Record<string, Record<string, string>> = {
  'buy milk': {
    standard: 'Acquire the bovine secretion from a commercial hub.',
    pirate: 'Plunder the white nectar from the merchant\'s dock, matey!',
    shakespeare: 'Pray, fetch the creamy yield of the kine from the market.',
    manager: 'PROCUREMENT OF LACTOSE IS OVERDUE. COMMENCE ACQUISITION IMMEDIATELY.',
    cheerleader: 'OMG YOU ARE GOING TO CRUSH THAT SHOPPING TRIP! GO TEAM YOU!'
  },
  'call mom': {
    standard: 'Initiate telecommunication protocol with maternal parental unit.',
    pirate: 'Ring up the old sea witch who birthed ye, arr!',
    shakespeare: 'Hark! Discourse with thy mother through distant communication.',
    manager: 'MATERNAL CONTACT REQUIRED. INITIATE COMMUNICATION PROTOCOL NOW.',
    cheerleader: 'YES! TIME TO CONNECT WITH THE AMAZING PERSON WHO GAVE YOU LIFE!'
  },
  'exercise': {
    standard: 'Engage in systematic physical exertion to elevate cardiovascular function.',
    pirate: 'Swab the deck and work yer muscles, ye lazy barnacle!',
    shakespeare: 'Moveth thy body with vigorous and healthful exertion.',
    manager: 'PHYSICAL CONDITIONING OVERDUE. EXECUTE WORKOUT REGIMEN WITHOUT DELAY.',
    cheerleader: 'YOU\'RE ABOUT TO ABSOLUTELY DOMINATE THIS WORKOUT! LET\'S GOOOO!'
  },
  'study': {
    standard: 'Process informational content via ocular absorption for cognitive retention.',
    pirate: 'Cram knowledge into yer noggin from them dusty scrolls!',
    shakespeare: 'Absorbeth wisdom from the written word into thy mind.',
    manager: 'KNOWLEDGE ACQUISITION BEHIND SCHEDULE. BEGIN STUDY SESSION STAT.',
    cheerleader: 'YOU\'RE GOING TO ABSORB SO MUCH KNOWLEDGE! BRAIN POWER ACTIVATED!'
  },
  'sleep': {
    standard: 'Enter prolonged state of reduced consciousness on horizontal surface.',
    pirate: 'Hit the hammock and drift to the land of dreams, sailor!',
    shakespeare: 'Surrender thyself to slumber\'s sweet embrace upon thy bed.',
    manager: 'REST CYCLE INITIATED. HORIZONTAL POSITION MANDATORY FOR RECOVERY.',
    cheerleader: 'TIME FOR THE MOST AMAZING SLEEP EVER! YOU DESERVE THIS REST!'
  },
  'cook dinner': {
    standard: 'Apply thermal energy to consumable organic matter for evening sustenance.',
    pirate: 'Prepare the grub for tonight\'s feast, ye scurvy dog!',
    shakespeare: 'Preparest the evening meal through culinary arts.',
    manager: 'EVENING NUTRITION PREP REQUIRED. COMMENCE MEAL PREPARATION NOW.',
    cheerleader: 'YOU\'RE GOING TO MAKE THE MOST INCREDIBLE DINNER! CHEF MODE ON!'
  },
  'walk dog': {
    standard: 'Escort domesticated canine on perambulatory waste elimination excursion.',
    pirate: 'Take the mangy cur out fer a stroll on the poop deck!',
    shakespeare: 'Accompany thy hound on a leisurely promenade outdoors.',
    manager: 'CANINE WASTE ELIMINATION PROTOCOL OVERDUE. EXECUTE IMMEDIATELY.',
    cheerleader: 'YOU AND YOUR FURRY FRIEND ARE GOING TO HAVE THE BEST WALK EVER!'
  }
};

function getTaskTranslation(task: string, mode: string): string {
  const normalizedTask = task.toLowerCase().trim();

  if (taskTranslations[normalizedTask]) {
    return taskTranslations[normalizedTask][mode];
  }

  for (const key in taskTranslations) {
    if (normalizedTask.includes(key) || key.includes(normalizedTask)) {
      return taskTranslations[key][mode];
    }
  }

  if (mode === 'pirate') {
    return `Complete the task "${task}" with proper pirate swagger, arr!`;
  } else if (mode === 'shakespeare') {
    return `Accomplisheth the task of "${task}" with utmost diligence.`;
  } else if (mode === 'manager') {
    return `TASK "${task.toUpperCase()}" IS PENDING. EXECUTE WITHOUT DELAY.`;
  } else if (mode === 'cheerleader') {
    return `YOU'RE GOING TO ABSOLUTELY CRUSH "${task}"! YOU'VE GOT THIS!`;
  } else {
    return `Execute the prescribed task: "${task}" with excessive literalism.`;
  }
}

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState('standard');
  const [mood, setMood] = useState(50);
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const premiumModes = ['pirate', 'shakespeare', 'manager', 'cheerleader'];
  const modeLabels: Record<string, string> = {
    standard: 'STANDARD',
    pirate: 'PIRATE',
    shakespeare: 'SHAKESPEARE',
    manager: 'BOSSY MANAGER',
    cheerleader: 'CHEERLEADER'
  };

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTasks(data);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password
      });

      if (!signUpError) {
        setIsAuthenticating(false);
      }
    }

    setIsAuthenticating(false);
  };

  const handleModeClick = (selectedMode: string) => {
    if (premiumModes.includes(selectedMode) && !isPremium) {
      setShowUpgradeModal(true);
      return;
    }
    setMode(selectedMode);
  };

  const addTask = async () => {
    if (!taskInput.trim() || !user) return;

    const translation = getTaskTranslation(taskInput, mode);

    const { data, error } = await supabase
      .from('tasks')
      .insert([
        {
          user_id: user.id,
          original_task: taskInput,
          translation_mode: mode,
          translated_text: translation,
          completed: false
        }
      ])
      .select()
      .maybeSingle();

    if (!error && data) {
      setTasks([data, ...tasks]);
      setTaskInput('');
    }
  };

  const toggleComplete = async (task: Task) => {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', task.id);

    if (!error) {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
    }
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (!error) {
      setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-32 h-[1px] bg-white/10 overflow-hidden">
          <div className="h-full bg-[#4FC3F7] animate-progress-boutique" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white relative overflow-hidden font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_bottom,#0a0a0a_0%,#000000_50%)] pointer-events-none" />

        <div className="relative min-h-screen flex flex-col items-center justify-center px-6">
          <header className="text-center mb-16">
            <h1 className="text-7xl md:text-8xl font-bold tracking-tighter mb-2 leading-none">
              OVERLY<br/>LITERAL
            </h1>
            <div className="h-px w-16 bg-[#4FC3F7] mx-auto mt-8" />
          </header>

          <div className="w-full max-w-md">
            {!isAuthenticating ? (
              <form onSubmit={handleAuth} className="space-y-6">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ENTER EMAIL ADDRESS"
                  className="w-full bg-transparent border-b border-white/20 py-3 focus:outline-none focus:border-[#4FC3F7] transition-colors font-mono text-xs tracking-widest uppercase placeholder:text-white/30"
                  required
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ENTER PASSWORD"
                  className="w-full bg-transparent border-b border-white/20 py-3 focus:outline-none focus:border-[#4FC3F7] transition-colors font-mono text-xs tracking-widest uppercase placeholder:text-white/30"
                  required
                />
                <button className="w-full border border-white/30 py-4 font-mono text-[11px] tracking-[0.3em] hover:bg-white hover:text-black transition-all duration-300 uppercase">
                  Request Access
                </button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <p className="font-mono text-[10px] tracking-[0.4em] text-white/60 uppercase">
                  Authenticating...
                </p>
                <div className="w-full h-[1px] bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#4FC3F7] animate-progress-boutique" />
                </div>
              </div>
            )}
          </div>

          <footer className="absolute bottom-12 w-full text-center opacity-20">
            <p className="font-mono text-[9px] tracking-[0.5em] uppercase">
              © 2026 OVERLY LITERAL. STATED CLEARLY.
            </p>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center_top,#0a0a0a_0%,#000000_50%)] pointer-events-none" />

      <div className="relative">
        <div className="border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <h1 className="text-lg sm:text-2xl font-bold tracking-tighter">OVERLY LITERAL</h1>
            <button
              onClick={() => supabase.auth.signOut()}
              className="font-mono text-[9px] sm:text-[10px] tracking-wider text-white/40 hover:text-white transition-colors"
            >
              EXIT
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  placeholder="Enter task..."
                  className="w-full bg-transparent border-b border-white/20 py-2 focus:outline-none focus:border-[#4FC3F7] transition-colors text-sm placeholder:text-white/30"
                />
              </div>
              <button
                onClick={addTask}
                className="border border-white/30 px-6 py-2 font-mono text-[10px] tracking-wider hover:bg-white hover:text-black transition-all duration-300 w-full sm:w-auto"
              >
                ADD
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {['standard', 'pirate', 'shakespeare', 'manager', 'cheerleader'].map((m) => {
                const isLocked = premiumModes.includes(m) && !isPremium;
                return (
                  <button
                    key={m}
                    onClick={() => handleModeClick(m)}
                    className={`relative px-3 py-1 font-mono text-[9px] tracking-wider border transition-all duration-300 ${
                      mode === m
                        ? 'border-[#4FC3F7] text-[#4FC3F7]'
                        : 'border-white/20 text-white/40 hover:text-white/60'
                    } ${isLocked ? 'pr-6' : ''}`}
                  >
                    {modeLabels[m]}
                    {isLocked && (
                      <Lock
                        size={10}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-[#4FC3F7]"
                        strokeWidth={2}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-[9px] tracking-wider text-white/40">MOOD</span>
                <div className="flex-1 relative h-[2px] bg-white/10">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#4FC3F7] transition-all duration-300"
                    style={{ width: `${mood}%` }}
                  />
                </div>
                <span className="font-mono text-[9px] tracking-wider text-[#4FC3F7]">{mood}</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="w-full h-[2px] bg-transparent appearance-none cursor-pointer mood-slider"
                style={{
                  WebkitAppearance: 'none',
                }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-mono text-[11px] tracking-wider text-white/30">
                  The void is empty. Add a burden.
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`border border-white/10 p-3 sm:p-4 hover:border-white/20 transition-all group relative ${
                    task.completed ? 'completed-glow' : ''
                  }`}
                  onMouseEnter={() => setHoveredTask(task.id)}
                  onMouseLeave={() => setHoveredTask(null)}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                    <div className="flex-1 w-full sm:w-auto">
                      <div className="text-[10px] sm:text-[11px] font-mono tracking-wider text-white/50 mb-1 uppercase break-words">
                        {task.original_task}
                      </div>
                      <div className="text-xs sm:text-sm leading-relaxed break-words">{task.translated_text}</div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-start">
                      <button
                        onClick={() => {
                          alert('Share feature: Generate literal breakdown meme');
                        }}
                        className={`transition-opacity ${
                          hoveredTask === task.id ? 'opacity-40 hover:opacity-100' : 'opacity-0 sm:opacity-0'
                        }`}
                        title="Share"
                      >
                        <Share2 size={14} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => {
                          alert('Reminder feature: Set literal reminder');
                        }}
                        className={`transition-opacity ${
                          hoveredTask === task.id ? 'opacity-40 hover:opacity-100' : 'opacity-0 sm:opacity-0'
                        }`}
                        title="Set Reminder"
                      >
                        <Bell size={14} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => toggleComplete(task)}
                        className={`w-5 h-5 border transition-all flex-shrink-0 ${
                          task.completed
                            ? 'border-[#4FC3F7] bg-[#4FC3F7]'
                            : 'border-white/30 hover:border-white/50'
                        }`}
                      >
                        {task.completed && (
                          <CheckCircle2 size={12} className="text-black mx-auto" strokeWidth={3} />
                        )}
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity flex-shrink-0"
                      >
                        <Trash2 size={14} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowUpgradeModal(false)}
          />
          <div className="relative bg-black/90 backdrop-blur-md border border-white/20 rounded-none max-w-md w-full p-8 shadow-2xl">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 border border-[#4FC3F7] rounded-none mb-4">
                <Lock size={32} className="text-[#4FC3F7]" strokeWidth={1.5} />
              </div>

              <h2 className="text-2xl font-bold tracking-tight">Unlock the Crew</h2>

              <p className="text-white/60 text-sm leading-relaxed">
                Upgrade to Ultra for $2.99/mo and unlock all premium personalities: Pirate, Shakespeare, Bossy Manager, and Cheerleader modes.
              </p>

              <div className="space-y-3 pt-4">
                <button
                  onClick={() => {
                    setIsPremium(true);
                    setShowUpgradeModal(false);
                  }}
                  className="w-full bg-[#4FC3F7] text-black font-mono text-xs tracking-wider py-3 px-6 hover:bg-[#6DD5FF] transition-all duration-300 uppercase"
                >
                  Upgrade
                </button>

                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full text-white/40 hover:text-white/60 font-mono text-[10px] tracking-wider transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
