import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PlayButton from "./PlayButton";
import { AppProvider } from "../../AppContext";

describe("PlayButton", () => {
  it('renders with initial state "PLAY"', () => {
    render(
      <AppProvider>
        <PlayButton />
      </AppProvider>
    );
    const button = screen.getByRole("button", { name: /play/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("PLAY");
  });

  it('toggles to "STOP" when clicked', () => {
    render(
      <AppProvider>
        <PlayButton />
      </AppProvider>
    );
    const button = screen.getByRole("button", { name: /play/i });

    fireEvent.click(button);

    expect(button).toHaveTextContent("STOP");
    expect(screen.getByRole("button", { name: /stop/i })).toBeInTheDocument();
  });

  it('toggles back to "PLAY" when clicked again', () => {
    render(
      <AppProvider>
        <PlayButton />
      </AppProvider>
    );
    const button = screen.getByRole("button", { name: /play/i });

    fireEvent.click(button); // To STOP
    fireEvent.click(button); // Back to PLAY

    expect(button).toHaveTextContent("PLAY");
    expect(screen.getByRole("button", { name: /play/i })).toBeInTheDocument();
  });
});
