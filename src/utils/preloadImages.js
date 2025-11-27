import Background1 from "../assets/images/background_lvl1.png";
import Background2 from "../assets/images/background_lvl2.png";
import Background3 from "../assets/images/background_lvl3.png";
import Tooth1 from "../assets/images/tooth1.svg";
import Tooth2 from "../assets/images/tooth2.svg";
import Tooth3 from "../assets/images/tooth3.svg";
import Char1 from "../assets/images/char1.webm";
import Char2 from "../assets/images/char2.webm";
import Char3 from "../assets/images/char3.webm";
import ToothCoin from "../assets/images/tooth_coin.svg";
import ProfilePlaceholder from "../assets/images/profile-placeholder.png";

/**
 * Получение критичных изображений на основе разблокированных уровней
 */
export const getCriticalImages = (unlockedBackgrounds, unlockedTeeth, unlockedCharacters) => {
  const images = [ToothCoin];
  
  // Определяем текущий фон
  if (unlockedBackgrounds?.has(3)) {
    images.push(Background3);
  } else if (unlockedBackgrounds?.has(2)) {
    images.push(Background2);
  } else {
    images.push(Background1);
  }
  
  // Определяем текущий зуб
  if (unlockedTeeth?.has(3)) {
    images.push(Tooth3);
  } else if (unlockedTeeth?.has(2)) {
    images.push(Tooth2);
  } else {
    images.push(Tooth1);
  }
  
  // Определяем текущего персонажа
  if (unlockedCharacters?.has(3)) {
    images.push(Char3);
  } else if (unlockedCharacters?.has(2)) {
    images.push(Char2);
  } else {
    images.push(Char1);
  }
  
  return images;
};

/**
 * Получение важных изображений (все остальные разблокированные)
 */
export const getImportantImages = (unlockedBackgrounds, unlockedTeeth, unlockedCharacters) => {
  const images = [ProfilePlaceholder];
  
  // Добавляем все разблокированные фоны (кроме текущего, он уже в critical)
  unlockedBackgrounds?.forEach(level => {
    if (level === 1 && !unlockedBackgrounds.has(2) && !unlockedBackgrounds.has(3)) return;
    if (level === 2 && !unlockedBackgrounds.has(3)) images.push(Background2);
    if (level === 1) images.push(Background1);
  });
  
  // Добавляем все разблокированные зубы
  unlockedTeeth?.forEach(level => {
    if (level === 1 && !unlockedTeeth.has(2) && !unlockedTeeth.has(3)) return;
    if (level === 2 && !unlockedTeeth.has(3)) images.push(Tooth2);
    if (level === 1) images.push(Tooth1);
  });
  
  // Добавляем всех разблокированных персонажей
  unlockedCharacters?.forEach(level => {
    if (level === 1 && !unlockedCharacters.has(2) && !unlockedCharacters.has(3)) return;
    if (level === 2 && !unlockedCharacters.has(3)) images.push(Char2);
    if (level === 1) images.push(Char1);
  });
  
  return images;
};

/**
 * ДОПОЛНИТЕЛЬНЫЕ изображения - загружаются в фоне (низкий приоритет)
 */
export const additionalImages = [
  // Раскомментируйте когда добавите услуги/апгрейды
  // Discount10, Discount20, Discount30, и т.д.
];

/**
 * Кэш загруженных изображений
 */
const imageCache = new Set();

/**
 * Загрузка одного изображения
 */
const loadImage = (src) => {
  return new Promise((resolve) => {
    if (imageCache.has(src)) {
      resolve();
      return;
    }

    const img = new Image();
    img.onload = () => {
      imageCache.add(src);
      resolve();
    };
    img.onerror = () => {
      console.warn(`Failed to load: ${src}`);
      resolve();
    };
    img.src = src;
  });
};

/**
 * Загрузка массива изображений с прогрессом
 */
const loadImageBatch = (images, onProgress) => {
  return new Promise((resolve) => {
    if (images.length === 0) {
      resolve();
      return;
    }

    let loaded = 0;
    const promises = images.map((src) =>
      loadImage(src).then(() => {
        loaded++;
        if (onProgress) {
          onProgress(loaded / images.length);
        }
      })
    );

    Promise.all(promises).then(resolve);
  });
};

/**
 * Прелоад только критичных изображений (для начального экрана)
 */
export const preloadCriticalImages = (onProgress, unlockedBackgrounds, unlockedTeeth, unlockedCharacters) => {
  const images = getCriticalImages(unlockedBackgrounds, unlockedTeeth, unlockedCharacters);
  return loadImageBatch(images, onProgress);
};

/**
 * Прелоад важных изображений (в фоне после загрузки критичных)
 */
export const preloadImportantImages = (unlockedBackgrounds, unlockedTeeth, unlockedCharacters) => {
  const images = getImportantImages(unlockedBackgrounds, unlockedTeeth, unlockedCharacters);
  return loadImageBatch(images);
};

/**
 * Прелоад дополнительных изображений (низкий приоритет)
 */
export const preloadAdditionalImages = () => {
  if (additionalImages.length === 0) return Promise.resolve();
  return loadImageBatch(additionalImages);
};