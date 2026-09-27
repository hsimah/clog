import { Text } from "@astryxdesign/core/Text";
import { Component, Suspense, type ReactNode } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Stack } from "@astryxdesign/core/Stack";

export class QueryBoundary extends Component<
  QueryBoundaryProps,
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidUpdate(previous: QueryBoundaryProps) {
    if (previous.resetKey !== this.props.resetKey && this.state.error)
      this.setState({ error: null });
  }
  render() {
    if (this.state.error)
      return (
        <Stack gap={3}>
          <Text role="alert">{this.state.error.message}</Text>
          <Button label="Try again" onClick={this.props.retry} />
        </Stack>
      );
    return (
      <Suspense fallback={<Text role="status">Loading...</Text>}>
        {this.props.children}
      </Suspense>
    );
  }
}

interface QueryBoundaryProps {
  children: ReactNode;
  retry: () => void;
  resetKey?: string;
}
