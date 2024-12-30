// src/components/NoSSRComponent.js
import { useEffect, useState } from 'react';

const NoSSRComponent = ({ children }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <>{children}</>;
};

export default NoSSRComponent;
