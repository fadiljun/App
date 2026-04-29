import type { Question } from '../lib/types';

export const QUESTIONS: Question[] = [
  // ─── Self-awareness (6) ────────────────────────────────────────────────
  {
    id: 1,
    pillar: 'selfAwareness',
    format: 'choice',
    prompt:
      'When you feel a strong negative emotion, how quickly do you usually identify exactly what it is?',
    choices: [
      { label: 'Almost instantly', value: 10 },
      { label: 'Within a few minutes', value: 7 },
      { label: 'After it passes', value: 4 },
      { label: 'I usually just know I feel “bad”', value: 1 },
    ],
  },
  {
    id: 2,
    pillar: 'selfAwareness',
    format: 'choice',
    prompt:
      'You’re scrolling your phone for the third hour tonight. What’s most likely actually going on?',
    choices: [
      { label: 'I’m avoiding something I don’t want to feel', value: 10 },
      { label: 'I’m bored', value: 5 },
      { label: 'I’m genuinely just relaxing', value: 3 },
      { label: 'I don’t think about it', value: 1 },
    ],
  },
  {
    id: 3,
    pillar: 'selfAwareness',
    format: 'choice',
    prompt: 'Someone gives you a compliment. Your first internal reaction:',
    choices: [
      { label: 'Genuine warmth — I take it in', value: 10 },
      { label: 'Slight discomfort, then I deflect', value: 6 },
      { label: 'I barely register it', value: 4 },
      { label: 'Suspicion — what do they want?', value: 3 },
    ],
  },
  {
    id: 4,
    pillar: 'selfAwareness',
    format: 'choice',
    prompt:
      'How often do your physical sensations (tight chest, clenched jaw, churning stomach) tell you something emotional before your mind catches up?',
    choices: [
      { label: 'Constantly — my body knows first', value: 10 },
      { label: 'Sometimes', value: 7 },
      { label: 'Rarely', value: 3 },
      { label: 'Never noticed', value: 1 },
    ],
  },
  {
    id: 5,
    pillar: 'selfAwareness',
    format: 'choice',
    prompt: 'You just snapped at someone. Ten minutes later, you most likely:',
    choices: [
      { label: 'Know exactly which earlier event built up to this', value: 10 },
      { label: 'Feel guilty but don’t know why I reacted that way', value: 5 },
      { label: 'Already moved on and forgot', value: 3 },
      { label: 'Justify why they deserved it', value: 2 },
    ],
  },
  {
    id: 6,
    pillar: 'selfAwareness',
    format: 'choice',
    prompt:
      'When journaling or thinking about your week, can you usually pinpoint the moment your mood shifted?',
    choices: [
      { label: 'Yes, almost always', value: 10 },
      { label: 'Sometimes', value: 6 },
      { label: 'Rarely', value: 3 },
      { label: 'I don’t really track this', value: 1 },
    ],
  },

  // ─── Self-regulation (6) ───────────────────────────────────────────────
  {
    id: 7,
    pillar: 'selfRegulation',
    format: 'choice',
    prompt: 'You get a passive-aggressive email from a colleague. You:',
    choices: [
      { label: 'Wait until tomorrow before responding', value: 10 },
      { label: 'Respond calmly within the hour', value: 8 },
      { label: 'Vent to someone first, then respond', value: 6 },
      { label: 'Fire back immediately', value: 2 },
    ],
  },
  {
    id: 8,
    pillar: 'selfRegulation',
    format: 'choice',
    prompt:
      'You’re stuck in unexpected traffic and you’re going to be late. After the first 5 minutes:',
    choices: [
      { label: 'I accept it and put on a podcast', value: 10 },
      { label: 'I’m annoyed but functional', value: 7 },
      { label: 'I’m gripping the wheel and muttering', value: 4 },
      { label: 'I’m honking and changing lanes aggressively', value: 1 },
    ],
  },
  {
    id: 9,
    pillar: 'selfRegulation',
    format: 'choice',
    prompt:
      'When you’re hungry, tired, or stressed, how different is the version of you that shows up?',
    choices: [
      { label: 'Same person — I notice and adjust', value: 10 },
      { label: 'A bit shorter, but I manage', value: 7 },
      { label: 'Honestly, pretty different', value: 4 },
      { label: 'People around me would say very different', value: 2 },
    ],
  },
  {
    id: 10,
    pillar: 'selfRegulation',
    format: 'choice',
    prompt: 'Pick the truer statement:',
    choices: [
      {
        label: 'I can sit with discomfort without needing to fix it immediately',
        value: 10,
      },
      {
        label:
          'I usually need to do something to make uncomfortable feelings go away',
        value: 4,
      },
    ],
  },
  {
    id: 11,
    pillar: 'selfRegulation',
    format: 'choice',
    prompt: 'Someone cancels plans on you last minute. Your honest reaction:',
    choices: [
      { label: 'Slight disappointment, but I make other plans', value: 10 },
      { label: 'I’m fine, but I remember it', value: 6 },
      { label: 'I assume they don’t really want to see me', value: 4 },
      { label: 'I’m pissed and they’ll hear about it', value: 2 },
    ],
  },
  {
    id: 12,
    pillar: 'selfRegulation',
    format: 'choice',
    prompt: 'You’re given criticism that stings. A week later:',
    choices: [
      { label: 'I’ve extracted what’s useful and let the rest go', value: 10 },
      { label: 'I still think about it sometimes', value: 6 },
      { label: 'I’m already planning how to prove them wrong', value: 4 },
      { label: 'It still bothers me a lot', value: 3 },
    ],
  },

  // ─── Empathy (8 — heavier weight) ──────────────────────────────────────
  {
    id: 13,
    pillar: 'empathy',
    format: 'choice',
    prompt: 'A friend tells you about a problem. Your instinct is to:',
    choices: [
      { label: 'Ask what kind of support they want first', value: 10 },
      { label: 'Listen and validate before anything else', value: 9 },
      { label: 'Offer solutions', value: 5 },
      { label: 'Share a similar story of mine', value: 4 },
    ],
  },
  {
    id: 14,
    pillar: 'empathy',
    format: 'choice',
    prompt:
      'You walk into a room where two people just had a tense conversation. How quickly do you sense it?',
    choices: [
      { label: 'The second I walk in', value: 10 },
      { label: 'Within a minute', value: 7 },
      { label: 'Once someone says something', value: 4 },
      { label: 'Only if they tell me directly', value: 1 },
    ],
  },
  {
    id: 15,
    pillar: 'empathy',
    format: 'choice',
    prompt: 'Someone says “I’m fine” but their tone is flat. You:',
    choices: [
      { label: 'Gently check in — I trust the tone over the words', value: 10 },
      { label: 'Ask once more, then drop it', value: 7 },
      { label: 'Take them at their word', value: 3 },
      { label: 'Don’t notice the tone', value: 1 },
    ],
  },
  {
    id: 16,
    pillar: 'empathy',
    format: 'choice',
    prompt:
      'A person’s face shows slightly raised inner eyebrows, downturned mouth corners, and tightened lower eyelids. They’re most likely feeling:',
    choices: [
      { label: 'Sadness with restraint', value: 10 },
      { label: 'Confusion', value: 5 },
      { label: 'Mild annoyance', value: 4 },
      { label: 'Disgust', value: 3 },
    ],
  },
  {
    id: 17,
    pillar: 'empathy',
    format: 'choice',
    prompt:
      'Your partner or close friend has been quieter than usual for 3 days. You assume:',
    choices: [
      { label: 'Something’s going on — I’ll create space to talk', value: 10 },
      { label: 'They probably need alone time', value: 6 },
      { label: 'Maybe I did something wrong', value: 4 },
      { label: 'I don’t really notice patterns like that', value: 2 },
    ],
  },
  {
    id: 18,
    pillar: 'empathy',
    format: 'choice',
    prompt: 'You’re in a heated argument. Mid-sentence, you:',
    choices: [
      { label: 'Pause to consider how the other person is feeling', value: 10 },
      { label: 'Notice you’re winning and ease off', value: 6 },
      { label: 'Don’t think about their side until later', value: 4 },
      { label: 'Push your point harder', value: 3 },
    ],
  },
  {
    id: 19,
    pillar: 'empathy',
    format: 'choice',
    prompt: 'When watching a movie, you:',
    choices: [
      { label: 'Cry, laugh, feel everything the characters feel', value: 10 },
      { label: 'Get emotionally pulled in but stay aware', value: 8 },
      { label: 'Enjoy it but don’t really feel it', value: 4 },
      { label: 'Mostly analyze the plot', value: 2 },
    ],
  },
  {
    id: 20,
    pillar: 'empathy',
    format: 'choice',
    prompt:
      'A stranger is rude to you in public. Your most honest first thought:',
    choices: [
      { label: 'I wonder what kind of day they’re having', value: 10 },
      { label: 'That was uncalled for, but whatever', value: 6 },
      { label: 'What an asshole', value: 3 },
      { label: 'I want to say something cutting back', value: 2 },
    ],
  },

  // ─── Social skills (6) ─────────────────────────────────────────────────
  {
    id: 21,
    pillar: 'socialSkills',
    format: 'choice',
    prompt: 'At a party where you only know one person, you:',
    choices: [
      { label: 'Make 2–3 new genuine conversations', value: 10 },
      { label: 'Stick close to my person but engage when introduced', value: 7 },
      { label: 'Politely leave early', value: 4 },
      { label: 'Don’t go in the first place', value: 3 },
    ],
  },
  {
    id: 22,
    pillar: 'socialSkills',
    format: 'choice',
    prompt: 'You need to deliver hard feedback to someone. You:',
    choices: [
      { label: 'Lead with what’s working, then the issue, then a path forward', value: 10 },
      { label: 'Be direct but kind', value: 9 },
      { label: 'Soften it so much they might miss it', value: 4 },
      { label: 'Avoid it or do it bluntly when frustrated', value: 3 },
    ],
  },
  {
    id: 23,
    pillar: 'socialSkills',
    format: 'choice',
    prompt:
      'You have to work with someone whose style annoys you. After a month:',
    choices: [
      { label: 'I’ve found ways to genuinely appreciate them', value: 10 },
      { label: 'I’m professional and find common ground', value: 8 },
      { label: 'I tolerate them', value: 5 },
      { label: 'I avoid them when possible', value: 3 },
    ],
  },
  {
    id: 24,
    pillar: 'socialSkills',
    format: 'choice',
    prompt: 'In group settings, people tend to:',
    choices: [
      { label: 'Open up to me even when they barely know me', value: 10 },
      { label: 'Enjoy my company', value: 8 },
      { label: 'Find me pleasant', value: 5 },
      { label: 'I’m not sure — I don’t really notice', value: 3 },
    ],
  },
  {
    id: 25,
    pillar: 'socialSkills',
    format: 'choice',
    prompt: 'When there’s tension between two friends, you:',
    choices: [
      { label: 'Help both feel heard without taking sides', value: 10 },
      { label: 'Stay out of it but stay neutral', value: 6 },
      { label: 'Pick a side privately', value: 4 },
      { label: 'Get pulled in and add to the drama', value: 2 },
    ],
  },
  {
    id: 26,
    pillar: 'socialSkills',
    format: 'choice',
    prompt: 'Pick the truer statement:',
    choices: [
      {
        label:
          'I can read a room and adjust my energy to it without losing myself',
        value: 10,
      },
      { label: 'I’m the same with everyone — take it or leave it', value: 5 },
    ],
  },

  // ─── Motivation (4) ────────────────────────────────────────────────────
  {
    id: 27,
    pillar: 'motivation',
    format: 'choice',
    prompt: 'You set a goal and hit a major setback in week 2. You:',
    choices: [
      { label: 'Adjust the plan and keep going', value: 10 },
      { label: 'Take a break, then restart', value: 7 },
      { label: 'Lose momentum and start something else', value: 4 },
      { label: 'Quietly abandon it', value: 2 },
    ],
  },
  {
    id: 28,
    pillar: 'motivation',
    format: 'choice',
    prompt: 'What gets you out of bed on a hard morning?',
    choices: [
      { label: 'A reason that’s bigger than how I feel today', value: 10 },
      { label: 'Routine and discipline', value: 8 },
      { label: 'External obligations', value: 5 },
      { label: 'Honestly, sometimes nothing does', value: 2 },
    ],
  },
  {
    id: 29,
    pillar: 'motivation',
    format: 'choice',
    prompt:
      'When something is hard but meaningful vs easy but pointless, you:',
    choices: [
      { label: 'Choose hard and meaningful, even when exhausted', value: 10 },
      { label: 'Choose hard most of the time', value: 7 },
      { label: 'Depends on the day', value: 5 },
      { label: 'Choose easy more than I’d like to admit', value: 3 },
    ],
  },
  {
    id: 30,
    pillar: 'motivation',
    format: 'choice',
    prompt: 'Pick the truer statement:',
    choices: [
      { label: 'I generally believe things tend to work out', value: 10 },
      { label: 'I generally expect things to go wrong', value: 3 },
    ],
  },
];
