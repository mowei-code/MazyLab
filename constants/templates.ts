import type { Category, VideoStyle, AspectRatio } from '../types';

export const ASPECT_RATIOS: AspectRatio[] = [
  { value: '1:1', label_en: 'Square', label_zh: '方形' },
  { value: '16:9', label_en: 'Landscape', label_zh: '橫向' },
  { value: '9:16', label_en: 'Portrait', label_zh: '縱向' },
  { value: '4:3', label_en: 'Standard', label_zh: '標準' },
  { value: '3:4', label_en: 'Vertical', label_zh: '垂直' },
];

export const AD_CATEGORIES: Category[] = [
  {
    id: 'sports',
    name_en: 'Sports & Fitness',
    name_zh: '運動與健身',
    templates: Array.from({ length: 10 }, (_, i) => ({
      id: `sports_${i + 1}`,
      name_en: `Dynamic Action Shot ${i + 1}`,
      name_zh: `動態動作拍攝 ${i + 1}`,
      thumbnail: `https://picsum.photos/seed/sports${i}/400/300`,
      prompt_en: `Transform this product image into a high-energy sports advertisement. Place it in a dynamic action scene, like a stadium or on a mountain. Add motion blur and dramatic lighting. The text should be bold and motivational.`,
      prompt_zh: `將此產品圖片轉換為充滿活力的高能體育廣告。將其置於動態動作場景中，例如體育場或山上。添加運動模糊和戲劇性的燈光效果。文字應大膽且鼓舞人心。`,
    })),
  },
  {
    id: 'newspaper',
    name_en: 'Newspaper & Print',
    name_zh: '報紙與印刷',
    templates: Array.from({ length: 10 }, (_, i) => ({
      id: `newspaper_${i + 1}`,
      name_en: `Vintage Classified ${i + 1}`,
      name_zh: `復古分類廣告 ${i + 1}`,
      thumbnail: `https://picsum.photos/seed/news${i}/400/300`,
      prompt_en: `Re-imagine this product photo as a vintage, black-and-white newspaper classified ad from the 1950s. The product should be the central focus, illustrated in a classic halftone style. Add a catchy headline and a short description with a fictional price. The entire image should have an aged paper texture.`,
      prompt_zh: `將此產品照片重新構想為 1950 年代的復古黑白報紙分類廣告。產品應成為焦點，以經典的半色調風格進行插圖。添加一個引人注目的標題和帶有虛構價格的簡短描述。整個圖像應具有陳舊的紙張紋理。`,
    })),
  },
  {
    id: 'magazine',
    name_en: 'Lifestyle & Magazine',
    name_zh: '生活與雜誌',
    templates: Array.from({ length: 10 }, (_, i) => ({
      id: `magazine_${i + 1}`,
      name_en: `Glossy Spread ${i + 1}`,
      name_zh: `光面跨頁 ${i + 1}`,
      thumbnail: `https://picsum.photos/seed/mag${i}/400/300`,
      prompt_en: `Turn this product photo into a full-page, glossy lifestyle magazine advertisement. Place the product in a clean, luxurious, and aspirational setting. Use soft, elegant lighting and sophisticated typography for the ad copy.`,
      prompt_zh: `將此產品照片製作成一整頁、光鮮的生活方式雜誌廣告。將產品置於乾淨、奢華、令人嚮往的環境中。使用柔和、優雅的燈光和精緻的字體來製作廣告文案。`,
    })),
  },
  {
    id: 'figurine',
    name_en: 'Figure Creation',
    name_zh: '公仔製作',
    templates: Array.from({ length: 10 }, (_, i) => ({
      id: `figurine_${i + 1}`,
      name_en: `Collectible Figurine ${i + 1}`,
      name_zh: `收藏級公仔 ${i + 1}`,
      thumbnail: `https://picsum.photos/seed/fig${i}/400/300`,
      prompt_en: `Reimagine this product as a high-quality, detailed collectible figurine. Place it on a display stand with a clean background or in a diorama box that matches the product's theme. The lighting should be professional, highlighting the details of the figurine.`,
      prompt_zh: `將此產品重新想像成一個高品質、細節豐富的收藏級公仔。將其放置在帶有乾淨背景的展示架上，或放置在與產品主題相符的立體模型盒中。燈光應專業，突顯公仔的細節。`,
    })),
  },
  {
    id: 'anime',
    name_en: 'Anime Style',
    name_zh: '動漫風格',
    templates: Array.from({ length: 10 }, (_, i) => ({
      id: `anime_${i + 1}`,
      name_en: `Vibrant Anime Scene ${i + 1}`,
      name_zh: `活力動漫場景 ${i + 1}`,
      thumbnail: `https://picsum.photos/seed/anime${i}/400/300`,
      prompt_en: `Transform this product into a vibrant anime-style illustration. Place it in a dynamic scene with cel-shaded art, speed lines, and bright, saturated colors. Add a stylized logo or title in Japanese characters.`,
      prompt_zh: `將此產品轉變為充滿活力的動漫風格插圖。將其放置在具有賽璐珞著色藝術、速度線和明亮飽和色彩的動態場景中。添加一個帶有日文字符的風格化標誌或標題。`,
    })),
  },
  {
    id: 'transport',
    name_en: 'Urban & Transportation',
    name_zh: '城市與交通',
    templates: Array.from({ length: 10 }, (_, i) => ({
      id: `transport_${i + 1}`,
      name_en: `Bus Stop Ad ${i + 1}`,
      name_zh: `公車站廣告 ${i + 1}`,
      thumbnail: `https://picsum.photos/seed/trans${i}/400/300`,
      prompt_en: `Create an ad for this product as if it were on a bus stop shelter in a busy, modern city at night. The product should be prominently displayed and well-lit. Add reflections of city lights on the glass of the shelter.`,
      prompt_zh: `為該產品創建一個廣告，就好像它在繁忙、現代城市的夜晚的公車候車亭裡一樣。產品應突出展示且光線充足。在候車亭的玻璃上添加城市燈光的反射。`,
    })),
  },
  {
    id: 'interior',
    name_en: 'Home & Interior Design',
    name_zh: '家居與室內設計',
    templates: Array.from({ length: 10 }, (_, i) => ({
      id: `interior_${i + 1}`,
      name_en: `Minimalist Catalog ${i + 1}`,
      name_zh: `極簡主義目錄 ${i + 1}`,
      thumbnail: `https://picsum.photos/seed/int${i}/400/300`,
      prompt_en: `Feature this product in a minimalist interior design catalog. Place it in a Scandinavian-style room with neutral colors, natural light, and simple, elegant decor. The focus should be on how the product complements the space.`,
      prompt_zh: `在極簡主義室內設計目錄中展示該產品。將其放置在斯堪地那維亞風格的房間中，該房間具有中性色彩、自然光和簡約優雅的裝飾。重點應放在產品如何與空間相得益彰。`,
    })),
  },
  {
    id: 'social',
    name_en: 'Digital & Social Media',
    name_zh: '數位與社交媒體',
    templates: Array.from({ length: 10 }, (_, i) => ({
      id: `social_${i + 1}`,
      name_en: `Instagram Post ${i + 1}`,
      name_zh: `Instagram 貼文 ${i + 1}`,
      thumbnail: `https://picsum.photos/seed/social${i}/400/300`,
      prompt_en: `Generate an image for an Instagram post featuring this product. The style should be bright, trendy, and eye-catching, suitable for a social media feed. Place the product against a vibrant, solid color background or a lifestyle flat-lay scene. Add a short, engaging caption.`,
      prompt_zh: `為包含該產品的 Instagram 貼文生成一張圖片。風格應明亮、時尚、引人注目，適合社交媒體資訊流。將產品放置在充滿活力的純色背景或生活方式平面佈置場景中。添加簡短、引人勝事的標題。`,
    })),
  },
];


export const VIDEO_STYLES: VideoStyle[] = [
  {
    id: 'cinematic',
    name_en: 'Cinematic',
    name_zh: '電影感',
    prompt_en: 'A cinematic, high-quality, slow-motion video of the product with dramatic lighting.',
    prompt_zh: '一段具有戲劇性燈光效果的電影般、高品質、慢動作的產品影片。'
  },
  {
    id: 'fast_paced',
    name_en: 'Fast-Paced & Energetic',
    name_zh: '快節奏與活力',
    prompt_en: 'A fast-paced, energetic video with quick cuts, dynamic camera movements, and upbeat music, showcasing the product in action.',
    prompt_zh: '一段快節奏、充滿活力的影片，具有快速剪輯、動態攝影機移動和輕快的音樂，展示產品的實際使用情況。'
  },
  {
    id: 'minimalist',
    name_en: 'Minimalist & Clean',
    name_zh: '極簡與乾淨',
    prompt_en: 'A minimalist video featuring the product on a clean, solid-color background with smooth, subtle camera pans.',
    prompt_zh: '一段極簡主義影片，在乾淨的純色背景上展示產品，並配以流暢、細微的攝影機平移。'
  },
  {
    id: 'futuristic',
    name_en: 'Futuristic & Sci-Fi',
    name_zh: '未來與科幻',
    prompt_en: 'A futuristic, sci-fi themed video with holographic elements, neon lights, and a high-tech feel.',
    prompt_zh: '一段未來主義、科幻主題的影片，包含全息元素、霓虹燈和高科技感。'
  },
  {
    id: 'vintage',
    name_en: 'Vintage & Retro',
    name_zh: '復古與懷舊',
    prompt_en: 'A vintage-style video with a grainy, film-like texture, warm color grading, and a nostalgic feel, as if from the 1980s.',
    prompt_zh: '一段復古風格的影片，具有顆粒狀的電影質感、溫暖的色調和懷舊的感覺，彷彿來自 1980 年代。'
  }
];