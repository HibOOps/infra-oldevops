import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';
import '@testing-library/jest-dom';

describe('App', () => {
  it('renders login page when not authenticated', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('renders register page', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    render(
      <MemoryRouter initialEntries={['/register']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('redirects to login when visiting / without auth', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
});
