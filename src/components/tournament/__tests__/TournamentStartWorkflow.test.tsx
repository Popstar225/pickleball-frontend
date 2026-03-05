/**
 * TournamentStartWorkflow.test.tsx
 *
 * Unit tests for TournamentStartWorkflow component
 * Tests validation display, event management, and start confirmation
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import '@testing-library/jest-dom';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import TournamentStartWorkflow from '../TournamentStartWorkflow';
import tournamentReducer from '@/store/slices/tournamentSlice';

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ tournamentId: 'tour-123' }),
  };
});

describe('TournamentStartWorkflow Component', () => {
  let store;
  let mockDispatch;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        tournament: tournamentReducer,
      },
      preloadedState: {
        tournament: {
          currentTournament: {
            id: 'tour-123',
            name: 'Summer Tournament',
            status: 'registration',
            start_date: '2024-06-01',
            end_date: '2024-06-15',
            organizer_id: 'org-123',
            total_events: 3,
            total_registrations: 24,
            events: [],
          } as any,
          validation: null,
          loading: false,
          error: null,
          successMessage: null,
        },
      },
    });

    mockDispatch = vi.fn();
  });

  const renderComponent = (props = {}) => {
    return render(
      <Provider store={store}>
        <Router>
          <TournamentStartWorkflow />
        </Router>
      </Provider>,
    );
  };

  describe('Layout and Tabs', () => {
    it('should render the main workflow component', () => {
      renderComponent();
      expect(screen.getByText(/Tournament Start Workflow/i)).toBeInTheDocument();
    });

    it('should display tab navigation', () => {
      renderComponent();
      expect(screen.getByText(/Overview/i)).toBeInTheDocument();
      expect(screen.getByText(/Events Management/i)).toBeInTheDocument();
      expect(screen.getByText(/Validation/i)).toBeInTheDocument();
      expect(screen.getByText(/Progress/i)).toBeInTheDocument();
    });

    it('should show Overview tab by default', () => {
      renderComponent();
      const overviewTab = screen.getByRole('tab', { name: /Overview/i });
      expect(overviewTab).toHaveAttribute('data-state', 'active');
    });
  });

  describe('Tournament Status Display', () => {
    it('should show tournament name and status', () => {
      renderComponent();
      expect(screen.getByText('Summer Tournament')).toBeInTheDocument();
      expect(screen.getByText(/registration/i)).toBeInTheDocument();
    });

    it('should display registration summary', () => {
      renderComponent();
      expect(screen.getByText(/24/)).toBeInTheDocument(); // total registrations
      expect(screen.getByText(/3/)).toBeInTheDocument(); // total events
    });

    it('should show status badge with appropriate color', () => {
      renderComponent();
      const statusBadge = screen.getByText('registration');
      expect(statusBadge).toHaveClass('badge');
    });
  });

  describe('Event Health Display', () => {
    it('should display event health cards in Overview', () => {
      renderComponent();
      // Component should render health cards (EventHealthCard components)
      expect(screen.getByText(/Tournament Status/i)).toBeInTheDocument();
    });

    it('should show quick status for each event', async () => {
      renderComponent();

      // Navigate to Events Management tab if needed
      const eventsTab = screen.getByRole('tab', { name: /Events Management/i });
      fireEvent.click(eventsTab);

      await waitFor(() => {
        // Should display event management table or cards
        expect(screen.getByText(/Events/i)).toBeInTheDocument();
      });
    });
  });

  describe('Validation Panel', () => {
    it('should display validation results in Validation tab', () => {
      renderComponent();

      const validationTab = screen.getByRole('tab', { name: /Validation/i });
      fireEvent.click(validationTab);

      // Validation panel should be visible
      expect(screen.getByText(/Validation/i)).toBeInTheDocument();
    });

    it('should show blocking issues if present', async () => {
      store = configureStore({
        reducer: {
          tournaments: tournamentReducer,
        },
        preloadedState: {
          tournaments: {
            currentTournament: {
              id: 'tour-123',
              name: 'Test Tournament',
              status: 'registration',
            },
            validation: {
              isValid: false,
              issues: [
                {
                  event: '4.0 M Doubles',
                  severity: 'error',
                  message: 'Insufficient registrations',
                },
              ],
              warnings: [],
              checks: [],
              events: [],
              summary: 'Validation failed',
            },
            loading: false,
            error: null,
            successMessage: null,
          },
        },
      });

      renderComponent();
      const validationTab = screen.getByRole('tab', { name: /Validation/i });
      fireEvent.click(validationTab);

      // Should show blocking issues
      expect(screen.getByText(/Blocking Issues/i)).toBeInTheDocument();
    });

    it('should disable Start button when validation fails', async () => {
      store = configureStore({
        reducer: {
          tournaments: tournamentReducer,
        },
        preloadedState: {
          tournaments: {
            currentTournament: { id: 'tour-123', name: 'Test', status: 'registration' },
            validation: {
              isValid: false,
              issues: [
                {
                  event: 'Event 1',
                  severity: 'error',
                  message: 'Issue',
                },
              ],
              warnings: [],
              checks: [],
              events: [],
            },
            loading: false,
            error: null,
            successMessage: null,
          },
        },
      });

      renderComponent();

      const startButton = screen.getByRole('button', { name: /Start Tournament/i });
      expect(startButton).toBeDisabled();
    });
  });

  describe('Start Tournament Button', () => {
    it('should render Start Tournament button', () => {
      store = configureStore({
        reducer: {
          tournaments: tournamentReducer,
        },
        preloadedState: {
          tournaments: {
            currentTournament: { id: 'tour-123', name: 'Test', status: 'registration' },
            validation: {
              isValid: true,
              issues: [],
              warnings: [],
              checks: [],
              events: [],
            },
            loading: false,
            error: null,
            successMessage: null,
          },
        },
      });

      renderComponent();

      const startButton = screen.getByRole('button', { name: /Start Tournament/i });
      expect(startButton).toBeInTheDocument();
    });

    it('should enable Start button when validation passes', () => {
      store = configureStore({
        reducer: {
          tournaments: tournamentReducer,
        },
        preloadedState: {
          tournaments: {
            currentTournament: { id: 'tour-123', name: 'Test', status: 'registration' },
            validation: {
              isValid: true,
              issues: [],
              warnings: [],
              checks: [],
              events: [],
            },
            loading: false,
            error: null,
            successMessage: null,
          },
        },
      });

      renderComponent();

      const startButton = screen.getByRole('button', { name: /Start Tournament/i });
      expect(startButton).not.toBeDisabled();
    });

    it('should open confirmation modal when clicked', async () => {
      store = configureStore({
        reducer: {
          tournaments: tournamentReducer,
        },
        preloadedState: {
          tournaments: {
            currentTournament: { id: 'tour-123', name: 'Test', status: 'registration' },
            validation: {
              isValid: true,
              issues: [],
              warnings: [],
              checks: [],
              events: [],
            },
            loading: false,
            error: null,
            successMessage: null,
          },
        },
      });

      renderComponent();

      const startButton = screen.getByRole('button', { name: /Start Tournament/i });
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText(/Confirm Tournament Start/i)).toBeInTheDocument();
      });
    });
  });

  describe('Event Actions', () => {
    const sampleEvent = {
      id: 'evt-1',
      skill_block: '3.5',
      gender: 'M',
      modality: 'Singles',
      format: 'hybrid',
      current_participants: 2,
      minimum_participants: 8,
      max_participants: 16,
    };

    beforeEach(() => {
      // inject a tournament with one undersubscribed event
      store = configureStore({
        reducer: {
          tournament: tournamentReducer,
        },
        preloadedState: {
          tournament: {
            currentTournament: {
              id: 'tour-123',
              name: 'Test Tournament',
              status: 'registration',
              events: [sampleEvent],
              current_participants: 2,
            } as any,
            validation: null,
            loading: false,
            error: null,
            successMessage: null,
          },
        },
      });
    });

    it('opens insufficient dialog and dispatches cancelEvent', async () => {
      const spy = vi.spyOn(store, 'dispatch');

      renderComponent();

      const eventsTab = screen.getByRole('tab', { name: /Events Management/i });
      fireEvent.click(eventsTab);

      // wait for row to render
      await waitFor(() =>
        expect(screen.getByTestId(`action-trigger-${sampleEvent.id}`)).toBeInTheDocument(),
      );

      // open menu and click cancel
      fireEvent.click(screen.getByTestId(`action-trigger-${sampleEvent.id}`));
      await waitFor(() =>
        expect(screen.getByTestId(`action-cancel-${sampleEvent.id}`)).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByTestId(`action-cancel-${sampleEvent.id}`));

      // dialog should open
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText(/Insufficient Entries/i)).toBeInTheDocument();

      // choose cancel option inside dialog
      fireEvent.click(within(dialog).getByText(/^Cancel Event$/i));

      // confirm action
      fireEvent.click(within(dialog).getByRole('button', { name: /Confirm/i }));

      await waitFor(() => {
        expect(spy).toHaveBeenCalledWith(
          expect.objectContaining({ type: 'tournaments/cancelEvent/pending' }),
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message if present', async () => {
      store = configureStore({
        reducer: {
          tournaments: tournamentReducer,
        },
        preloadedState: {
          tournaments: {
            currentTournament: { id: 'tour-123', name: 'Test', status: 'registration' },
            validation: null,
            loading: false,
            error: 'Failed to load tournament',
            successMessage: null,
          },
        },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Failed to load tournament/i)).toBeInTheDocument();
      });
    });

    it('should display success message after start', async () => {
      store = configureStore({
        reducer: {
          tournaments: tournamentReducer,
        },
        preloadedState: {
          tournaments: {
            currentTournament: { id: 'tour-123', name: 'Test', status: 'in-progress' },
            validation: null,
            loading: false,
            error: null,
            successMessage: 'Tournament started successfully',
          },
        },
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Tournament started successfully/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading indicator when validating', () => {
      store = configureStore({
        reducer: {
          tournaments: tournamentReducer,
        },
        preloadedState: {
          tournaments: {
            currentTournament: { id: 'tour-123', name: 'Test', status: 'registration' },
            validation: null,
            loading: true,
            error: null,
            successMessage: null,
          },
        },
      });

      renderComponent();

      // Component should show loading state
      const startButton = screen.queryByRole('button', { name: /Start Tournament/i });
      if (startButton) {
        expect(startButton).toBeDisabled();
      }
    });
  });

  describe('Progress Tab', () => {
    it('should display progress information after start', () => {
      store = configureStore({
        reducer: {
          tournaments: tournamentReducer,
        },
        preloadedState: {
          tournaments: {
            currentTournament: {
              id: 'tour-123',
              name: 'Test',
              status: 'in-progress',
            },
            validation: null,
            loading: false,
            error: null,
            successMessage: null,
          },
        },
      });

      renderComponent();

      const progressTab = screen.getByRole('tab', { name: /Progress/i });
      fireEvent.click(progressTab);

      expect(screen.getByText(/Progress/i)).toBeInTheDocument();
    });
  });
});
