export type CrutchGroup = 'words' | 'conversation' | 'endgame'

export interface Crutch {
  n: number
  name: string
  group: CrutchGroup
  summary: string
  how: string[]
  example: string
}

export const CRUTCH_GROUPS: { id: CrutchGroup; title: string; blurb: string }[] = [
  { id: 'words', title: 'Single feared words (C-1 to C-8)', blurb: 'For one-off words: your name, a city, a menu item.' },
  { id: 'conversation', title: 'Conversation (C-9 to C-12)', blurb: 'Styles of speaking that carry you through sentences.' },
  { id: 'endgame', title: 'The end game (C-13)', blurb: 'Fluency itself: speaking your thoughts.' },
]

export const FOUR_THINGS = ['Hesitate', 'Think of a word', 'Fear it', 'Force it']

export const CRUTCHES: Crutch[] = [
  {
    n: 1,
    name: 'Drop the first sound',
    group: 'words',
    summary: 'Leave off the first letter or syllable of the word.',
    how: [
      'Say the word without its first sound. In context, listeners almost never notice.',
      'If the word makes no sense without it, combine with C-7 (whisper it) or C-4 (“ee‿LEE”).',
    ],
    example: '“Lee” → “ee”',
  },
  {
    n: 2,
    name: 'Synonym',
    group: 'words',
    summary: 'Use a similar word or phrase.',
    how: [
      'Swap in a word or short phrase with the same meaning.',
      'Add some humor if you like. By the time you reach the word, it often flows.',
    ],
    example: '“It depends who’s asking: Coach to my players… but Lee to everyone else.”',
  },
  {
    n: 3,
    name: 'Skip or spell it',
    group: 'words',
    summary: 'Skip the word, or spell it and glide into it.',
    how: [
      'Many words can simply be skipped.',
      'Spell it, then jam the last letter straight into the word. Writing it in the air with a finger helps.',
    ],
    example: '“L‑E‑E‑Lee”',
  },
  {
    n: 4,
    name: 'Insert and jam',
    group: 'words',
    summary: 'Put a word or sound in front, with no gap.',
    how: [
      'Say a starter word or sound and run it straight into the word, with no space between them.',
      'The most popular crutch for first feared words.',
    ],
    example: '“Well‿Lee”, “So‿Lee”, “Ahh‿Lee”, “Mmm‿Lee”',
  },
  {
    n: 5,
    name: 'Tell a story',
    group: 'words',
    summary: 'Talk around the word, then slip it in.',
    how: [
      'Say a few easy words first and link the last one into the word.',
      'Talk until you feel relaxed, then add the word where it comes easiest.',
    ],
    example: '“Glad you asked‿Lee, what’s yours?” · “A family name‿Lee.”',
  },
  {
    n: 6,
    name: 'Rephrase',
    group: 'words',
    summary: 'Change the words or the thought.',
    how: [
      'Say the same idea a different way, without delaying to plan it.',
      'This shows the key to fluency: think thoughts, and let the brain choose the words.',
    ],
    example: '“Tuesday” → “the day after Monday”',
  },
  {
    n: 7,
    name: 'Whisper',
    group: 'words',
    summary: 'Whisper the word at medium volume and keep going.',
    how: [
      'A medium-volume whisper is heard in most conversations and sounds natural.',
      'Practice several volumes. Use it sparingly: a word or phrase here and there.',
    ],
    example: 'Whisper “Lee”, then carry on in your normal voice.',
  },
  {
    n: 8,
    name: 'Modulate',
    group: 'words',
    summary: 'Change pitch, loudness or register, with enthusiasm.',
    how: [
      'Your voice has four registers: main, high, soft and whisper. Leave the main one for the word.',
      'Go all the way: HIGH-low, LOW-high, LOUD-soft. Holding back is what stops it working.',
    ],
    example: '“HEL-lo” or “hel-LO”, “WEL-come” or “wel-COME”',
  },
  {
    n: 9,
    name: 'Pronunciation',
    group: 'conversation',
    summary: 'Pronounce every syllable clearly and fully.',
    how: [
      'Focus on shaping each syllable, slightly exaggerated.',
      'Combines well with linking and enthusiasm.',
    ],
    example: '“Good · mor · ning, ev · ery · one.”',
  },
  {
    n: 10,
    name: 'Linking and last resorts',
    group: 'conversation',
    summary: 'Say words as one long word. Hum, gesture, sing or write if needed.',
    how: [
      'Link all words in a phrase as if they were one word. Linked words are not stuttered.',
      'Humming through the words makes linking easy; sing-song speech or singing make humming easy.',
      'Gesture naturally. As a last resort, write the word while you say, whisper or mouth it.',
    ],
    example: '“How are you” → “Howareyou”',
  },
  {
    n: 11,
    name: 'Speak like a King or Queen',
    group: 'conversation',
    summary: 'Slow, clear, warm, smiling, with full stops.',
    how: [
      'Speak slowly with extreme pronunciation and as much positive feeling as you can.',
      'Smile, and add full stops of one, two or three seconds.',
    ],
    example: '“Thank you all for coming. || It is a pleasure | to be here.”',
  },
  {
    n: 12,
    name: 'Smile',
    group: 'conversation',
    summary: 'Smile as you speak.',
    how: [
      'Some people found smiling alone did more than any other crutch.',
      'At minimum, it makes every other crutch easier, and people warm to you.',
    ],
    example: 'Smile before your first word, and keep smiling.',
  },
  {
    n: 13,
    name: 'No crutch at all',
    group: 'endgame',
    summary: 'Speak your thoughts and let your brain choose the words.',
    how: [
      'This is what fluent speakers do in conversation: they speak as they think.',
      'It comes after mastering the other crutches and having no bad incidents for a while. C-11 and C-12 are the stepping stones.',
    ],
    example: 'Think the message, not the words.',
  },
]

export const EXAMPLE_WORDS = [
  'Hello',
  'Thank you',
  'Good morning',
  'Coffee',
  'Water',
  'Pizza',
  'Monday',
  'Tuesday',
  'Seven',
  'Thirty',
  'Doctor',
  'Present',
  'Question',
  'Ticket',
  'Bank',
  'Pardon',
  'Kitchen',
  'Delivery',
  'Busy',
  'Customer',
  'London',
  'Paris',
  'Berlin',
  'Tokyo',
  'Can I have',
  'My name is',
  'Yes',
  'Nice to meet you',
]

export const SCENES = [
  { id: 'meeting', label: 'Meeting' },
  { id: 'boss', label: 'Boss' },
  { id: 'intro', label: 'Intro' },
  { id: 'chat', label: 'Chat' },
  { id: 'silence', label: 'Silence' },
  { id: 'phone', label: 'Phone' },
  { id: 'general', label: 'Everyday' },
] as const

export type SceneId = (typeof SCENES)[number]['id']

export interface LinkedSentence {
  text: string
  scene: SceneId
}

const S = (scene: SceneId, ...texts: string[]): LinkedSentence[] => texts.map((text) => ({ text, scene }))

/** `|` = 1-second stop, `||` = 2-second stop. Words between stops are linked. */
export const LINKED_SENTENCES: LinkedSentence[] = [
  ...S(
    'meeting',
    'Can you hear me | okay',
    'That sounds great || let us do it',
    'Sorry | could you repeat that || please',
    'I think | we should start || with the main idea',
    'Thank you all | for coming || it is a pleasure | to be here',
    'I agree with you || and I would add | one more point',
    'Today | I want to talk | about my progress',
    'Good question || here is | what I think',
    'Quick update || two things. | First | the report | is ready.',
    'Can I add | one thing | here?',
    'From my side || everything is | on track.',
    'I have a question || about the timeline.',
    'Let me share | my screen || one moment.',
    'To summarize || we agreed | on three points.',
    'I see it | a bit differently. || Here is why.',
    'That is | a good point. || I would also | check the data.',
    'Next step || I will send | a short summary.',
    'Sorry to interrupt || can I | jump in here?',
  ),
  ...S(
    'boss',
    'I have a quick question || about the report',
    'I am | really happy | with the result',
    'Let me check | my calendar || and get back to you',
    'Do you have | two minutes? || I would like | your view | on this.',
    'I finished | the analysis. || Can I | walk you through it?',
    'I need | a bit more time || for the report.',
    'What would you | like me | to focus on?',
    'Can we talk | about my goals | this quarter?',
    'I made | a small mistake || and I have | already fixed it.',
    'Thanks for | the feedback. || That really helps.',
    'I have an idea || that could | save us time.',
  ),
  ...S(
    'intro',
    'Hello | my name is {name} || nice to meet you',
    'Let me introduce myself || I am {name} | and I work on | the data team',
    'My name is {name} || and I am | here for the interview',
    'Hi | I am {name}. || I joined | the team | last month.',
    'Nice to meet you. || What do you | work on?',
    'I am {name} || from the | data team.',
    'Hi everyone. || I am {name} || and I work | on data.',
    'Let me | quickly introduce myself.',
    'I am new here || so I am | happy to meet everyone.',
  ),
  ...S(
    'chat',
    'Good morning || how are you today',
    'I love speaking | with you || see you soon',
    'Oh | that reminds me || of my trip.',
    'Really? || How did | that happen?',
    'Same here. || I had | a busy week too.',
    'That sounds | amazing. || Where was it?',
    'Ha | that is funny. || I did | the same thing.',
    'Wait || so what | happened next?',
    'I tried | that place too. || The food was great.',
    'Nice! || Did you | enjoy it?',
  ),
  ...S(
    'silence',
    'Nice to see you || how was | your weekend',
    'So | how was | everyone\'s weekend?',
    'Anyone tried | the new place | downstairs?',
    'Busy day | today?',
    'Any plans | for the holidays?',
    'This coffee | is really good.',
    'Did anyone | watch the game | last night?',
    'How is | your project | going?',
    'It is | so quiet today. || Is everyone | still waking up?',
  ),
  ...S(
    'phone',
    'I would like | a table for two || at seven',
    'Hi | this is {name} || I am calling about | my appointment',
    'My phone number is | zero six || one two | three four',
    'We can meet | on Tuesday || at three',
    'Thank you for | your time || have a lovely evening',
    'Hi | this is {name} || from the | data team.',
    'I am calling | to ask about | my order.',
    'Could you | spell that | for me?',
    'Is now | a good time | to talk?',
    'Thanks for | your help. || Have a | good day.',
  ),
  ...S(
    'general',
    'Could I have | a large coffee | please',
    'Thank you || have a great day',
    'Excuse me || where is | the train station',
    'I would like to pay | by card',
    'Can I get the bill | please',
    'One ticket to | the city center || please',
    'Could you help me | find this book',
    'Two cappuccinos | and a croissant | please',
    'Sorry || could you | say that again?',
    'Let me think | for a second.',
    'Good question. || Let me | check and | get back to you.',
    'Thank you | so much. || That is | very kind.',
  ),
]

export const FREE_TALK_TOPICS = [
  'Describe what you had for breakfast.',
  'Tell me about your hometown.',
  'What did you do last weekend?',
  'Describe your favorite place to relax.',
  'What is a skill you would love to learn, and why?',
  'Talk about a film or series you enjoyed recently.',
  'Describe your morning routine.',
  'What would your perfect day look like?',
  'Tell me about a friend who makes you laugh.',
  'What is the best trip you have ever taken?',
  'Describe the room you are in right now.',
  'What are you looking forward to this month?',
  'Talk about a meal you love to cook or eat.',
  'What do you enjoy most about your work?',
  'Describe a small thing that made you happy today.',
  'If you could live anywhere, where would it be?',
  'Explain how to make a cup of tea or coffee.',
  'Talk about a book that changed how you think.',
  'What is a habit you are proud of?',
  'Describe the weather and how it makes you feel.',
  'Tell me about your favorite season.',
  'What would you do with a free afternoon?',
  'Describe someone you admire.',
  'Talk about a hobby you enjoy.',
  'What is something new you learned this week?',
  'Describe your ideal weekend breakfast.',
  'Give directions from your home to a nearby shop.',
  'Talk about a goal you are working toward.',
  'Describe a happy memory from childhood.',
  'What makes a great conversation?',
  'Introduce yourself as if at a party.',
  'Explain your job to a ten-year-old.',
  'Tell me about your favorite music.',
  'Describe a place you would love to visit.',
  'What does a great speaker do?',
  'Talk about how you like to celebrate.',
]
