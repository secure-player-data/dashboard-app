import React, { useEffect } from 'react';

export function usePageTitle(initTitle: string) {
  const [title, setTitle] = React.useState(initTitle);

  useEffect(() => {
    document.title = title;
  }, [title]);

  return {
    title,
    setTitle,
  };
}
