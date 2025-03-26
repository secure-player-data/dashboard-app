import React from 'react';

type Layout = 'list' | 'grid';

type LayoutProviderProps = {
  children: React.ReactNode;
};

type LayoutProviderState = {
  layout: Layout;
  setLayout: (layout: Layout) => void;
};

const initialState: LayoutProviderState = {
  layout: 'list',
  setLayout: () => {},
};

const LayoutProviderContext =
  React.createContext<LayoutProviderState>(initialState);

export function LayoutProvider({ children }: LayoutProviderProps) {
  const [layout, setLayout] = React.useState<Layout>(initialState.layout);

  return (
    <LayoutProviderContext.Provider value={{ layout, setLayout }}>
      {children}
    </LayoutProviderContext.Provider>
  );
}

export const useLayout = () => {
  const context = React.useContext(LayoutProviderContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};

export default LayoutProvider;
