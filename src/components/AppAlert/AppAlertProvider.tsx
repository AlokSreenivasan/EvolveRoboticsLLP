import React, { useEffect, useState } from 'react';

import AppAlertModal from './AppAlertModal';
import {
  subscribeAppAlert,
  type AppAlertRequest,
} from '../../utils/alert/appAlertHost';

function AppAlertProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<AppAlertRequest | null>(null);

  useEffect(() => subscribeAppAlert(setRequest), []);

  return (
    <>
      {children}
      {request ? (
        <AppAlertModal
          key={request.id}
          visible
          title={request.title}
          message={request.message}
          buttons={request.buttons}
          onClose={() => setRequest(null)}
        />
      ) : null}
    </>
  );
}

export default AppAlertProvider;
