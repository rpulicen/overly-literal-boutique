import { useState, useEffect } from 'react';
import { CheckCircle2, Trash2 } from 'lucide-react';
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
    shakespeare: 'Pray, fetch the creamy yield of the kine from the market.'
  },
  'call mom': {
    standard: 'Initiate telecommunication protocol with maternal parental unit.',
    pirate: 'Ring up the old sea witch who birthed ye, arr!',
    shakespeare: 'Hark! Discourse with thy mother through distant communication.'
  },
  'exercise': {
    standard: 'Engage in systematic physical exertion to elevate cardiovascular function.',
    pirate: 'Swab the deck and work yer muscles, ye lazy barnacle!',
    shakespeare: 'Moveth thy body with vigorous and healthful exertion.'
  },
  'study': {
    standard: 'Process informational content via ocular absorption for cognitive retention.',
    pirate: 'Cram knowledge into yer noggin from them dusty scrolls!',
    shakespeare: 'Absorbeth wisdom from the written word into thy mind.'
  },
  'sleep': {
    standard: 'Enter prolonged state of reduced consciousness on horizontal surface.',
    pirate: 'Hit the hammock and drift to the land of dreams, sailor!',
    shakespeare: 'Surrender thyself to slumber\'s sweet embrace upon thy bed.'
  },
  'cook dinner': {
    standard: 'Apply thermal energy to consumable organic matter for evening sustenance.',
    pirate: 'Prepare the grub for tonight\'s feast, ye scurvy dog!',
    shakespeare: 'Preparest the evening meal through culinary arts.'
  },
  'walk dog': {
    standard: 'Escort domesticated canine on perambulatory waste elimination excursion.',
    pirate: 'Take the mangy cur out fer a stroll on the poop deck!',
    shakespeare: 'Accompany thy hound on a leisurely promenade outdoors.'
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
  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold tracking-tighter">OVERLY LITERAL</h1>
            <button
              onClick={() => supabase.auth.signOut()}
              className="font-mono text-[10px] tracking-wider text-white/40 hover:text-white transition-colors"
            >
              EXIT
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
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
                className="border border-white/30 px-6 py-2 font-mono text-[10px] tracking-wider hover:bg-white hover:text-black transition-all duration-300"
              >
                ADD
              </button>
            </div>

            <div className="flex gap-2">
              {['standard', 'pirate', 'shakespeare'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1 font-mono text-[9px] tracking-wider border transition-all duration-300 ${
                    mode === m
                      ? 'border-[#4FC3F7] text-[#4FC3F7]'
                      : 'border-white/20 text-white/40 hover:text-white/60'
                  }`}
                >
                  {m.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="border border-white/10 p-4 hover:border-white/20 transition-all group"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="text-[11px] font-mono tracking-wider text-white/50 mb-1 uppercase">
                      {task.original_task}
                    </div>
                    <div className="text-sm leading-relaxed">{task.translated_text}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleComplete(task)}
                      className={`w-5 h-5 border transition-all ${
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
                      className="opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
