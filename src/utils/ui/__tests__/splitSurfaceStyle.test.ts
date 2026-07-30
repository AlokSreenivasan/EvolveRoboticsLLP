import { splitSurfaceStyle } from '../splitSurfaceStyle';

describe('splitSurfaceStyle', () => {
  it('keeps layout on the shell and padding on the content surface', () => {
    const { shell, content } = splitSurfaceStyle({
      marginBottom: 12,
      width: '100%',
      padding: 20,
      flexDirection: 'row',
      backgroundColor: '#FAF2FF',
    });

    expect(shell).toEqual({
      marginBottom: 12,
      width: '100%',
      backgroundColor: '#FAF2FF',
    });
    expect(content).toEqual({
      padding: 20,
      flexDirection: 'row',
      backgroundColor: '#FAF2FF',
    });
  });

  it('returns empty objects for undefined style', () => {
    expect(splitSurfaceStyle(undefined)).toEqual({ shell: {}, content: {} });
  });
});
