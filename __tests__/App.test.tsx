/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../src/App';

test('renders correctly through splash bootstrap', async () => {
  jest.useFakeTimers();

  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(async () => {
    tree = ReactTestRenderer.create(<App />);
  });

  expect(tree).toBeDefined();
  expect(tree!.toJSON()).toBeTruthy();

  // Let the minimum-splash timer and async bootstrap finish so no work
  // leaks past the test, then verify the post-splash tree still renders.
  await ReactTestRenderer.act(async () => {
    jest.runAllTimers();
  });

  expect(tree!.toJSON()).toBeTruthy();

  await ReactTestRenderer.act(async () => {
    tree!.unmount();
  });

  jest.useRealTimers();
});
