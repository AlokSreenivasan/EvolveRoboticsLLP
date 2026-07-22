import { FirebaseServiceError } from '../../firebase/errors';
import { toAdminWriteErrorMessage } from '../adminWriteErrorMessage';

describe('toAdminWriteErrorMessage', () => {
  test('labels wrapped Storage upload denials as Storage', () => {
    const error = new FirebaseServiceError(
      'UPLOAD_FAILED',
      'User does not have permission to access this object.',
      { code: 'storage/unauthorized', message: 'permission denied' },
    );

    const message = toAdminWriteErrorMessage(error);
    expect(message).toContain('Storage permission denied');
    expect(message).toContain('firebase deploy --only storage,firestore:rules');
    expect(message).toContain('"admin" or "superadmin"');
  });

  test('passes through non-permission errors', () => {
    expect(toAdminWriteErrorMessage(new Error('Network down'))).toBe(
      'Network down',
    );
  });
});
