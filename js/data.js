window.GAME_DATA = {
  audio: {
    backgroundMusic: {
      src: "assets/audio/background-music-local.mp3?v=rap-2",
      volume: 0.08,
      fadeInDurationMs: 7000
    },
    outfitArrowClick: {
      src: "assets/audio/menu-button-click.wav",
      volume: 0.2
    },
    heavenDialogueClick: {
      src: "assets/audio/menu-button-click.wav",
      volume: 0.05
    },
    retroError: {
      src: "assets/audio/retro-error.wav",
      volume: 0.14
    },
    errorPopupHit: {
      src: "assets/audio/error-popup-hit.wav",
      volume: 0.6
    },
    heavenVoicesIntro: {
      src: "assets/audio/heaven-voices-intro.wav",
      volume: 0.25,
      fadeInDurationMs: 4000,
      fadeOutDurationMs: 7000
    },
    birdsChirpingAmbience: {
      src: "assets/audio/birds-chirping-ambience.mp3",
      volume: 0.15,
      earthVolume: 0.12,
      fadeInDurationMs: 10000
    },
    axeHitWood: {
      src: "assets/audio/axe-hit-wood.mp3",
      volume: 0.02
    },
    pickupItem: {
      src: "assets/audio/pickup-item.mp3",
      volume: 0.05
    },
    walkOnGrass: {
      src: "assets/audio/walk-on-grass.mp3",
      volume: 0.03
    },
    waterStreamAmbience: {
      src: "assets/audio/water-stream-loop.mp3",
      volume: 0.07
    },
    campfireBurningAmbience: {
      src: "assets/audio/campfire-burning-loop.mp3",
      volume: 0.07
    }
  },
  debug: {
    collisions: false,
    playerCoords: false,
    flowerIds: false
  },
  creatorUi: {
    background: "assets/ui/creator-bg.png",
    woodSign: "assets/ui/wood-sign.png",
    speechBubble: "assets/ui/speech-bubble-empty.png",
    godSprite: "assets/ui/god-sprite.png",
    outerPanel: "assets/ui/outer-green-panel.png",
    leftPanel: "assets/ui/left-panel.png",
    rightPanel: "assets/ui/right-stats-panel.png",
    statRowPanel: "assets/ui/stat-row-panel.png",
    innerCharacterBox: "assets/ui/inner-character-box.png",
    descriptionCard: "assets/ui/description-card.png",
    counterPlate: "assets/ui/counter-plate.png",
    selectButton: "assets/ui/select-button.png",
    selectButtonHover: "assets/ui/select-button-hover.png",
    selectButtonPressed: "assets/ui/select-button-pressed.png",
    arrowButton: "assets/ui/arrow-button.png",
    errorPopupDark: "assets/ui/error-popup-dark.png",
    errorPopupBright: "assets/ui/error-popup-bright.png",
    heavenBackground: "assets/ui/heaven-bg.png",
    heavenAngel: "assets/ui/heaven-angel-cloud.png",
    heavenAngelSurprised: "assets/ui/heaven-angel-surprised.png",
    heavenAngelHands: "assets/ui/heaven-angel-hands.png",
    heavenGod: "assets/ui/heaven-god-cloud.png",
    heavenGodThoughtful: "assets/ui/heaven-god-thoughtful.png",
    heavenGodIdea: "assets/ui/heaven-god-idea.png",
    heavenGodHappy: "assets/ui/heaven-god-happy.png?v=2",
    heavenGodFlask: "assets/ui/heaven-god-flask.png?v=2",
    heavenGodPointing: "assets/ui/heaven-god-pointing.png?v=2",
    heavenBubble: "assets/ui/heaven-dialogue-bubble.png",
    heavenNextButton: "assets/ui/heaven-next-button.png",
    heavenNextButtonHover: "assets/ui/heaven-next-button-hover.png",
    heavenNextButtonPressed: "assets/ui/heaven-next-button-pressed.png"
  },
  mapUi: {
    frame: "assets/ui/map/map-frame.png",
    restPanel: "assets/ui/map/rest-panel.png",
    restLeafFull: "assets/ui/map/rest-leaf-full.png",
    restLeafEmpty: "assets/ui/map/rest-leaf-empty.png",
    goalsPanel: "assets/ui/map/goals-panel.png",
    goalCheckDone: "assets/ui/map/goal-check-done.png",
    goalCheckEmpty: "assets/ui/map/goal-check-empty.png",
    activeItemPanel: "assets/ui/map/active-item-panel.png",
    inventoryPanel: "assets/ui/map/inventory-panel.png",
    inventorySlot: "assets/ui/map/inventory-slot.png",
    speechBubble: "assets/ui/map/speech-bubble.png",
    axe: "assets/ui/map/axe.png",
    vaseGround: "assets/ui/map/vase-ground.png",
    vaseInventory: "assets/ui/map/vase-inventory.png",
    flowerInventory: "assets/ui/map/flower-inventory.png",
    woodInventory: "assets/ui/map/wood-inventory.png",
    appleInventory: "assets/ui/map/apple-inventory.png",
    mailbox: "assets/ui/map/mailbox.png",
    letterPanel: "assets/ui/map/letter-panel.png",
    campfireLitFrames: [
      "assets/ui/map/campfire-lit-1.png",
      "assets/ui/map/campfire-lit-2.png",
      "assets/ui/map/campfire-lit-3.png"
    ],
    tableFrames: [
      "assets/ui/map/table-1.png",
      "assets/ui/map/table-2.png"
    ],
    tableVaseFrames: [
      "assets/ui/map/table-vase-1.png",
      "assets/ui/map/table-vase-2.png"
    ],
    tableVaseFlowersFrames: [
      "assets/ui/map/table-vase-flowers-1.png",
      "assets/ui/map/table-vase-flowers-2.png"
    ]
  },
  angelLines: {
    formal: [
      "Ого, серьёзный настрой… мне уже хочется на созвон.",
      "В таком виде даже приключения проходят по расписанию."
    ],
    cozy: [
      "Вот это правильный подход… сначала чай, потом всё остальное.",
      "Уют максимального уровня. Даже мне стало спокойнее."
    ],
    dacha: [
      "О, режим “всё пригодится” активирован.",
      "Главное — не начинай чинить то, что работает."
    ],
    cyber: [
      "Похоже, ты уже в главной роли.",
      "Если что, я не отвечаю за баги."
    ]
  },
  characterOutfits: [
    {
      id: "formal",
      angelLineKey: "formal",
      name: "Формальный Саня",
      description: "Готов покорять мир, созвоны и праздничный стол.",
      sprite: "assets/sasha_formal.png",
      image: "assets/sasha_formal.png",
      idleImage: "assets/sasha_formal.png",
      stats: [
        { iconImage: "assets/ui/icon-formal-endurance.png", label: "Выносливость после созовнов", value: "+60" },
        { iconImage: "assets/ui/icon-formal-tie.png", label: "Красивый галстук", value: "+70" },
        { iconImage: "assets/ui/icon-formal-look.png", label: "Выглядит шикарно даже уставшим", value: "+75" }
      ],
      walkAnimations: {
        left: [
          "assets/sasha_formal_walk_left_1.png",
          "assets/sasha_formal_walk_left_2.png",
          "assets/sasha_formal_walk_left_3.png",
          "assets/sasha_formal_walk_left_4.png"
        ],
        up: [
          "assets/sasha_formal_walk_up_1.png",
          "assets/sasha_formal_walk_up_2.png",
          "assets/sasha_formal_walk_up_3.png",
          "assets/sasha_formal_walk_up_4.png",
          "assets/sasha_formal_walk_up_5.png",
          "assets/sasha_formal_walk_up_6.png"
        ],
        down: [
          "assets/sasha_formal_walk_down_1.png",
          "assets/sasha_formal_walk_down_2.png",
          "assets/sasha_formal_walk_down_3.png",
          "assets/sasha_formal_walk_down_4.png",
          "assets/sasha_formal_walk_down_5.png",
          "assets/sasha_formal_walk_down_6.png"
        ]
      }
    },
    {
      id: "cardigan",
      angelLineKey: "cozy",
      name: "Уютный Саня",
      description: "Готов починить всё дома, заварить чай и выглядеть стильно.",
      sprite: "assets/sasha_cardigan.png",
      image: "assets/sasha_cardigan.png",
      idleImage: "assets/sasha_cardigan.png",
      stats: [
        { iconImage: "assets/ui/icon-cozy-style.png", label: "Врожденное чувство стиля (пассивный навык)", value: "+65" },
        { iconImage: "assets/ui/icon-cozy-tea.png", label: "Чайная мудрость", value: "+85" },
        { iconImage: "assets/ui/icon-cozy-stress.png", label: "Устойчивость к стрессу", value: "+70" }
      ],
      walkAnimations: {
        left: [
          "assets/sasha_dacha_walk_left_1.png",
          "assets/sasha_dacha_walk_left_2.png",
          "assets/sasha_dacha_walk_left_3.png",
          "assets/sasha_dacha_walk_left_4.png"
        ],
        up: [
          "assets/sasha_dacha_walk_up_1.png",
          "assets/sasha_dacha_walk_up_2.png",
          "assets/sasha_dacha_walk_up_3.png",
          "assets/sasha_dacha_walk_up_4.png",
          "assets/sasha_dacha_walk_up_5.png",
          "assets/sasha_dacha_walk_up_6.png"
        ],
        down: [
          "assets/sasha_dacha_walk_down_1.png",
          "assets/sasha_dacha_walk_down_2.png",
          "assets/sasha_dacha_walk_down_3.png",
          "assets/sasha_dacha_walk_down_4.png",
          "assets/sasha_dacha_walk_down_5.png",
          "assets/sasha_dacha_walk_down_6.png"
        ]
      }
    },
    {
      id: "forest",
      angelLineKey: "dacha",
      name: "Дачный Саня",
      description: "Готов к дровам, поломкам и разговорам у костра.",
      sprite: "assets/sanya_dacha.png",
      image: "assets/sanya_dacha.png",
      idleImage: "assets/sanya_dacha.png",
      stats: [
        { iconImage: "assets/ui/icon-dacha-hoard.png", label: "Всё пригодится (пассивный навык)", value: "+90" },
        { iconImage: "assets/ui/icon-dacha-repair.png", label: "Починка без инструкций", value: "+70" },
        { iconImage: "assets/ui/icon-dacha-weather.png", label: "Неуязвимость к погоде", value: "+65" }
      ],
      walkAnimations: {
        left: [
          "assets/sasha_cardigan_walk_left_1.png",
          "assets/sasha_cardigan_walk_left_2.png",
          "assets/sasha_cardigan_walk_left_3.png",
          "assets/sasha_cardigan_walk_left_4.png"
        ],
        up: [
          "assets/sasha_cardigan_walk_up_1.png",
          "assets/sasha_cardigan_walk_up_2.png",
          "assets/sasha_cardigan_walk_up_3.png",
          "assets/sasha_cardigan_walk_up_4.png",
          "assets/sasha_cardigan_walk_up_5.png",
          "assets/sasha_cardigan_walk_up_6.png"
        ],
        down: [
          "assets/sasha_cardigan_walk_down_1.png",
          "assets/sasha_cardigan_walk_down_2.png",
          "assets/sasha_cardigan_walk_down_3.png",
          "assets/sasha_cardigan_walk_down_4.png",
          "assets/sasha_cardigan_walk_down_5.png",
          "assets/sasha_cardigan_walk_down_6.png"
        ]
      }
    },
    {
      id: "holiday",
      angelLineKey: "cyber",
      name: "Кибер-Саня",
      description: "Готов к неону, скорости и тому, что реальность иногда лагает.",
      sprite: "assets/sanya_cyber.png",
      image: "assets/sanya_cyber.png",
      idleImage: "assets/sanya_cyber.png",
      stats: [
        { iconImage: "assets/ui/icon-cyber-presence.png", label: "Неоновое присутствие (пассивный навык)", value: "+90" },
        { iconImage: "assets/ui/icon-cyber-resistance.png", label: "Сопротивление багам реальности", value: "+60" },
        { iconImage: "assets/ui/icon-cyber-processing.png", label: "Быстрая обработка решений", value: "+70" }
      ],
      walkAnimations: {
        down: []
      }
    }
  ],
  sprite: {
    width: 23,
    height: 60,
    previewScale: 5,
    mapScale: 1.8,
    walkFrameDuration: 120
  },
  stats: [
    "Ответственность +100",
    "Сделаю сам +90",
    "Чувство стиля +85",
    "Умение чинить непонятное +80",
    "Красивый галстук +70",
    "Дачная тяга +95",
    "Выносливость после созвонов +60",
    "Способность выглядеть прилично даже уставшим +75"
  ],
  createError: "ОШИБКА: стата 'отдых' не найдена.",
  dialogue: [
    {
      speaker: "Ангелочек",
      portrait: "👼",
      angelPose: "surprised",
      text: "О нет, Боженька!\nМы случайно создали персонажа без статы отдыха!"
    },
    {
      speaker: "Боженька",
      portrait: "☁️",
      godPose: "thoughtful",
      text: "..."
    },
    {
      speaker: "Боженька",
      portrait: "☁️",
      godPose: "thoughtful",
      text: "Неловко вышло."
    },
    {
      speaker: "Боженька",
      portrait: "☁️",
      godPose: "flask",
      text: "Колбочка с отдыхом закончилась."
    },
    {
      speaker: "Ангелочек",
      portrait: "👼",
      angelPose: "hands",
      text: "Но как он теперь будет жить?!"
    },
    {
      speaker: "Боженька",
      portrait: "☁️",
      godPose: "thoughtful",
      text: "М-да..."
    },
    {
      speaker: "Боженька",
      portrait: "☁️",
      godPose: "idea",
      text: "Ладно."
    },
    {
      speaker: "Боженька",
      portrait: "☁️",
      godPose: "pointing",
      text: "Доставай ту старую штуку."
    },
    {
      speaker: "Ангелочек",
      portrait: "👼",
      angelPose: "surprised",
      godPose: "smile",
      text: "Какую штуку?"
    },
    {
      speaker: "Боженька",
      portrait: "☁️",
      angelPose: "smile",
      text: "Запускай эволюцию."
    },
    {
      speaker: "Боженька",
      portrait: "☁️",
      godPose: "happy",
      text: "Пусть добудет стату отдыха самостоятельно."
    }
  ],
  items: {
    axe: { id: "axe", name: "топор", icon: "🪓" },
    wood: { id: "wood", name: "дерево", icon: "🪵" },
    flowers: { id: "flowers", name: "цветы", icon: "🌸" },
    apples: { id: "apples", name: "яблоки", icon: "🍎" },
    vase: { id: "vase", name: "вазочка", icon: "🏺" }
  },
  achievements: [
    { id: "restPlaces", label: "Где тут вообще отдыхать?", total: 5 },
    { id: "campfire", label: "Уютное место у костра", total: 4 },
    { id: "flowers", label: "Цветочная терапия", total: 8 },
    { id: "nature", label: "Контакт с природой", total: 5 },
    { id: "fruit", label: "Фруктовая экспедиция", total: 5 }
  ],
  messages: {
    intro: "Цель ясна: добыть отдых, собрать уют и не забыть про красоту вокруг.",
    foundAxe: "Топор лежал на земле и ждал своего часа.",
    needAxe: "Руками дерево не добудешь. Нужен топор.",
    needAxeBirch: "Руками это будет слишком эмоционально.",
    gotFlowers: "Цветочки собраны. Красота тоже лечит усталость.",
    gotVase: "Ваза найдена. Осталось придумать, чем её порадовать.",
    river: "Тут журчит вода. Звук: ш-ш-ш.",
    house: "Домик 10/10. Заселение пока не открыто",
    toilet: "Сюда лучше не заходить без подготовки",
    pier: "Сюда бы лодку… и сюжет",
    bench: "Сесть нельзя, но морально Саша уже отдохнул",
    campfire: "Здесь явно должно быть теплее",
    needMoreWoodForCampfire: "Кажется, для уютного костра нужно ещё немного дров.",
    campfireLit: "Костёр разожжён. Место сразу стало уютнее.",
    noMail: "Почты пока нет...",
    needMoreFlowers: "Для букета пока маловато цветов.",
    needVase: "Сначала нужна вазочка.",
    needPlacedVase: "Сначала вазочку нужно поставить на стол.",
    vasePlaced: "Ваза теперь на столе. Просит букет.",
    bouquetPlaced: "Букет появился в вазе на столе. Красота делает своё дело.",
    tableMissing: "Стол скоро появится на карте. Пока вазу поставить некуда.",
    treeAlreadyChopped: "Это дерево уже внесло вклад в дачный уют.",
    blockedByWater: "У Саши ещё не открыт навык хождения по воде.",
    blockedByRocks: "Саша уважает границы камня.",
    noRecipe: "Для этого действия пока не хватает материалов.",
    finished: "Кажется в почтовом ящике что-то появилось..."
  },
  messagePools: {
    regularTreeHit: [
      "Лес записал это в личное дело.",
      "Саня выбрал путь силы.",
      "Контакт с природой прошёл… интенсивно."
    ],
    regularTreeFinal: [
      "На уютный костёр стало чуть ближе.",
      "Инвентарь становится подозрительно хозяйственным.",
      "Полезная штука для очень дачных дел."
    ],
    birchHit: [
      "Это личное.",
      "Годы чихания привели к этому моменту.",
      "Переговоры с берёзой провалились.",
      "Саня выбрал путь силы."
    ],
    birchFinal: [
      "Счёт: Саня 1 — берёза 0.",
      "Саня чувствует +5 к моральной компенсации.",
      "Берёза больше не участвует в сюжете."
    ],
    appleCollected: [
      "Яблоня поделилась ресурсами.",
      "Урожайность превысила ожидания.",
      "Фрукты сами себя не соберут.",
      "Появилось желание сварить компот.",
      "Что-то вкусненькое найдено."
    ]
  },
  map: {
    worldWidth: 1536,
    worldHeight: 1024,
    sourceWorldWidth: 2400,
    sourceWorldHeight: 1600,
    backgroundImage: "assets/map_background.png",
    backgroundScale: 1.5,
    collisionMasks: {
      rocks: "assets/map_rocks_mask.png",
      water: "assets/map_water_mask_v2.png"
    },
    playerSpeed: 2.3,
    interactDistance: 42,
    cameraLerp: 0.1,
    playerStart: {
      x: 460,
      y: 449
    },
    decor: {
      ponds: [
        { x: 1240, y: 610, rx: 220, ry: 125 },
        { x: 1710, y: 1220, rx: 140, ry: 88 }
      ],
      flowerPatches: [
        { x: 320, y: 1180 },
        { x: 860, y: 270 },
        { x: 1480, y: 320 },
        { x: 2010, y: 470 },
        { x: 1030, y: 1360 },
        { x: 2140, y: 1080 }
      ],
      rockPatches: [
        { x: 420, y: 540, size: 16 },
        { x: 930, y: 1010, size: 22 },
        { x: 1560, y: 840, size: 18 },
        { x: 1900, y: 930, size: 24 },
        { x: 2190, y: 640, size: 14 }
      ],
      decorativeTrees: [
        { x: 540, y: 300, radius: 34 },
        { x: 940, y: 520, radius: 30 },
        { x: 1340, y: 300, radius: 36 },
        { x: 2020, y: 290, radius: 32 },
        { x: 2140, y: 1280, radius: 36 },
        { x: 730, y: 1330, radius: 32 },
        { x: 1650, y: 970, radius: 34 }
      ]
    },
    objects: [
      { id: "tree-02", type: "tree", x: 1951, y: 903, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-03", type: "tree", x: 452, y: 862, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-04", type: "tree", x: 2159, y: 1164, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-05", type: "tree", x: 664, y: 1291, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-06", type: "tree", x: 1350, y: 1301, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-07", type: "tree", x: 1708, y: 1336, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-08", type: "tree", x: 1071, y: 1342, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-09", type: "tree", x: 584, y: 73, radius: 42, image: "assets/tree_round_1.png", width: 175, height: 207 },
      { id: "tree-10", type: "tree", x: 192, y: 102, radius: 42, image: "assets/tree_round_1.png", width: 175, height: 207 },
      { id: "tree-11", type: "tree", x: 801, y: 512, radius: 42, image: "assets/tree_round_1.png", width: 175, height: 207 },
      { id: "tree-12", type: "tree", x: 634, y: 1028, radius: 42, image: "assets/tree_round_1.png", width: 175, height: 207 },
      { id: "tree-13", type: "tree", x: 277, y: 1282, radius: 42, image: "assets/tree_round_1.png", width: 175, height: 207 },
      { id: "tree-14", type: "tree", x: 1210, y: 1518, radius: 42, image: "assets/tree_round_1.png", width: 175, height: 207 },
      { id: "tree-15", type: "tree", x: 315, y: 231, radius: 42, image: "assets/tree_fir_1.png", width: 150, height: 291 },
      { id: "tree-16", type: "tree", x: 642, y: 328, radius: 42, image: "assets/tree_fir_1.png", width: 150, height: 291 },
      { id: "tree-17", type: "tree", x: 1004, y: 345, radius: 42, image: "assets/tree_fir_1.png", width: 150, height: 291 },
      { id: "tree-18", type: "tree", x: 2169, y: 642, radius: 42, image: "assets/tree_fir_1.png", width: 150, height: 291 },
      { id: "tree-19", type: "tree", x: 129, y: 778, radius: 42, image: "assets/tree_fir_1.png", width: 150, height: 291 },
      { id: "tree-20", type: "tree", x: 724, y: 759, radius: 42, image: "assets/tree_fir_1.png", width: 150, height: 291 },
      { id: "tree-21", type: "tree", x: 1432, y: 774, radius: 42, image: "assets/tree_fir_1.png", width: 150, height: 291 },
      { id: "tree-22", type: "tree", x: 273, y: 986, radius: 42, image: "assets/tree_fir_1.png", width: 150, height: 291 },
      { id: "tree-23", type: "tree", x: 2215, y: 1461, radius: 42, image: "assets/tree_fir_1.png", width: 150, height: 291 },
      { id: "tree-24", type: "tree", x: 903, y: 101, radius: 42, image: "assets/tree_round_2.png", width: 172, height: 212 },
      { id: "tree-25", type: "tree", x: 2130, y: 173, radius: 42, image: "assets/tree_round_2.png", width: 172, height: 212 },
      { id: "tree-26", type: "tree", x: 2248, y: 412, radius: 42, image: "assets/tree_round_2.png", width: 172, height: 212 },
      { id: "tree-27", type: "tree", x: 1017, y: 635, radius: 42, image: "assets/tree_round_2.png", width: 172, height: 212 },
      { id: "tree-28", type: "tree", x: 2298, y: 905, radius: 42, image: "assets/tree_round_2.png", width: 172, height: 212 },
      { id: "tree-29", type: "tree", x: 1707, y: 1010, radius: 42, image: "assets/tree_round_2.png", width: 172, height: 212 },
      { id: "tree-30", type: "tree", x: 111, y: 1086, radius: 42, image: "assets/tree_round_2.png", width: 172, height: 212 },
      { id: "tree-31", type: "tree", x: 1976, y: 1496, radius: 42, image: "assets/tree_round_2.png", width: 172, height: 212 },
      { id: "tree-32", type: "tree", x: 507, y: 1513, radius: 42, image: "assets/tree_round_2.png", width: 172, height: 212 },
      { id: "tree-33", type: "tree", x: 759, y: 212, radius: 42, image: "assets/tree_fir_2.png", width: 152, height: 326 },
      { id: "tree-34", type: "tree", x: 117, y: 370, radius: 42, image: "assets/tree_fir_2.png", width: 152, height: 326 },
      { id: "tree-35", type: "tree", x: 280, y: 636, radius: 42, image: "assets/tree_fir_2.png", width: 152, height: 326 },
      { id: "tree-36", type: "tree", x: 1537, y: 1318, radius: 42, image: "assets/tree_fir_2.png", width: 152, height: 326 },
      { id: "tree-37", type: "tree", x: 2322, y: 1300, radius: 42, image: "assets/tree_fir_2.png", width: 152, height: 326 },
      { id: "tree-38", type: "tree", x: 1373, y: 172, radius: 42, image: "assets/tree_apple.png", width: 160, height: 206 },
      { id: "tree-39", type: "tree", x: 1813, y: 178, radius: 42, image: "assets/tree_apple.png", width: 160, height: 206 },
      { id: "tree-40", type: "tree", x: 1708, y: 368, radius: 42, image: "assets/tree_apple.png", width: 160, height: 206 },
      { id: "tree-41", type: "tree", x: 1268, y: 367, radius: 42, image: "assets/tree_apple.png", width: 160, height: 206 },
      { id: "tree-42", type: "tree", x: 1481, y: 493, radius: 42, image: "assets/tree_apple.png", width: 160, height: 206 },
      { id: "tree-43", type: "tree", x: 359, y: 1047, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-44", type: "tree", x: 524, y: 1132, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-45", type: "tree", x: 764, y: 1143, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-46", type: "tree", x: 112, y: 1465, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-47", type: "tree", x: 824, y: 1546, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-48", type: "tree", x: 1447, y: 1513, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-49", type: "tree", x: 1811, y: 1398, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-50", type: "tree", x: 1982, y: 1260, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-51", type: "tree", x: 2275, y: 78, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-52", type: "tree", x: 422, y: 1204, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-53", type: "tree", x: 326, y: 1369, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-54", type: "tree", x: 647, y: 1457, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-55", type: "tree", x: 885, y: 1185, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-56", type: "tree", x: 966, y: 1460, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      { id: "tree-57", type: "tree", x: 1590, y: 1453, radius: 42, image: "assets/tree_birch.png", width: 160, height: 246 },
      {
        id: "axe-1",
        type: "axe",
        x: 172,
        y: 524,
        radius: 22,
        image: "assets/ui/map/axe.png",
        width: 40,
        height: 28
      },
      { id: "flowers-01", type: "flowers", x: 755, y: 333, radius: 22, image: "assets/ui/map/flower-bell.png", width: 51, height: 86 },
      { id: "flowers-02", type: "flowers", x: 2034, y: 1361, radius: 22, image: "assets/ui/map/flower-forget-me-not.png", width: 51, height: 86 },
      { id: "flowers-03", type: "flowers", x: 716, y: 446, radius: 22, image: "assets/ui/map/flower-lavender.png", width: 51, height: 86 },
      { id: "flowers-04", type: "flowers", x: 2178, y: 552, radius: 22, image: "assets/ui/map/flower-lavender.png", width: 51, height: 86 },
      { id: "flowers-05", type: "flowers", x: 2275, y: 664, radius: 22, image: "assets/ui/map/flower-bell.png", width: 51, height: 86 },
      { id: "flowers-06", type: "flowers", x: 1540, y: 348, radius: 22, image: "assets/ui/map/flower-forget-me-not.png", width: 51, height: 86 },
      { id: "flowers-07", type: "flowers", x: 655, y: 588, radius: 22, image: "assets/ui/map/flower-daisy.png", width: 51, height: 86 },
      { id: "flowers-08", type: "flowers", x: 572, y: 1333, radius: 22, image: "assets/ui/map/flower-bell.png", width: 51, height: 86 },
      { id: "flowers-09", type: "flowers", x: 595, y: 838, radius: 22, image: "assets/ui/map/flower-lily.png", width: 51, height: 86 },
      { id: "flowers-10", type: "flowers", x: 1682, y: 281, radius: 22, image: "assets/ui/map/flower-daisy.png", width: 51, height: 86 },
      { id: "flowers-11", type: "flowers", x: 2292, y: 823, radius: 22, image: "assets/ui/map/flower-bell.png", width: 51, height: 86 },
      { id: "flowers-12", type: "flowers", x: 978, y: 487, radius: 22, image: "assets/ui/map/flower-bell.png", width: 51, height: 86 },
      { id: "flowers-13", type: "flowers", x: 480, y: 654, radius: 22, image: "assets/ui/map/flower-forget-me-not.png", width: 51, height: 86 },
      { id: "flowers-14", type: "flowers", x: 84, y: 626, radius: 22, image: "assets/ui/map/flower-yellow.png", width: 51, height: 86 },
      { id: "flowers-15", type: "flowers", x: 594, y: 504, radius: 22, image: "assets/ui/map/flower-lily.png", width: 51, height: 86 },
      { id: "flowers-16", type: "flowers", x: 1361, y: 1488, radius: 22, image: "assets/ui/map/flower-yellow.png", width: 51, height: 86 },
      { id: "flowers-17", type: "flowers", x: 293, y: 800, radius: 22, image: "assets/ui/map/flower-daisy.png", width: 51, height: 86 },
      { id: "flowers-18", type: "flowers", x: 835, y: 430, radius: 22, image: "assets/ui/map/flower-yellow.png", width: 51, height: 86 },
      { id: "flowers-19", type: "flowers", x: 2088, y: 1204, radius: 22, image: "assets/ui/map/flower-forget-me-not.png", width: 51, height: 86 },
      { id: "flowers-20", type: "flowers", x: 812, y: 667, radius: 22, image: "assets/ui/map/flower-bell.png", width: 51, height: 86 },
      { id: "flowers-21", type: "flowers", x: 1657, y: 1245, radius: 22, image: "assets/ui/map/flower-yellow.png", width: 51, height: 86 },
      { id: "flowers-22", type: "flowers", x: 735, y: 980, radius: 22, image: "assets/ui/map/flower-daisy.png", width: 51, height: 86 },
      { id: "flowers-23", type: "flowers", x: 2328, y: 1411, radius: 22, image: "assets/ui/map/flower-lavender.png", width: 51, height: 86 },
      { id: "flowers-24", type: "flowers", x: 2242, y: 1138, radius: 22, image: "assets/ui/map/flower-yellow.png", width: 51, height: 86 },
      { id: "flowers-25", type: "flowers", x: 248, y: 564, radius: 22, image: "assets/ui/map/flower-forget-me-not.png", width: 51, height: 86 },
      { id: "flowers-26", type: "flowers", x: 521, y: 279, radius: 22, image: "assets/ui/map/flower-forget-me-not.png", width: 51, height: 86 },
      { id: "flowers-27", type: "flowers", x: 1078, y: 1438, radius: 22, image: "assets/ui/map/flower-lavender.png", width: 51, height: 86 },
      { id: "flowers-28", type: "flowers", x: 1688, y: 155, radius: 22, image: "assets/ui/map/flower-yellow.png", width: 51, height: 86 },
      { id: "flowers-29", type: "flowers", x: 2325, y: 399, radius: 22, image: "assets/ui/map/flower-lavender.png", width: 51, height: 86 },
      { id: "flowers-30", type: "flowers", x: 238, y: 1525, radius: 22, image: "assets/ui/map/flower-lavender.png", width: 51, height: 86 },
      { id: "flowers-31", type: "flowers", x: 640, y: 714, radius: 22, image: "assets/ui/map/flower-forget-me-not.png", width: 51, height: 86 },
      { id: "flowers-32", type: "flowers", x: 810, y: 1384, radius: 22, image: "assets/ui/map/flower-forget-me-not.png", width: 51, height: 86 },
      { id: "flowers-33", type: "flowers", x: 2085, y: 280, radius: 22, image: "assets/ui/map/flower-lavender.png", width: 51, height: 86 },
      { id: "flowers-34", type: "flowers", x: 2029, y: 449, radius: 22, image: "assets/ui/map/flower-daisy.png", width: 51, height: 86 },
      { id: "flowers-35", type: "flowers", x: 213, y: 1413, radius: 22, image: "assets/ui/map/flower-lily.png", width: 51, height: 86 },
      { id: "flowers-36", type: "flowers", x: 1805, y: 1497, radius: 22, image: "assets/ui/map/flower-lily.png", width: 51, height: 86 },
      { id: "flowers-37", type: "flowers", x: 1390, y: 299, radius: 22, image: "assets/ui/map/flower-bell.png", width: 51, height: 86 },
      { id: "flowers-38", type: "flowers", x: 1498, y: 1439, radius: 22, image: "assets/ui/map/flower-yellow.png", width: 51, height: 86 },
      { id: "flowers-39", type: "flowers", x: 461, y: 784, radius: 22, image: "assets/ui/map/flower-lily.png", width: 51, height: 86 },
      { id: "flowers-40", type: "flowers", x: 2250, y: 1005, radius: 22, image: "assets/ui/map/flower-lavender.png", width: 51, height: 86 },
      { id: "flowers-41", type: "flowers", x: 1821, y: 316, radius: 22, image: "assets/ui/map/flower-daisy.png", width: 51, height: 86 },
      { id: "flowers-42", type: "flowers", x: 222, y: 405, radius: 22, image: "assets/ui/map/flower-daisy.png", width: 51, height: 86 },
      { id: "flowers-43", type: "flowers", x: 1644, y: 888, radius: 22, image: "assets/ui/map/flower-daisy.png", width: 51, height: 86 },
      { id: "flowers-44", type: "flowers", x: 2072, y: 554, radius: 22, image: "assets/ui/map/flower-forget-me-not.png", width: 51, height: 86 },
      { id: "flowers-45", type: "flowers", x: 844, y: 840, radius: 22, image: "assets/ui/map/flower-bell.png", width: 51, height: 86 },
      { id: "flowers-46", type: "flowers", x: 421, y: 311, radius: 22, image: "assets/ui/map/flower-bell.png", width: 51, height: 86 },
      { id: "flowers-47", type: "flowers", x: 883, y: 587, radius: 22, image: "assets/ui/map/flower-forget-me-not.png", width: 51, height: 86 },
      { id: "flowers-48", type: "flowers", x: 407, y: 1368, radius: 22, image: "assets/ui/map/flower-lavender.png", width: 51, height: 86 },
      { id: "flowers-49", type: "flowers", x: 126, y: 1356, radius: 22, image: "assets/ui/map/flower-yellow.png", width: 51, height: 86 },
      { id: "flowers-50", type: "flowers", x: 1663, y: 1045, radius: 22, image: "assets/ui/map/flower-bell.png", width: 51, height: 86 },
      {
        id: "vase-spot",
        type: "vase",
        x: 2302,
        y: 213,
        radius: 26,
        image: "assets/ui/map/vase-ground.png",
        width: 20,
        height: 29
      },
      {
        id: "river",
        type: "river",
        x: 1240,
        y: 610,
        radius: 130
      },
      {
        id: "house-1",
        type: "house",
        x: 1697,
        y: 838,
        radius: 90,
        image: "assets/house.png",
        width: 419,
        height: 326,
        anchor: "bottom-center",
        walkSideRatio: 0.1,
        walkBehindRatio: 0.5,
        walkFrontRatio: 0.3
      },
      {
        id: "mailbox-1",
        type: "mailbox",
        x: 1532,
        y: 881,
        radius: 18,
        image: "assets/ui/map/mailbox.png",
        width: 35,
        height: 61
      },
      {
        id: "toilet-1",
        type: "toilet",
        x: 1922,
        y: 489,
        radius: 36,
        image: "assets/toilet.png",
        width: 121,
        height: 144,
        anchor: "bottom-center",
        walkSideRatio: 0.1,
        walkSideLeftRatio: 0.3,
        walkBehindRatio: 0.5,
        walkFrontRatio: 0.3
      },
      {
        id: "bench-1",
        type: "bench",
        x: 2133,
        y: 785,
        radius: 40,
        image: "assets/bench.png",
        width: 103,
        height: 55,
        anchor: "bottom-center",
        walkBehindRatio: 0.4,
        walkFrontRatio: 0.6
      },
      {
        id: "table-1",
        type: "table",
        x: 1816,
        y: 1044,
        radius: 42,
        image: "assets/ui/map/table-1.png",
        width: 121,
        height: 104,
        anchor: "bottom-center",
        walkBehindRatio: 0.65,
        walkFrontRatio: 0.35
      },
      {
        id: "campfire-1",
        type: "campfire",
        x: 2029,
        y: 1089,
        radius: 56,
        image: "assets/campfire.png",
        width: 227,
        height: 116,
        anchor: "bottom-center",
        walkBehindRatio: 0,
        walkFrontRatio: 1
      },
      {
        id: "pier-1",
        type: "pier",
        x: 1525,
        y: 1009,
        radius: 54,
        image: "assets/pier.png",
        width: 126,
        height: 124
      },
    ]
  }
};
