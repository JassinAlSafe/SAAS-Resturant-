import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AccessibilityTip, { showContextualTip } from "./AccessibilityTip";
import "@testing-library/jest-dom";

// Mock the announcer service
jest.mock("./ScreenReaderAnnouncer", () => ({
  announcer: {
    announce: jest.fn(),
  },
}));

describe("AccessibilityTip", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with correct message", () => {
    render(<AccessibilityTip message="Test accessibility tip" />);
    expect(screen.getByText("Test accessibility tip")).toBeInTheDocument();
  });

  it("has correct role for screen readers", () => {
    render(<AccessibilityTip message="Test accessibility tip" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("disappears when dismiss button is clicked", () => {
    const onDismiss = jest.fn();
    render(
      <AccessibilityTip
        message="Test accessibility tip"
        onDismiss={onDismiss}
      />
    );

    fireEvent.click(screen.getByLabelText("Dismiss accessibility tip"));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByText("Test accessibility tip")
    ).not.toBeInTheDocument();
  });

  it("automatically disappears after duration when autoDisappear is true", async () => {
    jest.useFakeTimers();
    const onDismiss = jest.fn();

    render(
      <AccessibilityTip
        message="Test accessibility tip"
        autoDisappear={true}
        duration={1000}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByText("Test accessibility tip")).toBeInTheDocument();

    // Fast-forward time
    jest.advanceTimersByTime(1100);

    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(
        screen.queryByText("Test accessibility tip")
      ).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it("uses the correct color class based on importance", () => {
    const { rerender } = render(
      <AccessibilityTip message="Info tip" importance="info" />
    );
    expect(screen.getByRole("alert")).toHaveClass("bg-info");

    rerender(<AccessibilityTip message="Warning tip" importance="warning" />);
    expect(screen.getByRole("alert")).toHaveClass("bg-warning");

    rerender(<AccessibilityTip message="Error tip" importance="error" />);
    expect(screen.getByRole("alert")).toHaveClass("bg-error");

    rerender(<AccessibilityTip message="Success tip" importance="success" />);
    expect(screen.getByRole("alert")).toHaveClass("bg-success");
  });
});

describe("showContextualTip", () => {
  it("returns the correct tip for keyboard type", () => {
    const result = showContextualTip("keyboard");
    expect(result.props.message).toContain("Shift+?");
  });

  it("returns the correct tip for mobile type", () => {
    const result = showContextualTip("mobile");
    expect(result.props.message).toContain("Swipe left or right");
  });

  it("returns the correct tip for screenReader type", () => {
    const result = showContextualTip("screenReader");
    expect(result.props.message).toContain("screen readers");
  });

  it("returns the correct tip for firstTime type", () => {
    const result = showContextualTip("firstTime");
    expect(result.props.message).toContain("Welcome!");
  });

  it("returns a custom tip when provided", () => {
    const customMessage = "This is a custom tip";
    const result = showContextualTip("custom", customMessage);
    expect(result.props.message).toBe(customMessage);
  });
});
