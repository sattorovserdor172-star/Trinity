import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChevronLeft, ArrowRight, Check, X, Clock, Layers, Shuffle, Zap,
  ClipboardCheck, Trophy, RotateCcw, GraduationCap, Target, BookOpen,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  DATA — real words transcribed from Vocabook by @satashkent        */
/*  Row shape: [word, tag, definition, example, antonym, altForms?]   */
/* ------------------------------------------------------------------ */

const CP_SET_1 = [
  ['Erratic', 'ADJECTIVE', `Unpredictable, inconsistent, irregular`, `His erratic dance moves were so unpredictable that even the DJ couldn't keep up with the beat.`, `Predictable`],
  ['Secluded', 'ADJECTIVE', `Hard to reach, hidden away`, `The WiFi signal was so bad in the secluded cabin that they had to make friends with the squirrels just for entertainment.`, `Accessible`],
  ['Fluctuate', 'VERB', `To rise and fall irregularly`, `His mood fluctuates like the stock market — happy when he gets pizza, but plummeting when it runs out.`, `Stabilize`],
  ['Exalt', 'VERB', `To praise, to worship`, `She exalted her coffee maker every morning, whispering, "You are my hero," as it brewed her life-saving caffeine.`, `Criticize`],
  ['Admonish', 'VERB', `To warn or scold someone`, `The cat was admonished for knocking over the vase, but its smug face said, "I regret nothing!"`, `Praise`],
  ['Abrupt', 'ADJECTIVE', `Sudden, unexpected, without warning`, `His abrupt decision to cut his hair at 3 a.m. left him looking like a porcupine in a windstorm.`, `Gradual`],
  ['Content', 'ADJECTIVE', `Satisfied`, `After eating an entire pizza by himself, he was so content that even the thought of dessert couldn't move him.`, `Discontent`],
  ['Eccentric', 'ADJECTIVE', `Uncommon, strange`, `His eccentric habit of wearing socks over his shoes made people think he was either a genius or just really confused.`, `Conventional`],
  ['Mired', 'ADJECTIVE', `Stuck in mud`, `She was so mired in paperwork that even a bulldozer wouldn't be able to dig her out of her office.`, `Free`],
  ['Colloquial', 'ADJECTIVE', `Used in casual conversation`, `His speech was so full of colloquial slang that even his grandma said, "Bruh, I don't understand you."`, `Formal`],
  ['Reconcile', 'VERB', `Settle one's differences, make compatible, bring back to peace`, `They finally reconciled after their epic debate over whether pineapple belongs on pizza. Spoiler: it doesn't.`, `Estrange`],
  ['Alienate', 'VERB', `To cause someone to feel isolated or lonely`, `His decision to start every conversation with a detailed history of traffic lights quickly alienated all his friends.`, `Befriend`],
  ['Distinguish', 'VERB', `To tell the difference between`, `He could barely distinguish between his identical twin brothers until one started wearing neon green socks every day.`, `Confuse`],
  ['Adequate', 'ADJECTIVE', `Sufficient, enough, acceptable`, `His cooking skills were adequate — let's just say the fire alarm got a workout, but the pizza wasn't that burnt.`, `Inadequate`],
  ['Contend', 'VERB', `1) To deal with someone or something 2) To claim or state a belief confidently`, `He contended with his alarm clock every morning as if it was a fierce battle between sleep and reality.`, `Surrender`],
  ['Skeptical', 'ADJECTIVE', `Having doubts`, `She was skeptical about the "miracle" face cream that claimed to make her look 20 years younger overnight.`, `Trusting`],
  ['Enfranchise', 'VERB', `To give the right to vote`, `The town held a parade to celebrate when they finally enfranchised the local raccoons… though they immediately voted for more trash cans.`, `Disenfranchise, enslave`],
  ['Sophisticated', 'ADJECTIVE', `1) Having a lot of worldly experience and knowledge 2) Complicated`, `His sophisticated taste in cheese made him the only person who actually knew what "gorgonzola" was at the party.`, `Naive`],
  ['Radical', 'ADJECTIVE', `1) Thorough, complete, extensive 2) Fundamental, essential 3) Revolutionary, extreme`, `His radical idea to solve all the world's problems by making every Friday "Free Ice Cream Day" was met with mixed reviews, mostly from lactose-intolerant folks.`, `Conservative`],
  ['Formulate', 'VERB', `To create or think up`, `She formulated a foolproof plan to sneak past her dog — step one: tiptoe; step two: realize dogs can hear everything.`, `Destroy`],
  ['Attest', 'VERB', `To confirm or verify`, `He could attest to the fact that eating 10 tacos in one sitting was not a good life decision.`, `Deny`],
  ['Vexing', 'ADJECTIVE', `Annoying, irritating`, `The constant buzzing of the fly around his head was so vexing that he considered giving it a name just to yell at it properly.`, `Pleasing`],
  ['Unassuming', 'ADJECTIVE', `Humble, low-key`, `The unassuming librarian turned out to be a ninja in her free time, proving you can't judge a book by its cover.`, `Arrogant`],
  ['Coerce', 'VERB', `To pressure or force someone to do something`, `He coerced his little brother into trading his chocolate bar for a carrot by promising it was "just as tasty." It wasn't.`, `Persuade (gently)`],
  ['Adept', 'ADJECTIVE', `Very skilled at something`, `She was so adept at parallel parking that she could fit a bus into a space meant for a bicycle.`, `Inept, mediocre, amateur`],
];

const CP_SET_2 = [
  ['Eloquent', 'ADJECTIVE', `Fluent or persuasive in speaking or writing`, `His speech was so eloquent that even his dog stopped barking just to listen.`, `Inarticulate, dullness`],
  ['Austere', 'ADJECTIVE', `Plain and without decoration, comforts, or anything extra`, `Her living room was so austere that the only decoration was a single chair — perfect for minimalist extreme sports.`, `Ornate, luxurious`],
  ['Dread', 'VERB', `To fear, be afraid of`, `He dreaded his mom's reaction to the broken vase, but he blamed the wind — inside the house.`, `Welcome, anticipate`],
  ['Inevitable', 'ADJECTIVE', `Unavoidable`, `It was inevitable that he would trip while texting and walking, as everyone saw it coming — except him.`, `Avoidable, uncertain`],
  ['Stress', 'VERB', `To emphasize`, `She stressed the importance of cleaning the room, but it still looked like a tornado had moved in.`, `Downplay, minimize`],
  ['Spawn', 'VERB', `To produce, generate, or create`, `The idea for his movie spawned after a dream where penguins took over the world with dance battles.`, `Destroy, terminate`],
  ['Renounce', 'VERB', `To give up, deny, or surrender something`, `He renounced his superhero cape after one too many failed attempts at flying off the couch.`, `Accept, embrace`],
  ['Unprecedented', 'ADJECTIVE', `Never done or known before`, `His unprecedented move to start a cheese museum in his basement had the neighbors curiously excited.`, `Common, routine`],
  ['Broach', 'VERB', `To bring up a difficult subject for discussion`, `He broached the subject of missing rent with his landlord, who thankfully had a sense of humor — about everything except rent.`, `Avoid, suppress`],
  ['Proxy', 'NOUN', `A person authorized to act on behalf of another; substitute`, `He sent his dog as a proxy to the meeting, but all they got was a bowl of snacks and a nap under the table.`, `Principal, original`],
  ['Detrimental', 'ADJECTIVE', `Harmful, damaging`, `Eating 10 donuts for breakfast might be detrimental to your health, but it's great for your mood — temporarily.`, `Beneficial, constructive`],
  ['Secular', 'ADJECTIVE', `Having no religious or spiritual basis`, `The concert was entirely secular, except for the part where the lead singer thanked "the universe" for his fans.`, `Sacred, religious`],
  ['Innovative', 'ADJECTIVE', `New and different`, `His innovative way of organizing his closet involved attaching his shirts to a ceiling fan — one quick spin, and he was dressed.`, `Unoriginal, traditional`],
  ['Tangible', 'ADJECTIVE', `Real and able to be shown or touched`, `The excitement in the room was so tangible, you could practically high-five it.`, `Intangible, abstract`],
  ['Disseminate', 'VERB', `To spread widely (particularly information)`, `He tried to disseminate the news about the school trip, but it somehow turned into a rumor about a school-wide pizza party.`, `Conceal, contain`],
  ['Delegate', 'VERB', `To assign a task to another person`, `He delegated the dishwashing duty to his little brother, but somehow the dishes were still dirty, and the brother was missing.`, `Retain, withhold`],
  ['Apparent', 'ADJECTIVE', `Clearly visible or understood; obvious`, `It became apparent that he had no idea how to assemble the furniture when the bookshelf started resembling a chair.`, `Hidden, obscure`],
  ['Postulate', 'VERB', `To suggest or propose something`, `He postulated that pizza should be considered a vegetable, which earned him both laughs and several high-fives.`, `Reject, deny`],
  ['Speculate', 'VERB', `To guess, to form a theory without firm evidence`, `He speculated that his lost sock had fallen into a black hole because where else could it have gone?`, `Prove, verify`],
  ['Bazaar', 'NOUN', `A market selling a large variety of goods`, `The bazaar had everything from handmade rugs to pet unicorn horns — for cats, of course.`, `Boutique, supermarket`],
  ['Sporadic', 'ADJECTIVE', `Scattered, irregular, unpredictable`, `His sporadic attempts to clean his room usually started strong and ended with him watching TV in the mess.`, `Consistent, regular`],
  ['Suffrage', 'NOUN', `The right to vote`, `She celebrated when women gained suffrage by voting for the cutest puppy in the election for "Pet of the Year."`, `Disenfranchisement, disqualification`],
  ['Incredulous', 'ADJECTIVE', `Unwilling or unable to believe something`, `He was incredulous when his cat finally learned how to fetch. "Next up," he said, "playing the piano."`, `Believing, gullible`],
  ['Idealistic', 'ADJECTIVE', `Unrealistically aiming for perfection`, `His idealistic goal of becoming a world-class chef in a week ended when he burned toast — three times in a row.`, `Realistic, pragmatic`],
  ['Conflate', 'VERB', `To mix or combine into one (typically ideas)`, `He conflated his birthday party with Halloween, so everyone showed up in costumes to celebrate his "vampire cake."`, `Separate, divide`],
];

const CP_SET_3 = [
  ['Paucity', 'NOUN', `Poverty, scarcity`, `The paucity of snacks at the party led to a fierce competition over the last slice of pizza.`, `Abundance, plentifulness`],
  ['Ephemeral', 'ADJECTIVE', `Temporary, short-lived`, `His enthusiasm for working out was ephemeral — lasting just long enough to post about it on social media.`, `Permanent, lasting`],
  ['Prompt', 'VERB', `To cause (someone) to take a course of action`, `The sight of chocolate cake promptly caused him to break his diet with zero hesitation.`, `Discourage, deter`],
  ['Reverence', 'NOUN', `Deep respect for someone or something`, `He showed great reverence for his grandma's cooking, bowing before every plate of lasagna like it was a royal feast.`, `Disrespect, scorn`],
  ['Disparity', 'NOUN', `A great difference`, `The disparity between his baking skills and his sister's was obvious when his cookies looked like rocks and hers like art.`, `Similarity, equality`],
  ['Dispassionate', 'ADJECTIVE', `Not influenced by strong emotion, fair-minded`, `As the judge, she remained dispassionate, even when the defendant made a very emotional argument about losing his last donut.`, `Emotional, biased`],
  ['Phenomenon', 'NOUN', `A noteworthy occurrence or situation`, `The sudden appearance of a double rainbow after the storm was such a phenomenon that everyone stopped to take selfies with it.`, `Ordinary, normality`],
  ['Boast', 'VERB', `To brag, to show off`, `He boasted so much about his new car that his friends started pretending they couldn't hear him.`, `Humble, conceal`],
  ['Irksome', 'ADJECTIVE', `Irritating, annoying`, `The irksome sound of his neighbor's endless lawn mowing made him wish grass would just stop growing.`, `Pleasant, agreeable`],
  ['Allude', 'VERB', `To suggest or call attention to indirectly, to make a reference to something`, `She alluded to the surprise party by "accidentally" mentioning how much she loved cake in every conversation.`, `State directly, declare`],
  ['Omnipotence', 'NOUN', `Having unlimited or great power`, `He felt a sense of omnipotence when he finally found the TV remote, as if he could control the whole universe.`, `Powerlessness, weakness`],
  ['Provoke', 'VERB', `To cause a reaction or emotion (usually anger); to trigger`, `His joke about pineapple on pizza provoked a heated debate that threatened to divide the whole group of friends.`, `Pacify, calm`],
  ['Indulge', 'VERB', `To allow oneself to enjoy the pleasure of`, `He decided to indulge in a whole tub of ice cream after a long day of pretending to eat salads.`, `Abstain, deny`],
  ['Entrenched', 'ADJECTIVE', `Firmly established and unlikely to change`, `His entrenched belief that socks and sandals were the height of fashion would not be swayed by any amount of ridicule.`, `Flexible, unstable`],
  ['Inherent', 'ADJECTIVE', `Built-in, existing in something as a permanent or essential characteristic`, `His inherent love of naps made him the best couch tester in the world.`, `Acquired, external`],
  ['Vernacular', 'NOUN', `Everyday informal language, local dialect`, `He quickly picked up the local vernacular, casually saying "y'all" after just one day in Texas.`, `Formal language, literary language`],
  ['Inquisition', 'NOUN', `Interrogation, questioning`, `His mom's inquisition about his missing homework felt more intense than a detective show.`, `Neglect, ignorance`],
  ['Anecdote', 'NOUN', `A short personal story`, `He told an amusing anecdote about the time he accidentally walked into the wrong Zoom meeting — and stayed for an hour.`, `Epic, long narrative`],
  ['Malign', 'ADJECTIVE', `Evil in nature, harmful`, `The villain's malign plot to steal all the world's ice cream was met with global outrage.`, `Benevolent, kind`],
  ['Anomaly', 'NOUN', `Oddity, something that is not normal`, `His punctuality was such an anomaly that everyone asked if he was feeling okay when he arrived on time.`, `Normality, usualness`],
  ['Inhibit', 'VERB', `To hold someone or something back, to suppress, to prevent`, `His fear of public speaking inhibited him from raising his hand in class, even when he knew all the answers.`, `Encourage, allow`],
  ['Mutable', 'ADJECTIVE', `Changeable`, `His mutable schedule meant that nobody ever knew when he'd actually show up.`, `Fixed, stable`],
  ['Petty', 'ADJECTIVE', `1) Of little importance 2) Caring too much about trivial matters`, `The argument over whose turn it was to pick a movie was so petty that even the dog rolled his eyes.`, `Significant, important`],
  ['Avid', 'ADJECTIVE', `Passionate about something`, `He was such an avid collector of rare comic books that he could smell a first edition from a mile away.`, `Indifferent, apathetic`],
  ['Invoke', 'VERB', `To call on or refer to something`, `He tried to invoke the "5-second rule" after dropping his sandwich, but it was too late — the dog already had it.`, `Dismiss, ignore`],
];

const SAT_SET_1 = [
  ['Copious', 'ADJECTIVE', `Abundant in supply or quantity`, `She had copious notes from the lecture.`, `Scarce, sparse`],
  ['Sporadic', 'ADJECTIVE', `Occurring irregularly or at intervals`, `The rain was sporadic throughout the day.`, `Consistent, regular`],
  ['Transpose', 'VERB', `To change the order or arrangement of something`, `The teacher asked us to transpose the rows and columns.`, `Organize, maintain`],
  ['Lament', 'VERB', `To express sorrow or regret`, `He lamented the loss of his childhood home.`, `Celebrate, rejoice`],
  ['Entail', 'VERB', `To involve or require as a necessary part`, `This project entails a lot of research and dedication.`, `Exclude, omit`],
  ['Momentous', 'ADJECTIVE', `Of great importance or significance`, `The signing of the treaty was a momentous occasion.`, `Insignificant, trivial`],
  ['Pristine', 'ADJECTIVE', `Clean and unspoiled; in its original state`, `The forest remains pristine despite nearby urbanization.`, `Dirty, corrupted`],
  ['Constrict', 'VERB', `To make narrower by pressing together`, `The snake constricted its prey tightly.`, `Expand, release`],
  ['Nebulous', 'ADJECTIVE', `Vague, unclear, or ill-defined`, `His plans for the future remain nebulous.`, `Clear, distinct`],
  ['Buttress', 'VERB', `To support or strengthen something`, `The new law is intended to buttress economic growth.`, `Weaken, undermine`],
  ['Refute', 'VERB', `To disprove or argue against`, `He refuted the allegations with solid evidence.`, `Support, confirm`],
  ['Corroborate', 'VERB', `To confirm or give support to`, `The scientist corroborated the findings with additional data.`, `Contradict, oppose`],
  ['Scrupulous', 'ADJECTIVE', `Thorough and attentive to detail`, `Her scrupulous approach ensures accuracy in her work.`, `Careless, negligent`],
  ['Vindicate', 'VERB', `To clear someone of blame or suspicion`, `New evidence vindicated the wrongly accused man.`, `Blame, incriminate`],
  ['Preclude', 'VERB', `To prevent something from happening`, `Heavy rain precluded us from going hiking.`, `Enable, permit`],
  ['Repudiate', 'VERB', `To reject or disown something`, `He repudiated the accusations during the trial.`, `Accept, embrace`],
  ['Mitigate', 'VERB', `To make less severe, serious, or painful`, `Measures were taken to mitigate the effects of climate change.`, `Aggravate, intensify`],
  ['Outsized', 'ADJECTIVE', `Unusually large or oversized`, `The outsized package couldn't fit through the door.`, `Small, undersized`],
  ['Palpable', 'ADJECTIVE', `Easily noticeable or capable of being felt`, `There was a palpable sense of excitement in the air.`, `Subtle, intangible`],
  ['Evince', 'VERB', `To show or demonstrate clearly`, `The data evinced a clear trend in customer behavior.`, `Hide, obscure`],
  ['Overlooked', 'ADJECTIVE', `Failed to be noticed or considered`, `The significance of her contributions was overlooked.`, `Recognized, acknowledged`],
  ['Accentuate', 'VERB', `To emphasize or highlight something`, `The report accentuated the need for policy reform.`, `Downplay, de-emphasize`],
  ['Counteract', 'VERB', `To act against something to reduce its effect`, `The drug counteracted the effects of the poison.`, `Support, promote`],
  ['Insuperable', 'ADJECTIVE', `Impossible to overcome`, `The mountain presented an insuperable challenge.`, `Surmountable, conquerable`],
  ['Irreproachable', 'ADJECTIVE', `Beyond criticism; faultless`, `Her irreproachable character earned her universal respect.`, `Flawed, reproachable`],
];

const SAT_SET_2 = [
  ['Pretentiousness', 'NOUN', `The quality of being showy or self-important`, `Her pretentiousness was apparent in the way she spoke.`, `Modesty, humility`],
  ['Ineluctable', 'ADJECTIVE', `Impossible to avoid or resist`, `The consequences of his actions were ineluctable.`, `Avoidable, escapable`],
  ['Equivocal', 'ADJECTIVE', `Open to more than one interpretation; ambiguous`, `Her reply was equivocal, leaving us uncertain of her intentions.`, `Clear, definite`],
  ['Inconsequential', 'ADJECTIVE', `Not important or significant`, `The typo in the document was inconsequential to the final decision.`, `Significant, meaningful`],
  ['Manifestations', 'NOUN', `Visible signs or expressions of something`, `The protests were manifestations of widespread discontent.`, `Concealments, absences`],
  ['Obscure', 'ADJECTIVE', `Not clearly understood or easily expressed`, `The explanation was too obscure for most to understand.`, `Clear, evident`],
  ['Rectify', 'VERB', `To correct or make something right`, `He tried to rectify his mistakes by apologizing.`, `Worsen, corrupt`],
  ['Ameliorate', 'VERB', `To make a bad situation better`, `Efforts were made to ameliorate the living conditions in the area.`, `Worsen, exacerbate`],
  ['Unattainable', 'ADJECTIVE', `Impossible to achieve`, `The peak was deemed unattainable without proper equipment.`, `Achievable, possible`],
  ['Superfluous', 'ADJECTIVE', `Unnecessary, especially through being more than enough`, `He spent money on superfluous items he didn't need.`, `Necessary, essential`],
  ['Amorphous', 'ADJECTIVE', `Without a clearly defined shape or form`, `The plan was amorphous and lacked clear goals.`, `Defined, structured`],
  ['Misconstrued', 'ADJECTIVE', `Interpreted wrongly`, `His comments were misconstrued as criticism.`, `Understood, clarified`],
  ['Prohibitive', 'ADJECTIVE', `Excessively expensive; forbidding`, `The cost of the tickets was prohibitive for most families.`, `Affordable, accessible`],
  ['Stipulate', 'VERB', `To demand or specify as part of an agreement`, `The contract stipulates the terms of the agreement clearly.`, `Suggest, imply`],
  ['Induce', 'VERB', `To bring about or give rise to`, `The drug can induce drowsiness in some patients.`, `Prevent, hinder`],
  ['Engender', 'VERB', `To cause or give rise to a feeling or situation`, `Their actions engendered trust among the team members.`, `Suppress, discourage`],
  ['Dispersed', 'ADJECTIVE', `Scattered across a wide area`, `The seeds were dispersed by the wind.`, `Concentrated, gathered`],
  ['Supplant', 'VERB', `To take the place of something, often by force`, `The new product aims to supplant its predecessor.`, `Retain, preserve`],
  ['Austere', 'ADJECTIVE', `Severe or strict in manner or appearance`, `Her austere demeanor was softened by her kindness.`, `Luxurious, indulgent`],
  ['Equitable', 'ADJECTIVE', `Fair and impartial`, `The decision was equitable to all parties involved.`, `Unfair, biased`],
  ['Augment', 'VERB', `To make something greater by adding to it`, `The team augmented their resources to meet the deadline.`, `Reduce, decrease`],
  ['Conventional', 'ADJECTIVE', `Based on or in accordance with what is traditionally done`, `Her dress style was very conventional, fitting societal norms.`, `Unorthodox, unconventional`],
  ['Idiosyncratic', 'ADJECTIVE', `Distinctive or peculiar to an individual`, `His idiosyncratic habits made him memorable.`, `Common, typical`],
  ['Coalesce', 'VERB', `To come together to form one whole`, `The rivers coalesce into a large delta.`, `Separate, divide`],
  ['Synopsis', 'NOUN', `A brief summary or general overview`, `The report provided a concise synopsis of the findings.`, `Expansion, elaboration`],
];

const SAT_SET_3 = [
  ['Abundant', 'ADJECTIVE', `Existing in large quantities; plentiful`, `The harvest was abundant this year.`, `Scarce, insufficient`],
  ['Coarseness', 'NOUN', `The quality of being rough or crude`, `The coarseness of his language offended the audience.`, `Refinement, delicacy`],
  ['Orthodox', 'ADJECTIVE', `Adhering to traditional beliefs or practices`, `He follows orthodox religious practices.`, `Unorthodox, unconventional`],
  ['Reverberate', 'VERB', `To echo or resound repeatedly`, `The sound of the explosion reverberated through the valley.`, `Muffle, silence`],
  ['Municipal', 'ADJECTIVE', `Relating to a town or city and its governance`, `Municipal elections will be held next month.`, `Private, rural`],
  ['Sway', 'VERB', `To move back and forth or to influence someone's opinion`, `The wind swayed the trees gently.`, `Steady, stabilize`],
  ['Spurious', 'ADJECTIVE', `Not genuine or false`, `The spurious claims were dismissed by the court.`, `Authentic, genuine`],
  ['Indulgently', 'OTHER', `In a manner showing excessive generosity or leniency`, `She indulgently allowed her child to stay up late.`, `Strictly, harshly`],
  ['Behold', 'VERB', `To observe or see something`, `We beheld the stunning view from the mountain.`, `Ignore, overlook`, ['beheld']],
  ['Satiate', 'VERB', `To satisfy fully or to excess`, `The buffet satiated everyone's hunger.`, `Deprive, starve`],
  ['Convening', 'NOUN', `The act of gathering or assembling`, `The convening of the council was announced yesterday.`, `Dismissing, dispersing`],
  ['Idealize', 'VERB', `To view something or someone as perfect`, `She tends to idealize her past experiences.`, `Criticize, devalue`],
  ['Heterodox', 'ADJECTIVE', `Not conforming to established doctrines or beliefs`, `His heterodox views often spark debates.`, `Orthodox, conformist`],
  ['Irrefutable', 'ADJECTIVE', `Impossible to deny or disprove`, `The evidence presented was irrefutable.`, `Refutable, questionable`],
  ['Venerate', 'VERB', `To regard with great respect or reverence`, `They venerate the founder of their community.`, `Disrespect, despise`],
  ['Arduous', 'ADJECTIVE', `Involving great effort or difficulty`, `Climbing the mountain was an arduous task.`, `Easy, effortless`],
  ['Strenuous', 'ADJECTIVE', `Requiring much effort or energy`, `The strenuous workout left him exhausted.`, `Effortless, relaxed`],
  ['Unpretentious', 'ADJECTIVE', `Not pretentious; simple and sincere`, `Her unpretentious manner made her approachable.`, `Pretentious, pompous`],
  ['Satiable', 'ADJECTIVE', `Capable of being satisfied`, `He is easily satiable with small portions.`, `Insatiable, unquenchable`],
  ['Incongruous', 'ADJECTIVE', `Not in harmony with surroundings or expectations`, `The modern decor was incongruous with the ancient building.`, `Harmonious, fitting`],
  ['Recurrent', 'ADJECTIVE', `Occurring or appearing again periodically`, `The symptoms were recurrent every few weeks.`, `Irregular, singular`],
  ['Imposing', 'ADJECTIVE', `Grand and impressive in appearance`, `The imposing mansion stood at the edge of the cliff.`, `Modest, unimpressive`],
  ['Venerable', 'ADJECTIVE', `Commanding respect due to age or dignity`, `The venerable professor was admired by all.`, `Modern, dishonorable`],
  ['Erratic', 'ADJECTIVE', `Unpredictable or inconsistent`, `His erratic behavior confused his colleagues.`, `Consistent, stable`],
  ['Benevolent', 'ADJECTIVE', `Well-meaning and kind`, `Her benevolent actions benefited the entire village.`, `Malevolent, cruel`],
];

let __seq = 0;
function buildWords(rows) {
  return rows.map((r) => {
    __seq += 1;
    return {
      id: `w${__seq}`,
      word: r[0],
      tag: r[1],
      definition: r[2],
      example: r[3],
      antonym: r[4],
      altForms: r[5] || [],
    };
  });
}

const PACKAGES = [
  {
    id: 'college-panda-400',
    title: 'College Panda 400 Words',
    description: `The classic 400-word list — high-frequency words that show up again and again on test day.`,
    icon: GraduationCap,
    sets: [
      { id: 'cp-set-1', name: 'Set 1', words: buildWords(CP_SET_1), masteredSeed: 0, learningSeed: 4 },
      { id: 'cp-set-2', name: 'Set 2', words: buildWords(CP_SET_2), masteredSeed: 0, learningSeed: 2 },
      { id: 'cp-set-3', name: 'Set 3', words: buildWords(CP_SET_3), masteredSeed: 0, learningSeed: 2 },
    ],
  },
  {
    id: 'satashkent-real-exam',
    title: 'SATashkent Words (Real Exam Words)',
    description: `Pulled straight from real past exams — the words that actually show up when it counts.`,
    icon: Target,
    sets: [
      { id: 'sat-set-1', name: 'Set 1', words: buildWords(SAT_SET_1), masteredSeed: 3, learningSeed: 22 },
      { id: 'sat-set-2', name: 'Set 2', words: buildWords(SAT_SET_2), masteredSeed: 2, learningSeed: 6 },
      { id: 'sat-set-3', name: 'Set 3', words: buildWords(SAT_SET_3), masteredSeed: 0, learningSeed: 2 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  UTILITIES                                                          */
/* ------------------------------------------------------------------ */

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(totalSeconds) {
  const s = Math.max(0, totalSeconds);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function blankOutWord(example, word, altForms) {
  const base = word.replace(/\s*\(.*?\)\s*/g, '').trim();
  const alternatives = [base, ...(altForms || [])].map(escapeRegExp);
  const pattern = new RegExp(`\\b(?:${alternatives.join('|')})\\w*`, 'gi');
  return example.replace(pattern, '______');
}

function buildInitialProgress(packages) {
  const progress = {};
  packages.forEach((pkg) => {
    pkg.sets.forEach((set) => {
      set.words.forEach((w, i) => {
        if (i < set.masteredSeed) progress[w.id] = 'mastered';
        else if (i < set.masteredSeed + set.learningSeed) progress[w.id] = 'learning';
        else progress[w.id] = 'new';
      });
    });
  });
  return progress;
}

function decorateSet(set, wordProgress) {
  const words = set.words.map((w) => ({ ...w, status: wordProgress[w.id] || 'new' }));
  let mastered = 0, learning = 0, fresh = 0;
  words.forEach((w) => {
    if (w.status === 'mastered') mastered += 1;
    else if (w.status === 'learning') learning += 1;
    else fresh += 1;
  });
  return { ...set, words, mastered, learning, fresh, complete: fresh === 0 };
}

function decoratePackage(pkg, wordProgress) {
  const sets = pkg.sets.map((s) => decorateSet(s, wordProgress));
  const mastered = sets.reduce((a, s) => a + s.mastered, 0);
  const learning = sets.reduce((a, s) => a + s.learning, 0);
  const fresh = sets.reduce((a, s) => a + s.fresh, 0);
  const totalWords = mastered + learning + fresh;
  return {
    ...pkg,
    sets,
    mastered,
    learning,
    fresh,
    totalWords,
    totalSets: sets.length,
    percent: totalWords ? (mastered / totalWords) * 100 : 0,
  };
}

/* ------------------------------------------------------------------ */
/*  SMALL UI ATOMS                                                      */
/* ------------------------------------------------------------------ */

function CircularRing({ percent, size = 56, stroke = 6 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = c - (clamped / 100) * c;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e2e8f0" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#10b981"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-slate-700">{Math.round(clamped)}%</span>
      </div>
    </div>
  );
}

function LegendDot({ color, label, count }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label} <span className="font-semibold text-slate-600">{count}</span>
    </span>
  );
}

function SegmentedBar({ mastered, learning, fresh, showLegend = true, height = 8 }) {
  const total = mastered + learning + fresh || 1;
  const pm = (mastered / total) * 100;
  const pl = (learning / total) * 100;
  const pf = (fresh / total) * 100;
  return (
    <div>
      <div className="flex w-full overflow-hidden rounded-full bg-slate-100" style={{ height }}>
        {mastered > 0 && <div style={{ width: `${pm}%`, background: '#10b981', transition: 'width 0.6s ease-out' }} />}
        {learning > 0 && <div style={{ width: `${pl}%`, background: '#f59e0b', transition: 'width 0.6s ease-out' }} />}
        {fresh > 0 && <div style={{ width: `${pf}%`, background: '#cbd5e1', transition: 'width 0.6s ease-out' }} />}
      </div>
      {showLegend && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1">
          <LegendDot color="#10b981" label="Mastered" count={mastered} />
          <LegendDot color="#f59e0b" label="Learning" count={learning} />
          <LegendDot color="#cbd5e1" label="New" count={fresh} />
        </div>
      )}
    </div>
  );
}

function TagPill({ tag }) {
  return (
    <span className="inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-slate-500">
      {tag}
    </span>
  );
}

function BackHeader({ onBack, eyebrow, title, subtitle }) {
  return (
    <div className="mb-7">
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      {eyebrow && <p className="text-xs font-bold uppercase tracking-wide text-blue-600">{eyebrow}</p>}
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

function ModeHeader({ onBack, title, progress, extra }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h1 className="text-lg font-bold text-slate-900">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {extra}
        {progress && (
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">{progress}</span>
        )}
      </div>
    </div>
  );
}

function ModeCompletion({ title, stat, onBack, onRestart }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Trophy className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-slate-500">{stat}</p>
      <div className="mt-7 flex w-full gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          Back to set
        </button>
        <button
          onClick={onRestart}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          <RotateCcw className="h-4 w-4" /> Restart
        </button>
      </div>
    </div>
  );
}

const STATUS_META = {
  mastered: { label: 'Mastered', color: '#10b981' },
  learning: { label: 'Learning', color: '#f59e0b' },
  new: { label: 'New', color: '#94a3b8' },
};

function StatusRadio({ status, onChange }) {
  return (
    <div className="flex items-center gap-3">
      {Object.keys(STATUS_META).map((key) => {
        const meta = STATUS_META[key];
        const active = status === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className="flex items-center gap-1.5 text-xs font-semibold focus-visible:outline-none"
            style={{ color: active ? meta.color : '#cbd5e1' }}
          >
            <span
              className="flex h-3.5 w-3.5 items-center justify-center rounded-full border-2"
              style={{ borderColor: active ? meta.color : '#cbd5e1' }}
            >
              {active && <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />}
            </span>
            <span className={active ? 'inline' : 'hidden sm:inline'}>{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DASHBOARD                                                           */
/* ------------------------------------------------------------------ */

function PackageCard({ pkg, onClick }) {
  const Icon = pkg.icon;
  return (
    <button
      onClick={onClick}
      className="group flex flex-col rounded-3xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold leading-snug text-slate-900">{pkg.title}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{pkg.description}</p>
          </div>
        </div>
        <CircularRing percent={pkg.percent} size={56} stroke={6} />
      </div>
      <div className="mt-5">
        <SegmentedBar mastered={pkg.mastered} learning={pkg.learning} fresh={pkg.fresh} />
      </div>
      <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
        <span>{pkg.totalSets} sets</span>
        <span className="h-1 w-1 rounded-full bg-slate-300" />
        <span>{pkg.totalWords} words</span>
        <span className="ml-auto flex items-center gap-1 text-blue-600 opacity-0 transition group-hover:opacity-100">
          Open <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
}

function Dashboard({ packages, onOpen }) {
  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
          <BookOpen className="h-4 w-4" /> Vocabook
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Your vocabulary packages</h1>
        <p className="mt-2 max-w-xl text-slate-500">
          Real words pulled straight from @satashkent's Vocabook — pick a package and start learning.
        </p>
      </header>
      <div className="grid gap-5 sm:grid-cols-2">
        {packages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} onClick={() => onOpen(pkg.id)} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SET LIST                                                            */
/* ------------------------------------------------------------------ */

function SetCard({ set, onClick }) {
  return (
    <div className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">{set.name}</h3>
          <p className="text-xs font-medium text-slate-500">{set.words.length} words</p>
        </div>
        {set.complete && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
            <Check className="h-3 w-3" /> Done
          </span>
        )}
      </div>
      <div className="mt-4">
        <SegmentedBar mastered={set.mastered} learning={set.learning} fresh={set.fresh} showLegend={false} height={6} />
      </div>
      <button
        onClick={onClick}
        className={
          'mt-4 rounded-xl py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ' +
          (set.complete
            ? 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50'
            : 'bg-blue-600 text-white hover:bg-blue-700')
        }
      >
        {set.complete ? 'Practice again' : 'Practice'}
      </button>
    </div>
  );
}

function SetListView({ pkg, onBack, onOpenSet }) {
  return (
    <div>
      <BackHeader onBack={onBack} eyebrow="Package" title={pkg.title} subtitle={`${pkg.totalSets} sets · ${pkg.totalWords} words`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pkg.sets.map((set) => (
          <SetCard key={set.id} set={set} onClick={() => onOpenSet(set.id)} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SET DETAILS                                                         */
/* ------------------------------------------------------------------ */

const MODES = [
  { key: 'flashcard', title: 'Flashcard', desc: 'Flip through cards and mark what you know.', icon: Layers },
  { key: 'matching', title: 'Matching', desc: 'Pair up words with their definitions.', icon: Shuffle },
  { key: 'speed', title: 'Speed', desc: 'Race the clock, one word at a time.', icon: Zap },
  { key: 'test', title: 'Test', desc: 'Words in context — pick the right fit.', icon: ClipboardCheck },
];

function WordRow({ word, onUpdateStatus, isLast }) {
  return (
    <div className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6 ${isLast ? '' : 'border-b border-slate-100'}`}>
      <div className="sm:w-56 sm:shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900">{word.word}</span>
          <TagPill tag={word.tag} />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-600">{word.definition}</p>
        <p className="mt-1 text-sm italic text-slate-400">&ldquo;{word.example}&rdquo;</p>
        <p className="mt-1 text-xs text-slate-400">Opposite: {word.antonym}</p>
      </div>
      <div className="sm:w-44 sm:shrink-0">
        <StatusRadio status={word.status} onChange={(s) => onUpdateStatus(word.id, s)} />
      </div>
    </div>
  );
}

function SetDetailsView({ pkg, set, onBack, onStartMode, onUpdateStatus }) {
  return (
    <div>
      <BackHeader onBack={onBack} eyebrow={pkg.title} title={set.name} subtitle={`${set.words.length} words · ${set.mastered} mastered`} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MODES.map((mode) => (
          <button
            key={mode.key}
            onClick={() => onStartMode(mode.key)}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <mode.icon className="h-4 w-4" />
            </div>
            <h3 className="mt-3 text-sm font-bold text-slate-900">{mode.title}</h3>
            <p className="mt-1 text-xs leading-snug text-slate-500">{mode.desc}</p>
            <span className="mt-3 flex items-center gap-1 text-xs font-bold text-blue-600">
              Start <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
            </span>
          </button>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-400">Learning Time</h2>
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {set.words.map((w, i) => (
            <WordRow key={w.id} word={w} onUpdateStatus={onUpdateStatus} isLast={i === set.words.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  FLASHCARD MODE                                                       */
/* ------------------------------------------------------------------ */

function FlashcardMode({ set, onBack, onUpdateStatus }) {
  const [sessionKey, setSessionKey] = useState(0);
  const words = useMemo(() => shuffle(set.words), [set.words, sessionKey]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState({});

  const done = index >= words.length;
  const current = !done ? words[index] : null;

  const flip = useCallback(() => setFlipped((f) => !f), []);

  const answer = useCallback(
    (isCorrect) => {
      if (!current) return;
      onUpdateStatus(current.id, isCorrect ? 'mastered' : 'learning');
      setResults((prev) => ({ ...prev, [current.id]: isCorrect ? 'correct' : 'wrong' }));
      setFlipped(false);
      setIndex((i) => i + 1);
    },
    [current, onUpdateStatus]
  );

  useEffect(() => {
    function onKey(e) {
      if (done) return;
      if (e.code === 'Space') {
        e.preventDefault();
        flip();
      } else if (e.key === '1') {
        answer(false);
      } else if (e.key === '2') {
        answer(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, flip, answer]);

  function restart() {
    setSessionKey((k) => k + 1);
    setIndex(0);
    setFlipped(false);
    setResults({});
  }

  if (done) {
    const correctCount = Object.values(results).filter((r) => r === 'correct').length;
    return (
      <ModeCompletion
        title="Set complete!"
        stat={`${correctCount} / ${words.length} correct`}
        onBack={onBack}
        onRestart={restart}
      />
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <ModeHeader onBack={onBack} title="Flashcard" progress={`${index + 1} / ${words.length}`} />

      <div style={{ perspective: 1600 }} className="mt-8">
        <div
          onClick={flip}
          className="relative mx-auto h-80 w-full cursor-pointer select-none"
          style={{
            transformStyle: 'preserve-3d',
            transition: 'transform 0.55s cubic-bezier(0.4,0.15,0.2,1)',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <div
            style={{ backfaceVisibility: 'hidden' }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-md"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Word</span>
            <h2 className="mt-4 text-4xl font-bold text-slate-900">{current.word}</h2>
            <div className="mt-3">
              <TagPill tag={current.tag} />
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                flip();
              }}
              className="mt-8 rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              Flip for definition
            </button>
          </div>
          <div
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-md"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Definition</span>
            <p className="mt-4 text-xl font-semibold leading-snug text-slate-900">{current.definition}</p>
            <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm italic text-slate-500">&ldquo;{current.example}&rdquo;</p>
            </div>
            <p className="mt-3 text-xs text-slate-400">Opposite: {current.antonym}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                flip();
              }}
              className="mt-5 rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
            >
              Flip for word
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <button
          onClick={() => answer(false)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-red-50 py-4 text-base font-bold text-red-600 transition hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
        >
          <X className="h-5 w-5" /> Wrong
        </button>
        <button
          onClick={() => answer(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 py-4 text-base font-bold text-emerald-600 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2"
        >
          <Check className="h-5 w-5" /> Correct
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-slate-400">
        <kbd className="rounded border border-slate-200 px-1.5 py-0.5 font-sans">Space</kbd> flip ·{' '}
        <kbd className="rounded border border-slate-200 px-1.5 py-0.5 font-sans">1</kbd> wrong ·{' '}
        <kbd className="rounded border border-slate-200 px-1.5 py-0.5 font-sans">2</kbd> correct
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MATCHING MODE                                                        */
/* ------------------------------------------------------------------ */

function MatchingMode({ set, onBack }) {
  const [sessionKey, setSessionKey] = useState(0);
  const rounds = useMemo(() => {
    const ids = shuffle(set.words.map((w) => w.id)).slice(0, 24);
    return [0, 1, 2, 3].map((i) => ids.slice(i * 6, i * 6 + 6));
  }, [set.words, sessionKey]);

  const [roundIndex, setRoundIndex] = useState(0);
  const [cards, setCards] = useState([]);
  const [selected, setSelected] = useState([]);
  const [matched, setMatched] = useState([]);
  const [wrongFlash, setWrongFlash] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    const pool = rounds[roundIndex].map((id) => set.words.find((w) => w.id === id));
    const wordCards = pool.map((w) => ({ cardId: `${w.id}-w`, wordId: w.id, type: 'word', label: w.word }));
    const defCards = pool.map((w) => ({ cardId: `${w.id}-d`, wordId: w.id, type: 'def', label: w.definition }));
    setCards(shuffle([...wordCards, ...defCards]));
    setMatched([]);
    setSelected([]);
    setSeconds(0);
  }, [roundIndex, rounds, set.words]);

  useEffect(() => {
    if (allDone) return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [roundIndex, allDone, sessionKey]);

  useEffect(() => {
    if (cards.length > 0 && matched.length === cards.length / 2) {
      const t = setTimeout(() => {
        if (roundIndex + 1 < rounds.length) setRoundIndex((i) => i + 1);
        else setAllDone(true);
      }, 650);
      return () => clearTimeout(t);
    }
  }, [matched, cards.length, roundIndex, rounds.length]);

  function handleClick(card) {
    if (allDone || matched.includes(card.wordId)) return;
    if (selected.some((c) => c.cardId === card.cardId) || selected.length === 2) return;
    const next = [...selected, card];
    setSelected(next);
    if (next.length === 2) {
      const [a, b] = next;
      if (a.wordId === b.wordId && a.type !== b.type) {
        setTimeout(() => {
          setMatched((m) => [...m, a.wordId]);
          setSelected([]);
        }, 300);
      } else {
        setWrongFlash([a.cardId, b.cardId]);
        setTimeout(() => {
          setWrongFlash([]);
          setSelected([]);
        }, 500);
      }
    }
  }

  function restart() {
    setSessionKey((k) => k + 1);
    setRoundIndex(0);
    setAllDone(false);
  }

  if (allDone) {
    return (
      <ModeCompletion
        title="All rounds matched!"
        stat="You paired every word across 4 rounds."
        onBack={onBack}
        onRestart={restart}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <ModeHeader
        onBack={onBack}
        title="Matching"
        progress={`Round ${roundIndex + 1} / ${rounds.length}`}
        extra={
          <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            <Clock className="h-3.5 w-3.5" /> {formatTime(seconds)}
          </span>
        }
      />
      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
        {cards.map((card) => {
          const isMatched = matched.includes(card.wordId);
          const isSelected = selected.some((c) => c.cardId === card.cardId);
          const isWrong = wrongFlash.includes(card.cardId);
          let cls =
            'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-sm';
          if (isMatched) cls = 'border-emerald-200 bg-emerald-50 text-emerald-600 opacity-60';
          else if (isWrong) cls = 'border-red-300 bg-red-50 text-red-600';
          else if (isSelected) cls = 'border-blue-400 bg-blue-50 text-blue-700';
          return (
            <button
              key={card.cardId}
              onClick={() => handleClick(card)}
              disabled={isMatched}
              className={`flex min-h-24 items-center justify-center rounded-2xl border p-3 text-center text-sm font-medium leading-snug transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${cls}`}
            >
              {card.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SPEED MODE                                                           */
/* ------------------------------------------------------------------ */

function SpeedMode({ set, onBack, onUpdateStatus }) {
  const [sessionKey, setSessionKey] = useState(0);
  const queue = useMemo(() => shuffle(set.words), [set.words, sessionKey]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [feedback, setFeedback] = useState(null);
  const [choices, setChoices] = useState(null);

  const done = timeLeft <= 0 || index >= queue.length;
  const current = !done ? queue[index] : null;

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setTimeLeft((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => clearInterval(t);
  }, [done, sessionKey]);

  useEffect(() => {
    if (!current) return;
    const pool = set.words.filter((w) => w.id !== current.id);
    const distractor = pool[Math.floor(Math.random() * pool.length)];
    setChoices(
      shuffle([
        { id: current.id, text: current.definition, correct: true },
        { id: distractor.id, text: distractor.definition, correct: false },
      ])
    );
    setFeedback(null);
  }, [current, set.words]);

  const choose = useCallback(
    (choice) => {
      if (!current || feedback) return;
      setFeedback(choice.correct ? 'correct' : 'wrong');
      onUpdateStatus(current.id, choice.correct ? 'mastered' : 'learning');
      if (choice.correct) setScore((s) => s + 1);
      setTimeout(() => setIndex((i) => i + 1), 380);
    },
    [current, feedback, onUpdateStatus]
  );

  useEffect(() => {
    function onKey(e) {
      if (done || !choices || feedback) return;
      if (e.key === '1') choose(choices[0]);
      else if (e.key === '2') choose(choices[1]);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [done, choices, feedback, choose]);

  function restart() {
    setSessionKey((k) => k + 1);
    setIndex(0);
    setScore(0);
    setTimeLeft(60);
    setFeedback(null);
  }

  if (done) {
    const clearedAll = index >= queue.length;
    return (
      <ModeCompletion
        title={clearedAll ? 'You cleared the set!' : "Time's up!"}
        stat={`${score} correct out of ${index} answered`}
        onBack={onBack}
        onRestart={restart}
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl text-center">
      <ModeHeader onBack={onBack} title="Speed" progress={`Score ${score}`} />
      <div className="mt-10 flex flex-col items-center">
        <h2 className="text-5xl font-bold tracking-tight text-slate-900">{current.word}</h2>
        <div className="mt-3">
          <TagPill tag={current.tag} />
        </div>
        <div className="mt-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-blue-100 bg-blue-50 text-lg font-bold text-blue-600">
          {formatTime(timeLeft)}
        </div>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {choices &&
          choices.map((choice, i) => {
            let cls = 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:shadow-sm';
            if (feedback && choice.correct) cls = 'border-emerald-400 bg-emerald-50 text-emerald-700';
            else if (feedback && !choice.correct) cls = 'border-red-300 bg-red-50 text-red-500';
            return (
              <button
                key={choice.id + i}
                onClick={() => choose(choice)}
                className={`flex items-start gap-3 rounded-2xl border p-5 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${cls}`}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
                  {i + 1}
                </span>
                <span>{choice.text}</span>
              </button>
            );
          })}
      </div>
      <p className="mt-6 text-xs text-slate-400">
        <kbd className="rounded border border-slate-200 px-1.5 py-0.5 font-sans">1</kbd> /{' '}
        <kbd className="rounded border border-slate-200 px-1.5 py-0.5 font-sans">2</kbd> to choose
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TEST MODE                                                            */
/* ------------------------------------------------------------------ */

function TestMode({ set, onBack, onUpdateStatus }) {
  const [sessionKey, setSessionKey] = useState(0);
  const questions = useMemo(() => {
    const picked = shuffle(set.words).slice(0, Math.min(10, set.words.length));
    return picked.map((w) => {
      const pool = set.words.filter((o) => o.id !== w.id);
      const distractors = shuffle(pool).slice(0, 3).map((o) => o.word);
      const options = shuffle([w.word, ...distractors]);
      return { word: w, blanked: blankOutWord(w.example, w.word, w.altForms), options };
    });
  }, [set.words, sessionKey]);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(null);

  const done = index >= questions.length;
  const current = !done ? questions[index] : null;

  function choose(option) {
    if (picked || !current) return;
    setPicked(option);
    const correct = option === current.word.word;
    onUpdateStatus(current.word.id, correct ? 'mastered' : 'learning');
    if (correct) setScore((s) => s + 1);
    setTimeout(() => {
      setPicked(null);
      setIndex((i) => i + 1);
    }, 700);
  }

  function restart() {
    setSessionKey((k) => k + 1);
    setIndex(0);
    setScore(0);
    setPicked(null);
  }

  if (done) {
    return (
      <ModeCompletion
        title="Test complete!"
        stat={`${score} / ${questions.length} correct`}
        onBack={onBack}
        onRestart={restart}
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <ModeHeader onBack={onBack} title="Test" progress={`${index + 1} / ${questions.length}`} />
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Words in context</span>
        <p className="mt-3 text-lg font-medium leading-relaxed text-slate-800">{current.blanked}</p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {current.options.map((opt) => {
          const isCorrect = opt === current.word.word;
          const show = picked !== null;
          let cls = 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:shadow-sm';
          if (show && isCorrect) cls = 'border-emerald-400 bg-emerald-50 text-emerald-700';
          else if (show && opt === picked) cls = 'border-red-300 bg-red-50 text-red-500';
          return (
            <button
              key={opt}
              onClick={() => choose(opt)}
              className={`rounded-2xl border p-4 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  APP                                                                   */
/* ------------------------------------------------------------------ */

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPackageId, setSelectedPackageId] = useState(null);
  const [selectedSetId, setSelectedSetId] = useState(null);
  const [wordProgress, setWordProgress] = useState(() => buildInitialProgress(PACKAGES));

  const updateStatus = useCallback((wordId, status) => {
    setWordProgress((prev) => ({ ...prev, [wordId]: status }));
  }, []);

  const packages = useMemo(() => PACKAGES.map((p) => decoratePackage(p, wordProgress)), [wordProgress]);
  const selectedPackage = useMemo(
    () => packages.find((p) => p.id === selectedPackageId) || null,
    [packages, selectedPackageId]
  );
  const selectedSet = useMemo(
    () => (selectedPackage ? selectedPackage.sets.find((s) => s.id === selectedSetId) || null : null),
    [selectedPackage, selectedSetId]
  );

  function openPackage(id) {
    setSelectedPackageId(id);
    setCurrentView('set-list');
  }
  function openSet(id) {
    setSelectedSetId(id);
    setCurrentView('set-details');
  }
  function startMode(mode) {
    setCurrentView(`mode-${mode}`);
  }
  function backToDashboard() {
    setCurrentView('dashboard');
    setSelectedPackageId(null);
    setSelectedSetId(null);
  }
  function backToSetList() {
    setCurrentView('set-list');
    setSelectedSetId(null);
  }
  function backToSetDetails() {
    setCurrentView('set-details');
  }

  let body;
  if (currentView === 'set-list' && selectedPackage) {
    body = <SetListView pkg={selectedPackage} onBack={backToDashboard} onOpenSet={openSet} />;
  } else if (currentView === 'set-details' && selectedPackage && selectedSet) {
    body = (
      <SetDetailsView
        pkg={selectedPackage}
        set={selectedSet}
        onBack={backToSetList}
        onStartMode={startMode}
        onUpdateStatus={updateStatus}
      />
    );
  } else if (currentView === 'mode-flashcard' && selectedSet) {
    body = <FlashcardMode set={selectedSet} onBack={backToSetDetails} onUpdateStatus={updateStatus} />;
  } else if (currentView === 'mode-matching' && selectedSet) {
    body = <MatchingMode set={selectedSet} onBack={backToSetDetails} />;
  } else if (currentView === 'mode-speed' && selectedSet) {
    body = <SpeedMode set={selectedSet} onBack={backToSetDetails} onUpdateStatus={updateStatus} />;
  } else if (currentView === 'mode-test' && selectedSet) {
    body = <TestMode set={selectedSet} onBack={backToSetDetails} onUpdateStatus={updateStatus} />;
  } else {
    body = <Dashboard packages={packages} onOpen={openPackage} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <style>{`
        @keyframes vbFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .vb-fade-in { animation: vbFadeIn 0.35s ease-out; }
      `}</style>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div key={currentView + (selectedSetId || '')} className="vb-fade-in">
          {body}
        </div>
      </div>
    </div>
  );
}
