# Fauna Forum — image generation kit

Prompts for the demo's imagery, written for any image model. Keep ONE style
across the whole set so the site reads art-directed, not assembled.

**Shared style suffix — append to every portrait prompt:**

> studio portrait, soft warm lighting, muted forest-green backdrop (#1f7a4d
> family), professional conference-speaker headshot framing (head and
> shoulders), subtle friendly expression, painterly semi-realistic style,
> square 1:1, no text, no watermark

## Speaker portraits (upload via cloomba event admin → Featured → each entry)

| Speaker | Prompt core |
| --- | --- |
| Ella Trunk | an elegant elephant in a smart blazer, memory-architect energy |
| Dr. Luna Whiskers | a grey cat with round glasses, sleepy but brilliant |
| Bruno Bearson | a large brown bear in a cozy cardigan, calm authority |
| Rex Retriever | a golden retriever in a crisp shirt, boundless enthusiasm |
| Oscar Owlsworth | an owl with a loosened tie, night-shift veteran |
| Finn Flippers | a penguin in formal dress, logistics professional |
| Penny Paws | a red panda with a lanyard, developer-advocate warmth |
| Greta Gallop | a chestnut horse in a tailored jacket, steady confidence |
| Ziggy Zebra | a zebra in a patterned scarf, consultant chic |
| Maya Meow | a sleek black cat, founder energy, slight smirk |

## Team (same style)

| Host | Prompt core |
| --- | --- |
| Marta Meerkat | a meerkat standing alert, clipboard in paw, lead-organizer |
| Oleg Octopus | an octopus juggling schedule cards, program chair |
| Béla Badger | a badger in a hi-vis vest, venue logistics |

## Sponsor logos (upload the same way, on sponsor entries)

Style: flat minimal wordmark/emblem, single color on transparent, wide
format. One per sponsor: Golden Bone Capital (bone + coin), Whisker & Co.
(three whiskers), Purrfect Analytics (cat-ear bar chart), NestWorks (twig
nest), Bamboo Cloud (bamboo + cloud), Burrow & Sons (burrow arch), Steady
Stride Consulting (horseshoe), The Shelter Alliance (roof + paw).

## Event cover (cloomba event admin → cover)

> a wide painterly illustration of many different animals gathered around a
> forest watering hole at golden hour, conference lanyards, warm greens and
> amber, no text, 16:9

## Where images land

Speaker/host portraits and sponsor logos are uploaded in the Cloomba event
admin (Featured entries) — the API serves them and the template picks them up
on the next build, replacing the initial-letter fallbacks automatically. The
cover feeds the hero background. The `public/placeholders/*.svg` splits can
be replaced with generated scene illustrations in the same palette whenever.
