import React from 'react';

interface IAccessControlContext {
  hasMadeChanges: boolean;
  setHasMadeChanges: (value: boolean) => void;
}

const initialValue: IAccessControlContext = {
  hasMadeChanges: false,
  setHasMadeChanges: () => {},
};

const AccessControlContext =
  React.createContext<IAccessControlContext>(initialValue);

const AccessControlProvider = ({ children }: { children: React.ReactNode }) => {
  const [hasMadeChanges, setHasMadeChanges] = React.useState(
    initialValue.hasMadeChanges
  );

  return (
    <AccessControlContext.Provider
      value={{ hasMadeChanges, setHasMadeChanges }}
    >
      {children}
    </AccessControlContext.Provider>
  );
};

export const useAccessControl = () => {
  const context = React.useContext(AccessControlContext);
  if (!context) {
    throw new Error(
      'useAccessControl must be used within an AccessControlProvider'
    );
  }
  return context;
};

export default AccessControlProvider;
