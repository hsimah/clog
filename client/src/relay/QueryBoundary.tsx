import { Component, Suspense, type ReactNode } from 'react';
import { Button } from '@astryxdesign/core/Button';
import { Stack } from '@astryxdesign/core/Stack';

interface QueryBoundaryProps { children: ReactNode; retry: () => void }
export class QueryBoundary extends Component<QueryBoundaryProps, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) return <Stack gap={3}>
      <p role="alert">{this.state.error.message}</p>
      <Button label="Try again" onClick={this.props.retry} />
    </Stack>;
    return <Suspense fallback={<p role="status">Loading...</p>}>{this.props.children}</Suspense>;
  }
}
