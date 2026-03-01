import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Trash2, Share2, Bell, Lock, Download } from 'lucide-react';
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
  if (taskTranslations[normalizedTask]) return taskTranslations[normalizedTask][mode];
  for (const key in taskTranslations) {
    if (normalizedTask.includes(key) || key.includes(normalizedTask)) return taskTranslations[key][mode];
  }
  if (mode === 'pirate') return `Complete the task "${task}" with proper pirate swagger, arr!`;
  if (mode === 'shakespeare') return `Accomplisheth the task of "${task}" with utmost diligence.`;
  if (mode === 'manager') return `TASK "${task.toUpperCase()}" IS PENDING. EXECUTE WITHOUT DELAY.`;
  if (mode === 'cheerleader') return `YOU'RE GOING TO ABSOLUTELY CRUSH "${task}"! YOU'VE GOT THIS!`;
  return `Execute the prescribed task: "${task}" with excessive literalism.`;
}

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [mode, setMode] = useState('standard');
  const [mood, setMood] = useState(50);
  const [taskInput, setTask