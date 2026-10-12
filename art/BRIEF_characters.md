# Character sheets still needed (original art for every face that now uses a recoloured stand-in)

The owner wants every character to be its own figure: different face, build, armour, weapon and pose, never a recolour.
Until a sheet arrives the game shows a recoloured stand-in (`v_*` variants in `artmap_addon.js`); the moment a real sheet is
added under the id below, it wins automatically (add the id to `AMAP_SG` / `AMAP_HUNT` in `artmap_addon.js` if it is not a
ladder or hero id).

Format, as for every sheet so far: one 2x2 green-screen sheet per character, same detailed 16-bit pixel style as the ladder
art. Top-left idle stance, top-right weapon raised, bottom-left attack lunge, bottom-right face close-up. Facing right,
full body, feet on the same baseline, no shadows. Cut with `python3 -I art/mksheet.py SHEET.png ID`.

## Saga generals and figures (id = the saga id)
| id | who | look |
|---|---|---|
| kiyomasa | Katō Kiyomasa | very tall, black lacquered armour, the tall nagaeboshi helmet (a long black cone), full beard, a jūmonji cross-spear |
| naomasa | Ii Naomasa, "the red devil" | lean, all-red lacquer armour, tall golden horns on the helmet, a long spear, fierce young face |
| naotaka | Ii Naotaka | broad, red armour with gold trim, a horse-hair plume, a heavy naginata |
| yamagata | Yamagata Masakage | short and stocky, red armour of the Takeda "red fire" unit, a scarred face, a nodachi on the back, a war fan |
| baba | Baba Nobuharu | old veteran, dark green armour with many lacquered plates, grey beard, a long tachi |
| kansuke | Yamamoto Kansuke | a strategist, one eye (eyepatch), limping stance, a dark brown jinbaori over light armour, a walking staff and a short sword |
| kakizaki | Kakizaki Kageie | Uesugi vanguard, black armour with a white hood scarf, a huge ōdachi held in both hands |
| shibata | Shibata Katsuie, "Oni Shibata" | a massive man, dark green armour, a thick beard, a heavy kanabō-like iron club |
| mitsuhide | Akechi Mitsuhide | calm, refined, blue armour with the bellflower crest, a tachi held low, a poet's face |
| hidemitsu | Akechi Hidemitsu | young rider, light blue armour, a long spear, a flowing white cape |
| otani | Ōtani Yoshitsugu | wrapped in a white hood that hides the face, white robes over dark armour, a naginata |
| ukon | Takayama Ukon | a Christian daimyō: dark navy armour, a small cross on a cord, a straight Western-style sword |
| yoshimoto | Imagawa Yoshimoto | a court-style lord: blackened teeth, white face powder, an eboshi cap, gold-and-purple robes over armour, a jewelled tachi |
| ranmaru | Mori Ranmaru | a beautiful young page, long hair tied high, a pink-and-white kimono, a short spear |
| shinsuke | Mori Shinsuke | lean footsoldier-captain, plain jingasa, a yari with a red tassel |
| kajiwara | Kajiwara, "the dog of the general" | wolfish grin, green armour with fur trim, two short swords |
| akaho | Akaho, the red rider | a mounted-archer look on foot: red armour, a big yumi bow and a quiver |
| raider | the chief of the raiders | a bandit: bare muscular arms, ragged furs, a notched katana, a scar across the face |
| gonta | Gonta the gravedigger | hunched, a straw cloak, a heavy shovel used as a weapon |
| junkai | Junkai, banner-bearer monk | a sōhei warrior monk with a tall banner pole and a naginata, white hood |
| gokei | Gokei of the pagoda | an old abbot, purple kesa robe, prayer beads, an iron shakujō staff |
| noshadow | the monk without a shadow | a pale ascetic, grey robes, closed eyes, bare hands with glowing ki |
| goemon | Ishikawa Goemon | a flamboyant thief: wild hair, a purple kimono with a bold pattern, a kiseru pipe and a short sword |
| foxman | the man in the fox mask | a slim swordsman in a white kitsune mask, dark clothes, a curved blade held backwards |
| kasha | the kasha | a huge black-and-orange fire cat yokai on two legs, flames along the back and tail |

## Hunts, sea and yokai (id = hunt / sea id)
| id | who | look |
|---|---|---|
| raiju | Raijū | a thunder beast: a blue-white wolf-weasel wrapped in lightning, claws of light |
| umibozu | Umibōzu | a giant black bald sea monk rising from the waves, glowing white eyes |
| isonade | Isonade (sea battle, wide sheet) | a shark-demon with a hook-covered tail fin |
| bakekujira | Bakekujira (sea battle, wide sheet) | the skeleton of a whale, pale blue ghost light, birds circling |

## Overseas (id = the empire id)
| id | who | look |
|---|---|---|
| ryukyu | Ryūkyū commander | a red-and-gold Ryūkyū court robe, a hachimaki, a sai and a bō |
| joseon | Joseon general | a Joseon general's dark blue lamellar armour, a wide-brimmed helmet with a plume, a straight sword |
| manila | the Spanish conquistador | a steel morion helmet, a breastplate over a red doublet, a rapier (no firearm) |
| ayutthaya | Ayutthaya guard commander | a Siamese warrior: gold-trimmed tunic, a pointed helmet, two daab swords |
| ming | the Ming grand general | heavy Ming scale armour in gold and crimson, a red cape, a guandao |
| bunei / imjin / sacheon | Ming and Joseon field commanders | three different officers, each with its own weapon (guandao, spear, sword and shield) |
| koan | the Portuguese captain | a wide-brimmed hat, a ruff collar, a long coat, a cutlass (no firearm) |

## Province lords (one sheet per helmet type, then recoloured by house)
plain helmet lord · kuwagata (horned) lord · crescent-moon lord · horse-mane lord · antler lord, each a different man
(build, face, beard, weapon) so the five types read apart; the house colour is applied on top.

## Court and market people (portrait cell only)
hanbei, kanbei, masanobu, rikyu, mitsunari, tenkai, magoichi, okada, raiken, wangzhi, hanzo, chiyome, tsuruhime, sokyu,
ryoi, chaya, joao, kihei, shirotae, kanemi, komuso, gakuen, frois, kanesada, tetsuzo, matauemon, umagoro, okuni, onigashira,
dosan, sansa, yohei, sakihisa, hideyoshi, ieyasu, wakasa, kinbei, hotaru: a face close-up each, in the same style as the
`*_por` cells. Their role and look are in `CAST` (look `L` fields: hat, colours, prop, background).
