import { useEffect, useState } from "react";

const useSplashScreen = () => {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isAppReady, setIsAppReady] = useState<boolean>(false);

  useEffect(() => {
    setShowSplash(true);
    setIsAppReady(false);
  }, []);

  const hideSplash = () => {
    setShowSplash(false);
    setIsAppReady(true);
  };

  return {
    showSplash,
    isAppReady,
    hideSplash,
  };
};

export default useSplashScreen;
