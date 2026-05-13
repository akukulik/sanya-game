(function () {
  const app = document.getElementById("app");
  const data = window.GAME_DATA;
  const DEBUG_COLLISIONS = Boolean(data.debug?.collisions);
  const DEBUG_PLAYER_COORDS = Boolean(data.debug?.playerCoords);
  const DEBUG_FLOWER_IDS = Boolean(data.debug?.flowerIds);
  const spriteAssets = {};
  const treeImageAssets = {};
  const objectImageAssets = {};
  const creatorOutfits = data.characterOutfits.filter((outfit) => outfit.id !== "holiday");
  const backgroundMusic = createBackgroundMusic();
  const outfitArrowClickSound = createSoundEffect(data.audio?.outfitArrowClick);
  const heavenDialogueClickSound = createSoundEffect(data.audio?.heavenDialogueClick);
  const retroErrorSound = createLoopingSoundEffect(data.audio?.retroError);
  const errorPopupHitSound = createSoundEffect(data.audio?.errorPopupHit);
  const heavenVoicesIntroSound = createSoundEffect(data.audio?.heavenVoicesIntro);
  const birdsChirpingAmbienceSound = createLoopingSoundEffect(data.audio?.birdsChirpingAmbience);
  const axeHitWoodSound = createSoundEffect(data.audio?.axeHitWood);
  const pickupItemSound = createSoundEffect(data.audio?.pickupItem);
  const walkOnGrassSound = createLoopingSoundEffect(data.audio?.walkOnGrass);
  const waterStreamAmbienceSound = createLoopingSoundEffect(data.audio?.waterStreamAmbience);
  const waterStreamMaxDistance = 600;
  const campfireBurningAmbienceSound = createLoopingSoundEffect(data.audio?.campfireBurningAmbience);
  const campfireBurningMaxDistance = 300;
  const loadingState = {
    complete: false,
    loaded: 0,
    total: 0,
    label: "Собираем дачный мир..."
  };
  const backgroundMusicTargetVolume = clamp(
    typeof data.audio?.backgroundMusic?.volume === "number" ? data.audio.backgroundMusic.volume : 0.15,
    0,
    1
  );
  const heavenBackgroundMusicTargetVolume = 0.01;
  const earthBackgroundMusicTargetVolume = 0.01;
  const backgroundMusicFadeInDurationMs = Math.max(0, data.audio?.backgroundMusic?.fadeInDurationMs || 0);
  const errorPopupRevealDurationMs = 960;
  const errorDialogueDelayAfterRevealMs = 5000;
  const retroErrorLoopDurationMs = 6000;
  const heavenTransitionDurationMs = 3600;
  const earthTransitionDurationMs = 5200;
  const birdsChirpingEarthFadeDurationMs = 10000;
  const earthMapPreviewDelayMs = 2200;
  const earthMapPreviewExitDelayMs = 4300;
  const mapMessageVisibleDurationMs = 4200;
  const mapIntroMessageVisibleDurationMs = mapMessageVisibleDurationMs + 3000;
  const mapMessageFadeDurationMs = 950;
  const finalMessageQuietDelayMs = 4000;
  const mapImage = new Image();
  const collisionMaskConfig = {
    rocks: createCollisionMask("rocks", data.map.collisionMasks?.rocks),
    water: createCollisionMask("water", data.map.collisionMasks?.water)
  };
  const defaultOutfitId = creatorOutfits[0]?.id || data.characterOutfits[0]?.id || null;
  let mapReady = false;
  let mapScaled = false;

  // Все игровые данные лежат в одном объекте состояния, чтобы MVP было легко править вручную.
  const state = {
    screen: "creator",
    currentScene: "characterCreation",
    dialogueIndex: 0,
    heavenBubbleExiting: false,
    heavenTextVisibleChunks: 0,
    heavenTextComplete: false,
    earthMapPreviewVisible: false,
    mapIntroActive: false,
    mapMessageVisible: true,
    mapMessageHiding: false,
    mapIntroMessagePending: true,
    mapGoalsShifted: false,
    mapGoalsShiftY: 0,
    createErrorVisible: false,
    creatorGlitchActive: false,
    creatorDecorGlitchOut: false,
    creatorDecorHidden: false,
    selectedStats: [],
    selectedOutfitId: defaultOutfitId,
    creatorIntroLineVisible: true,
    creatorAngelLineIndices: {},
    playerAppearanceId: defaultOutfitId,
    inventory: {
      axe: 0,
      wood: 0,
      flowers: 0,
      apples: 0,
      vase: 0
    },
    activeItem: null,
    mapSidebarTab: "inventory",
    rest: 0,
    message: data.messages.intro,
    quests: {
      restPlaces: {
        found: {}
      },
      campfire: {
        woodCollected: 0,
        lit: false
      },
      flowers: {
        flowersCollected: 0,
        vaseFound: false,
        vasePlaced: false,
        bouquetPlaced: false
      },
      nature: {
        axeFound: false,
        birchesChopped: 0
      },
      fruit: {
        applesCollected: 0
      }
    },
    mapObjects: data.map.objects.map((object) => createMapObject(object)),
    floatingRestPopups: [],
    endingReached: false,
    letterOpen: false,
    messageLimits: {
      needAxe: 0,
      needAxeBirch: 0,
      blockedByRocks: 0,
      blockedByWater: 0,
      flowersCollected: 0,
      bouquetPlaced: 0,
      noMail: 0,
      finished: 0
    },
    player: {
      x: data.map.playerStart.x,
      y: data.map.playerStart.y,
      targetX: data.map.playerStart.x,
      targetY: data.map.playerStart.y,
      pendingAction: null,
      followUpTarget: null,
      isMoving: false,
      facing: "down",
      walkFrameIndex: 0,
      walkFrameElapsed: 0
    },
    camera: {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0
    },
    viewport: {
      width: 960,
      height: 600
    },
    mapZoom: 1,
    pressedKeys: new Set(),
    collisionNotice: null,
    pendingCollision: null,
    zoneStates: {
      pier: {},
      scenery: {}
    }
  };

  let canvas;
  let ctx;
  let animationFrame = null;
  let controlsBound = false;
  let lastFrameTime = 0;
  let backgroundMusicFadeFrame = null;
  let backgroundMusicVolumeTweenFrame = null;
  let creatorSequenceToken = 0;
  let errorDialogueTimeout = null;
  let retroErrorStopTimeout = null;
  let heavenActivationTimeout = null;
  let heavenDialogueTimeout = null;
  let heavenTextInterval = null;
  let birdsChirpingVolumeTweenFrame = null;
  let earthMapPreviewTimeout = null;
  let earthMapPreviewExitTimeout = null;
  let earthMapStartTimeout = null;
  let mapMessageHideTimeout = null;
  let mapMessageRemoveTimeout = null;
  let finalMessageTimeout = null;
  let walkingSoundActive = false;

  window.__mapDebug = {
    state: getMapDebugState,
    sample: sampleMapMaskAt
  };

  function render() {
    if (!loadingState.complete) {
      renderLoadingScreen();
      return;
    }

    if (state.screen !== "creator") {
      clearRetroErrorStopTimeout();
      stopLoopingSoundEffect(retroErrorSound);
    }

    if (state.screen === "creator") {
      stopMapLoop();
      renderShell("Создание персонажа", "Мини-игра-подарок", renderCreatorContent());
      bindCreatorEvents();
      return;
    }

    if (state.screen === "dialogue") {
      stopMapLoop();
      renderShell("Сюжетный диалог", "Пролог перед дачным режимом", renderDialogueContent());
      bindDialogueEvents();
      return;
    }

    if (state.screen === "earthTransition") {
      stopMapLoop();
      renderShell("Спуск на землю", "Переход к дачному режиму", renderEarthTransitionContent());
      startEarthTransitionAnimation();
      return;
    }

    if (!mapReady) {
      stopMapLoop();
      renderShell("Дачный режим", "Локация загружается", renderMapLoadingContent());
      return;
    }

    renderShell("Дачный режим", "Локация: дача мечты", renderMapContent());
    bindMapUiEvents();
    setupCanvas();
    startMapLoop();
  }

  function createBackgroundMusic() {
    const musicConfig = data.audio?.backgroundMusic;
    if (!musicConfig?.src) {
      return null;
    }

    const audio = new Audio(musicConfig.src);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    audio.addEventListener("ended", () => {
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.warn("Не удалось перезапустить фоновую музыку.", error);
      });
    });
    return audio;
  }

  function createSoundEffect(soundConfig) {
    if (!soundConfig?.src) {
      return null;
    }

    return {
      src: soundConfig.src,
      volume: clamp(typeof soundConfig.volume === "number" ? soundConfig.volume : 0.2, 0, 1),
      fadeInDurationMs: Math.max(0, soundConfig.fadeInDurationMs || 0),
      fadeOutDurationMs: Math.max(0, soundConfig.fadeOutDurationMs || 0)
    };
  }

  function createLoopingSoundEffect(soundConfig) {
    if (!soundConfig?.src) {
      return null;
    }

    const audio = new Audio(soundConfig.src);
    audio.loop = true;
    audio.preload = "auto";
    audio.dataset.targetVolume = String(clamp(typeof soundConfig.volume === "number" ? soundConfig.volume : 0.2, 0, 1));
    audio.dataset.earthVolume = String(clamp(typeof soundConfig.earthVolume === "number" ? soundConfig.earthVolume : Number(audio.dataset.targetVolume), 0, 1));
    audio.dataset.fadeInDurationMs = String(Math.max(0, soundConfig.fadeInDurationMs || 0));
    audio.volume = audio.dataset.fadeInDurationMs === "0" ? Number(audio.dataset.targetVolume) : 0;
    return audio;
  }

  function setupAudioUnlock() {
    if (!backgroundMusic) {
      return;
    }

    const unlockAudio = () => {
      playBackgroundMusic()
        .then(() => {
          window.removeEventListener("pointerdown", unlockAudio);
          window.removeEventListener("keydown", unlockAudio);
        })
        .catch(() => {
          // Браузер может ещё не разрешить автозапуск; попробуем снова при следующем действии.
        });
    };

    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
  }

  function playBackgroundMusic() {
    if (!backgroundMusic || !backgroundMusic.paused) {
      return Promise.resolve();
    }

    backgroundMusic.volume = 0;

    return backgroundMusic.play()
      .then(() => {
        startBackgroundMusicFadeIn();
      })
      .catch((error) => {
        console.warn("Не удалось запустить фоновую музыку.", error);
        throw error;
      });
  }

  function startBackgroundMusicFadeIn() {
    if (!backgroundMusic) {
      return;
    }

    if (backgroundMusicFadeFrame) {
      window.cancelAnimationFrame(backgroundMusicFadeFrame);
      backgroundMusicFadeFrame = null;
    }

    if (backgroundMusicFadeInDurationMs <= 0) {
      backgroundMusic.volume = backgroundMusicTargetVolume;
      return;
    }

    const fadeStartTime = performance.now();

    const step = (timestamp) => {
      const elapsed = timestamp - fadeStartTime;
      const progress = clamp(elapsed / backgroundMusicFadeInDurationMs, 0, 1);

      backgroundMusic.volume = backgroundMusicTargetVolume * progress;

      if (progress < 1 && !backgroundMusic.paused) {
        backgroundMusicFadeFrame = window.requestAnimationFrame(step);
        return;
      }

      backgroundMusic.volume = backgroundMusicTargetVolume;
      backgroundMusicFadeFrame = null;
    };

    backgroundMusicFadeFrame = window.requestAnimationFrame(step);
  }

  function tweenBackgroundMusicVolume(targetVolume, durationMs) {
    if (!backgroundMusic) {
      return;
    }

    const safeTargetVolume = clamp(targetVolume, 0, 1);

    if (backgroundMusicVolumeTweenFrame) {
      window.cancelAnimationFrame(backgroundMusicVolumeTweenFrame);
      backgroundMusicVolumeTweenFrame = null;
    }

    if (durationMs <= 0) {
      backgroundMusic.volume = safeTargetVolume;
      return;
    }

    const startVolume = backgroundMusic.volume;
    const tweenStartTime = performance.now();

    const step = (timestamp) => {
      const elapsed = timestamp - tweenStartTime;
      const progress = clamp(elapsed / durationMs, 0, 1);
      backgroundMusic.volume = startVolume + (safeTargetVolume - startVolume) * progress;

      if (progress < 1 && !backgroundMusic.paused) {
        backgroundMusicVolumeTweenFrame = window.requestAnimationFrame(step);
        return;
      }

      backgroundMusic.volume = safeTargetVolume;
      backgroundMusicVolumeTweenFrame = null;
    };

    backgroundMusicVolumeTweenFrame = window.requestAnimationFrame(step);
  }

  function playSoundEffect(soundEffect) {
    if (!soundEffect?.src) {
      return null;
    }

    const audio = new Audio(soundEffect.src);
    audio.volume = soundEffect.fadeInDurationMs ? 0 : soundEffect.volume;
    scheduleSoundEffectFadeIn(audio, soundEffect);
    scheduleSoundEffectFadeOut(audio, soundEffect);
    audio.play().catch((error) => {
      console.warn("Не удалось воспроизвести звуковой эффект.", error);
    });
    return audio;
  }

  function scheduleSoundEffectFadeIn(audio, soundEffect) {
    if (!audio || !soundEffect?.fadeInDurationMs) {
      return;
    }

    const fadeInDurationMs = soundEffect.fadeInDurationMs;
    const targetVolume = soundEffect.volume;
    const fadeStartTime = performance.now();

    const step = (timestamp) => {
      if (audio.paused) {
        return;
      }

      const elapsed = timestamp - fadeStartTime;
      const progress = clamp(elapsed / fadeInDurationMs, 0, 1);
      audio.volume = targetVolume * progress;

      if (progress < 1) {
        window.requestAnimationFrame(step);
        return;
      }

      audio.volume = targetVolume;
    };

    window.requestAnimationFrame(step);
  }

  function scheduleSoundEffectFadeOut(audio, soundEffect) {
    if (!audio || !soundEffect?.fadeOutDurationMs) {
      return;
    }

    const scheduleFade = () => {
      if (!Number.isFinite(audio.duration) || audio.duration <= 0) {
        return;
      }

      const totalDurationMs = audio.duration * 1000;
      const fadeOutDurationMs = Math.min(soundEffect.fadeOutDurationMs, totalDurationMs);
      const fadeStartDelayMs = Math.max(0, totalDurationMs - fadeOutDurationMs);
      const startVolume = soundEffect.volume;

      window.setTimeout(() => {
        const fadeStartTime = performance.now();

        const step = (timestamp) => {
          if (audio.paused) {
            return;
          }

          const elapsed = timestamp - fadeStartTime;
          const progress = clamp(elapsed / fadeOutDurationMs, 0, 1);
          const easedProgress = 1 - Math.pow(1 - progress, 3);
          audio.volume = startVolume * (1 - easedProgress);

          if (progress < 1) {
            window.requestAnimationFrame(step);
            return;
          }

          audio.volume = 0;
        };

        window.requestAnimationFrame(step);
      }, fadeStartDelayMs);
    };

    if (audio.readyState >= 1) {
      scheduleFade();
      return;
    }

    audio.addEventListener("loadedmetadata", scheduleFade, { once: true });
  }

  function startLoopingSoundEffect(audio) {
    if (!audio) {
      return;
    }

    audio.currentTime = 0;
    audio.volume = 0;
    audio.play().catch((error) => {
      console.warn("Не удалось запустить зацикленный звуковой эффект.", error);
    });
    fadeInLoopingSoundEffect(audio);
  }

  function fadeInLoopingSoundEffect(audio) {
    const targetVolume = Number(audio?.dataset?.targetVolume || 0);
    const fadeInDurationMs = Number(audio?.dataset?.fadeInDurationMs || 0);

    if (!audio || fadeInDurationMs <= 0) {
      audio.volume = targetVolume;
      return;
    }

    const fadeStartTime = performance.now();

    const step = (timestamp) => {
      if (audio.paused) {
        return;
      }

      const progress = clamp((timestamp - fadeStartTime) / fadeInDurationMs, 0, 1);
      audio.volume = targetVolume * progress;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }

  function tweenBirdsChirpingAmbienceVolume(targetVolume, durationMs) {
    const audio = birdsChirpingAmbienceSound;

    if (!audio) {
      return;
    }

    const safeTargetVolume = clamp(targetVolume, 0, 1);

    if (birdsChirpingVolumeTweenFrame) {
      window.cancelAnimationFrame(birdsChirpingVolumeTweenFrame);
      birdsChirpingVolumeTweenFrame = null;
    }

    if (durationMs <= 0) {
      audio.volume = safeTargetVolume;
      return;
    }

    const startVolume = audio.volume;
    const tweenStartTime = performance.now();

    const step = (timestamp) => {
      if (audio.paused) {
        birdsChirpingVolumeTweenFrame = null;
        return;
      }

      const progress = clamp((timestamp - tweenStartTime) / durationMs, 0, 1);
      audio.volume = startVolume + (safeTargetVolume - startVolume) * progress;

      if (progress < 1) {
        birdsChirpingVolumeTweenFrame = window.requestAnimationFrame(step);
        return;
      }

      audio.volume = safeTargetVolume;
      birdsChirpingVolumeTweenFrame = null;
    };

    birdsChirpingVolumeTweenFrame = window.requestAnimationFrame(step);
  }

  function stopLoopingSoundEffect(audio) {
    if (!audio) {
      return;
    }

    audio.pause();
    audio.currentTime = 0;
  }

  function scheduleRetroErrorSoundStop(activeToken) {
    clearRetroErrorStopTimeout();
    retroErrorStopTimeout = window.setTimeout(() => {
      if (creatorSequenceToken !== activeToken) {
        return;
      }

      stopLoopingSoundEffect(retroErrorSound);
      retroErrorStopTimeout = null;
    }, retroErrorLoopDurationMs);
  }

  function clearRetroErrorStopTimeout() {
    if (!retroErrorStopTimeout) {
      return;
    }

    window.clearTimeout(retroErrorStopTimeout);
    retroErrorStopTimeout = null;
  }

  function renderShell(title, note, innerContent) {
    const isCreatorScreen = state.screen === "creator";
    const isDialogueScreen = state.screen === "dialogue";
    const isEarthTransitionScreen = state.screen === "earthTransition";
    const isMapScreen = state.screen === "map";
    app.innerHTML = `
      <section
        class="game-shell ${isCreatorScreen ? "game-shell-creator" : ""} ${isDialogueScreen ? "game-shell-dialogue" : ""} ${isEarthTransitionScreen ? "game-shell-earth-transition" : ""} ${isMapScreen ? "game-shell-map" : ""}"
        ${isMapScreen ? `style="--creator-bg:url('${data.creatorUi.background}')"` : ""}
      >
        ${isCreatorScreen || isDialogueScreen || isEarthTransitionScreen || isMapScreen ? "" : `
        <header class="game-header">
          <div class="game-header-copy">
            <h1 class="game-header-title">${title}</h1>
            <p class="game-header-note">${note}</p>
          </div>
          <div class="game-header-line" aria-hidden="true"></div>
        </header>
        `}
        <div class="game-content">
          ${innerContent}
        </div>
      </section>
    `;
  }

  function renderLoadingScreen() {
    const progress = loadingState.total > 0
      ? Math.round((loadingState.loaded / loadingState.total) * 100)
      : 0;

    app.innerHTML = `
      <section class="boot-loading-screen" style="--creator-bg:url('${data.creatorUi.background}')">
        <div class="boot-loading-panel">
          <p class="boot-loading-kicker">Квест Сани</p>
          <h1 class="boot-loading-title">Готовим открытку к запуску</h1>
          <p class="boot-loading-copy">${loadingState.label}</p>
          <div class="boot-loading-meter" aria-label="Загрузка ресурсов">
            <span class="boot-loading-fill" style="width:${progress}%"></span>
          </div>
          <div class="boot-loading-meta">
            <span>${progress}%</span>
            <span>${loadingState.loaded} / ${loadingState.total || 0}</span>
          </div>
        </div>
      </section>
    `;
  }

  function collectAssetUrls(value, result = []) {
    if (!value) {
      return result;
    }

    if (typeof value === "string") {
      if (/^assets\//.test(value)) {
        result.push(value);
      }
      return result;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => collectAssetUrls(item, result));
      return result;
    }

    if (typeof value === "object") {
      Object.values(value).forEach((item) => collectAssetUrls(item, result));
    }

    return result;
  }

  function getCriticalAssetUrls() {
    const mapObjectImages = data.map.objects.map((object) => object.image).filter(Boolean);
    const mapMasks = Object.values(data.map.collisionMasks || {}).map((mask) => mask?.path).filter(Boolean);

    return Array.from(new Set([
      ...collectAssetUrls(data.creatorUi),
      ...collectAssetUrls(data.mapUi),
      ...collectAssetUrls(data.characterOutfits),
      ...collectAssetUrls(data.audio),
      data.map.backgroundImage,
      ...mapObjectImages,
      ...mapMasks
    ].filter(Boolean)));
  }

  function getSecondaryAssetUrls() {
    return [];
  }

  function isImageAsset(url) {
    return /\.(png|jpe?g|gif|webp|avif)(?:\?.*)?$/i.test(url);
  }

  function preloadImage(url) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = url;
    });
  }

  function warmAssetRequest(url) {
    return fetch(url, { cache: "force-cache" })
      .then((response) => response.ok)
      .catch(() => false);
  }

  function preloadCriticalAsset(url) {
    return warmAssetRequest(url)
      .then(() => isImageAsset(url) ? preloadImage(url) : true)
      .catch(() => false);
  }

  function updateLoadingProgress(label) {
    loadingState.loaded += 1;
    loadingState.label = label;
    renderLoadingScreen();
  }

  function preloadCriticalAssets() {
    const criticalAssets = getCriticalAssetUrls();
    loadingState.total = criticalAssets.length;
    loadingState.loaded = 0;
    loadingState.label = "Подгружаем картинки, спрайты и звук...";
    renderLoadingScreen();

    return Promise.allSettled(
      criticalAssets.map((url) => preloadCriticalAsset(url)
        .finally(() => updateLoadingProgress("Финально раскладываем детали сцены...")))
    );
  }

  function preloadSecondaryAssets() {
    getSecondaryAssetUrls().forEach((url) => {
      warmAssetRequest(url);
    });
  }

  function bootGame() {
    renderLoadingScreen();
    preloadCriticalAssets()
      .finally(() => {
        loadingState.complete = true;
        preloadSpriteImages();
        preloadTreeImages();
        preloadObjectImages();
        preloadMapImage();
        preloadCollisionMasks();
        setupAudioUnlock();
        preloadSecondaryAssets();
        render();
      });
  }

  function renderCreatorContent() {
    const usesHeavenTransitionLayout = ["restStatError", "heavenTransition", "heavenDialogue"].includes(state.currentScene);
    const verticalWorldClass = state.currentScene === "heavenTransition" || state.currentScene === "heavenDialogue"
      ? " to-heaven"
      : "";
    const heavenActiveClass = state.currentScene === "heavenDialogue" ? " is-active" : "";
    const creatorLeavingClass = state.currentScene === "heavenTransition" || state.currentScene === "heavenDialogue"
      ? " is-leaving"
      : "";
    const creatorScene = renderCharacterCreationScene(creatorLeavingClass);

    if (!usesHeavenTransitionLayout) {
      return creatorScene;
    }

    return `
      <div id="verticalWorld" class="vertical-world${verticalWorldClass}" data-role="vertical-world">
        <section
          id="heavenDialogueScene"
          class="heaven-dialogue-scene${heavenActiveClass}"
          data-role="heaven-dialogue-scene"
          style="--heaven-bg:url('${data.creatorUi.heavenBackground}')"
        >
          ${renderHeavenDialogueScene()}
        </section>
        <section id="characterCreationScene" class="character-creation-scene">
          ${creatorScene}
        </section>
      </div>
    `;
  }

  function renderCharacterCreationScene(extraClass = "") {
    const outfit = getSelectedOutfit();
    const currentIndex = getSelectedOutfitIndex();
    const totalOutfits = creatorOutfits.length;
    const currentAngelLine = getCurrentAngelLine(outfit);
    const isProcessing = state.currentScene !== "characterCreation";
    const showErrorPopup = state.currentScene === "restStatError";
    const displayAngelLine = getCreatorDisplayText(currentAngelLine);
    const displayChooseTitle = getCreatorDisplayText("Выбери прикид для Сани!");
    const displayOutfitName = getCreatorDisplayText(outfit.name);
    const displayOutfitDescription = getCreatorDisplayText(outfit.description);
    const displayCounterText = getCreatorDisplayText(`${currentIndex + 1} / ${totalOutfits}`);
    const decorGlitchClass = state.creatorDecorGlitchOut ? " creator-decor-glitch-out" : "";

    return `
      <section
        class="creator-screen${extraClass} ${isProcessing ? "creator-screen-processing" : ""} ${state.creatorGlitchActive ? "creator-screen-glitching" : ""}"
        style="--creator-bg:url('${data.creatorUi.background}')"
      >
        <div class="creator-scene ${state.creatorGlitchActive ? "creator-scene-shake" : ""}">
          <div class="creator-top">
            <div class="creator-sign" aria-hidden="true"></div>
            <div class="creator-godline" aria-hidden="true"></div>
          </div>

          <div class="creator-board ${state.creatorDecorGlitchOut ? "creator-board-glitch-out" : ""}" style="--outer-panel:url('${data.creatorUi.outerPanel}')">
            <div class="creator-board-decor">
              ${state.creatorDecorHidden ? "" : `
              <div class="creator-sign creator-sign-on-board${decorGlitchClass}" style="--sign-image:url('${data.creatorUi.woodSign}')"></div>
              <div class="creator-bubble creator-bubble-on-board${decorGlitchClass}" style="--bubble-image:url('${data.creatorUi.speechBubble}')">
                <p class="creator-bubble-text" data-scramble-text>${displayAngelLine}</p>
              </div>
              <img class="creator-god-sprite creator-god-sprite-on-board${decorGlitchClass}" src="${data.creatorUi.godSprite}" alt="" />
              `}
            </div>
            <div class="creator-panels">
              <section class="creator-panel-card creator-outfit-panel" style="--panel-image:url('${data.creatorUi.leftPanel}')">
                <header class="creator-panel-header">
                  <h2 data-scramble-text>${displayChooseTitle}</h2>
                </header>
                <div class="creator-outfit-box" style="--inner-box:url('${data.creatorUi.innerCharacterBox}')">
                  <div class="creator-counter" style="--counter-plate:url('${data.creatorUi.counterPlate}')">
                    <span data-scramble-text>${displayCounterText}</span>
                  </div>
                  <div class="creator-showcase">
                    <button
                      class="outfit-arrow outfit-arrow-left"
                      type="button"
                      aria-label="Предыдущий прикид"
                      data-action="previous-outfit"
                      ${isProcessing ? "disabled" : ""}
                      style="--arrow-image:url('${data.creatorUi.arrowButton}')"
                    ></button>
                    <div class="creator-preview-wrap">
                      ${renderCharacterPreview()}
                    </div>
                    <button
                      class="outfit-arrow outfit-arrow-right"
                      type="button"
                      aria-label="Следующий прикид"
                      data-action="next-outfit"
                      ${isProcessing ? "disabled" : ""}
                      style="--arrow-image:url('${data.creatorUi.arrowButton}')"
                    ></button>
                  </div>
                  <div class="creator-description-card" style="--description-image:url('${data.creatorUi.descriptionCard}')">
                    <h3 data-scramble-text>${displayOutfitName}</h3>
                    <p data-scramble-text>${displayOutfitDescription}</p>
                  </div>
                </div>
              </section>

              <section class="creator-panel-card creator-stats-panel" style="--panel-image:url('${data.creatorUi.rightPanel}')">
                <div class="creator-stats-list">
                  ${renderOutfitStats(outfit)}
                </div>
              </section>
            </div>

            <div class="creator-actions">
              <button
                class="creator-select-button ${isProcessing ? "is-locked is-pressed" : ""}"
                type="button"
                data-action="create-character"
                ${isProcessing ? "disabled" : ""}
              >
                <span class="visually-hidden">Выбрать этот прикид</span>
              </button>
            </div>
          </div>
          <div class="creator-processing-overlay" aria-hidden="true"></div>
          <div class="creator-scanlines" aria-hidden="true"></div>
          ${showErrorPopup ? renderRestStatErrorPopup() : ""}
        </div>
      </section>
    `;
  }

  function renderHeavenDialogueScene() {
    const line = data.dialogue[state.dialogueIndex] || data.dialogue[0];
    const angelIsSpeaking = line.speaker === "Ангелочек";
    const godIsSpeaking = line.speaker === "Боженька";
    const angelSprite = getCurrentHeavenAngelSprite();
    const godSprite = getCurrentHeavenGodSprite();

    return `
      <div class="heaven-ui heaven-sprite heaven-sprite-god ${godIsSpeaking ? "is-speaking" : ""}" data-role="sprite-god">
        <img src="${godSprite}" alt="Боженька" />
      </div>
      <div class="heaven-ui heaven-sprite heaven-sprite-angel ${angelIsSpeaking ? "is-speaking" : ""}" data-role="sprite-angel">
        <img src="${angelSprite}" alt="Ангелочек" />
      </div>
      ${godIsSpeaking ? renderHeavenBubble("god", "Боженька", line.text) : ""}
      ${angelIsSpeaking ? renderHeavenBubble("angel", "Ангелочек", line.text) : ""}
      <button
        class="heaven-ui heaven-next"
        data-action="next-dialogue"
        type="button"
        style="
          --heaven-next-button:url('${data.creatorUi.heavenNextButton}');
          --heaven-next-button-hover:url('${data.creatorUi.heavenNextButtonHover}');
          --heaven-next-button-pressed:url('${data.creatorUi.heavenNextButtonPressed}');
        "
        ${state.heavenBubbleExiting ? "disabled" : ""}
      >
        <span>Дальше</span>
      </button>
    `;
  }

  function renderHeavenBubble(owner, speaker, text) {
    const visibleText = getHeavenVisibleText(text);
    return `
      <div
        class="heaven-ui heaven-bubble heaven-bubble-${owner} is-active ${state.heavenBubbleExiting ? "is-exiting" : ""}"
        data-role="${owner}-bubble"
        style="--heaven-bubble:url('${data.creatorUi.heavenBubble}')"
      >
        <div class="heaven-bubble-content">
          <p class="heaven-speaker">${speaker}</p>
          <p class="heaven-dialogue-text" data-role="heaven-dialogue-text">${visibleText}</p>
        </div>
      </div>
    `;
  }

  function getCurrentHeavenAngelSprite() {
    const pose = getCurrentHeavenAngelPose();
    const spriteByPose = {
      surprised: data.creatorUi.heavenAngelSurprised,
      hands: data.creatorUi.heavenAngelHands,
      smile: data.creatorUi.heavenAngel
    };

    return spriteByPose[pose] || data.creatorUi.heavenAngel;
  }

  function getCurrentHeavenAngelPose() {
    for (let index = state.dialogueIndex; index >= 0; index -= 1) {
      const pose = data.dialogue[index]?.angelPose;

      if (pose) {
        return pose;
      }
    }

    return "surprised";
  }

  function getCurrentHeavenGodSprite() {
    const pose = getCurrentHeavenGodPose();
    const spriteByPose = {
      smile: data.creatorUi.heavenGod,
      thoughtful: data.creatorUi.heavenGodThoughtful,
      idea: data.creatorUi.heavenGodIdea,
      happy: data.creatorUi.heavenGodHappy,
      flask: data.creatorUi.heavenGodFlask,
      pointing: data.creatorUi.heavenGodPointing
    };

    return spriteByPose[pose] || data.creatorUi.heavenGod;
  }

  function getCurrentHeavenGodPose() {
    for (let index = state.dialogueIndex; index >= 0; index -= 1) {
      const pose = data.dialogue[index]?.godPose;

      if (pose) {
        return pose;
      }
    }

    return "smile";
  }

  function getHeavenVisibleText(text) {
    if (state.heavenTextComplete) {
      return text;
    }

    return getHeavenTextChunks(text).slice(0, state.heavenTextVisibleChunks).join("");
  }

  function startHeavenTextTyping() {
    clearHeavenTextTyping();

    const line = data.dialogue[state.dialogueIndex];
    const textChunks = getHeavenTextChunks(line?.text || "");
    state.heavenTextVisibleChunks = 0;
    state.heavenTextComplete = textChunks.length === 0;
    updateHeavenDialogueText();

    if (state.heavenTextComplete) {
      return;
    }

    heavenTextInterval = window.setInterval(() => {
      state.heavenTextVisibleChunks += 1;

      if (state.heavenTextVisibleChunks >= textChunks.length) {
        completeHeavenTextTyping();
        return;
      }

      updateHeavenDialogueText();
    }, 92);
  }

  function completeHeavenTextTyping() {
    clearHeavenTextTyping();
    const line = data.dialogue[state.dialogueIndex];
    state.heavenTextVisibleChunks = getHeavenTextChunks(line?.text || "").length;
    state.heavenTextComplete = true;
    updateHeavenDialogueText();
  }

  function getHeavenTextChunks(text) {
    return Array.from(text.match(/.{1,3}/gu) || []);
  }

  function clearHeavenTextTyping() {
    if (!heavenTextInterval) {
      return;
    }

    window.clearInterval(heavenTextInterval);
    heavenTextInterval = null;
  }

  function updateHeavenDialogueText() {
    const textElement = app.querySelector("[data-role='heaven-dialogue-text']");
    const line = data.dialogue[state.dialogueIndex];

    if (!textElement || !line) {
      return;
    }

    textElement.textContent = getHeavenVisibleText(line.text);
  }

  function renderCharacterPreview() {
    const outfit = getSelectedOutfit();

    if (!outfit) {
      return `<div class="pixel-preview-shell"><div class="pixel-fallback">Саня временно невидим</div></div>`;
    }

    return `
      <div class="pixel-preview-shell" aria-label="Превью персонажа">
        <img class="pixel-preview" src="${outfit.sprite || outfit.image}" alt="${outfit.name}" />
      </div>
    `;
  }

  function renderOutfitStats(outfit) {
    return (outfit.stats || [])
      .map(
        (stat) => `
          <article class="outfit-stat-card" style="--stat-row-panel:url('${data.creatorUi.statRowPanel}')">
            <div class="outfit-stat-icon">
              ${stat.iconImage
                ? `<img class="outfit-stat-icon-image" src="${stat.iconImage}" alt="" />`
                : stat.icon}
            </div>
            <div class="outfit-stat-copy">
              <span class="outfit-stat-label" data-scramble-text>${getCreatorDisplayText(stat.label)}</span>
              <strong class="outfit-stat-value">${stat.value}</strong>
            </div>
          </article>
        `
      )
      .join("");
  }

  function getCreatorDisplayText(text) {
    if (state.currentScene === "characterCreation") {
      return text;
    }

    return createCorruptedText(text);
  }

  function createCorruptedText(text) {
    return Array.from(text || "", (character) => (character === " " ? " " : "?")).join("");
  }

  function renderRestStatErrorPopup() {
    return `
      <div class="error-popup" data-role="error-popup" aria-hidden="true">
        <img class="error-popup-image error-popup-dark" src="${data.creatorUi.errorPopupDark}" alt="" />
        <img class="error-popup-image error-popup-bright" src="${data.creatorUi.errorPopupBright}" alt="" />
      </div>
    `;
  }

  function bindCreatorEvents() {
    const previousButton = app.querySelector("[data-action='previous-outfit']");
    const nextButton = app.querySelector("[data-action='next-outfit']");
    const createButton = app.querySelector("[data-action='create-character']");

    cacheOriginalTexts();

    if (previousButton) {
      previousButton.addEventListener("click", () => {
        if (state.currentScene !== "characterCreation") {
          return;
        }
        playSoundEffect(outfitArrowClickSound);
        cycleSelectedOutfit(-1);
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", () => {
        if (state.currentScene !== "characterCreation") {
          return;
        }
        playSoundEffect(outfitArrowClickSound);
        cycleSelectedOutfit(1);
      });
    }

    if (!createButton) {
      return;
    }

    createButton.addEventListener("click", () => {
      if (state.currentScene !== "characterCreation") {
        return;
      }
      playSoundEffect(outfitArrowClickSound);
      state.playerAppearanceId = state.selectedOutfitId;
      startCharacterProcessingSequence();
    });
  }

  function cacheOriginalTexts() {
    app.querySelectorAll("[data-scramble-text]").forEach((element) => {
      if (!element.dataset.originalText) {
        element.dataset.originalText = normalizeScrambleText(element.textContent);
      }
    });
  }

  function normalizeScrambleText(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }

  function startCharacterProcessingSequence() {
    if (state.screen !== "creator" || state.currentScene !== "characterCreation") {
      return;
    }

    creatorSequenceToken += 1;
    clearErrorDialogueTimeout();
    clearRetroErrorStopTimeout();
    clearHeavenTransitionTimeouts();
    state.currentScene = "processingCharacter";
    state.creatorDecorGlitchOut = false;
    state.creatorDecorHidden = false;
    lockCharacterCreationUI();

    const activeToken = creatorSequenceToken;
    window.setTimeout(() => {
      if (creatorSequenceToken !== activeToken || state.screen !== "creator") {
        return;
      }

      showProcessingOverlay();
      showGlitchBeforeError();
      startCreatorDecorGlitchOut();
      startLoopingSoundEffect(retroErrorSound);
      scheduleRetroErrorSoundStop(activeToken);
      scrambleAllTexts();
    }, 900);

    window.setTimeout(() => {
      if (creatorSequenceToken !== activeToken || state.screen !== "creator") {
        return;
      }

      showRestStatError(activeToken);
    }, 2400);
  }

  function lockCharacterCreationUI() {
    const scene = app.querySelector(".creator-screen");
    const createButton = app.querySelector("[data-action='create-character']");

    scene?.classList.add("creator-screen-processing");

    app.querySelectorAll("[data-action='previous-outfit'], [data-action='next-outfit'], [data-action='create-character']")
      .forEach((button) => {
        button.disabled = true;
        button.setAttribute("aria-disabled", "true");
      });

    if (createButton) {
      createButton.classList.add("is-locked", "is-pressed");
    }
  }

  function showProcessingOverlay() {
    app.querySelector(".creator-processing-overlay")?.classList.add("is-visible");
  }

  function scrambleAllTexts() {
    app.querySelectorAll("[data-scramble-text]").forEach((element) => {
      scrambleText(element, 1500);
    });
  }

  function scrambleText(element, duration, finalText) {
    if (!element) {
      return;
    }

    const originalText = element.dataset.originalText || normalizeScrambleText(element.textContent);
    const targetText = typeof finalText === "string" ? finalText : createCorruptedText(originalText);
    const glyphPool = ".*#%/\\!?+-=<>:;0123456789";
    const startTime = performance.now();
    const originalChars = Array.from(originalText);
    const finalChars = Array.from(targetText);
    const maxLength = Math.max(originalChars.length, finalChars.length);
    const intervalMs = 52;

    if (element.scrambleFrame) {
      window.cancelAnimationFrame(Number(element.scrambleFrame));
    }

    element.style.minHeight = `${element.offsetHeight}px`;
    element.dataset.scrambling = "true";

    const renderScrambleFrame = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = clamp(elapsed / duration, 0, 1);
      const settledCharacters = Math.floor(progress * maxLength);

      const scrambledText = Array.from({ length: maxLength }, (_, index) => {
        const originalChar = originalChars[index] || " ";
        const finalChar = finalChars[index] || "?";

        if (originalChar === " " || finalChar === " ") {
          return " ";
        }

        if (index < settledCharacters) {
          return finalChar;
        }

        if (progress > 0.2 && Math.random() < progress * 0.65) {
          return "?";
        }

        if (elapsed % (intervalMs * 2) < intervalMs && /[А-Яа-яA-Za-z0-9]/.test(originalChar)) {
          return originalChars[(index + Math.ceil(progress * 3)) % originalChars.length] || originalChar;
        }

        return glyphPool[Math.floor(Math.random() * glyphPool.length)];
      }).join("");

      element.textContent = scrambledText;

      if (progress < 1) {
        const frameId = window.requestAnimationFrame(renderScrambleFrame);
        element.scrambleFrame = String(frameId);
        return;
      }

      element.textContent = targetText;
      element.dataset.scrambling = "false";
      element.scrambleFrame = "";
    };

    const frameId = window.requestAnimationFrame(renderScrambleFrame);
    element.scrambleFrame = String(frameId);
  }

  function showGlitchBeforeError() {
    state.creatorGlitchActive = true;
    const screen = app.querySelector(".creator-screen");
    const scene = app.querySelector(".creator-scene");
    const scanlines = app.querySelector(".creator-scanlines");

    screen?.classList.add("creator-screen-glitching");
    scene?.classList.add("creator-scene-shake");
    scanlines?.classList.add("is-visible");
  }

  function showRestStatError(activeToken = creatorSequenceToken) {
    if (state.screen !== "creator") {
      return;
    }

    playSoundEffect(errorPopupHitSound);
    state.creatorDecorHidden = true;
    state.currentScene = "restStatError";
    render();
    startErrorBlinking();
    scheduleDialogueAfterRestStatError(activeToken);
  }

  function startErrorBlinking() {
    const errorPopup = app.querySelector("[data-role='error-popup']");

    if (!errorPopup) {
      return;
    }

    window.requestAnimationFrame(() => {
      errorPopup.classList.add("is-visible");
    });
  }

  function startCreatorDecorGlitchOut() {
    state.creatorDecorGlitchOut = true;

    app.querySelectorAll(".creator-sign-on-board, .creator-bubble-on-board, .creator-god-sprite-on-board, .creator-board")
      .forEach((element) => {
        if (element.classList.contains("creator-board")) {
          element.classList.add("creator-board-glitch-out");
          return;
        }

        element.classList.add("creator-decor-glitch-out");
      });
  }

  function scheduleDialogueAfterRestStatError(activeToken) {
    clearErrorDialogueTimeout();
    errorDialogueTimeout = window.setTimeout(() => {
      if (
        creatorSequenceToken !== activeToken ||
        state.screen !== "creator" ||
        state.currentScene !== "restStatError"
      ) {
        return;
      }

      startHeavenTransition();
    }, errorPopupRevealDurationMs + errorDialogueDelayAfterRevealMs);
  }

  function clearErrorDialogueTimeout() {
    if (!errorDialogueTimeout) {
      return;
    }

    window.clearTimeout(errorDialogueTimeout);
    errorDialogueTimeout = null;
  }

  function clearHeavenTransitionTimeouts() {
    if (heavenActivationTimeout) {
      window.clearTimeout(heavenActivationTimeout);
      heavenActivationTimeout = null;
    }

    if (heavenDialogueTimeout) {
      window.clearTimeout(heavenDialogueTimeout);
      heavenDialogueTimeout = null;
    }
  }

  function clearEarthTransitionTimeouts() {
    if (earthMapPreviewTimeout) {
      window.clearTimeout(earthMapPreviewTimeout);
      earthMapPreviewTimeout = null;
    }

    if (earthMapPreviewExitTimeout) {
      window.clearTimeout(earthMapPreviewExitTimeout);
      earthMapPreviewExitTimeout = null;
    }

    if (earthMapStartTimeout) {
      window.clearTimeout(earthMapStartTimeout);
      earthMapStartTimeout = null;
    }
  }

  function startHeavenTransition() {
    clearErrorDialogueTimeout();
    clearHeavenTransitionTimeouts();

    if (state.screen !== "creator") {
      return;
    }

    const verticalWorld = app.querySelector("[data-role='vertical-world']");
    const heavenScene = app.querySelector("[data-role='heaven-dialogue-scene']");
    const characterScene = app.querySelector(".creator-screen");

    if (!verticalWorld || !heavenScene) {
      state.currentScene = "restStatError";
      render();
      window.requestAnimationFrame(startHeavenTransition);
      return;
    }

    state.currentScene = "heavenTransition";
    state.dialogueIndex = 0;
    characterScene?.classList.add("is-leaving");
    verticalWorld.classList.add("to-heaven");
    tweenBackgroundMusicVolume(heavenBackgroundMusicTargetVolume, heavenTransitionDurationMs);
    playSoundEffect(heavenVoicesIntroSound);
    startLoopingSoundEffect(birdsChirpingAmbienceSound);

    heavenActivationTimeout = window.setTimeout(() => {
      activateHeavenScene();
    }, 2800);

    heavenDialogueTimeout = window.setTimeout(() => {
      startHeavenDialogue();
    }, heavenTransitionDurationMs);
  }

  function activateHeavenScene() {
    const heavenScene = app.querySelector("[data-role='heaven-dialogue-scene']");
    heavenScene?.classList.add("is-active");
  }

  function startHeavenDialogue() {
    clearHeavenTransitionTimeouts();
    clearRetroErrorStopTimeout();
    stopLoopingSoundEffect(retroErrorSound);
    state.screen = "dialogue";
    state.currentScene = "heavenDialogue";
    state.dialogueIndex = 0;
    state.heavenBubbleExiting = false;
    state.heavenTextVisibleChunks = 0;
    state.heavenTextComplete = false;
    render();
    startHeavenTextTyping();
  }

  function startEarthTransition() {
    clearHeavenTextTyping();
    clearEarthTransitionTimeouts();
    state.screen = "earthTransition";
    state.currentScene = "earthTransition";
    state.earthMapPreviewVisible = false;
    state.heavenBubbleExiting = false;
    state.heavenTextComplete = true;
    render();
  }

  function startEarthTransitionAnimation() {
    const earthWorld = app.querySelector("[data-role='earth-world']");

    if (!earthWorld || earthWorld.dataset.transitionStarted === "true") {
      return;
    }

    earthWorld.dataset.transitionStarted = "true";
    window.requestAnimationFrame(() => {
      earthWorld.classList.add("to-earth");
    });
    tweenBackgroundMusicVolume(earthBackgroundMusicTargetVolume, earthTransitionDurationMs);
    tweenBirdsChirpingAmbienceVolume(Number(birdsChirpingAmbienceSound?.dataset?.earthVolume || 0.12), birdsChirpingEarthFadeDurationMs);

    earthMapPreviewTimeout = window.setTimeout(() => {
      state.earthMapPreviewVisible = true;
      app.querySelector("[data-role='earth-map-preview']")?.classList.add("is-visible");
    }, earthMapPreviewDelayMs);

    earthMapPreviewExitTimeout = window.setTimeout(() => {
      app.querySelector("[data-role='earth-map-preview']")?.classList.add("is-exiting");
    }, earthMapPreviewExitDelayMs);

    earthMapStartTimeout = window.setTimeout(() => {
      finishEarthTransition();
    }, earthTransitionDurationMs + 420);
  }

  function finishEarthTransition() {
    clearEarthTransitionTimeouts();
    state.screen = "map";
    state.currentScene = "map";
    state.earthMapPreviewVisible = false;
    state.mapIntroActive = true;
    state.mapMessageVisible = true;
    state.mapMessageHiding = false;
    state.mapIntroMessagePending = true;
    render();
    showMapMessage();
    startWaterStreamAmbience();
    updateWaterStreamAmbienceVolume();

    window.setTimeout(() => {
      state.mapIntroActive = false;
      app.querySelector("[data-role='map-screen']")?.classList.remove("is-entering");
    }, 1100);
  }

  function renderDialogueContent() {
    return `
      <section
        id="heavenDialogueScene"
        class="heaven-dialogue-scene standalone is-active"
        style="--heaven-bg:url('${data.creatorUi.heavenBackground}')"
      >
        ${renderHeavenDialogueScene()}
      </section>
    `;
  }

  function renderEarthTransitionContent() {
    return `
      <div class="earth-world" data-role="earth-world">
        <section
          id="heavenDialogueScene"
          class="heaven-dialogue-scene earth-transition-heaven is-active"
          style="--heaven-bg:url('${data.creatorUi.heavenBackground}')"
        >
          ${renderHeavenSceneSnapshot()}
        </section>
        <section
          class="earth-map-scene"
          style="--creator-bg:url('${data.creatorUi.background}')"
        >
          <div class="earth-map-preview ${state.earthMapPreviewVisible ? "is-visible" : ""}" data-role="earth-map-preview">
            <div class="earth-map-preview-frame">
              <span>Первый квест Сани на Земле</span>
            </div>
          </div>
        </section>
      </div>
    `;
  }

  function renderHeavenSceneSnapshot() {
    const previousDialogueIndex = state.dialogueIndex;
    const previousTextComplete = state.heavenTextComplete;
    const previousTextVisibleChunks = state.heavenTextVisibleChunks;

    state.heavenTextComplete = true;
    state.heavenTextVisibleChunks = getHeavenTextChunks(data.dialogue[state.dialogueIndex]?.text || "").length;
    const content = renderHeavenDialogueScene();
    state.heavenTextComplete = previousTextComplete;
    state.heavenTextVisibleChunks = previousTextVisibleChunks;
    state.dialogueIndex = previousDialogueIndex;

    return content;
  }

  function bindDialogueEvents() {
    app.querySelector("[data-action='next-dialogue']").addEventListener("click", () => {
      if (state.heavenBubbleExiting) {
        return;
      }

      playSoundEffect(heavenDialogueClickSound);

      if (!state.heavenTextComplete) {
        completeHeavenTextTyping();
        return;
      }

      if (state.dialogueIndex < data.dialogue.length - 1) {
        clearHeavenTextTyping();
        state.heavenBubbleExiting = true;
        render();
        window.setTimeout(() => {
          state.dialogueIndex += 1;
          state.heavenBubbleExiting = false;
          state.heavenTextVisibleChunks = 0;
          state.heavenTextComplete = false;
          render();
          startHeavenTextTyping();
        }, 160);
      } else {
        startEarthTransition();
      }
    });
  }

  function renderCastCard(name, portrait, active) {
    return `
      <div class="novel-character ${active ? "active" : ""}">
        <div>
          <div class="novel-portrait">${portrait}</div>
          <h3>${name}</h3>
          <p class="small-muted">${active ? "Сейчас говорит" : "Ждёт реплику"}</p>
        </div>
      </div>
    `;
  }

  function renderMapContent() {
    const mapUi = data.mapUi;
    const activeItem = state.activeItem ? data.items[state.activeItem] : null;

    return `
      <section
        class="map-screen ${state.mapIntroActive ? "is-entering" : ""}"
        data-role="map-screen"
        style="
          --creator-bg:url('${data.creatorUi.background}');
          --map-frame:url('${mapUi.frame}');
          --map-rest-panel:url('${mapUi.restPanel}');
          --map-rest-leaf-full:url('${mapUi.restLeafFull}');
          --map-rest-leaf-empty:url('${mapUi.restLeafEmpty}');
          --map-goals-panel:url('${mapUi.goalsPanel}');
          --map-check-done:url('${mapUi.goalCheckDone}');
          --map-check-empty:url('${mapUi.goalCheckEmpty}');
          --map-active-panel:url('${mapUi.activeItemPanel}');
          --map-inventory-panel:url('${mapUi.inventoryPanel}');
          --map-inventory-slot:url('${mapUi.inventorySlot}');
          --map-speech-bubble:url('${mapUi.speechBubble}');
          --map-letter-panel:url('${mapUi.letterPanel}');
        "
      >
        <div class="map-playfield">
          <div class="map-canvas-wrap">
            <canvas id="game-canvas" aria-label="Игровая карта"></canvas>
            <div class="map-speech-bubble ${state.mapMessageVisible ? "is-visible" : ""} ${state.mapMessageHiding ? "is-hiding" : ""}" data-role="map-speech-bubble">
              <p>${state.message}</p>
            </div>
          </div>

          <section class="map-rest-widget" aria-label="Отдых ${state.rest} из 100">
            <span>Отдых</span>
            <div class="map-rest-leaves" aria-hidden="true">
              ${renderMapRestLeaves()}
            </div>
            <strong>${state.rest}/100</strong>
          </section>

          <section
            class="map-goals-widget ${state.mapGoalsShifted ? "is-shifted-down" : ""}"
            data-role="map-goals-widget"
            style="--map-goals-shift-y:${state.mapGoalsShiftY}px"
          >
            <h2>Квест: собрать стату отдыха</h2>
            ${renderMapGoalsContent()}
          </section>

          <div class="map-bottom-hud">
            <section class="map-active-item-widget">
              <span>В руках:</span>
              <strong>${activeItem ? activeItem.name : "пусто"}</strong>
              <div class="map-active-icon">
                ${renderMapItemIcon(activeItem)}
              </div>
            </section>

            <section class="map-inventory-widget" aria-label="Рюкзак">
              ${renderMapInventorySlots()}
            </section>
          </div>

          <div class="map-frame-overlay" aria-hidden="true"></div>
          ${state.letterOpen ? renderLetterPanel() : ""}
          <pre id="map-debug-state" style="display:none">${escapeHtml(JSON.stringify(getMapDebugState()))}</pre>
        </div>
      </section>
    `;
  }

  function renderLetterPanel() {
    return `
      <div class="map-letter-overlay" role="dialog" aria-modal="true" aria-label="Письмо">
        <button class="map-letter-backdrop" type="button" data-action="close-letter" aria-label="Закрыть письмо"></button>
        <section class="map-letter-panel">
          <button class="map-letter-close" type="button" data-action="close-letter" aria-label="Закрыть письмо">×</button>
          <div class="map-letter-text">
            <p>Саня успешно завершил квест!</p>
            <p>Награды:<br>
            +100 к уюту<br>
            +50 к счастливым воспоминаниям<br>
            +доступ к новому году жизни ✨</p>
            <p>С днём рождения тебя 💛<br>
            Я самый счастливый человек, потому что могу проходить эту жизнь рядом с тобой. Ты делаешь её спокойнее, смешнее, теплее и намного-намного лучше.</p>
          </div>
        </section>
      </div>
    `;
  }

  function renderMapRestLeaves() {
    const totalLeaves = 10;
    const filledLeaves = Math.floor(clamp(state.rest, 0, 100) / 10);

    return Array.from({ length: totalLeaves }, (_, index) => {
      const className = index < filledLeaves ? "is-full" : "is-empty";
      return `<span class="map-rest-leaf ${className}"></span>`;
    }).join("");
  }

  function renderMapGoalsContent() {
    const goals = getQuestRows();

    return `
      <div class="map-goals-list">
        ${goals
          .map((goal) => `
            <div class="map-goal-row ${goal.done ? "is-done" : ""}">
              <span class="map-goal-check" aria-hidden="true"></span>
              <span class="map-goal-label">${goal.label}</span>
              <strong>${goal.current}/${goal.total}</strong>
            </div>
          `)
          .join("")}
      </div>
    `;
  }

  function getQuestRows() {
    return data.achievements.map((achievement) => {
      const current = getQuestProgress(achievement.id);
      return {
        id: achievement.id,
        label: achievement.label,
        current,
        total: achievement.total,
        done: current >= achievement.total
      };
    });
  }

  function getQuestProgress(questId) {
    switch (questId) {
      case "restPlaces":
        return Object.keys(state.quests.restPlaces.found).length;
      case "campfire":
        return Math.min(state.quests.campfire.woodCollected, 3) + (state.quests.campfire.lit ? 1 : 0);
      case "flowers":
        return (
          Math.min(state.quests.flowers.flowersCollected, 5) +
          (state.quests.flowers.vaseFound ? 1 : 0) +
          (state.quests.flowers.vasePlaced ? 1 : 0) +
          (state.quests.flowers.bouquetPlaced ? 1 : 0)
        );
      case "nature":
        return Math.min(state.quests.nature.birchesChopped, 5);
      case "fruit":
        return Math.min(state.quests.fruit.applesCollected, 5);
      default:
        return 0;
    }
  }

  function renderMapInventorySlots() {
    const visibleItems = Object.values(data.items).filter((item) => (state.inventory[item.id] || 0) > 0);
    const slotCount = 6;

    return Array.from({ length: slotCount }, (_, index) => {
      const item = visibleItems[index];

      if (!item) {
        return `<div class="map-inventory-slot is-empty" aria-hidden="true"></div>`;
      }

      const amount = state.inventory[item.id] || 0;
      const selectedClass = state.activeItem === item.id ? " is-active" : "";

      return `
        <button
          class="map-inventory-slot${selectedClass}"
          type="button"
          data-action="select-item"
          data-item="${item.id}"
          aria-label="${item.name}: ${amount}"
        >
          ${renderMapItemIcon(item)}
          <span>${amount}</span>
        </button>
      `;
    }).join("");
  }

  function renderMapItemIcon(item) {
    if (!item) {
      return "";
    }

    const iconByItem = {
      axe: data.mapUi.axe,
      vase: data.mapUi.vaseInventory,
      flowers: data.mapUi.flowerInventory,
      wood: data.mapUi.woodInventory,
      apples: data.mapUi.appleInventory
    };
    const iconImage = iconByItem[item.id];

    if (iconImage) {
      return `<img src="${iconImage}" alt="" />`;
    }

    return `<span class="map-item-emoji">${item.icon}</span>`;
  }

  function renderMapLoadingContent() {
    return `
      <section class="map-screen map-loading-screen" style="--creator-bg:url('${data.creatorUi.background}'); --map-frame:url('${data.mapUi.frame}');">
        <div class="map-loading-card">
          <h2>Подгружаем карту</h2>
          <p class="small-muted">Пиксельная трава и озеро уже почти на месте.</p>
        </div>
      </section>
    `;
  }

  function bindMapUiEvents() {
    app.querySelectorAll("[data-action='select-sidebar-tab']").forEach((button) => {
      button.addEventListener("click", () => {
        state.mapSidebarTab = button.dataset.tab;
        render();
      });
    });

    app.querySelectorAll("[data-action='select-item']").forEach((button) => {
      button.addEventListener("click", () => {
        const itemId = button.dataset.item;
        playSoundEffect(heavenDialogueClickSound);

        if (state.inventory[itemId] <= 0) {
          setMessage(`Сначала нужно найти предмет: ${data.items[itemId].name}.`);
          render();
          return;
        }
        state.activeItem = state.activeItem === itemId ? null : itemId;
        render();
      });
    });

    app.querySelectorAll("[data-action='close-letter']").forEach((button) => {
      button.addEventListener("click", () => {
        state.letterOpen = false;
        render();
      });
    });
  }

  function renderSidebarTabContent() {
    if (state.mapSidebarTab === "achievements") {
      return `
        <div class="achievement-grid compact-grid">
          ${getQuestRows()
            .map((achievement) => {
              const done = achievement.done;
              return `
                <div class="achievement-item ${done ? "done" : ""}">
                  <span>${done ? "[✓]" : "[ ]"}</span>
                  <span>${achievement.label} ${achievement.current}/${achievement.total}</span>
                </div>
              `;
            })
            .join("")}
        </div>
      `;
    }

    return `
      <div class="inventory-grid compact-grid">
        ${Object.values(data.items)
          .map((item) => {
            const amount = state.inventory[item.id];
            const label = `${item.icon} ${item.name}: ${amount}`;
            return `
              <button class="inventory-item ${state.activeItem === item.id ? "active" : ""}" data-action="select-item" data-item="${item.id}">
                ${label}
              </button>
            `;
          })
          .join("")}
      </div>
    `;
  }

  function setupCanvas() {
    canvas = document.getElementById("game-canvas");
    if (!canvas) {
      return;
    }

    ctx = canvas.getContext("2d");
    syncCanvasSize();
    if (!canvas.dataset.bound) {
      canvas.addEventListener("click", handleCanvasClick);
      canvas.dataset.bound = "true";
    }

    if (!controlsBound) {
      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      window.addEventListener("resize", handleResize);
      controlsBound = true;
    }
  }

  function handleCanvasClick(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    const worldX = state.camera.x + x / state.mapZoom;
    const worldY = state.camera.y + y / state.mapZoom;

    const object = findObjectAt(worldX, worldY);
    if (object) {
      movePlayerToObject(object, worldX, worldY);
      return;
    }

    const clampedTarget = clampPositionToBounds(worldX, worldY);
    setPlayerMovementDestination(clampedTarget.x, clampedTarget.y);
  }

  function movePlayerToObject(object, targetX = object.x, targetY = object.y) {
    if (isPlayerCloseEnoughToObject(object)) {
      state.player.targetX = state.player.x;
      state.player.targetY = state.player.y;
      state.player.pendingAction = null;
      state.player.followUpTarget = null;
      state.pendingCollision = null;
      executeObjectAction(object);
      return;
    }

    const approachPoint = getApproachPoint(object, targetX, targetY);
    setPlayerMovementDestination(
      approachPoint.x,
      approachPoint.y,
      { objectId: object.id },
      { type: "object", objectId: object.id, clickX: targetX, clickY: targetY }
    );
  }

  function setPlayerMovementDestination(targetX, targetY, pendingAction = null, followUpTarget = null) {
    const movementPlan = getReachableTarget(state.player.x, state.player.y, targetX, targetY);
    const canDetour = Boolean(movementPlan.collision);

    if (canDetour) {
      const detourWaypoint = findDetourWaypoint(state.player.x, state.player.y, targetX, targetY);
      if (detourWaypoint) {
        state.player.targetX = detourWaypoint.x;
        state.player.targetY = detourWaypoint.y;
        state.player.pendingAction = null;
        state.player.followUpTarget = followUpTarget || { type: "point", x: targetX, y: targetY };
        state.pendingCollision = null;
        return;
      }
    }

    state.player.targetX = movementPlan.x;
    state.player.targetY = movementPlan.y;
    state.player.pendingAction = pendingAction;
    state.player.followUpTarget = null;
    state.pendingCollision = movementPlan.collision || null;
  }

  function findDetourWaypoint(fromX, fromY, targetX, targetY) {
    const baseAngle = Math.atan2(targetY - fromY, targetX - fromX);
    const angleOffsets = [90, -90, 60, -60, 120, -120, 45, -45, 135, -135, 180];
    const radii = [56, 84, 112, 140, 168];
    let bestWaypoint = null;
    let bestScore = Number.POSITIVE_INFINITY;

    for (const radius of radii) {
      for (const offset of angleOffsets) {
        const angle = baseAngle + (offset * Math.PI) / 180;
        const candidate = clampPositionToBounds(
          fromX + Math.cos(angle) * radius,
          fromY + Math.sin(angle) * radius
        );
        const firstLeg = getReachableTarget(fromX, fromY, candidate.x, candidate.y);
        const firstLegDistance = Math.hypot(firstLeg.x - candidate.x, firstLeg.y - candidate.y);
        if (firstLeg.collision || firstLegDistance > data.map.playerSpeed * 1.5) {
          continue;
        }

        const secondLeg = getReachableTarget(candidate.x, candidate.y, targetX, targetY);
        if (secondLeg.collision) {
          continue;
        }

        const score =
          Math.hypot(candidate.x - targetX, candidate.y - targetY) +
          Math.hypot(candidate.x - fromX, candidate.y - fromY) * 0.2;
        if (score < bestScore) {
          bestScore = score;
          bestWaypoint = candidate;
        }
      }
    }

    return bestWaypoint;
  }

  function getApproachPoint(object, targetX = object.x, targetY = object.y) {
    if (object.topWalkRect && isPointInsideRect(targetX, targetY, object.topWalkRect)) {
      const bounds = getPlayerBounds();
      return {
        x: clamp(
          clamp(targetX, object.topWalkRect.x, object.topWalkRect.x + object.topWalkRect.width),
          bounds.minX,
          bounds.maxX
        ),
        y: clamp(
          clamp(targetY, object.topWalkRect.y, object.topWalkRect.y + object.topWalkRect.height),
          bounds.minY,
          bounds.maxY
        )
      };
    }

    if (object.bottomWalkRect) {
      const bounds = getPlayerBounds();
      return {
        x: clamp(
          clamp(targetX, object.bottomWalkRect.x, object.bottomWalkRect.x + object.bottomWalkRect.width),
          bounds.minX,
          bounds.maxX
        ),
        y: clamp(
          clamp(targetY, object.bottomWalkRect.y, object.bottomWalkRect.y + object.bottomWalkRect.height),
          bounds.minY,
          bounds.maxY
        )
      };
    }

    const dx = state.player.x - object.x;
    const dy = state.player.y - object.y;
    const length = Math.max(1, Math.hypot(dx, dy));
    const distance = object.radius + 18;
    const bounds = getPlayerBounds();
    return {
      x: clamp(object.x + (dx / length) * distance, bounds.minX, bounds.maxX),
      y: clamp(object.y + (dy / length) * distance, bounds.minY, bounds.maxY)
    };
  }

  function findObjectAt(x, y) {
    const objects = getVisibleObjects();
    return objects.find((object) => isObjectHit(object, x, y));
  }

  function isObjectHit(object, x, y) {
    if (object.hitBox) {
      return isPointInsideRect(x, y, object.hitBox);
    }

    const radiusScale = object.type === "tree" ? 1.15 : 1;
    return Math.hypot(x - object.x, y - object.y) <= object.radius * radiusScale;
  }

  function getVisibleObjects() {
    return state.mapObjects.filter((object) => {
      if (object.type === "axe" && object.collected) {
        return false;
      }
      if (object.type === "vase" && object.collected) {
        return false;
      }
      if (object.type === "flowers" && object.collected) {
        return false;
      }
      if (object.type === "tree" && object.chopped) {
        return false;
      }
      return true;
    });
  }

  function isPlayerCloseEnoughToObject(object) {
    const allowedDistance = (object.radius || 0) + data.map.interactDistance;
    return Math.hypot(state.player.x - object.x, state.player.y - object.y) <= allowedDistance;
  }

  function startMapLoop() {
    if (animationFrame) {
      return;
    }

    lastFrameTime = 0;

    const tick = (timestamp) => {
      const deltaTime = lastFrameTime ? timestamp - lastFrameTime : 16;
      lastFrameTime = timestamp;
      syncCanvasSize();
      updatePlayer(deltaTime);
      updateCamera();
      drawMap();
      animationFrame = window.requestAnimationFrame(tick);
    };

    animationFrame = window.requestAnimationFrame(tick);
  }

  function stopMapLoop() {
    if (animationFrame) {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    lastFrameTime = 0;
    stopWalkingSound();
  }

  function updatePlayer(deltaTime) {
    const movedByKeyboard = handleKeyboardMovement();
    updateWaterStreamAmbienceVolume();
    updateCampfireBurningAmbienceVolume();

    const dx = state.player.targetX - state.player.x;
    const dy = state.player.targetY - state.player.y;
    const distance = Math.hypot(dx, dy);

    if (distance > 0.01) {
      updatePlayerFacing(dx, dy);
    }

    if (distance > data.map.playerSpeed) {
      const attemptedX = state.player.x + (dx / distance) * data.map.playerSpeed;
      const attemptedY = state.player.y + (dy / distance) * data.map.playerSpeed;
      const collision = tryMovePlayerTo(attemptedX, attemptedY);
      updatePlayerAnimation(!collision, deltaTime);
      if (collision) {
        state.player.targetX = state.player.x;
        state.player.targetY = state.player.y;
        state.player.pendingAction = null;
      }
      return;
    }

    if (distance <= 0.01) {
      if (resumeFollowUpTarget()) {
        updatePlayerAnimation(movedByKeyboard, deltaTime);
        return;
      }

      if (state.pendingCollision) {
        handleMovementCollision(state.pendingCollision);
        state.pendingCollision = null;
      }
      updatePlayerAnimation(movedByKeyboard, deltaTime);
      return;
    }

    const collision = tryMovePlayerTo(state.player.targetX, state.player.targetY);
    updatePlayerAnimation(movedByKeyboard && !collision, deltaTime);
    if (collision) {
      state.player.targetX = state.player.x;
      state.player.targetY = state.player.y;
      state.player.pendingAction = null;
      state.pendingCollision = null;
      return;
    }

    if (state.player.pendingAction) {
      const object = state.mapObjects.find((entry) => entry.id === state.player.pendingAction.objectId);
      if (object && isPlayerCloseEnoughToObject(object)) {
        executeObjectAction(object);
      }
      state.player.pendingAction = null;
    }

    if (resumeFollowUpTarget()) {
      return;
    }

    if (state.pendingCollision) {
      handleMovementCollision(state.pendingCollision);
      state.pendingCollision = null;
    }
  }

  function handleKeyboardMovement() {
    if (!state.pressedKeys.size) {
      return false;
    }

    let nextX = state.player.x;
    let nextY = state.player.y;
    const verticalSpeed = data.map.playerSpeed * 1.18;

    if (state.pressedKeys.has("arrowup") || state.pressedKeys.has("w")) {
      nextY -= verticalSpeed;
    }
    if (state.pressedKeys.has("arrowdown") || state.pressedKeys.has("s")) {
      nextY += verticalSpeed;
    }
    if (state.pressedKeys.has("arrowleft") || state.pressedKeys.has("a")) {
      nextX -= data.map.playerSpeed;
    }
    if (state.pressedKeys.has("arrowright") || state.pressedKeys.has("d")) {
      nextX += data.map.playerSpeed;
    }

    const deltaX = nextX - state.player.x;
    const deltaY = nextY - state.player.y;
    if (deltaX || deltaY) {
      updatePlayerFacing(deltaX, deltaY);
    }

    const collision = tryMovePlayerTo(nextX, nextY);
    state.player.targetX = state.player.x;
    state.player.targetY = state.player.y;
    state.player.pendingAction = null;
    state.player.followUpTarget = null;
    state.pendingCollision = null;
    return Boolean((deltaX || deltaY) && !collision);
  }

  function resumeFollowUpTarget() {
    const followUpTarget = state.player.followUpTarget;
    if (!followUpTarget) {
      return false;
    }

    state.player.followUpTarget = null;

    if (followUpTarget.type === "object") {
      const object = state.mapObjects.find((entry) => entry.id === followUpTarget.objectId);
      if (!object) {
        return false;
      }

      movePlayerToObject(object, followUpTarget.clickX, followUpTarget.clickY);
      return true;
    }

    setPlayerMovementDestination(followUpTarget.x, followUpTarget.y);
    return true;
  }

  function updateCamera() {
    const visibleWidth = getVisibleWorldWidth();
    const visibleHeight = getVisibleWorldHeight();
    const maxCameraX = Math.max(0, data.map.worldWidth - visibleWidth);
    const maxCameraY = Math.max(0, data.map.worldHeight - visibleHeight);
    const targetCameraX = clamp(state.player.x - visibleWidth / 2, 0, maxCameraX);
    const targetCameraY = clamp(state.player.y - visibleHeight / 2, 0, maxCameraY);

    state.camera.targetX = targetCameraX;
    state.camera.targetY = targetCameraY;
    state.camera.x += (targetCameraX - state.camera.x) * data.map.cameraLerp;
    state.camera.y += (targetCameraY - state.camera.y) * data.map.cameraLerp;
    state.camera.x = clamp(state.camera.x, 0, maxCameraX);
    state.camera.y = clamp(state.camera.y, 0, maxCameraY);
  }

  function executeObjectAction(object) {
    // Объект обрабатывается только после того, как персонаж дошёл до нужной точки.
    switch (object.type) {
      case "tree":
        interactWithTree(object);
        break;
      case "flowers":
        collectFlowers(object);
        break;
      case "axe":
        collectAxe(object);
        break;
      case "vase":
        collectVase(object);
        break;
      case "river":
        setMessage(data.messages.river);
        render();
        break;
      case "house":
      case "toilet":
      case "bench":
      case "pier":
        discoverRestPlace(object);
        break;
      case "campfire":
        discoverRestPlace(object);
        tryLightCampfire(object);
        break;
      case "table":
        interactWithTable(object);
        break;
      case "mailbox":
        interactWithMailbox();
        break;
      default:
        render();
    }
  }

  function interactWithMailbox() {
    if (state.messageLimits.finished >= 1) {
      state.letterOpen = true;
      render();
      return;
    }

    showLimitedMessage("noMail", data.messages.noMail, 1);
    render();
  }

  function interactWithTree(object) {
    if (object.chopped) {
      setMessage(data.messages.treeAlreadyChopped);
      render();
      return;
    }

    if (isAppleTree(object) && state.activeItem !== "axe") {
      collectApple(object);
      return;
    }

    if (state.activeItem !== "axe") {
      showLimitedMessage(isBirchTree(object) ? "needAxeBirch" : "needAxe", isBirchTree(object) ? data.messages.needAxeBirch : data.messages.needAxe, 1);
      render();
      return;
    }

    object.chopHits += 1;
    playSoundEffect(axeHitWoodSound);
    const neededHits = isBirchTree(object) ? 5 : 30;

    if (object.chopHits < neededHits) {
      showTreeHitMessage(object);
      render();
      return;
    }

    object.chopped = true;
    state.inventory.wood += 1;

    if (state.quests.campfire.woodCollected < 3) {
      state.quests.campfire.woodCollected += 1;
      addRest(4);
    }

    if (isBirchTree(object) && state.quests.nature.birchesChopped < 5) {
      state.quests.nature.birchesChopped += 1;
      addRest(4);
    }

    setMessage(getTreeFinalMessage(object));
    checkEnding();
    render();
  }

  function collectFlowers(object) {
    if (object.collected) {
      render();
      return;
    }

    object.collected = true;
    playSoundEffect(pickupItemSound);
    state.inventory.flowers += 1;

    if (state.quests.flowers.flowersCollected < 5) {
      state.quests.flowers.flowersCollected += 1;
      addRest(2);
    }

    showLimitedMessage("flowersCollected", data.messages.gotFlowers, 3);
    checkEnding();
    render();
  }

  function collectAxe(object) {
    if (object.collected) {
      render();
      return;
    }

    object.collected = true;
    playSoundEffect(pickupItemSound);
    state.inventory.axe = 1;
    state.quests.nature.axeFound = true;
    setMessage(data.messages.foundAxe);
    render();
  }

  function collectVase(object) {
    if (object.collected) {
      render();
      return;
    }

    object.collected = true;
    playSoundEffect(pickupItemSound);
    state.inventory.vase = 1;
    if (!state.quests.flowers.vaseFound) {
      state.quests.flowers.vaseFound = true;
      addRest(5);
    }
    setMessage(data.messages.gotVase);
    checkEnding();
    render();
  }

  function collectApple(object) {
    if (object.appleCollected) {
      render();
      return;
    }

    object.appleCollected = true;
    playSoundEffect(pickupItemSound);
    state.inventory.apples += 1;

    if (state.quests.fruit.applesCollected < 5) {
      state.quests.fruit.applesCollected += 1;
      addRest(4);
    }

    setMessage(getRandomMessage(data.messagePools.appleCollected));
    checkEnding();
    render();
  }

  function showTreeHitMessage(object) {
    if (object.chopMessageShown) {
      return;
    }

    object.chopMessageShown = true;
    setMessage(getRandomMessage(isBirchTree(object) ? data.messagePools.birchHit : data.messagePools.regularTreeHit));
  }

  function getTreeFinalMessage(object) {
    return getRandomMessage(isBirchTree(object) ? data.messagePools.birchFinal : data.messagePools.regularTreeFinal);
  }

  function getRandomMessage(messages) {
    if (!Array.isArray(messages) || !messages.length) {
      return "";
    }

    return messages[Math.floor(Math.random() * messages.length)];
  }

  function showLimitedMessage(key, text, maxShows) {
    if (!text || state.messageLimits[key] >= maxShows) {
      return false;
    }

    state.messageLimits[key] += 1;
    setMessage(text);
    return true;
  }

  function tryLightCampfire(object) {
    if (state.activeItem !== "wood") {
      render();
      return;
    }

    if (object.built || state.quests.campfire.lit) {
      render();
      return;
    }

    if (state.inventory.wood < 3 || state.quests.campfire.woodCollected < 3) {
      setMessage(data.messages.needMoreWoodForCampfire);
      render();
      return;
    }

    spendIngredients({ wood: 3 });
    object.built = true;
    state.quests.campfire.lit = true;
    startCampfireBurningAmbience();
    updateCampfireBurningAmbienceVolume();
    addRest(8);
    setMessage(data.messages.campfireLit);
    checkEnding();
    render();
  }

  function discoverRestPlace(object) {
    const restPlaceMessages = {
      house: data.messages.house,
      toilet: data.messages.toilet,
      campfire: data.messages.campfire,
      pier: data.messages.pier,
      bench: data.messages.bench
    };

    if (!restPlaceMessages[object.type]) {
      return false;
    }

    if (!state.quests.restPlaces.found[object.id]) {
      state.quests.restPlaces.found[object.id] = true;
      addRest(4);
      setMessage(restPlaceMessages[object.type]);
      checkEnding();
      render();
      return true;
    }

    render();
    return false;
  }

  function discoverRestPlaceByObjectId(objectId) {
    const object = state.mapObjects.find((entry) => entry.id === objectId);
    if (!object) {
      return false;
    }

    return discoverRestPlace(object);
  }

  function interactWithTable() {
    if (state.activeItem === "vase") {
      placeVaseOnTable();
      return;
    }

    if (state.activeItem === "flowers") {
      placeBouquetOnTable();
      return;
    }

    render();
  }

  function placeVaseOnTable() {
    if (state.quests.flowers.vasePlaced) {
      setMessage(data.messages.vasePlaced);
      render();
      return;
    }

    if (state.inventory.vase < 1) {
      setMessage(data.messages.needVase);
      render();
      return;
    }

    spendIngredients({ vase: 1 });
    state.quests.flowers.vasePlaced = true;
    addRest(3);
    setMessage(data.messages.vasePlaced);
    checkEnding();
    render();
  }

  function placeBouquetOnTable() {
    if (state.quests.flowers.bouquetPlaced) {
      showLimitedMessage("bouquetPlaced", data.messages.bouquetPlaced, 1);
      render();
      return;
    }

    if (state.inventory.flowers < 5) {
      setMessage(data.messages.needMoreFlowers);
      render();
      return;
    }

    if (!state.quests.flowers.vaseFound) {
      setMessage(data.messages.needVase);
      render();
      return;
    }

    if (!state.quests.flowers.vasePlaced) {
      setMessage(data.messages.needPlacedVase);
      render();
      return;
    }

    spendIngredients({ flowers: 5 });
    state.quests.flowers.bouquetPlaced = true;
    addRest(2);
    showLimitedMessage("bouquetPlaced", data.messages.bouquetPlaced, 1);
    checkEnding();
    render();
  }

  function hasIngredients(needs) {
    return Object.entries(needs).every(([itemId, amount]) => state.inventory[itemId] >= amount);
  }

  function spendIngredients(needs) {
    Object.entries(needs).forEach(([itemId, amount]) => {
      state.inventory[itemId] -= amount;
    });

    if (state.activeItem && state.inventory[state.activeItem] <= 0) {
      state.activeItem = null;
    }
  }

  function addRest(points) {
    if (points <= 0) {
      return;
    }

    state.rest = Math.min(100, state.rest + points);
    createFloatingRestPopup(points);
  }

  function createFloatingRestPopup(points) {
    const now = performance.now();
    const activeNearPlayer = state.floatingRestPopups.filter((popup) => now - popup.createdAt < 240).length;
    state.floatingRestPopups.push({
      id: `${now}-${points}-${state.floatingRestPopups.length}`,
      points,
      x: state.player.x + (activeNearPlayer % 2 === 0 ? 18 : -18),
      y: state.player.y - 46 - activeNearPlayer * 10,
      createdAt: now,
      duration: 1900
    });

    if (state.floatingRestPopups.length > 12) {
      state.floatingRestPopups.splice(0, state.floatingRestPopups.length - 12);
    }
  }

  function checkEnding() {
    const allQuestsDone = data.achievements.every((achievement) => getQuestProgress(achievement.id) >= achievement.total);
    if (allQuestsDone || state.rest >= 100) {
      state.rest = 100;
      state.endingReached = true;
      scheduleFinalMessage();
    }
  }

  function scheduleFinalMessage() {
    if (state.messageLimits.finished >= 1) {
      return;
    }

    clearFinalMessageTimeout();

    if (state.mapMessageVisible || state.mapMessageHiding) {
      finalMessageTimeout = window.setTimeout(() => {
        finalMessageTimeout = null;
        scheduleFinalMessage();
      }, 250);
      return;
    }

    finalMessageTimeout = window.setTimeout(() => {
      finalMessageTimeout = null;
      if (
        !state.endingReached ||
        state.messageLimits.finished >= 1 ||
        state.mapMessageVisible ||
        state.mapMessageHiding
      ) {
        scheduleFinalMessage();
        return;
      }

      showLimitedMessage("finished", data.messages.finished, 1);
    }, finalMessageQuietDelayMs);
  }

  function clearFinalMessageTimeout() {
    if (!finalMessageTimeout) {
      return;
    }

    window.clearTimeout(finalMessageTimeout);
    finalMessageTimeout = null;
  }

  function isBirchTree(object) {
    return object.type === "tree" && object.image?.includes("tree_birch");
  }

  function isAppleTree(object) {
    return object.type === "tree" && object.image?.includes("tree_apple");
  }

  function drawMap() {
    if (!ctx) {
      return;
    }

    if (!mapReady || !mapImage.complete) {
      return;
    }

    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(state.mapZoom, state.mapZoom);
    drawBackground();
    drawObjects();
    drawDepthSortedScene();
    drawFloatingRestPopups();
    drawDebugOverlays();
    ctx.restore();
    updateMapSpeechBubblePosition();
    updateMapGoalsWidgetPosition();
    updateMapDebugStateElement();
  }

  function drawBackground() {
    ctx.drawImage(
      mapImage,
      -state.camera.x,
      -state.camera.y,
      data.map.worldWidth,
      data.map.worldHeight
    );
  }

  function drawObjects() {
    getVisibleObjects().forEach((object) => {
      if (isLayeredSceneryObject(object) && shouldRenderSceneryBeforePlayer(object)) {
        drawLayeredSceneryObject(object);
        return;
      }

      switch (object.type) {
        case "flowers":
          drawFlowerObject(object);
          break;
        case "axe":
          drawAxeObject(object);
          break;
        case "vase":
          drawVase(object);
          break;
        case "pier":
          drawPier(object);
          break;
        case "mailbox":
          drawSimpleObject(object);
          break;
        default:
          break;
      }
    });
  }

  function drawDepthSortedScene() {
    const renderObjects = [
      ...getVisibleLayeredSceneryObjects()
        .filter((object) => !shouldRenderSceneryBeforePlayer(object))
        .map((object) => ({
          type: "layered-scenery",
          depthY: getLayeredSceneryDepthY(object),
          data: object
        })),
      ...getVisibleTreeObjects().map((tree) => ({
        type: "tree",
        depthY: tree.depthY,
        data: tree
      })),
      {
        type: "player",
        depthY: getPlayerDepthY(),
        data: getPlayerRenderData()
      }
    ];

    renderObjects
      .sort((left, right) => left.depthY - right.depthY)
      .forEach((entry) => {
        if (entry.type === "layered-scenery") {
          drawLayeredSceneryObject(entry.data);
          return;
        }

        if (entry.type === "tree") {
          drawTree(entry.data);
          return;
        }

        drawPlayer(entry.data);
      });
  }

  function drawFlowerObject(object) {
    const screen = worldToScreen(object.x, object.y);
    if (!isVisibleCircle(screen.x, screen.y, object.radius + 10)) {
      return;
    }

    const image = objectImageAssets[object.image];
    const width = (object.width || 51) * 0.5;
    const height = (object.height || 86) * 0.5;

    if (image?.complete && image.naturalWidth > 0) {
      ctx.drawImage(image, screen.x - width / 2, screen.y - height, width, height);
      return;
    }

    ctx.fillStyle = "#d8d14d";
    ctx.fillRect(screen.x - width / 2, screen.y - height, width, height);
  }

  function drawAxeObject(object) {
    const screen = worldToScreen(object.x, object.y);
    if (!isVisibleCircle(screen.x, screen.y, object.radius + 10)) {
      return;
    }

    const image = objectImageAssets[object.image] || objectImageAssets[data.mapUi.axe];
    const width = object.width || 40;
    const height = object.height || 28;

    if (image?.complete && image.naturalWidth > 0) {
      ctx.drawImage(image, screen.x - width / 2, screen.y - height / 2, width, height);
      return;
    }

    ctx.fillStyle = "#5b341f";
    ctx.fillRect(screen.x - width / 2, screen.y - height / 2, width, height);
  }

  function drawVase(object) {
    const screen = worldToScreen(object.x, object.y);
    if (!isVisibleCircle(screen.x, screen.y, object.radius + 10)) {
      return;
    }

    const image = objectImageAssets[object.image];
    const width = object.width || 40;
    const height = object.height || 58;

    if (image?.complete && image.naturalWidth > 0) {
      ctx.drawImage(image, screen.x - width / 2, screen.y - height / 2, width, height);
      return;
    }

    ctx.fillStyle = "#c8a04f";
    ctx.fillRect(screen.x - width / 2, screen.y - height / 2, width, height);
  }

  function drawSimpleObject(object) {
    const image = objectImageAssets[object.image];
    if (!image?.complete || image.naturalWidth <= 0) {
      return;
    }

    const screen = worldToScreen(object.x, object.y);
    const width = object.width || image.naturalWidth;
    const height = object.height || image.naturalHeight;

    if (!isVisibleRect(screen.x - width / 2, screen.y - height, width, height)) {
      return;
    }

    ctx.drawImage(image, screen.x - width / 2, screen.y - height, width, height);
  }

  function drawPier(object) {
    const image = objectImageAssets[object.image];
    if (!image?.complete || image.naturalWidth <= 0) {
      return;
    }

    const screen = worldToScreen(object.spriteX, object.spriteY);
    if (!isVisibleRect(screen.x, screen.y, object.width, object.height)) {
      return;
    }

    ctx.drawImage(image, screen.x, screen.y, object.width, object.height);
  }

  function getTableImage() {
    if (state.quests.flowers.bouquetPlaced) {
      return getAnimatedImage(data.mapUi.tableVaseFlowersFrames, 1);
    }

    if (state.quests.flowers.vasePlaced) {
      return getAnimatedImage(data.mapUi.tableVaseFrames, 1);
    }

    return getAnimatedImage(data.mapUi.tableFrames, 1);
  }

  function getLayeredSceneryImage(object) {
    if (object.type === "table") {
      return getTableImage();
    }

    if (object.type === "campfire" && object.built) {
      return getAnimatedImage(data.mapUi.campfireLitFrames, 3);
    }

    return objectImageAssets[object.image];
  }

  function getAnimatedImage(framePaths, framesPerSecond) {
    if (!Array.isArray(framePaths) || !framePaths.length) {
      return null;
    }

    const frameDurationMs = 1000 / framesPerSecond;
    const frameIndex = Math.floor(performance.now() / frameDurationMs) % framePaths.length;
    return objectImageAssets[framePaths[frameIndex]];
  }

  function drawTable(object) {
    const image = getTableImage();
    if (!image?.complete || image.naturalWidth <= 0) {
      return;
    }

    const screen = worldToScreen(object.x, object.y);
    const width = object.width || image.naturalWidth || 103;
    const height = object.height || image.naturalHeight || 89;

    if (!isVisibleRect(screen.x - width / 2, screen.y - height / 2, width, height)) {
      return;
    }

    ctx.drawImage(image, screen.x - width / 2, screen.y - height / 2, width, height);
  }

  function drawLayeredSceneryObject(object) {
    const image = getLayeredSceneryImage(object);
    if (!image?.complete || image.naturalWidth <= 0) {
      return;
    }

    const screen = worldToScreen(object.spriteX, object.spriteY);
    const width = object.width;
    const height = object.height;
    const x = screen.x;
    const y = screen.y;

    if (!isVisibleRect(x, y, width, height)) {
      return;
    }

    ctx.drawImage(image, x, y, width, height);
  }

  function drawTree(tree) {
    const image = treeImageAssets[tree.image];
    if (!image?.complete || image.naturalWidth <= 0) {
      return;
    }

    const screen = worldToScreen(tree.spriteX, tree.spriteY);
    if (!isVisibleRect(screen.x, screen.y, tree.width, tree.height)) {
      return;
    }

    ctx.drawImage(image, screen.x, screen.y, tree.width, tree.height);

  }

  function drawPlayer(playerRenderData = getPlayerRenderData()) {
    const { image, drawWidth, drawHeight, drawX, drawY, shouldFlipHorizontally } = playerRenderData;

    if (image && image.complete && image.naturalWidth > 0) {
      if (shouldFlipHorizontally) {
        ctx.save();
        ctx.translate(drawX + drawWidth, drawY);
        ctx.scale(-1, 1);
        ctx.drawImage(image, 0, 0, drawWidth, drawHeight);
        ctx.restore();
      } else {
        ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      }
      return;
    }

    ctx.fillStyle = "#5f6f47";
    ctx.fillRect(drawX + 10, drawY + 14, drawWidth - 20, drawHeight - 22);
    ctx.fillStyle = "#f5c79e";
    ctx.fillRect(drawX + drawWidth / 2 - 8, drawY + 4, 16, 16);
  }

  function drawPlayerFocusMarker() {
    const { drawWidth, drawHeight, drawX, drawY } = getPlayerRenderData();
    const paddingX = 10;
    const paddingTop = 8;
    const paddingBottom = 2;
    const x = Math.round(drawX - paddingX);
    const y = Math.round(drawY - paddingTop);
    const width = Math.round(drawWidth + paddingX * 2);
    const height = Math.round(drawHeight + paddingTop + paddingBottom);
    const corner = 12;

    ctx.save();
    ctx.strokeStyle = "rgba(255, 244, 180, 0.92)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + corner);
    ctx.lineTo(x, y);
    ctx.lineTo(x + corner, y);
    ctx.moveTo(x + width - corner, y);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width, y + corner);
    ctx.moveTo(x, y + height - corner);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x + corner, y + height);
    ctx.moveTo(x + width - corner, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width, y + height - corner);
    ctx.stroke();
    ctx.restore();
  }

  function drawFloatingRestPopups() {
    if (!state.floatingRestPopups.length) {
      return;
    }

    const now = performance.now();
    state.floatingRestPopups = state.floatingRestPopups.filter((popup) => now - popup.createdAt < popup.duration);

    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "900 18px 'Trebuchet MS', Verdana, sans-serif";

    state.floatingRestPopups.forEach((popup) => {
      const elapsed = now - popup.createdAt;
      const progress = clamp(elapsed / popup.duration, 0, 1);
      const easedRise = 1 - Math.pow(1 - progress, 2);
      const screen = worldToScreen(popup.x, popup.y - easedRise * 72);
      const alpha = progress < 0.7 ? 1 : clamp(1 - (progress - 0.7) / 0.3, 0, 1);
      const text = `+${popup.points}`;

      ctx.globalAlpha = alpha;
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#245027";
      ctx.strokeText(text, Math.round(screen.x), Math.round(screen.y));
      ctx.fillStyle = "#72d84f";
      ctx.fillText(text, Math.round(screen.x), Math.round(screen.y));

      ctx.globalAlpha = alpha * 0.65;
      ctx.fillStyle = "#fff3a6";
      ctx.fillRect(Math.round(screen.x + 13), Math.round(screen.y - 13), 3, 3);
      ctx.fillRect(Math.round(screen.x - 16), Math.round(screen.y - 4), 2, 2);
    });

    ctx.restore();
  }

  function updateMapSpeechBubblePosition() {
    const bubble = app.querySelector("[data-role='map-speech-bubble']");

    if (!bubble || !canvas) {
      return;
    }

    const { drawY } = getPlayerRenderData();
    const bubbleWidth = bubble.offsetWidth;
    const bubbleHeight = bubble.offsetHeight;
    const playerCenter = worldToViewportScreen(state.player.x, state.player.y);
    const playerTopY = drawY * state.mapZoom;
    const playerCenterX = playerCenter.x;
    const margin = 12;
    const maxLeft = Math.max(margin, canvas.width - bubbleWidth - margin);
    const maxTop = Math.max(margin, canvas.height - bubbleHeight - margin);
    const left = clamp(playerCenterX - bubbleWidth * 0.5, margin, maxLeft);
    const top = clamp(playerTopY - bubbleHeight - 12, margin, maxTop);

    bubble.style.left = `${left}px`;
    bubble.style.top = `${top}px`;
  }

  function updateMapGoalsWidgetPosition() {
    const goalsWidget = app.querySelector("[data-role='map-goals-widget']");
    const playfield = goalsWidget?.closest(".map-playfield");

    if (!goalsWidget || !playfield) {
      return;
    }

    const playfieldHeight = playfield.getBoundingClientRect().height;
    const goalsHeight = goalsWidget.getBoundingClientRect().height;
    const topOffset = playfieldHeight * 0.056;
    const bottomOffset = playfieldHeight * 0.05;
    const shiftY = Math.max(0, Math.round(playfieldHeight - topOffset - bottomOffset - goalsHeight));
    const playerInUpperRightMapZone = shouldShiftMapGoalsWidget();
    state.mapGoalsShiftY = shiftY;
    state.mapGoalsShifted = playerInUpperRightMapZone;
    goalsWidget.style.setProperty("--map-goals-shift-y", `${shiftY}px`);
    goalsWidget.classList.toggle("is-shifted-down", playerInUpperRightMapZone);
  }

  function shouldShiftMapGoalsWidget() {
    return state.player.x >= 1050 && state.player.y <= 1100;
  }

  function drawDebugOverlays() {
    if (DEBUG_COLLISIONS) {
      drawCollisionMaskDebug();
      drawBlockingObjectDebug();
      drawTreeDebugLabels();
      drawPlayerDepthDebug();
    }

    if (DEBUG_PLAYER_COORDS) {
      drawPlayerCoordinatesLabel();
    }

    if (DEBUG_FLOWER_IDS) {
      drawFlowerDebugLabels();
    }
  }

  function drawCollisionMaskDebug() {
    Object.values(collisionMaskConfig).forEach((mask) => {
      if (!mask?.ready || !mask.debugOutlineCanvas || mask.failed) {
        return;
      }

      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.drawImage(
        mask.debugOutlineCanvas,
        -state.camera.x,
        -state.camera.y,
        data.map.worldWidth,
        data.map.worldHeight
      );
      ctx.restore();
    });

  }

  function drawBlockingObjectDebug() {
    ctx.save();
    ctx.strokeStyle = "rgba(220, 50, 47, 0.95)";
    ctx.lineWidth = 2;
    ctx.fillStyle = "rgba(45, 131, 255, 0.95)";

    getVisibleBlockingObjects().forEach((object) => {
      const boxScreen = worldToScreen(object.collisionBox.x, object.collisionBox.y);
      if (!isVisibleRect(boxScreen.x, boxScreen.y, object.collisionBox.width, object.collisionBox.height)) {
        return;
      }

      ctx.strokeRect(boxScreen.x, boxScreen.y, object.collisionBox.width, object.collisionBox.height);

      if (object.type === "tree") {
        const depthY = object.depthY - state.camera.y;
        const depthCenterX = object.x + object.width / 2 - state.camera.x;
        ctx.beginPath();
        ctx.moveTo(depthCenterX - 12, depthY);
        ctx.lineTo(depthCenterX + 12, depthY);
        ctx.strokeStyle = "rgba(55, 156, 255, 0.95)";
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(depthCenterX, depthY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(220, 50, 47, 0.95)";
      }
    });

    ctx.restore();
  }

  function drawTreeDebugLabels() {
    ctx.save();
    ctx.font = "11px Trebuchet MS, Verdana, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    getVisibleTreeObjects().forEach((tree) => {
      const label = `${tree.id} ${Math.round(tree.x)},${Math.round(tree.y)}`;
      const labelX = tree.x - state.camera.x;
      const labelY = tree.y - state.camera.y + 26;
      const boxWidth = ctx.measureText(label).width + 12;
      const boxHeight = 18;
      const boxX = labelX - boxWidth / 2;
      const boxY = labelY - boxHeight / 2;

      if (!isVisibleRect(boxX, boxY, boxWidth, boxHeight)) {
        return;
      }

      ctx.fillStyle = "rgba(45, 42, 38, 0.82)";
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      ctx.fillStyle = "#fff8e8";
      ctx.fillText(label, labelX, labelY);
    });

    ctx.restore();
  }

  function drawFlowerDebugLabels() {
    ctx.save();
    ctx.font = "10px Trebuchet MS, Verdana, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    getVisibleFlowerObjects().forEach((flower) => {
      const label = flower.id;
      const labelX = flower.x - state.camera.x;
      const labelY = flower.y - state.camera.y + 14;
      const boxWidth = ctx.measureText(label).width + 10;
      const boxHeight = 16;
      const boxX = labelX - boxWidth / 2;
      const boxY = labelY - boxHeight / 2;

      if (!isVisibleRect(boxX, boxY, boxWidth, boxHeight)) {
        return;
      }

      ctx.fillStyle = "rgba(49, 70, 34, 0.82)";
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
      ctx.fillStyle = "#fff8d8";
      ctx.fillText(label, labelX, labelY);
    });

    ctx.restore();
  }

  function drawPlayerDepthDebug() {
    const playerDepthY = getPlayerDepthY() - state.camera.y;
    const playerX = state.player.x - state.camera.x;

    ctx.save();
    ctx.strokeStyle = "rgba(55, 156, 255, 0.95)";
    ctx.fillStyle = "rgba(55, 156, 255, 0.95)";
    ctx.beginPath();
    ctx.moveTo(playerX - 10, playerDepthY);
    ctx.lineTo(playerX + 10, playerDepthY);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(playerX, playerDepthY, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPlayerCoordinatesLabel() {
    const screen = worldToScreen(state.player.x, state.player.y);
    const label = `x:${Math.round(state.player.x)} y:${Math.round(state.player.y)}`;

    ctx.save();
    ctx.font = "12px Trebuchet MS, Verdana, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const boxWidth = ctx.measureText(label).width + 14;
    const boxHeight = 22;
    const boxX = screen.x - boxWidth / 2;
    const boxY = screen.y - 82;
    ctx.fillStyle = "rgba(45, 42, 38, 0.82)";
    ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
    ctx.fillStyle = "#fff8e8";
    ctx.fillText(label, screen.x, boxY + boxHeight / 2);
    ctx.restore();
  }

  function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
      state.pressedKeys.add(key);
    }
  }

  function handleKeyUp(event) {
    state.pressedKeys.delete(event.key.toLowerCase());
  }

  function setMessage(text) {
    state.message = text;
    showMapMessage();
    syncCurrentMessage();

    if (state.endingReached && text !== data.messages.finished && state.messageLimits.finished < 1) {
      scheduleFinalMessage();
    }
  }

  function syncCurrentMessage() {
    const messageNode = app.querySelector("[data-role='current-message']");
    if (!messageNode) {
      return;
    }

    messageNode.textContent = state.message;
  }

  function showMapMessage() {
    clearMapMessageTimers();
    const visibleDuration = state.mapIntroMessagePending
      ? mapIntroMessageVisibleDurationMs
      : mapMessageVisibleDurationMs;
    state.mapMessageVisible = true;
    state.mapMessageHiding = false;
    state.mapIntroMessagePending = false;

    const bubble = app.querySelector("[data-role='map-speech-bubble']");
    if (bubble) {
      bubble.querySelector("p").textContent = state.message;
      bubble.classList.remove("is-hiding");
      bubble.classList.add("is-visible");
    }

    if (state.screen !== "map") {
      return;
    }

    mapMessageHideTimeout = window.setTimeout(() => {
      state.mapMessageHiding = true;
      const currentBubble = app.querySelector("[data-role='map-speech-bubble']");
      currentBubble?.classList.add("is-hiding");

      mapMessageRemoveTimeout = window.setTimeout(() => {
        state.mapMessageVisible = false;
        state.mapMessageHiding = false;
        const fadedBubble = app.querySelector("[data-role='map-speech-bubble']");
        fadedBubble?.classList.remove("is-visible", "is-hiding");
      }, mapMessageFadeDurationMs);
    }, visibleDuration);
  }

  function clearMapMessageTimers() {
    if (mapMessageHideTimeout) {
      window.clearTimeout(mapMessageHideTimeout);
      mapMessageHideTimeout = null;
    }

    if (mapMessageRemoveTimeout) {
      window.clearTimeout(mapMessageRemoveTimeout);
      mapMessageRemoveTimeout = null;
    }
  }

  function getSelectedOutfit() {
    return creatorOutfits.find((outfit) => outfit.id === state.selectedOutfitId) || creatorOutfits[0] || data.characterOutfits[0];
  }

  function getSelectedOutfitIndex() {
    const selectedIndex = creatorOutfits.findIndex((outfit) => outfit.id === state.selectedOutfitId);
    return selectedIndex >= 0 ? selectedIndex : 0;
  }

  function getOutfitAngelLines(outfit = getSelectedOutfit()) {
    const lineKey = outfit?.angelLineKey;
    const linePool = lineKey ? data.angelLines?.[lineKey] : null;
    return Array.isArray(linePool) && linePool.length ? linePool : ["Давай соберём Саню для большого приключения!"];
  }

  function getCurrentAngelLine(outfit = getSelectedOutfit()) {
    if (state.creatorIntroLineVisible) {
      return "Давай соберем Саню для большого путешествия!";
    }

    const lines = getOutfitAngelLines(outfit);
    const lineKey = outfit?.angelLineKey || outfit?.id || "default";
    const lineIndex = state.creatorAngelLineIndices[lineKey] || 0;
    return lines[lineIndex % lines.length];
  }

  function advanceAngelLineForOutfit(outfit) {
    const lines = getOutfitAngelLines(outfit);
    const lineKey = outfit?.angelLineKey || outfit?.id || "default";
    const currentIndex = state.creatorAngelLineIndices[lineKey];
    state.creatorAngelLineIndices[lineKey] = typeof currentIndex === "number"
      ? (currentIndex + 1) % lines.length
      : 0;
  }

  function cycleSelectedOutfit(step) {
    if (!creatorOutfits.length) {
      return;
    }

    const nextIndex = (getSelectedOutfitIndex() + step + creatorOutfits.length) % creatorOutfits.length;
    const nextOutfit = creatorOutfits[nextIndex];
    state.creatorIntroLineVisible = false;
    state.selectedOutfitId = nextOutfit.id;
    advanceAngelLineForOutfit(nextOutfit);
    render();
  }

  function getPlayerAppearance() {
    const outfitId = state.playerAppearanceId || state.selectedOutfitId;
    return data.characterOutfits.find((outfit) => outfit.id === outfitId) || data.characterOutfits[0];
  }

  function preloadSpriteImages() {
    data.characterOutfits.forEach((outfit) => {
      const idleImage = new Image();
      idleImage.src = outfit.idleImage || outfit.image;

      const walkAnimations = {};
      const configuredAnimations = outfit.walkAnimations || {};

      Object.keys(configuredAnimations).forEach((direction) => {
        walkAnimations[direction] = configuredAnimations[direction].map((framePath) => {
          const frameImage = new Image();
          frameImage.src = framePath;
          return frameImage;
        });
      });

      spriteAssets[outfit.id] = {
        idle: idleImage,
        walkAnimations
      };
    });
  }

  function preloadTreeImages() {
    data.map.objects.filter((object) => object.type === "tree" && object.image).forEach((tree) => {
      if (treeImageAssets[tree.image]) {
        return;
      }

      const image = new Image();
      image.src = tree.image;
      treeImageAssets[tree.image] = image;
    });
  }

  function preloadObjectImages() {
    const objectImages = [
      ...data.map.objects
      .filter((object) => object.type !== "tree" && object.image)
      .map((object) => object.image),
      data.mapUi.vaseInventory,
      data.mapUi.flowerInventory,
      data.mapUi.woodInventory,
      data.mapUi.appleInventory,
      data.mapUi.mailbox,
      data.mapUi.letterPanel,
      ...(data.mapUi.campfireLitFrames || []),
      ...(data.mapUi.tableFrames || []),
      ...(data.mapUi.tableVaseFrames || []),
      ...(data.mapUi.tableVaseFlowersFrames || [])
    ].flat().filter(Boolean);

    objectImages
      .forEach((imagePath) => {
        if (objectImageAssets[imagePath]) {
          return;
        }

        const image = new Image();
        image.src = imagePath;
        objectImageAssets[imagePath] = image;
      });
  }

  function updatePlayerFacing(dx, dy) {
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (dy > 0 && absY >= absX) {
      state.player.facing = "down";
      return;
    }

    if (dy < 0 && absY >= absX) {
      state.player.facing = "up";
      return;
    }

    state.player.facing = dx < 0 ? "left" : "right";
  }

  function updatePlayerAnimation(isMoving, deltaTime) {
    state.player.isMoving = isMoving;
    updateWalkingSound(isMoving);

    const frames = getWalkAnimationFrames();
    if (!isMoving || frames.length <= 1) {
      state.player.walkFrameIndex = 0;
      state.player.walkFrameElapsed = 0;
      return;
    }

    state.player.walkFrameElapsed += deltaTime;

    while (state.player.walkFrameElapsed >= data.sprite.walkFrameDuration) {
      state.player.walkFrameElapsed -= data.sprite.walkFrameDuration;
      state.player.walkFrameIndex = (state.player.walkFrameIndex + 1) % frames.length;
    }
  }

  function updateWalkingSound(isMoving) {
    if (isMoving) {
      startWalkingSound();
      return;
    }

    stopWalkingSound();
  }

  function startWalkingSound() {
    if (walkingSoundActive || !walkOnGrassSound) {
      return;
    }

    walkingSoundActive = true;
    startLoopingSoundEffect(walkOnGrassSound);
  }

  function stopWalkingSound() {
    if (!walkingSoundActive) {
      return;
    }

    walkingSoundActive = false;
    stopLoopingSoundEffect(walkOnGrassSound);
  }

  function startWaterStreamAmbience() {
    if (!waterStreamAmbienceSound || !waterStreamAmbienceSound.paused) {
      return;
    }

    startLoopingSoundEffect(waterStreamAmbienceSound);
  }

  function updateWaterStreamAmbienceVolume() {
    if (!waterStreamAmbienceSound || waterStreamAmbienceSound.paused) {
      return;
    }

    const centerX = data.map.worldWidth / 2;
    const centerY = data.map.worldHeight / 2;
    const distance = Math.hypot(state.player.x - centerX, state.player.y - centerY);
    const targetVolume = Number(waterStreamAmbienceSound.dataset.targetVolume || 0.07);
    const proximity = clamp(1 - distance / waterStreamMaxDistance, 0, 1);
    waterStreamAmbienceSound.volume = targetVolume * proximity;
  }

  function startCampfireBurningAmbience() {
    if (!campfireBurningAmbienceSound || !campfireBurningAmbienceSound.paused) {
      return;
    }

    startLoopingSoundEffect(campfireBurningAmbienceSound);
  }

  function updateCampfireBurningAmbienceVolume() {
    if (!campfireBurningAmbienceSound || campfireBurningAmbienceSound.paused || !state.quests.campfire.lit) {
      return;
    }

    const campfireObject = state.mapObjects.find((object) => object.type === "campfire");
    if (!campfireObject) {
      campfireBurningAmbienceSound.volume = 0;
      return;
    }

    const distance = Math.hypot(state.player.x - campfireObject.x, state.player.y - campfireObject.y);
    const targetVolume = Number(campfireBurningAmbienceSound.dataset.targetVolume || 0.07);
    const proximity = clamp(1 - distance / campfireBurningMaxDistance, 0, 1);
    campfireBurningAmbienceSound.volume = targetVolume * proximity;
  }

  function getWalkAnimationFrames(outfit = getPlayerAppearance()) {
    const assets = outfit ? spriteAssets[outfit.id] : null;
    if (!assets) {
      return [];
    }

    if (state.player.facing === "right" && assets.walkAnimations.left) {
      return assets.walkAnimations.left;
    }

    return assets.walkAnimations[state.player.facing] || [];
  }

  function getCurrentPlayerSprite(outfit) {
    const assets = outfit ? spriteAssets[outfit.id] : null;
    if (!assets) {
      return null;
    }

    const frames = getWalkAnimationFrames(outfit);
    if (state.player.isMoving && frames.length) {
      return frames[state.player.walkFrameIndex % frames.length];
    }

    return assets.idle;
  }

  function preloadMapImage() {
    mapImage.src = data.map.backgroundImage;
    mapImage.addEventListener("load", () => {
      mapReady = true;
      syncMapDataToBackground();
      updateCamera();
      logMapDebugState("map-loaded");
      render();
    });
  }

  function preloadCollisionMasks() {
    Object.values(collisionMaskConfig).forEach((mask) => {
      if (!mask?.path) {
        return;
      }

      mask.image.addEventListener("load", () => {
        captureCollisionMask(mask);
        if (mapReady) {
          render();
        }
      });

      mask.image.addEventListener("error", () => {
        mask.failed = true;
        if (mapReady) {
          render();
        }
      });

      mask.image.src = mask.path;
    });
  }

  function syncCanvasSize() {
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    state.viewport.width = width;
    state.viewport.height = height;
    state.mapZoom = calculateMapZoom(width, height);
  }

  function handleResize() {
    syncCanvasSize();
    if (mapReady) {
      updateCamera();
    }
  }

  function worldToScreen(worldX, worldY) {
    return {
      x: worldX - state.camera.x,
      y: worldY - state.camera.y
    };
  }

  function worldToViewportScreen(worldX, worldY) {
    const screen = worldToScreen(worldX, worldY);

    return {
      x: screen.x * state.mapZoom,
      y: screen.y * state.mapZoom
    };
  }

  function getVisibleWorldWidth() {
    return state.viewport.width / state.mapZoom;
  }

  function getVisibleWorldHeight() {
    return state.viewport.height / state.mapZoom;
  }

  function calculateMapZoom(width, height) {
    const widthZoom = width / 1100;
    const heightZoom = height / 650;

    return clamp(Math.min(widthZoom, heightZoom), 0.68, 1);
  }

  function isVisibleCircle(screenX, screenY, radius) {
    const visibleWidth = getVisibleWorldWidth();
    const visibleHeight = getVisibleWorldHeight();

    return (
      screenX + radius >= 0 &&
      screenX - radius <= visibleWidth &&
      screenY + radius >= 0 &&
      screenY - radius <= visibleHeight
    );
  }

  function isVisibleRect(screenX, screenY, width, height) {
    const visibleWidth = getVisibleWorldWidth();
    const visibleHeight = getVisibleWorldHeight();

    return (
      screenX + width >= 0 &&
      screenX <= visibleWidth &&
      screenY + height >= 0 &&
      screenY <= visibleHeight
    );
  }

  function syncMapDataToBackground() {
    if (mapScaled) {
      return;
    }

    const backgroundScale = data.map.backgroundScale || 1;
    data.map.worldWidth = mapImage.naturalWidth * backgroundScale;
    data.map.worldHeight = mapImage.naturalHeight * backgroundScale;

    const sourceWidth = data.map.sourceWorldWidth || data.map.worldWidth;
    const sourceHeight = data.map.sourceWorldHeight || data.map.worldHeight;
    const scaleX = data.map.worldWidth / sourceWidth;
    const scaleY = data.map.worldHeight / sourceHeight;

    scalePosition(data.map.playerStart, scaleX, scaleY);
    scaleCollection(data.map.decor.ponds, scaleX, scaleY, ["x", "y", "rx", "ry"]);
    scaleCollection(data.map.decor.flowerPatches, scaleX, scaleY, ["x", "y"]);
    scaleCollection(data.map.decor.rockPatches, scaleX, scaleY, ["x", "y", "size"]);
    scaleCollection(data.map.decor.decorativeTrees, scaleX, scaleY, ["x", "y", "radius"]);
    scaleCollection(state.mapObjects, scaleX, scaleY, ["x", "y", "radius", "width", "height"]);
    state.mapObjects.forEach((object) => updateMapObjectDerivedData(object));

    state.player.x = data.map.playerStart.x;
    state.player.y = data.map.playerStart.y;
    state.player.targetX = data.map.playerStart.x;
    state.player.targetY = data.map.playerStart.y;
    mapScaled = true;
  }

  function createCollisionMask(type, path) {
    return {
      type,
      path,
      image: new Image(),
      canvas: null,
      ctx: null,
      alphaMap: null,
      stats: null,
      ready: false,
      failed: false
    };
  }

  function captureCollisionMask(mask) {
    try {
      const offscreenCanvas = document.createElement("canvas");
      offscreenCanvas.width = mask.image.naturalWidth;
      offscreenCanvas.height = mask.image.naturalHeight;
      const offscreenCtx = offscreenCanvas.getContext("2d", { willReadFrequently: true });
      offscreenCtx.drawImage(mask.image, 0, 0);
      mask.canvas = offscreenCanvas;
      mask.ctx = offscreenCtx;
      mask.alphaMap = createCollisionMaskAlphaMap(mask);
      mask.stats = createCollisionMaskStats(mask);
      mask.debugOutlineCanvas = createCollisionMaskDebugOutline(mask);
      mask.ready = true;
      mask.failed = false;
      logMapDebugState(`mask-loaded:${mask.type}`);
    } catch (error) {
      mask.failed = true;
      mask.ready = false;
      console.warn(`Не удалось подготовить маску коллизии: ${mask.type}`, error);
    }
  }

  function createCollisionMaskDebugOutline(mask) {
    const outlineCanvas = document.createElement("canvas");
    outlineCanvas.width = mask.canvas.width;
    outlineCanvas.height = mask.canvas.height;
    const outlineCtx = outlineCanvas.getContext("2d", { willReadFrequently: true });
    const sourceImageData = mask.ctx.getImageData(0, 0, mask.canvas.width, mask.canvas.height);
    const outlineImageData = outlineCtx.createImageData(mask.canvas.width, mask.canvas.height);
    const { width, height, data } = sourceImageData;
    const outlineData = outlineImageData.data;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const alpha = getMaskAlpha(mask, x, y);
        if (alpha <= 20) {
          continue;
        }

        const hasTransparentNeighbor = [
          [0, -1],
          [0, 1],
          [-1, 0],
          [1, 0]
        ].some(([dx, dy]) => {
          const nx = x + dx;
          const ny = y + dy;

          if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
            return true;
          }

          return getMaskAlpha(mask, nx, ny) <= 20;
        });

        if (!hasTransparentNeighbor) {
          continue;
        }

        const pixelIndex = (y * width + x) * 4;
        outlineData[pixelIndex] = 255;
        outlineData[pixelIndex + 1] = 72;
        outlineData[pixelIndex + 2] = 72;
        outlineData[pixelIndex + 3] = 255;
      }
    }

    outlineCtx.putImageData(outlineImageData, 0, 0);
    return outlineCanvas;
  }

  function createCollisionMaskAlphaMap(mask) {
    const imageData = mask.ctx.getImageData(0, 0, mask.canvas.width, mask.canvas.height);
    const alphaMap = new Uint8Array(mask.canvas.width * mask.canvas.height);

    for (let index = 0; index < alphaMap.length; index += 1) {
      alphaMap[index] = imageData.data[index * 4 + 3];
    }

    return alphaMap;
  }

  function createCollisionMaskStats(mask) {
    const stats = {
      blockedPixels: 0,
      bounds: null
    };
    let minX = mask.canvas.width;
    let minY = mask.canvas.height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < mask.canvas.height; y += 1) {
      for (let x = 0; x < mask.canvas.width; x += 1) {
        if (getMaskAlpha(mask, x, y) <= 20) {
          continue;
        }

        stats.blockedPixels += 1;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }

    if (stats.blockedPixels > 0) {
      stats.bounds = { minX, minY, maxX, maxY };
    }

    return stats;
  }

  function scaleCollection(collection, scaleX, scaleY, keys) {
    collection.forEach((entry) => {
      keys.forEach((key) => {
        if (typeof entry[key] !== "number") {
          return;
        }

        if (key === "x" || key === "rx" || key === "size" || key === "radius" || key === "width") {
          entry[key] *= scaleX;
        } else if (key === "y" || key === "ry" || key === "height") {
          entry[key] *= scaleY;
        }
      });
    });
  }

  function scalePosition(point, scaleX, scaleY) {
    point.x *= scaleX;
    point.y *= scaleY;
  }

  function clampPositionToBounds(x, y) {
    const bounds = getPlayerBounds();
    return {
      x: clamp(x, bounds.minX, bounds.maxX),
      y: clamp(y, bounds.minY, bounds.maxY)
    };
  }

  function tryMovePlayerTo(nextX, nextY) {
    const nextPosition = clampPositionToBounds(nextX, nextY);
    const collision = getCollisionAt(nextPosition.x, nextPosition.y);

    if (collision) {
      handleMovementCollision(collision);
      return collision;
    }

    state.player.x = nextPosition.x;
    state.player.y = nextPosition.y;
    updatePlayerZoneState();
    return null;
  }

  function handleMovementCollision(collision) {
    if (collision.type === "tree") {
      return;
    }

    if (collision.type === "object") {
      if (collision.objectType === "toilet") {
        discoverRestPlaceByObjectId(collision.objectId);
        return;
      }

      if (collision.objectType === "house") {
        discoverRestPlaceByObjectId(collision.objectId);
        return;
      }

      return;
    }

    if (collision.type === "water") {
      showLimitedMessage("blockedByWater", data.messages.blockedByWater, 1);
      return;
    }

    showLimitedMessage("blockedByRocks", data.messages.blockedByRocks, 1);
  }

  function getReachableTarget(fromX, fromY, toX, toY) {
    const dx = toX - fromX;
    const dy = toY - fromY;
    const distance = Math.hypot(dx, dy);

    if (distance <= data.map.playerSpeed) {
      const target = clampPositionToBounds(toX, toY);
      const collision = getCollisionAt(target.x, target.y);
      return collision ? { ...clampPositionToBounds(fromX, fromY), collision } : { ...target, collision: null };
    }

    const steps = Math.max(1, Math.ceil(distance / data.map.playerSpeed));
    let lastReachable = clampPositionToBounds(fromX, fromY);

    for (let step = 1; step <= steps; step += 1) {
      const progress = step / steps;
      const candidate = clampPositionToBounds(fromX + dx * progress, fromY + dy * progress);
      const collision = getCollisionAt(candidate.x, candidate.y);
      if (collision) {
        return { ...lastReachable, collision };
      }
      lastReachable = candidate;
    }

    return { ...lastReachable, collision: null };
  }

  function getCollisionAt(playerX, playerY) {
    const samplePoints = getCollisionSamplePoints(playerX, playerY);
    const collidingObject = getCollidingTree(samplePoints);

    if (collidingObject) {
      if (collidingObject.type === "tree") {
        return { type: "tree", treeId: collidingObject.id };
      }

      return {
        type: "object",
        objectId: collidingObject.id,
        objectType: collidingObject.type
      };
    }

    const masksInPriorityOrder = [collisionMaskConfig.water, collisionMaskConfig.rocks];

    for (const mask of masksInPriorityOrder) {
      if (!mask?.ready || !mask.ctx || mask.failed) {
        continue;
      }

      const hitsMask = samplePoints.some((point) => isBlockedByMask(mask, point.x, point.y));
      if (hitsMask) {
        return { type: mask.type };
      }
    }

    return null;
  }

  function getCollisionSamplePoints(playerX, playerY) {
    const footY = playerY + 1;
    return [
      { x: playerX, y: footY },
      { x: playerX - 10, y: footY },
      { x: playerX + 10, y: footY },
      { x: playerX - 6, y: footY - 7 },
      { x: playerX + 6, y: footY - 7 },
      { x: playerX, y: footY - 10 }
    ];
  }

  function getCollidingTree(samplePoints) {
    return getVisibleBlockingObjects().find((object) =>
      samplePoints.some((point) => isPointInsideRect(point.x, point.y, object.collisionBox))
    );
  }

  function updateMapDebugStateElement() {
    const debugElement = document.getElementById("map-debug-state");

    if (!debugElement) {
      return;
    }

    debugElement.textContent = JSON.stringify(getMapDebugState());
  }

  function isPointInsideRect(x, y, rect) {
    return (
      x >= rect.x &&
      x <= rect.x + rect.width &&
      y >= rect.y &&
      y <= rect.y + rect.height
    );
  }

  function isBlockedByMask(mask, worldX, worldY) {
    const imageX = Math.round((worldX / data.map.worldWidth) * (mask.canvas.width - 1));
    const imageY = Math.round((worldY / data.map.worldHeight) * (mask.canvas.height - 1));

    if (
      imageX < 0 ||
      imageY < 0 ||
      imageX >= mask.canvas.width ||
      imageY >= mask.canvas.height
    ) {
      return false;
    }

    try {
      return getMaskAlpha(mask, imageX, imageY) > 20;
    } catch (error) {
      mask.failed = true;
      mask.ready = false;
      console.warn(`Не удалось прочитать пиксель маски коллизии: ${mask.type}`, error);
      return false;
    }
  }

  function getMaskAlpha(mask, imageX, imageY) {
    if (mask.alphaMap) {
      return mask.alphaMap[imageY * mask.canvas.width + imageX] || 0;
    }

    return mask.ctx.getImageData(imageX, imageY, 1, 1).data[3];
  }

  function getMapDebugState() {
    return {
      mapReady,
      mapScaled,
      map: {
        naturalWidth: mapImage.naturalWidth || null,
        naturalHeight: mapImage.naturalHeight || null,
        worldWidth: data.map.worldWidth,
        worldHeight: data.map.worldHeight,
        backgroundImage: data.map.backgroundImage
      },
      camera: {
        x: Math.round(state.camera.x),
        y: Math.round(state.camera.y),
        zoom: Number(state.mapZoom.toFixed(3)),
        viewportWidth: state.viewport.width,
        viewportHeight: state.viewport.height,
        visibleWorldWidth: Math.round(getVisibleWorldWidth()),
        visibleWorldHeight: Math.round(getVisibleWorldHeight())
      },
      player: {
        x: Math.round(state.player.x),
        y: Math.round(state.player.y)
      },
      masks: Object.fromEntries(
        Object.entries(collisionMaskConfig).map(([id, mask]) => [
          id,
          {
            path: mask.path,
            ready: mask.ready,
            failed: mask.failed,
            width: mask.canvas?.width || null,
            height: mask.canvas?.height || null,
            blockedPixels: mask.stats?.blockedPixels || 0,
            bounds: mask.stats?.bounds || null,
            hasDebugOutline: Boolean(mask.debugOutlineCanvas)
          }
        ])
      )
    };
  }

  function sampleMapMaskAt(worldX = state.player.x, worldY = state.player.y, maskType = "water") {
    const mask = collisionMaskConfig[maskType];

    if (!mask?.ready || !mask.canvas || mask.failed) {
      return {
        maskType,
        ready: Boolean(mask?.ready),
        failed: Boolean(mask?.failed),
        reason: "mask-not-ready"
      };
    }

    const imageX = Math.round((worldX / data.map.worldWidth) * (mask.canvas.width - 1));
    const imageY = Math.round((worldY / data.map.worldHeight) * (mask.canvas.height - 1));
    const inBounds = (
      imageX >= 0 &&
      imageY >= 0 &&
      imageX < mask.canvas.width &&
      imageY < mask.canvas.height
    );

    return {
      maskType,
      worldX: Math.round(worldX),
      worldY: Math.round(worldY),
      imageX,
      imageY,
      inBounds,
      alpha: inBounds ? getMaskAlpha(mask, imageX, imageY) : null,
      blocked: inBounds ? isBlockedByMask(mask, worldX, worldY) : false
    };
  }

  function logMapDebugState(reason) {
    console.info("MAP_DEBUG_STATE", reason, getMapDebugState());
  }

  function getPlayerBounds() {
    const drawWidth = data.sprite.width * data.sprite.mapScale;
    const drawHeight = data.sprite.height * data.sprite.mapScale;
    const footOffset = 31;

    return {
      minX: drawWidth / 2,
      maxX: data.map.worldWidth - drawWidth / 2,
      minY: drawHeight - footOffset,
      maxY: data.map.worldHeight - footOffset
    };
  }

  function createMapObject(object) {
    const mapObject = {
      ...object,
      collected: false,
      built: false,
      harvests: 0,
      chopHits: 0,
      chopped: false,
      appleCollected: false,
      chopMessageShown: false
    };

    updateMapObjectDerivedData(mapObject);
    return mapObject;
  }

  function updateMapObjectDerivedData(object) {
    if (!object.image || !object.width || !object.height) {
      return;
    }

    if (object.type === "tree") {
      object.spriteX = object.x - object.width / 2;
      object.spriteY = object.y + object.radius - object.height;
      object.collisionBox = {
        x: object.spriteX + object.width * 0.35,
        y: object.spriteY + object.height * 0.8,
        width: object.width * 0.3,
        height: object.height * 0.2
      };
      object.depthY = object.spriteY + object.height * 0.9;
      return;
    }

    if (object.type === "pier") {
      object.spriteX = object.x - object.width / 2;
      object.spriteY = object.y - object.height / 2;
      object.hitBox = {
        x: object.spriteX + object.width * 0.1,
        y: object.spriteY + object.height * 0.08,
        width: object.width * 0.82,
        height: object.height * 0.84
      };
      return;
    }

    if (object.type === "mailbox") {
      object.spriteX = object.x - object.width / 2;
      object.spriteY = object.y - object.height;
      object.hitBox = {
        x: object.spriteX,
        y: object.spriteY,
        width: object.width,
        height: object.height
      };
      return;
    }

    if (isLayeredSceneryObject(object)) {
      object.spriteX = object.x - object.width / 2;
      object.spriteY = object.anchor === "bottom-center" ? object.y - object.height : object.y - object.height / 2;
      object.hitBox = {
        x: object.spriteX,
        y: object.spriteY,
        width: object.width,
        height: object.height
      };

      const topWalkHeight = object.height * (object.walkBehindRatio || 0);
      const bottomWalkHeight = object.height * (object.walkFrontRatio || 0);
      const blockedHeight = Math.max(0, object.height - topWalkHeight - bottomWalkHeight);
      const leftSideWalkWidth = object.width * (object.walkSideLeftRatio ?? object.walkSideRatio ?? 0);
      const rightSideWalkWidth = object.width * (object.walkSideRightRatio ?? object.walkSideRatio ?? 0);
      const blockedWidth = Math.max(0, object.width - leftSideWalkWidth - rightSideWalkWidth);

      object.topWalkRect = topWalkHeight > 0
        ? {
            x: object.spriteX,
            y: object.spriteY,
            width: object.width,
            height: topWalkHeight
          }
        : null;

      object.bottomWalkRect = bottomWalkHeight > 0
        ? {
            x: object.spriteX,
            y: object.spriteY + object.height - bottomWalkHeight,
            width: object.width,
            height: bottomWalkHeight
          }
        : null;

      object.collisionBox = blockedHeight > 0
        ? {
            x: object.spriteX + leftSideWalkWidth,
            y: object.spriteY + topWalkHeight,
            width: blockedWidth,
            height: blockedHeight
          }
        : null;
    }
  }

  function getVisibleTreeObjects() {
    return getVisibleObjects().filter((object) => object.type === "tree" && object.image);
  }

  function getVisibleFlowerObjects() {
    return getVisibleObjects().filter((object) => object.type === "flowers");
  }

  function getVisibleBlockingObjects() {
    return getVisibleObjects().filter((object) => object.collisionBox);
  }

  function isLayeredSceneryObject(object) {
    return ["house", "toilet", "bench", "campfire", "table"].includes(object.type);
  }

  function getVisibleLayeredSceneryObjects() {
    return getVisibleObjects().filter((object) => isLayeredSceneryObject(object) && object.image);
  }

  function shouldRenderSceneryBeforePlayer(object) {
    if (object.type === "campfire") {
      return true;
    }

    return !isPlayerInsideRect(object.topWalkRect);
  }

  function getLayeredSceneryDepthY(object) {
    return getPlayerDepthY() + 1;
  }

  function isPlayerInsideRect(rect) {
    if (!rect) {
      return false;
    }

    return isPointInsideRect(state.player.x, state.player.y, rect);
  }

  function updatePlayerZoneState() {
    getVisibleObjects()
      .filter((object) => object.type === "pier" && object.hitBox)
      .forEach((object) => {
        const isInside = isPointInsideRect(state.player.x, state.player.y, object.hitBox);
        const wasInside = Boolean(state.zoneStates.pier[object.id]);

        if (isInside && !wasInside) {
          state.zoneStates.pier[object.id] = true;
          discoverRestPlace(object);
          return;
        }

        if (!isInside && wasInside) {
          state.zoneStates.pier[object.id] = false;
        }
      });

    getVisibleLayeredSceneryObjects()
      .filter((object) => object.bottomWalkRect)
      .forEach((object) => {
        const isInside = isPointInsideRect(state.player.x, state.player.y, object.bottomWalkRect);
        const wasInside = Boolean(state.zoneStates.scenery[object.id]);

        if (isInside && !wasInside) {
          state.zoneStates.scenery[object.id] = true;

          if (object.type === "bench") {
            discoverRestPlace(object);
            return;
          }

          if (object.type === "campfire") {
            discoverRestPlace(object);
            return;
          }

          return;
        }

        if (!isInside && wasInside) {
          state.zoneStates.scenery[object.id] = false;
        }
      });
  }

  function getPlayerRenderData() {
    const outfit = getPlayerAppearance();
    const image = getCurrentPlayerSprite(outfit);
    const drawWidth = data.sprite.width * data.sprite.mapScale;
    const drawHeight = data.sprite.height * data.sprite.mapScale;
    const screen = worldToScreen(state.player.x, state.player.y);
    const drawX = screen.x - drawWidth / 2;
    const drawY = screen.y + 31 - drawHeight;

    return {
      image,
      drawWidth,
      drawHeight,
      drawX,
      drawY,
      height: drawHeight,
      shouldFlipHorizontally: state.player.facing === "right"
    };
  }

  function getPlayerDepthY() {
    const playerRenderData = getPlayerRenderData();
    const playerTopY = state.player.y + 31 - playerRenderData.height;
    return playerTopY + playerRenderData.height * 0.7;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  bootGame();
})();
