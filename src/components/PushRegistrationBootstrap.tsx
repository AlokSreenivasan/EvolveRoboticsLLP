import { usePushRegistration } from '../presentation/hooks/usePushRegistration';

/** Mount inside AuthProvider to register FCM tokens for signed-in users. */
function PushRegistrationBootstrap() {
  usePushRegistration();
  return null;
}

export default PushRegistrationBootstrap;
