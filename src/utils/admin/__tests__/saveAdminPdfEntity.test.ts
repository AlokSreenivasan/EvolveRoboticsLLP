import {
  getAdminPdfStatusLabel,
  hasAdminPdfAttachment,
  saveAdminPdfEntity,
} from '../saveAdminPdfEntity';

describe('saveAdminPdfEntity', () => {
  it('updates existing entity without re-upload when no pending file', async () => {
    const uploadPdf = jest.fn();
    const deleteOldPdf = jest.fn();
    const createEntity = jest.fn();
    const updateEntity = jest.fn().mockResolvedValue(undefined);

    await saveAdminPdfEntity({
      editingId: 'note-1',
      pendingPdfUri: null,
      existingPdfUrl: 'https://storage.example/old.pdf',
      uploadPdf,
      deleteOldPdf,
      createEntity,
      updateEntity,
    });

    expect(uploadPdf).not.toHaveBeenCalled();
    expect(deleteOldPdf).not.toHaveBeenCalled();
    expect(createEntity).not.toHaveBeenCalled();
    expect(updateEntity).toHaveBeenCalledWith(
      'note-1',
      'https://storage.example/old.pdf',
    );
  });

  it('uploads and replaces PDF on edit when a new file is selected', async () => {
    const uploadPdf = jest
      .fn()
      .mockResolvedValue('https://storage.example/new.pdf');
    const deleteOldPdf = jest.fn().mockResolvedValue(undefined);
    const updateEntity = jest.fn().mockResolvedValue(undefined);

    await saveAdminPdfEntity({
      editingId: 'note-1',
      pendingPdfUri: 'file:///pending.pdf',
      existingPdfUrl: 'https://storage.example/old.pdf',
      uploadPdf,
      deleteOldPdf,
      createEntity: jest.fn(),
      updateEntity,
    });

    expect(uploadPdf).toHaveBeenCalledWith('note-1', 'file:///pending.pdf');
    expect(deleteOldPdf).toHaveBeenCalledWith('https://storage.example/old.pdf');
    expect(updateEntity).toHaveBeenCalledWith(
      'note-1',
      'https://storage.example/new.pdf',
    );
  });

  it('creates stub, uploads, then updates URL for new entities', async () => {
    const uploadPdf = jest
      .fn()
      .mockResolvedValue('https://storage.example/new.pdf');
    const createEntity = jest.fn().mockResolvedValue({ id: 'note-new' });
    const updateEntity = jest.fn().mockResolvedValue(undefined);

    await saveAdminPdfEntity({
      editingId: null,
      pendingPdfUri: 'file:///pending.pdf',
      existingPdfUrl: '',
      uploadPdf,
      createEntity,
      updateEntity,
    });

    expect(createEntity).toHaveBeenCalled();
    expect(uploadPdf).toHaveBeenCalledWith('note-new', 'file:///pending.pdf');
    expect(updateEntity).toHaveBeenCalledWith(
      'note-new',
      'https://storage.example/new.pdf',
    );
  });

  it('throws when creating without a pending PDF', async () => {
    await expect(
      saveAdminPdfEntity({
        editingId: null,
        pendingPdfUri: null,
        existingPdfUrl: '',
        uploadPdf: jest.fn(),
        createEntity: jest.fn(),
        updateEntity: jest.fn(),
      }),
    ).rejects.toThrow('PDF required');
  });

  it('rolls back created stub when upload fails', async () => {
    const uploadError = new Error('upload failed');
    const uploadPdf = jest.fn().mockRejectedValue(uploadError);
    const createEntity = jest.fn().mockResolvedValue({ id: 'note-new' });
    const updateEntity = jest.fn();
    const deleteCreatedEntity = jest.fn().mockResolvedValue(undefined);
    const deleteOldPdf = jest.fn();

    await expect(
      saveAdminPdfEntity({
        editingId: null,
        pendingPdfUri: 'file:///pending.pdf',
        existingPdfUrl: '',
        uploadPdf,
        deleteOldPdf,
        deleteCreatedEntity,
        createEntity,
        updateEntity,
      }),
    ).rejects.toThrow('upload failed');

    expect(updateEntity).not.toHaveBeenCalled();
    expect(deleteOldPdf).not.toHaveBeenCalled();
    expect(deleteCreatedEntity).toHaveBeenCalledWith('note-new');
  });

  it('rolls back uploaded PDF and stub when update fails after upload', async () => {
    const updateError = new Error('update failed');
    const uploadPdf = jest
      .fn()
      .mockResolvedValue('https://storage.example/new.pdf');
    const createEntity = jest.fn().mockResolvedValue({ id: 'note-new' });
    const updateEntity = jest.fn().mockRejectedValue(updateError);
    const deleteCreatedEntity = jest.fn().mockResolvedValue(undefined);
    const deleteOldPdf = jest.fn().mockResolvedValue(undefined);

    await expect(
      saveAdminPdfEntity({
        editingId: null,
        pendingPdfUri: 'file:///pending.pdf',
        existingPdfUrl: '',
        uploadPdf,
        deleteOldPdf,
        deleteCreatedEntity,
        createEntity,
        updateEntity,
      }),
    ).rejects.toThrow('update failed');

    expect(deleteOldPdf).toHaveBeenCalledWith(
      'https://storage.example/new.pdf',
    );
    expect(deleteCreatedEntity).toHaveBeenCalledWith('note-new');
  });

  it('still throws original error if rollback cleanup fails', async () => {
    const uploadError = new Error('upload failed');
    const uploadPdf = jest.fn().mockRejectedValue(uploadError);
    const createEntity = jest.fn().mockResolvedValue({ id: 'note-new' });
    const deleteCreatedEntity = jest
      .fn()
      .mockRejectedValue(new Error('cleanup failed'));

    await expect(
      saveAdminPdfEntity({
        editingId: null,
        pendingPdfUri: 'file:///pending.pdf',
        existingPdfUrl: '',
        uploadPdf,
        deleteCreatedEntity,
        createEntity,
        updateEntity: jest.fn(),
      }),
    ).rejects.toThrow('upload failed');
  });
});

describe('getAdminPdfStatusLabel', () => {
  it('reflects pending, existing, and empty states', () => {
    expect(getAdminPdfStatusLabel('file:///a.pdf', '')).toBe('New PDF selected');
    expect(getAdminPdfStatusLabel(null, 'https://x.pdf')).toBe(
      'Current PDF attached',
    );
    expect(getAdminPdfStatusLabel(null, '')).toBe('No PDF selected');
  });
});

describe('hasAdminPdfAttachment', () => {
  it('is true when pending or existing URL is set', () => {
    expect(hasAdminPdfAttachment('file:///a.pdf', '')).toBe(true);
    expect(hasAdminPdfAttachment(null, 'https://x.pdf')).toBe(true);
    expect(hasAdminPdfAttachment(null, '')).toBe(false);
  });
});
