import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PlayButton from './PlayButton';

describe('PlayButton', () => {
  it('renders with initial state "PLAY"', () => {
    render(<PlayButton />);
    const button = screen.getByRole('button', { name: /play/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('PLAY');
    // Check for green background color (using hex or rgb if possible, but style check might be flaky without computed style)
    // We can check if the icon is present. PlayArrowIcon usually renders an svg with data-testid="PlayArrowIcon" if using MUI default, 
    // but let's just check the text for now as it's most reliable.
  });

  it('toggles to "STOP" when clicked', () => {
    render(<PlayButton />);
    const button = screen.getByRole('button', { name: /play/i });
    
    fireEvent.click(button);
    
    expect(button).toHaveTextContent('STOP');
    // Expect StopIcon to be present (implicitly via text content check if we trust the component logic, 
    // but better to check if the button name changed which we did via getByRole query in next step if we were to re-query)
    expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
  });

  it('toggles back to "PLAY" when clicked again', () => {
    render(<PlayButton />);
    const button = screen.getByRole('button', { name: /play/i });
    
    fireEvent.click(button); // To STOP
    fireEvent.click(button); // Back to PLAY
    
    expect(button).toHaveTextContent('PLAY');
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });
});
