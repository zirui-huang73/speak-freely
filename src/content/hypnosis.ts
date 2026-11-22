import { CAPRIO_QUOTE } from './affirmations'

export type HypnosisMode = 'bedtime' | 'daytime'
export const HYPNOSIS_LENGTHS = [10, 20] as const

/** A spoken line followed by a pause. `pause` is a relative weight; real durations are fitted to the session length. */
export interface ScriptLine {
  text: string
  pause: number
  volume?: number
}

const line = (text: string, pause = 1, volume?: number): ScriptLine => ({ text, pause, volume })

const SETTLE = [
  line('Find a comfortable position, sitting or lying down.', 1.5),
  line('Let your hands rest loosely, and let your body be supported.', 1.5),
  line('When you are ready, gently close your eyes.', 2),
  line('Take a slow, deep breath in.', 3),
  line('And breathe out, slowly and completely.', 3),
  line('Another slow breath in, filling your chest.', 3),
  line('And let it go, letting your shoulders drop.', 3),
  line('One more deep breath in.', 3),
  line('And breathe out, letting everything soften.', 3),
  line('Now let your breathing find its own easy rhythm.', 2.5),
]

const PARTS_SHORT = ['forehead', 'eyes', 'jaw', 'shoulders', 'arms and hands', 'chest', 'stomach', 'legs', 'feet']
const PARTS_LONG = [
  'scalp',
  'forehead',
  'eyes',
  'cheeks',
  'lips',
  'jaw',
  'neck',
  'shoulders',
  'upper arms',
  'forearms and hands',
  'chest',
  'upper back',
  'stomach',
  'lower back',
  'hips',
  'thighs',
  'knees',
  'calves',
  'ankles',
  'feet and toes',
]

const RELAX_TEMPLATES = [
  (p: string) => `Now bring your attention to your ${p}. Let it become soft and heavy.`,
  (p: string) => `Relax your ${p}. Let all the tension melt away.`,
  (p: string) => `Feel your ${p} letting go, loose and warm.`,
]

function relax(parts: string[]): ScriptLine[] {
  const lines = parts.map((p, i) => line(RELAX_TEMPLATES[i % RELAX_TEMPLATES.length](p), 2))
  const jaw = parts.indexOf('jaw')
  lines.splice(
    jaw + 1,
    0,
    line('Let your jaw hang loose. Let your tongue rest softly. Let your throat feel open and easy.', 2.5),
    line('Your breath flows freely, in and out, without any effort.', 2.5),
  )
  return [...lines, line('Your whole body is now relaxed, heavy and comfortable.', 3)]
}

const NUMBER_WORDS = ['Ten', 'Nine', 'Eight', 'Seven', 'Six', 'Five', 'Four', 'Three', 'Two', 'One']
const DEEPER = [
  'deeper and deeper.',
  'more and more relaxed.',
  'drifting down.',
  'calm and peaceful.',
  'sinking deeper.',
  'safe and comfortable.',
  'letting go completely.',
  'deeper still.',
  'so relaxed.',
  'deeply, deeply relaxed.',
]

function deepen(long: boolean): ScriptLine[] {
  return [
    line('In a moment, I will count down from ten to one.', 1.5),
    line('Imagine you are at the top of a gentle staircase. With each number, you take one step down, and go deeper into relaxation.', 2.5),
    ...(long
      ? [line('The steps are soft and wide. The light is warm. You feel completely safe.', 2.5)]
      : []),
    ...NUMBER_WORDS.map((n, i) => line(`${n}, ${DEEPER[i]}`, long ? 3 : 2.2)),
    line('You are now at the bottom of the staircase, in a place of deep calm.', 3),
  ]
}

const PEACEFUL_PLACE = [
  line('Now imagine a peaceful place. It may be a beach, a garden, or a quiet room. Somewhere you feel completely at ease.', 3),
  line('Notice the colors around you, soft and pleasant.', 3),
  line('Notice the sounds. Gentle, calm, and far away.', 3),
  line('Feel the air on your skin, the perfect temperature.', 3),
  line('Here, there is no hurry and nothing to prove.', 3),
  line('Here, you are free. Free to rest, free to be yourself, free to speak.', 3.5),
  line('This place is always here for you, whenever you close your eyes.', 3),
]

function suggestions(affirmations: string[], repeats: number): ScriptLine[] {
  const quote = CAPRIO_QUOTE.split(/(?<=\.)\s+/).map((s) => line(s, 1.5))
  const said = affirmations.flatMap((a) => Array.from({ length: repeats }, () => line(a, 3.5)))
  return [
    line('Your mind is now open and calm, ready to accept positive thoughts.', 2),
    line('Listen to each one, and repeat it silently in your mind.', 2.5),
    ...quote,
    line('These are your affirmations.', 2),
    ...said,
  ]
}

const VISUALIZE_SHORT = [
  line('Now, picture yourself speaking to a group of people.', 2.5),
  line('You stand tall. You smile. You feel calm and ready.', 2.5),
  line('You begin to speak. Your words flow, linked together, smooth and easy.', 3),
  line('You pause whenever you like, and the pauses feel good.', 3),
  line('People listen with interest. You enjoy being heard.', 3),
  line('Notice how good it feels to speak freely.', 3.5),
]

const VISUALIZE_LONG = [
  line('Now, picture yourself meeting someone new.', 2.5),
  line('You smile, and you say your name easily, with warmth and pride.', 3.5),
  line('Now see yourself answering the phone. Your voice is clear and friendly.', 3.5),
  line('Now picture yourself speaking to a group of people.', 2.5),
  line('You stand tall. You smile. You feel calm and ready.', 2.5),
  line('You begin to speak. Your words flow, linked together, smooth and easy.', 3),
  line('You take full stops whenever you like, and the stops make your speech strong and elegant.', 3.5),
  line('People listen with interest. You enjoy every moment.', 3),
  line('Every time you speak, it becomes easier and more natural.', 3),
  line('Notice how good it feels to speak freely, anywhere, to anyone.', 4),
]

const WAKE = [
  line('These thoughts are now part of you. They grow stronger every day.', 2.5),
  line('In a moment, I will count from one to five. At five, you will open your eyes, feeling refreshed, alert and confident.', 2.5),
  line('One. Slowly coming back.', 2),
  line('Two. Feeling your body, light and energized.', 2),
  line('Three. Breathing a little deeper.', 2),
  line('Four. Ready to open your eyes.', 2),
  line('Five. Eyes open, wide awake, feeling wonderful.', 1),
]

const SLEEP = [
  line('These thoughts are now part of you, and they sink deeper as you sleep.', 3, 0.9),
  line('Every night, your mind grows calmer, and your speech grows freer.', 3.5, 0.8),
  line('There is nothing to do now but rest.', 3.5, 0.65),
  line('Let yourself drift into a deep, peaceful sleep.', 4, 0.5),
  line('Sleep now, deeply and peacefully.', 5, 0.35),
]

export function buildScript(mode: HypnosisMode, minutes: number, affirmations: string[]): ScriptLine[] {
  const long = minutes >= 20
  return [
    ...SETTLE,
    ...relax(long ? PARTS_LONG : PARTS_SHORT),
    ...deepen(long),
    ...(long ? PEACEFUL_PLACE : []),
    ...suggestions(affirmations, long ? 2 : 1),
    ...(long ? VISUALIZE_LONG : VISUALIZE_SHORT),
    ...(mode === 'daytime' ? WAKE : SLEEP),
  ]
}
