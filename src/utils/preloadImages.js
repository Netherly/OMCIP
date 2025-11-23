import Background1 from "../assets/images/background_lvl1.svg";
import Background2 from "../assets/images/background_lvl2.svg";
import Background3 from "../assets/images/background_lvl3.svg";
import Tooth1 from "../assets/images/tooth1.svg";
import Tooth2 from "../assets/images/tooth2.svg";
import Tooth3 from "../assets/images/tooth3.svg";
import Char1 from "../assets/images/char1.svg";
import Char2 from "../assets/images/char2.svg";
import Char3 from "../assets/images/char3.svg";
import ToothCoin from "../assets/images/tooth_coin.svg";
import ProfilePlaceholder from "../assets/images/profile-placeholder.png";

/**
 * КРИТИЧНЫЕ изображения - загружаются сразу (главный экран)
 */
export const criticalImages = [
  Background1,  // Фон первого уровня
  Tooth1,       // Зуб первого уровня
  Char1,        // Персонаж первого уровня
  ToothCoin,    // Монетка (показывается сразу)
];

/**
 * ВАЖНЫЕ изображения - загружаются после критичных (второй приоритет)
 */
export const importantImages = [
  Background2,
  Background3,
  Tooth2,
  Tooth3,
  Char2,
  Char3,
  ProfilePlaceholder,
];

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
export const preloadCriticalImages = (onProgress) => {
  console.log(`⚡ Loading ${criticalImages.length} critical images...`);
  return loadImageBatch(criticalImages, onProgress).then(() => {
    console.log(`✅ Critical images loaded`);
  });
};

/**
 * Прелоад важных изображений (в фоне после загрузки критичных)
 */
export const preloadImportantImages = () => {
  console.log(`📦 Loading ${importantImages.length} important images in background...`);
  return loadImageBatch(importantImages).then(() => {
    console.log(`✅ Important images loaded`);
  });
};

/**
 * Прелоад дополнительных изображений (низкий приоритет)
 */
export const preloadAdditionalImages = () => {
  if (additionalImages.length === 0) return Promise.resolve();
  
  console.log(`📦 Loading ${additionalImages.length} additional images...`);
  return loadImageBatch(additionalImages).then(() => {
    console.log(`✅ Additional images loaded`);
  });
};

/**
 * УСТАРЕВШАЯ функция - оставлена для совместимости
 * Используйте preloadCriticalImages вместо неё
 */
export const preloadImages = (onProgress) => {
  console.warn('⚠️ preloadImages is deprecated. Use preloadCriticalImages instead.');
  return preloadCriticalImages(onProgress);
};