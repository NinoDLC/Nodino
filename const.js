const COLORS = [
    {name: "indianred", r: 176, g: 23, b: 31},
    {name: "lavenderblush", r: 205, g: 193, b: 197},
    {name: "violetred", r: 205, g: 50, b: 120},
    {name: "hotpink", r: 205, g: 96, b: 144},
    {name: "deeppink", r: 205, g: 16, b: 118},
    {name: "crimson", r: 220, g: 20, b: 60},
    {name: "lightpink", r: 205, g: 140, b: 149},
    {name: "pink", r: 255, g: 192, b: 203},
    {name: "pinky", r: 205, g: 145, b: 158},
    {name: "palevioletred", r: 205, g: 104, b: 137},
    {name: "raspberry", r: 135, g: 38, b: 87},
    {name: "mediumvioletred", r: 199, g: 21, b: 133},
    {name: "violetred", r: 208, g: 32, b: 144},
    {name: "orchid", r: 218, g: 112, b: 214},
    {name: "thistle", r: 216, g: 191, b: 216},
    {name: "plum", r: 221, g: 160, b: 221},
    {name: "violet", r: 238, g: 130, b: 238},
    {name: "purple", r: 128, g: 0, b: 128},
    {name: "mediumorchid", r: 186, g: 85, b: 211},
    {name: "darkviolet", r: 148, g: 0, b: 211},
    {name: "darkorchid", r: 153, g: 50, b: 204},
    {name: "indigo", r: 75, g: 0, b: 130},
    {name: "blueviolet", r: 138, g: 43, b: 226},
    {name: "mediumpurple", r: 147, g: 112, b: 219},
    {name: "darkslateblue", r: 72, g: 61, b: 139},
    {name: "lightslateblue", r: 132, g: 112, b: 255},
    {name: "mediumslateblue", r: 123, g: 104, b: 238},
    {name: "slateblue", r: 106, g: 90, b: 205},
    {name: "ghostwhite", r: 248, g: 248, b: 255},
    {name: "lavender", r: 230, g: 230, b: 250},
    {name: "blue", r: 0, g: 0, b: 255},
    {name: "navy", r: 0, g: 0, b: 128},
    {name: "midnightblue", r: 25, g: 25, b: 112},
    {name: "cobalt", r: 61, g: 89, b: 171},
    {name: "royalblue", r: 65, g: 105, b: 225},
    {name: "cornflowerblue", r: 100, g: 149, b: 237},
    {name: "lightsteelblue", r: 176, g: 196, b: 222},
    {name: "lightslategray", r: 119, g: 136, b: 153},
    {name: "slategray", r: 112, g: 128, b: 144},
    {name: "aliceblue", r: 240, g: 248, b: 255},
    {name: "steelblue", r: 70, g: 130, b: 180},
    {name: "lightskyblue", r: 135, g: 206, b: 250},
    {name: "skyblue", r: 135, g: 206, b: 235},
    {name: "peacock", r: 51, g: 161, b: 201},
    {name: "lightblue", r: 173, g: 216, b: 230},
    {name: "powderblue", r: 176, g: 224, b: 230},
    {name: "cadetblue", r: 95, g: 158, b: 160},
    {name: "darkturquoise", r: 0, g: 206, b: 209},
    {name: "darkslategray", r: 47, g: 79, b: 79},
    {name: "teal", r: 0, g: 128, b: 128},
    {name: "mediumturquoise", r: 72, g: 209, b: 204},
    {name: "lightseagreen", r: 32, g: 178, b: 170},
    {name: "manganeseblue", r: 3, g: 168, b: 158},
    {name: "turquoise", r: 64, g: 224, b: 208},
    {name: "coldgrey", r: 128, g: 138, b: 135},
    {name: "turquoiseblue", r: 0, g: 199, b: 140},
    {name: "mediumspringgreen", r: 0, g: 250, b: 154},
    {name: "mintcream", r: 245, g: 255, b: 250},
    {name: "springgreen", r: 0, g: 255, b: 127},
    {name: "mediumseagreen", r: 60, g: 179, b: 113},
    {name: "emeraldgreen", r: 0, g: 201, b: 87},
    {name: "mint", r: 189, g: 252, b: 201},
    {name: "cobaltgreen", r: 61, g: 145, b: 64},
    {name: "darkseagreen", r: 143, g: 188, b: 143},
    {name: "palegreen", r: 152, g: 251, b: 152},
    {name: "limegreen", r: 50, g: 205, b: 50},
    {name: "forestgreen", r: 34, g: 139, b: 34},
    {name: "sapgreen", r: 48, g: 128, b: 20},
    {name: "greenyellow", r: 173, g: 255, b: 47},
    {name: "darkolivegreen", r: 85, g: 107, b: 47},
    {name: "olivedrab", r: 107, g: 142, b: 35},
    {name: "beige", r: 245, g: 245, b: 220},
    {name: "lightgoldenrodyellow", r: 250, g: 250, b: 210},
    {name: "warmgrey", r: 128, g: 128, b: 105},
    {name: "darkkhaki", r: 189, g: 183, b: 107},
    {name: "khaki", r: 240, g: 230, b: 140},
    {name: "palegoldenrod", r: 238, g: 232, b: 170},
    {name: "banana", r: 227, g: 207, b: 87},
    {name: "goldenrod", r: 218, g: 165, b: 32},
    {name: "darkgoldenrod", r: 184, g: 134, b: 1},
    {name: "floralwhite", r: 255, g: 250, b: 240},
    {name: "oldlace", r: 253, g: 245, b: 230},
    {name: "wheat", r: 245, g: 222, b: 179},
    {name: "moccasin", r: 255, g: 228, b: 181},
    {name: "papayawhip", r: 255, g: 239, b: 213},
    {name: "blanchedalmond", r: 255, g: 235, b: 205},
    {name: "eggshell", r: 252, g: 230, b: 201},
    {name: "tan", r: 210, g: 180, b: 140},
    {name: "brick", r: 156, g: 102, b: 31},
    {name: "cadmiumyellow", r: 255, g: 153, b: 18},
    {name: "antiquewhite", r: 250, g: 235, b: 215},
    {name: "burlywood", r: 222, g: 184, b: 135},
    {name: "melon", r: 227, g: 168, b: 105},
    {name: "carrot", r: 237, g: 145, b: 33},
    {name: "linen", r: 250, g: 240, b: 230},
    {name: "sandybrown", r: 244, g: 164, b: 96},
    {name: "rawsienna", r: 199, g: 97, b: 20},
    {name: "chocolate", r: 210, g: 105, b: 30},
    {name: "ivoryblack", r: 41, g: 36, b: 33},
    {name: "flesh", r: 255, g: 125, b: 64},
    {name: "burntsienna", r: 138, g: 54, b: 1},
    {name: "sienna", r: 160, g: 82, b: 45},
    {name: "coral", r: 255, g: 127, b: 80},
    {name: "sepia", r: 94, g: 38, b: 18},
    {name: "darksalmon", r: 233, g: 150, b: 122},
    {name: "burntumber", r: 138, g: 51, b: 36},
    {name: "salmon", r: 250, g: 128, b: 114},
    {name: "rosybrown", r: 188, g: 143, b: 143},
    {name: "lightcoral", r: 240, g: 128, b: 128},
    {name: "indianred", r: 205, g: 92, b: 92},
    {name: "brown", r: 165, g: 42, b: 42},
    {name: "firebrick", r: 178, g: 34, b: 34},
    {name: "white", r: 255, g: 255, b: 255},
    {name: "gainsboro", r: 220, g: 220, b: 220},
    {name: "lightgrey", r: 211, g: 211, b: 211},
    {name: "silver", r: 192, g: 192, b: 192},
    {name: "darkgray", r: 169, g: 169, b: 169},
    {name: "gray", r: 128, g: 128, b: 128}];

const ADJECTIVES = [
    "hysterical",
    "spidery",
    "sleepless",
    "fractured",
    "benighted",
    "proven",
    "barbed",
    "sacrificed",
    "disreputable",
    "rancid",
    "unspoken",
    "stunned",
    "immobilized",
    "querulous",
    "murdering",
    "congratulating",
    "deprived",
    "foreign",
    "filthy",
    "spitfire",
    "primitive",
    "craggy",
    "disobeyed",
    "unintelligible",
    "embarrassed",
    "waving",
    "rotting",
    "oak",
    "unseeing",
    "loyal",
    "vile",
    "dour",
    "swelling",
    "flexible",
    "bloodless",
    "splashed",
    "sketched",
    "emblazoned",
    "studded",
    "barren",
    "screeching",
    "emerging",
    "drafty",
    "flaming",
    "flooded",
    "pathless",
    "absent",
    "drowsy",
    "gripping",
    "engrossed",
    "shaky"];

const NAMES = [
    "goatskin",
    "wealth",
    "troll",
    "serpent",
    "drunk",
    "sapphire",
    "cleaver",
    "chariot",
    "wizard",
    "pilgrim",
    "carrot",
    "husband",
    "catastrophe",
    "complexity",
    "barbarian",
    "incantation",
    "combat",
    "stewardship",
    "soup",
    "empire",
    "parasite",
    "darkling",
    "sloth",
    "bears",
    "menfolk",
    "dragon",
    "sausage",
    "splinter",
    "honeysuckle",
    "moonbeams",
    "beast",
    "informer",
    "bodyguard",
    "trappings",
    "humanitarian",
    "knife",
    "threshold",
    "throne",
    "shaman",
    "hostility",
    "dignity",
    "drapery",
    "spittle",
    "priestess",
    "walnut",
    "plague",
    "twig",
    "devotion",
    "scribe",
    "humans",
    "rival",
    "weapon",
    "curses",
    "hierarchy",
    "enemies",
    "nobleman",
    "weapon",
    "mistress",
    "nostril",
    "fortune",
    "obscenity",
    "partridge",
    "tapestries",
    "putrescence",
    "gossipmonger",
    "orb",
    "haze",
    "provision",
    "shackle"
];

const COLOR_LENGTH = COLORS.length;
const ADJECTIVE_LENGTH = ADJECTIVES.length;
const NAME_LENGTH = NAMES.length;

const GAME_WIDTH = 800;
const SPAWNING_ZONE_MARGIN = 150;
const SERVER_TICK = 30;


/**
 * Return a randomized color from a (somewhat large) pool of colors.
 * Returned object is like : <code>{name: "gray", r: 128, g: 128, b: 128}</code>
 *
 * @returns {{name, r, g, b}|*}
 */
var getPlayerColor = function () {
    return COLORS[Math.floor(Math.random() * COLOR_LENGTH)];
};

/**
 * Return a randomized name with a set color
 *
 * @returns {String}
 */
var getPlayerName = function (colorName) {
    return ADJECTIVES[Math.floor(Math.random() * ADJECTIVE_LENGTH)] + " " + colorName + " " + NAMES[Math.floor(Math.random() * NAME_LENGTH)];
};

module.exports = {
    GAME_WIDTH: GAME_WIDTH,
    SPAWNING_ZONE_MARGIN: SPAWNING_ZONE_MARGIN,
    SERVER_TICK: SERVER_TICK,
    getPlayerColor: getPlayerColor,
    getPlayerName: getPlayerName
};