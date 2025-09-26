
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { translations } from './constants/localization';
import { AD_CATEGORIES, VIDEO_STYLES, ASPECT_RATIOS } from './constants/templates';
import { generateImageAd, generateVideo, getVideosOperation, compositeImages, generateImageFromText, fetchVideo } from './services/geminiService';
import { UploadIcon, CloseIcon, SpinnerIcon, DownloadIcon, RefreshIcon, TrashIcon, FacebookIcon, InstagramIcon, LineIcon, YouTubeIcon, UserIcon, LogoutIcon, CogIcon } from './components/IconComponents';
import AuthComponent from './components/AuthComponent';
import AdminPanel from './components/AdminPanel';
import type { Language, Category, Template, GeneratedAd, VideoStyle, AspectRatioValue, User, RegistrationData } from './types';

type ImageFile = { file: File; dataUrl: string };
type CompositeImage = { url: string; base64: string; mimeType: string };


const App: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [showAdminPanel, setShowAdminPanel] = useState<boolean>(false);

  // App Core State
  const [language, setLanguage] = useState<Language>('en');
  const [images, setImages] = useState<(ImageFile | null)[]>([null, null, null]);
  const [compositeImage, setCompositeImage] = useState<CompositeImage | null>(null);
  const [compositePrompt, setCompositePrompt] = useState<string>('');
  const [adType, setAdType] = useState<'image' | 'video' | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioValue | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [videoOperation, setVideoOperation] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedAd, setGeneratedAd] = useState<GeneratedAd | null>(null);
  const [editedAdText, setEditedAdText] = useState<string | null>(null);
  const [isModalActive, setIsModalActive] = useState<boolean>(false);

  // Seed/Reset admin user on initial load
  useEffect(() => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('mazylab_users') || '{}');
      const adminEmail = 'admin@mazylab.com';
      
      // Always ensure the admin user exists and the password is set to 'adminpassword'.
      // This will overwrite any changes made to the admin account profile, including a changed password.
      storedUsers[adminEmail] = {
        password: 'adminpassword',
        company: 'MazyLab',
        school: 'Admin',
        industry: 'Administration',
        phone: 'N/A'
      };
      localStorage.setItem('mazylab_users', JSON.stringify(storedUsers));
    } catch (e) {
      console.error("Failed to seed/reset admin user", e);
    }
  }, []);
  
  // Check for logged-in user on initial load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('mazylab_user');
      if (storedUser) {
        const user: User = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
        if (user.email === 'admin@mazylab.com') {
            setIsAdmin(true);
        }
      }
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem('mazylab_user');
    }
  }, []);

  useEffect(() => {
    if (generatedAd) setEditedAdText(generatedAd.text);
  }, [generatedAd]);
  
  const showModal = isLoading || !!error || !!generatedAd;

  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => setIsModalActive(true), 10);
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  const t = useCallback((key: keyof typeof translations['en'] | string) => {
    const castKey = key as keyof typeof translations['en'];
    return translations[language][castKey] || translations['en'][castKey] || key;
  }, [language]);

  const handleLanguageSwitch = () => {
    setLanguage(prev => (prev === 'en' ? 'zh' : 'en'));
    setSelectedCategory(null);
  };
  
  // --- Auth Handlers ---
  const handleLogin = async (email: string, pass: string) => {
    setIsAuthLoading(true);
    setAuthError(null);
    await new Promise(res => setTimeout(res, 1000)); // Simulate network delay
    try {
        const storedUsers = JSON.parse(localStorage.getItem('mazylab_users') || '{}');
        const userData = storedUsers[email];
        if (userData && userData.password === pass) {
            const user: User = { 
                email,
                company: userData.company,
                school: userData.school,
                industry: userData.industry,
                phone: userData.phone
            };
            localStorage.setItem('mazylab_user', JSON.stringify(user));
            setCurrentUser(user);
            setIsAuthenticated(true);
            if (user.email === 'admin@mazylab.com') {
                setIsAdmin(true);
            }
        } else {
            setAuthError(t('auth_error_login_failed'));
        }
    } catch(e) {
        setAuthError(t('auth_error_login_failed'));
    }
    setIsAuthLoading(false);
  };
  
  const handleRegister = async (data: RegistrationData) => {
    setIsAuthLoading(true);
    setAuthError(null);
    await new Promise(res => setTimeout(res, 1000)); // Simulate network delay
    try {
        const storedUsers = JSON.parse(localStorage.getItem('mazylab_users') || '{}');
        if (storedUsers[data.email]) {
            setAuthError(t('auth_error_register_failed'));
        } else {
            storedUsers[data.email] = data;
            localStorage.setItem('mazylab_users', JSON.stringify(storedUsers));
            
            const user: User = { 
                email: data.email,
                company: data.company,
                school: data.school,
                industry: data.industry,
                phone: data.phone
            };
            localStorage.setItem('mazylab_user', JSON.stringify(user));
            setCurrentUser(user);
            setIsAuthenticated(true);
        }
    } catch(e) {
        setAuthError(t('auth_error_register_failed'));
    }
    setIsAuthLoading(false);
  };
  
  const handleLogout = () => {
      localStorage.removeItem('mazylab_user');
      setCurrentUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
  };


  // --- App Logic Handlers ---
  const resetFlow = () => {
      setCompositeImage(null);
      setAdType(null);
      setAspectRatio(null);
      setSelectedCategory(null);
      setGeneratedAd(null);
      setError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const newImages = [...images];
        newImages[index] = { file, dataUrl: reader.result as string };
        setImages(newImages);
        resetFlow();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
    resetFlow();
  };

  const handleComposite = async () => {
    const uploadedImages = images.filter((img): img is ImageFile => !!img);

    setIsLoading(true);
    setError(null);
    setGeneratedAd(null);

    try {
        let result;
        if (uploadedImages.length >= 2) {
            setLoadingMessage(t('compositing_message'));
            const imagePayload = uploadedImages.map(img => ({
                base64ImageData: img.dataUrl.split(',')[1],
                mimeType: img.file.type
            }));
            result = await compositeImages(imagePayload, compositePrompt);
        } else {
            if (!compositePrompt.trim()) {
                setError(t('error_prompt_empty'));
                setIsLoading(false);
                return;
            }
            setLoadingMessage(t('generating_image_message'));
            result = await generateImageFromText(compositePrompt);
        }
        setCompositeImage({
            url: result.url,
            base64: result.base64,
            mimeType: result.mimeType
        });
    } catch (err) {
        setError(err instanceof Error ? err.message : t('error_generation_failed'));
    } finally {
        setIsLoading(false);
    }
  };

  const handleTemplateSelect = async (template: Template) => {
    if (!compositeImage || !aspectRatio) {
      setError(t('error_no_aspect_ratio'));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setGeneratedAd(null);
    setLoadingMessage(t('generating_ad'));

    try {
      const prompt = language === 'en' ? template.prompt_en : template.prompt_zh;
      const result = await generateImageAd(compositeImage.base64, compositeImage.mimeType, prompt, aspectRatio);
      setGeneratedAd(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_generation_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoStyleSelect = async (style: VideoStyle) => {
    if (!compositeImage || !aspectRatio) {
      setError(t('error_no_aspect_ratio'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedAd(null);
    setLoadingMessage(t('generating_video'));

    try {
        const prompt = language === 'en' ? style.prompt_en : style.prompt_zh;
        setEditedAdText(prompt);
        const operation = await generateVideo(compositeImage.base64, compositeImage.mimeType, prompt, aspectRatio);
        setVideoOperation(operation);
    } catch (err) {
        setError(err instanceof Error ? err.message : t('error_generation_failed'));
        setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (!videoOperation) return;
    const pollInterval = setInterval(async () => {
        try {
            const updatedOperation = await getVideosOperation(videoOperation);
            if (updatedOperation.done) {
                clearInterval(pollInterval);
                setVideoOperation(null);
                const videoUri = updatedOperation.response?.generatedVideos?.[0]?.video?.uri;
                if (videoUri) {
                    setLoadingMessage("Almost there! Fetching your video...");
                    const objectURL = await fetchVideo(videoUri);
                    setGeneratedAd({ type: 'video', url: objectURL, text: editedAdText });
                } else {
                    throw new Error("Video generation finished, but no video URL was found.");
                }
                setIsLoading(false);
            } else { setVideoOperation(updatedOperation); }
        } catch (err) {
            let errorMessage = t('error_generation_failed');
            if (err instanceof Error) {
                errorMessage = err.message;
            } else if (err && typeof err === 'object' && 'message' in err && typeof (err as any).message === 'string' && (err as any).message) {
                errorMessage = (err as { message: string }).message;
            } else if (typeof err === 'string' && err) {
                errorMessage = err;
            }
            setError(errorMessage);
            setIsLoading(false);
            clearInterval(pollInterval);
        }
    }, 10000);
    return () => clearInterval(pollInterval);
}, [videoOperation, t, editedAdText]);

  const handleRegenerate = async () => {
    if (!compositeImage || !editedAdText || !generatedAd || generatedAd.type !== 'image' || !aspectRatio) {
      setError(t('error_regeneration_failed'));
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedAd(null);
    setLoadingMessage(t('generating_ad'));
    try {
      const result = await generateImageAd(compositeImage.base64, compositeImage.mimeType, editedAdText, aspectRatio);
      setGeneratedAd(result);
    } catch (err) {
        setError(err instanceof Error ? err.message : t('error_generation_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalActive(false);
    setTimeout(() => {
      if (generatedAd?.type === 'video' && generatedAd.url) {
        URL.revokeObjectURL(generatedAd.url);
      }
      setGeneratedAd(null);
      setError(null);
    }, 300);
  };
  
  const handleDownloadCompositeImage = () => {
    if (!compositeImage?.base64 || !compositeImage.mimeType) return;
    
    try {
      const byteCharacters = atob(compositeImage.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: compositeImage.mimeType });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      const extension = compositeImage.mimeType.split('/')[1] || 'png';
      link.download = `mazylab-composite.${extension}`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download composite image:", error);
      if (compositeImage.url) {
        const link = document.createElement('a');
        link.href = compositeImage.url;
        const extension = compositeImage.mimeType.split('/')[1] || 'png';
        link.download = `mazylab-composite.${extension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const handleDownload = async () => {
    if (!generatedAd?.url) return;
    const link = document.createElement('a');
    link.href = generatedAd.url;
    link.download = `mazylab-ad.${generatedAd.type === 'image' ? 'png' : 'mp4'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (!generatedAd?.url || typeof navigator.share !== 'function') return;
    try {
      const response = await fetch(generatedAd.url);
      const blob = await response.blob();
      const extension = generatedAd.type === 'video' ? 'mp4' : (blob.type.split('/')[1] || 'png');
      const file = new File([blob], `mazylab-ad.${extension}`, { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: t('ad_preview_title'), text: editedAdText || t('subtitle') });
      } else {
        await navigator.share({ title: t('ad_preview_title'), text: editedAdText || t('subtitle') });
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        console.error('Share failed:', err);
      }
    }
  };
  
  const currentTemplates = useMemo(() => selectedCategory ? selectedCategory.templates : [], [selectedCategory]);
  const uploadedImageCount = useMemo(() => images.filter(Boolean).length, [images]);

  if (!isAuthenticated) {
    return <AuthComponent onLogin={handleLogin} onRegister={handleRegister} isLoading={isAuthLoading} authError={authError} t={t} />;
  }
  
  if (isAdmin && showAdminPanel) {
    return <AdminPanel t={t} onClose={() => setShowAdminPanel(false)} />;
  }

  return (
    <div className="min-h-screen text-gray-200 font-sans p-4 sm:p-8 flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-grow">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">{t('title')}</h1>
            <p className="text-gray-400 mt-1">{t('subtitle')}</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 text-sm text-gray-300">
                <UserIcon className="h-6 w-6"/>
                <span>{currentUser?.email}</span>
             </div>
             {isAdmin && (
                <button onClick={() => setShowAdminPanel(true)} className="bg-gray-700 text-white font-semibold p-2 rounded-lg hover:bg-yellow-500 transition-colors" aria-label={t('admin_panel_title')}>
                    <CogIcon className="h-5 w-5"/>
                </button>
             )}
             <button onClick={handleLogout} className="bg-gray-700 text-white font-semibold p-2 rounded-lg hover:bg-red-600 transition-colors" aria-label={t('auth_logout_cta')}>
                <LogoutIcon className="h-5 w-5"/>
             </button>
             <button onClick={handleLanguageSwitch} className="bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors" aria-label={`Switch to ${language === 'en' ? 'Chinese' : 'English'}`}>{language === 'en' ? '中文' : 'English'}</button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section aria-labelledby="step1-title" className="lg:col-span-1 bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col gap-6">
            <div>
              <h2 id="step1-title" className="text-xl font-semibold text-white mb-4">{t('upload_step_title')}</h2>
              <div className="grid grid-cols-3 gap-4">
                {images.map((img, index) => (
                  <div key={index} className="flex flex-col">
                    <label htmlFor={`upload-input-${index}`} className="text-center text-sm font-medium text-gray-400 mb-1">
                      {t(`upload_image_label_${index + 1}`)}
                    </label>
                    <div className="relative aspect-square border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center text-center bg-gray-900 hover:border-blue-500 transition-colors group">
                      <input id={`upload-input-${index}`} type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => handleImageChange(e, index)} accept="image/png, image/jpeg, image/webp" aria-label={t(`upload_image_label_${index + 1}`)}/>
                      {img ? (
                        <>
                          <img src={img.dataUrl} alt={`Product upload ${index + 1}`} className="max-h-full max-w-full object-contain rounded-md" />
                          <button onClick={() => handleRemoveImage(index)} className="absolute top-1 right-1 bg-red-600 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-20" aria-label={`Remove image ${index + 1}`}>
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <div className="text-gray-400 text-xs px-1">
                          <UploadIcon className="mx-auto h-6 w-6 text-gray-500 mb-1" />
                          <span className="font-semibold text-blue-400">{t('upload_cta')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={`transition-all duration-500 ease-in-out`}>
                <h2 id="step2-title" className="text-xl font-semibold text-white mb-4">{t('composite_step_title')}</h2>
                <div className="mb-4">
                  <label htmlFor="composite-prompt" className="block text-sm font-medium text-gray-300 mb-2">{t('composite_prompt_label')}</label>
                  <textarea
                    id="composite-prompt"
                    rows={3}
                    value={compositePrompt}
                    onChange={(e) => setCompositePrompt(e.target.value)}
                    placeholder={t('composite_prompt_placeholder')}
                    className="w-full bg-gray-900 p-3 rounded-lg text-gray-300 text-sm resize-none border border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    aria-label={t('composite_prompt_label')}
                  />
                </div>
                {compositeImage ? (
                    <div className="space-y-4">
                        <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                           <img src={compositeImage.url} alt="Composite product" className="w-full h-auto object-contain" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button onClick={handleDownloadCompositeImage} className="sm:col-span-1 flex items-center justify-center gap-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                                <DownloadIcon className="h-5 w-5" /> {t('download_composite_cta')}
                            </button>
                            <button onClick={handleComposite} disabled={isLoading} className="sm:col-span-1 flex items-center justify-center gap-2 bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                                <RefreshIcon className="h-5 w-5" /> {t('recomposite_cta')}
                            </button>
                            <button onClick={resetFlow} className="sm:col-span-1 bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">{t('clear_composite_cta')}</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={handleComposite} disabled={isLoading || (uploadedImageCount < 2 && !compositePrompt.trim())} className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                        {uploadedImageCount >= 2 ? t('composite_cta') : t('generate_image_cta')}
                    </button>
                )}
            </div>

            <div className={`transition-all duration-500 ease-in-out ${!compositeImage ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                <h2 id="step3-title" className="text-xl font-semibold text-white mb-4">{t('ad_type_step_title')}</h2>
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => { setAdType('image'); setAspectRatio(null); }} disabled={!compositeImage} className={`py-3 px-4 rounded-lg font-semibold transition-all ${adType === 'image' ? 'bg-blue-600 text-white scale-105' : 'bg-gray-700 hover:bg-gray-600'}`}>{t('image_ad')}</button>
                    <button onClick={() => { setAdType('video'); setAspectRatio(null); }} disabled={!compositeImage} className={`py-3 px-4 rounded-lg font-semibold transition-all ${adType === 'video' ? 'bg-purple-600 text-white scale-105' : 'bg-gray-700 hover:bg-gray-600'}`}>{t('video_ad')}</button>
                </div>
            </div>
          </section>

          <section aria-live="polite" className={`lg:col-span-2 bg-gray-800 p-6 rounded-2xl shadow-lg transition-opacity duration-500 ${!compositeImage ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className={`transition-all duration-500 ease-in-out space-y-6 ${!adType ? 'opacity-40 pointer-events-none' : ''}`}>
              <div>
                  <h2 id="aspect-ratio-step-title" className="text-xl font-semibold text-white mb-4">{t('aspect_ratio_step_title')}</h2>
                  <div className="flex flex-wrap gap-3">
                      {ASPECT_RATIOS.map(ratio => (
                          <button key={ratio.value} onClick={() => setAspectRatio(ratio.value)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${aspectRatio === ratio.value ? 'bg-green-600 text-white shadow-md scale-105' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`} aria-pressed={aspectRatio === ratio.value}>
                              {language === 'en' ? ratio.label_en : ratio.label_zh} ({ratio.value})
                          </button>
                      ))}
                  </div>
              </div>
            </div>

            <div className={`transition-opacity duration-500 mt-6 ${!aspectRatio ? 'opacity-40 pointer-events-none' : ''}`}>
              <div className={`${adType !== 'image' ? 'hidden' : ''}`}>
                <h2 id="step4-title" className="text-xl font-semibold text-white mb-4">{t('category_step_title')}</h2>
                <div className="flex flex-wrap gap-3 mb-6">
                  {AD_CATEGORIES.map(category => (<button key={category.id} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${selectedCategory?.id === category.id ? 'bg-blue-600 text-white shadow-md scale-105' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`} aria-pressed={selectedCategory?.id === category.id}>{language === 'en' ? category.name_en : category.name_zh}</button>))}
                </div>
                <div className={`transition-all duration-500 ease-in-out ${!selectedCategory ? 'opacity-40 pointer-events-none translate-y-4' : 'opacity-100 translate-y-0'}`}>
                  <h2 id="step5-title" className="text-xl font-semibold text-white mb-4">{t('template_step_title')}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-[350px] overflow-y-auto pr-2">
                    {currentTemplates.map(template => (<button key={template.id} onClick={() => handleTemplateSelect(template)} className="group relative aspect-w-4 aspect-h-3 rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500" disabled={!selectedCategory}><img src={template.thumbnail} alt={language === 'en' ? template.name_en : template.name_zh} className="object-cover w-full h-full" /><div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-60 transition-all duration-300 flex items-end p-2"><p className="text-white text-xs font-bold text-left drop-shadow-md">{language === 'en' ? template.name_en : template.name_zh}</p></div></button>))}
                  </div>
                </div>
              </div>

              <div className={`${adType !== 'video' ? 'hidden' : ''}`}>
                <h2 id="video-step-title" className="text-xl font-semibold text-white mb-4">{t('video_style_step_title')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {VIDEO_STYLES.map(style => (<button key={style.id} onClick={() => handleVideoStyleSelect(style)} className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 hover:scale-105 transition-all text-left"><p className="font-bold text-lg text-purple-300">{language === 'en' ? style.name_en : style.name_zh}</p><p className="text-sm text-gray-400 mt-1">{language === 'en' ? style.prompt_en : style.prompt_zh}</p></button>))}
                </div>
              </div>
            </div>
          </section>
        </main>
        
        {showModal && (
          <div className={`fixed inset-0 bg-black flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out ${isModalActive ? 'bg-opacity-70' : 'bg-opacity-0'}`} aria-modal="true" role="dialog">
            <div className={`bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transition-all duration-300 ease-in-out ${isModalActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'}`}>
              {(isLoading && !generatedAd) && (
                <div className="flex flex-col items-center justify-center p-16 text-center">
                  <SpinnerIcon className="h-16 w-16 text-blue-500 animate-spin mb-6" />
                  <h3 className="text-2xl font-bold text-white">{loadingMessage || t('generating_ad')}</h3>
                  <p className="text-gray-400 mt-2">{videoOperation ? t('generating_video_subtext') : t('generating_ad_subtext')}</p>
                </div>
              )}
              {error && (
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-red-500 mb-4">{t('error_title')}</h3>
                  <p className="text-gray-300 mb-6">{error}</p>
                  <button onClick={closeModal} className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700 transition-colors">{t('close')}</button>
                </div>
              )}
              {generatedAd && (
                <>
                  <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-xl font-bold text-white">{t('ad_preview_title')}</h3>
                    <button onClick={closeModal} aria-label={t('close')} className="text-gray-400 hover:text-white transition-colors"><CloseIcon className="h-6 w-6" /></button>
                  </div>
                  <div className="flex-grow p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
                    <div className="bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
                      {generatedAd.type === 'image' && generatedAd.url && <img src={generatedAd.url} alt="Generated Ad" className="w-full h-auto object-contain max-h-full" />}
                      {generatedAd.type === 'video' && generatedAd.url && <video src={generatedAd.url} controls autoPlay loop className="w-full h-auto object-contain max-h-full" />}
                    </div>
                    <div>
                        <label htmlFor="ad-copy-prompt" className="font-semibold text-lg mb-2 text-blue-400 block">{t('ad_copy_prompt')}</label>
                        <textarea id="ad-copy-prompt" value={editedAdText || ''} onChange={(e) => setEditedAdText(e.target.value)} className="w-full h-48 bg-gray-900 p-4 rounded-lg text-gray-300 whitespace-pre-wrap text-sm resize-none border border-gray-700 focus:ring-blue-500 focus:border-blue-500" aria-label={t('ad_copy_prompt')} readOnly={generatedAd.type === 'video'}/>
                    </div>
                  </div>
                  <div className="flex-shrink-0 p-4 bg-gray-800 border-t border-gray-700 flex flex-col sm:flex-row justify-end items-center gap-3">
                      {generatedAd.type === 'image' && (<button onClick={handleRegenerate} className="w-full sm:w-auto bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"><RefreshIcon className="h-5 w-5" />{t('regenerate_ad')}</button>)}
                      <button onClick={handleDownload} className="w-full sm:w-auto bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"><DownloadIcon className="h-5 w-5" />{generatedAd.type === 'video' ? t('download_video') : t('download_ad')}</button>
                      {typeof navigator.share === 'function' && (
                          <div className="flex items-center gap-2 text-white">
                              <button onClick={handleShare} title="Facebook" className="p-2 rounded-full bg-gray-700 hover:bg-blue-600 transition-colors"><FacebookIcon className="h-6 w-6"/></button>
                              <button onClick={handleShare} title="Instagram" className="p-2 rounded-full bg-gray-700 hover:bg-gradient-to-br from-purple-600 via-pink-600 to-yellow-500 transition-all"><InstagramIcon className="h-6 w-6"/></button>
                              <button onClick={handleShare} title="Line" className="p-2 rounded-full bg-gray-700 hover:bg-green-500 transition-colors"><LineIcon className="h-6 w-6"/></button>
                              {generatedAd.type === 'video' && (
                                  <button onClick={handleDownload} title="Upload to YouTube (will download video first)" className="p-2 rounded-full bg-gray-700 hover:bg-red-600 transition-colors"><YouTubeIcon className="h-6 w-6"/></button>
                              )}
                          </div>
                      )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <footer className="text-center text-gray-500 text-sm py-8 mt-8 flex-shrink-0">{t('footer_text')}</footer>
    </div>
  );
};

const container = document.getElementById('root');
if (!container) throw new Error('Could not find root element');
const root = ReactDOM.createRoot(container);
root.render(<App />);
